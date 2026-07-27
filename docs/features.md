# Feature Map — Web Client

_Last updated: 2026-07-27 · Phases: **P1** = feed launch · **P2** = fast-follow · **P3** = growth · **Live** = already shipped_

Scope: UI work in this repo. Server data-layer rows live in the server repo `/docs/features.md`.

## Feed (the pivot — see prd.md)

| Feature (client work) | Phase |
|---|---|
| Masonry home feed at `/` (SSR + infinite scroll, zero CLS via server aspect ratio) | P1 |
| Pin detail modal with real URL `/pin/[id]` (intercepted route) + commerce CTA | P1 |
| Save to boards (one-tap → board picker); board management; boards on profile | P1 |
| Follow buttons on pins/profiles | P1 |
| Native pin upload UI (image + ≤60s video, tap-to-play, no autoplay) | P1 |
| Filter chips (trade/room/budget) + text search | P1 |
| Old home → `/about`; nav/bottom-nav rework | P1 |
| Admin moderation screens (hide/remove/feature) | P1 |
| Pin view/save counters + artisan-facing stats UI | P2 |
| Notifications UI: followed author posted, pin saved | P2 |
| Pin reporting (user-flagged) | P2 |
| Budget bands surfaced across all pin types | P2 |
| SEO: pin/board indexing polish, sitemaps for pins | P2 |
| Onboarding taste-picker → affinity seed | P3 |
| "More like this" (tag/taxonomy related pins) | P3 |
| Autoplay-on-WiFi setting | P3 |
| Search overhaul (facets, typo-tolerance) | P3 |

## Marketplace UI (existing, stays)

| Feature | Phase |
|---|---|
| Auth screens (JWT + refresh cookie), 3 roles, email verification | Live |
| Artisan discovery/geolocation search, profiles, portfolios | Live |
| Products, cart, checkout, orders; properties + viewings | Live |
| Jobs, quotes, appointments, projects (dashboard) | Live |
| Wallet/earnings/payout screens (money logic is server-side) | Live |
| Real-time chat (Socket.IO), notifications | Live |
| Admin panel (users, verification, disputes, content, analytics) | Live |
| Blog, careers, help center, contact | Live |
| Paystack live-key switch (client decision, server env change) | Parked |

## Other surfaces (one-liners — not this repo)

- **Server/API** — Pin entity, backfill, ranking, derived-pin upserts, payments/escrow: server repo `/docs/features.md` + `/docs/build-plan.md`.
- **Mobile app** — React Native + Expo (decided), feed-first against the same API, P2 spike: server repo `/docs/features.md`.
- **WhatsApp bot** — built and deployed, **shelved** on Meta business verification: server repo `/docs/features.md`.

## Won't build (recorded so we stop re-discussing)

Likes/comments (v1), client-authored pins, ads/promoted pins, ML visual search, native video >60s.
