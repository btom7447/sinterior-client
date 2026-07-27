# System Architecture — Web Client

_Last updated: 2026-07-27_

Scope: how **this app** (`sinterior-client`, Next.js 16 / React 19 / Tailwind 4) is built and how it talks to the platform. Server internals (data model, money flow, crons, media pipeline): server repo `/docs/system-architecture.md`.

## Platform topology (context)

```
                    ┌─────────────────────────────┐
  sintherior.com    │  sinterior-client (Next 16) │  Vercel · prod branch v1.1
  www.sintherior.com│  React 19 · Tailwind 4      │  NEXT_PUBLIC_API_URL →
                    └──────────────┬──────────────┘  https://api.sintherior.com/api/v1
                                   │ REST + Socket.IO (socket URL = API URL minus /api/v1)
                    ┌──────────────▼──────────────┐
  api.sintherior.com│  server (Express 4, ESM)    │  Railway · repo btom7447/sinterior-server
                    │  Socket.IO · node-cron      │  branch master · port 5000 · 1 replica
                    └────┬─────────┬──────────┬───┘
              MongoDB Atlas   Cloudinary   Paystack / Resend
  bot.sintherior.com (whatsapp-bot, SHELVED) · Mobile app (planned, same API)
  DNS: Vercel DNS hosts sintherior.com (manage via `vercel dns`)
```

## The API contract (`NEXT_PUBLIC_API_URL`)

- Value in production: `https://api.sintherior.com/api/v1` — **must end exactly `/api/v1`, no trailing slash.** Usage sites append paths directly; a suffix-less value 404s every REST call (this happened; see deploy-vercel.md History).
- **Socket URL is derived** in `src/lib/socket.ts` by stripping `/api/v1` from the same var (`NEXT_PUBLIC_API_URL?.replace("/api/v1", "")`, fallback `http://localhost:5000`). One var drives both REST and websockets — misconfigure it and both break together.
- `NEXT_PUBLIC_*` are **inlined at build time** — changing one on Vercel requires a cache-less rebuild (`vercel deploy --prod --force`) and a bundle grep to verify (deploy-vercel.md rule 2).

## Auth flow (client side)

Implemented in `src/lib/apiClient.ts` + `src/contexts/AuthContext.tsx`:

- **Access token (JWT, 15m) lives in memory only** (`apiClient` module variable via `setToken`/`getToken`) — never localStorage.
- **Refresh token (7d) is an httpOnly SameSite cookie** managed by the server; every `apiFetch` sends `credentials: "include"`.
- **Auto-refresh loop:** on a 401, `apiFetch` calls `POST /auth/refresh` once (cookie-only) and retries the original request. If refresh also fails (or the 401 recurs after retry), it clears the token and dispatches a `window` `CustomEvent("auth:unauthorized")` — listeners (AuthGuard in Providers) redirect to `/login`, and `socket.ts` tears the socket down.
- **Socket handshake carries the access token** via socket.io's function-form `auth` callback, so every (re)connect picks up the freshest token; `refreshSocketAuth()` is called from AuthContext after login/refresh to reconnect an active tab with new credentials. The socket is a ref-counted singleton shared by `useChat` and `useNotifications`.
- `apiUpload` is the multipart variant (skips the JSON Content-Type, keeps the Bearer header + cookie).

Rule: **all API access goes through `src/lib/apiClient.ts`** (`apiGet/apiPost/apiPatch/apiDelete/apiUpload`) — never raw `fetch` from components. Exception: intentional cookie-only calls (the refresh call itself; see AuthContext).

## App Router structure (`src/app/`, verified)

```
src/app/
├─ page.tsx                 # home — becomes the masonry feed (pivot); pin modal via
│                           # intercepted route /pin/[id] lands here (M1)
├─ (auth)/                  # login, signup, forgot-password, reset-password
├─ (company)/               # about, blog, careers, contact, feed (legacy FeedPost page)
├─ (order)/                 # cart, checkout, order-confirmation
├─ (support)/               # help, privacy, safety, terms
├─ admin/                   # analytics, blog, careers, chat, disputes, feed (→ pin
│                           # moderation), help, orders, payments, products, settings,
│                           # users, verification
├─ dashboard/               # role-aware user dashboard: appointments, artisan-profile,
│                           # business, chat, earnings, inventory, jobs, logistics,
│                           # my-products, orders, profile, projects, properties,
│                           # reviews, saved, settings, subscription, verification,
│                           # wallet, [...slug]
├─ artisan/ [id]            # artisan discovery + public profiles
├─ products/ [id]           # product catalog + detail
├─ real-estate/ [id]        # property listings + detail
├─ seller/[supplierId]      # supplier public profile
├─ chat/ · home/ · onboarding/ · payment/ · verify-email/
└─ sitemap.ts · robots.ts · manifest.ts · opengraph-image.tsx
```

Feed-pivot routing changes (M1): `/` becomes the SSR'd masonry feed; the old home content moves under `(company)/about`; `/pin/[id]` ships as a Next **intercepted route** so the pin detail renders as a modal over the feed but has a real, shareable, indexable URL.

## State layers

| Layer | Where | Owns |
|---|---|---|
| **AuthContext** | `src/contexts/AuthContext.tsx` | session/user/profile, login/logout, token wiring to apiClient + socket |
| **CartContext** | `src/contexts/CartContext.tsx` | cart state feeding checkout |
| **TanStack Query** (v5) | `QueryClientProvider` in `src/components/Providers.tsx` | server-state fetching/caching for API data |
| **Socket.IO** (client 4.x) | `src/lib/socket.ts` + `useChat`/`useNotifications` hooks | realtime chat + notifications over one shared connection |

Hooks live in `src/hooks/` (`useAuth`, `useChat`, `useNotifications`, `useArtisanSearch`, `useGeolocation`, `use-mobile`, `use-toast`).

## Image host whitelist (`next.config.ts`)

All remote images render through `next/image`; hosts must be listed in `images.remotePatterns` or they 400. Currently whitelisted: `images.unsplash.com`, `api.dicebear.com`, `localhost` (http, dev), `api.sintherior.com`, `*.up.railway.app`, `res.cloudinary.com`. New media hosts (e.g. a video CDN) must be added there **and rebuilt**. Config also sets AVIF/WebP formats, 7-day minimum cache TTL, and security headers (HSTS, nosniff, frame/referrer/permissions policies).

## SSR/SSG constraints (these have bitten us)

1. **Browser globals (`window`, `location`, `localStorage`) never execute at module scope or in render bodies** — statically generated pages run their render server-side. Guards and redirects belong in `useEffect`/handlers. Precedent: the checkout SSG crash (see coding-guideline.md).
2. **`sitemap.ts` fetches the API at build time** with an 8s `AbortSignal.timeout` — without it a hung API stalls the build until Next kills sitemap workers (60s×3) and fails the deploy (this happened).
3. **Feed SSR (M1):** the first feed page is server-rendered for SEO; masonry cells are sized from the server-provided `aspectRatio` field on each pin (computed at upload from Cloudinary metadata) so images produce zero layout shift. Never measure media client-side to lay out the grid.

## Failure modes worth knowing (client-visible)

- Server `/health` 503s while Mongo reconnects; API requests fail fast (503) rather than hang — surface errors, don't spin forever.
- If REST calls 404 across the board or the socket won't connect, suspect the `NEXT_PUBLIC_API_URL` contract (suffix or stale inlined bundle) before suspecting the server — see ops-playbook.md.
