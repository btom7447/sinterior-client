# Sintherior — Client

The Next.js frontend for **Sintherior**. Renders the public marketplace, role-specific dashboards (client / artisan / supplier), and the super-admin panel. Talks to the Express API at `NEXT_PUBLIC_API_URL`.

---

## Tech Stack

| Layer          | Technology                                                      |
|----------------|-----------------------------------------------------------------|
| Framework      | Next.js 16 (App Router, Turbopack), React 19                    |
| Language       | TypeScript 5                                                    |
| Styling        | Tailwind CSS 4 + shadcn/ui (Radix primitives) + lucide-react    |
| Maps           | Leaflet + react-leaflet (OpenStreetMap tiles, Nominatim search) |
| State          | React Context (auth, cart) + TanStack Query 5                   |
| Real-Time      | Socket.IO Client                                                |
| Forms          | react-hook-form + zod                                           |
| Charts         | Recharts                                                        |
| Notifications  | sonner (toast)                                                  |
| Package Mgr    | pnpm                                                            |

---

## Getting Started

```bash
cd sinterior-client
pnpm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL
pnpm dev                     # http://localhost:3000
```

Production:
```bash
pnpm build
pnpm start
```

### Env (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

## Project Structure

```
src/
├── app/                                # Next.js App Router
│   ├── (auth)/                         # /login, /signup, /forgot-password, /reset-password
│   ├── (company)/                      # /about, /blog, /blog/[slug], /careers, /contact, /feed
│   ├── (order)/                        # /cart, /checkout
│   ├── (support)/                      # /help, /privacy, /safety, /terms
│   ├── admin/                          # Super-admin section (gated to role=admin)
│   │   ├── page.tsx                    # Overview — 10 grouped metrics
│   │   ├── users, users/[id]
│   │   ├── orders, products
│   │   ├── verification, disputes
│   │   ├── payments                    # Escrow / Payouts / Platform Wallet hub
│   │   │                               # (refund modal, force-release, release-now,
│   │   │                               #  cancel, suspend/unsuspend, global pause toggle)
│   │   ├── blog, careers, help, feed   # CMS editors
│   │   ├── chat, analytics, settings
│   │   └── layout.tsx                  # Admin shell with notification bell
│   ├── artisan/                        # /artisan listing + /artisan/[id] detail
│   ├── dashboard/                      # Authenticated user dashboards
│   │   ├── page.tsx                    # Role-aware overview — verification banner, wallet card
│   │   │                               # (3-bucket pending/holding/available), suspension banner,
│   │   │                               # negative-balance + fees-owed + payouts-paused alerts.
│   │   ├── jobs                        # ?as=artisan|client view-switching
│   │   │                               # Artisan-side awaiting-acceptance callout w/ auto-release date,
│   │   │                               # client-side accept-work modal (no dispute after acceptance).
│   │   ├── orders                      # ?as=buyer|seller view-switching
│   │   ├── appointments                # Scheduled job bookings
│   │   ├── chat
│   │   ├── wallet                      # 3-bucket dashboard, paginated WalletTransaction ledger
│   │   │   ├── page.tsx                # Pending / Holding / Available + lifetime stats
│   │   │   ├── bank/page.tsx           # Bank account management — list, add (Paystack-resolved),
│   │   │   │                           # set default, delete (blocked if pending payouts)
│   │   │   └── payouts/page.tsx        # Request payout + history with status pills
│   │   ├── verification                # Submit + history (kind-aware: business or individual)
│   │   ├── artisan-profile             # Professional profile editor (5 tabs)
│   │   ├── business                    # Supplier business profile
│   │   ├── my-products, inventory, logistics, earnings, reviews
│   │   ├── projects, properties, saved
│   │   ├── profile, settings
│   │   └── layout.tsx                  # Header w/ ActiveHiresIndicator + NotificationBell
│   ├── onboarding/
│   │   ├── artisan/                    # Specialty → Portfolio → Certifications → Availability → Service Details
│   │   └── supplier/
│   ├── products/, real-estate/, seller/[supplierId]
│   └── verify-email
├── components/
│   ├── admin/                          # AdminSidebar, MetricStrip
│   ├── artisan/                        # ArtisanCard (verified/unverified shield + suspended badge)
│   ├── auth/                           # Auth guards
│   ├── dashboard/                      # All dashboard panels:
│   │   ├── DashboardSidebar.tsx        # Grouped sections (Working/Selling, My Profile, Marketplace, etc.)
│   │   ├── DashboardOverview.tsx       # Stats + verification banner + role-specific CTAs
│   │   ├── DashboardJobs.tsx           # Dual-approval start/end, cancellation reasons
│   │   ├── DashboardOrders.tsx         # Named action buttons + dual-approval delivery + payment guard
│   │   ├── DashboardAppointments.tsx   # Scheduled bookings, accept/decline/cancel modals
│   │   ├── DashboardChat.tsx, DashboardProducts.tsx, ...
│   │   ├── JobActionModal.tsx          # Reusable confirm modal (icon + tone, optional reason/agreement)
│   │   ├── ActiveHiresIndicator.tsx    # Header pill — count + accumulated cost across in-progress jobs
│   │   └── NotificationBell.tsx
│   ├── home/, layout/, products/, real-estate/, signup/
│   ├── location/
│   │   └── LocationPicker.tsx          # Leaflet map + Nominatim search + draggable pin
│   └── ui/                             # shadcn primitives
│       ├── ErrorState.tsx              # Reusable error empty-state with retry
│       └── NairaInput.tsx              # ₦ prefix + live thousand-separator
├── contexts/
│   ├── AuthContext.tsx                 # JWT in memory, refresh via httpOnly cookie
│   └── CartContext.tsx
├── hooks/
│   ├── useAuth.ts, useChat.ts, useNotifications.ts
│   ├── useArtisanSearch.ts             # ?category, ?skill, geo, search
│   ├── useGeolocation.ts               # Browser geolocation API
│   └── use-mobile.tsx
├── lib/
│   ├── apiClient.ts                    # apiGet/Post/Patch/Delete/Upload, JWT-aware, auto-refresh
│   ├── constants.ts                    # ARTISAN_SKILL_CATEGORIES (19 categories, 340+ skills)
│   └── utils.ts
└── types/
    └── api.ts                          # Shared interfaces (ApiArtisan, ApiProduct, ApiProperty)
```

---

## Routes

### Public
| Route                | Description                                             |
|----------------------|---------------------------------------------------------|
| `/`                  | Landing page                                            |
| `/artisan`           | Artisan directory — category + subcategory chips, search, geo nearby. Header escrow trust banner. Suspended cards rendered grayscale + Unavailable badge. |
| `/artisan/[id]`      | Artisan detail — verified/unverified shield, portfolio, lean hire form. Suspended artisans show an Unavailable banner and the hire form is replaced with a browse-others empty state. |
| `/products`          | Product marketplace                                     |
| `/products/[id]`     | Product detail                                          |
| `/real-estate`       | Property listings                                       |
| `/real-estate/[id]`  | Property detail                                         |
| `/seller/[id]`       | Supplier storefront. Suspended suppliers show an Unavailable banner; products tab carries an "orders paused" notice. |
| `/about`, `/contact` | Static company pages                                    |
| `/blog`, `/blog/[slug]` | CMS-driven blog                                      |
| `/careers`           | CMS-driven open roles                                   |
| `/feed`              | Pinterest-style masonry — admin posts + artisan portfolios, image+video, hover save, infinite scroll |
| `/help`              | CMS-driven help articles grouped by category            |
| `/privacy`, `/safety`, `/terms` | Static support pages                          |

### Auth
`/login`, `/signup` (multi-step with Specialty/Location for artisans), `/forgot-password`, `/reset-password`, `/verify-email`.

### Onboarding
- `/onboarding/artisan` — five steps: Specialty (chip pickers from masterlist) → Portfolio → Certifications → Availability → Service Details (rate, address via map, radius, tools)
- `/onboarding/supplier`

### Dashboard (authenticated, email-verified)
Sidebar grouped per role:

**Artisan** — Working (Jobs Hired For, Appointments, Earnings, Reviews) · My Profile (Professional Profile, Verification, **Wallet**) · Marketplace (Browse, My Purchases, My Hires) · Communication · Account

**Supplier** — Selling (My Products, Orders Received, Inventory, Earnings, Logistics) · My Business (Business, Verification, **Wallet**) · Marketplace · Communication · Account

**Client** — Activity (My Purchases, My Hires, Projects, Saved, Properties) · Marketplace · Communication · Account

The header carries: page title (left), `<ActiveHiresIndicator>` pill (count + total cost), Chat button, `<NotificationBell>`, avatar dropdown.

### Admin (`role === 'admin'` redirected here from `/dashboard`)
Overview · Users + detail · Orders · Products · Verification · Disputes · **Payments** (Escrow / Payouts / Platform Wallet) · Blog CMS · Careers CMS · Help CMS · Feed CMS · Chat · Analytics · Settings.

### Commerce
`/cart`, `/checkout`, `/order-confirmation`, `/payment/verify`.

---

## Key Patterns

### `apiClient`
- JWT stored in memory (never localStorage).
- Auto-refresh on 401: tries `POST /auth/refresh` once, retries the original request, dispatches `auth:unauthorized` on failure.
- Helpers: `apiGet`, `apiPost`, `apiPatch`, `apiDelete`, `apiUpload` (multipart).

### Dashboard auth + verification gate
- `dashboard/layout.tsx` redirects unauthenticated users, shows verification gate for unverified emails, sends admins to `/admin`.
- `admin/layout.tsx` enforces `role === 'admin'`.

### Real-time
- Singleton Socket.IO connection with ref-counting (`useChat` and `useMessages` share it).
- Deterministic `conversationId` from sorted profile IDs.
- Notifications: in-app via `notification:new` event, badge count auto-updates.

### Skills cascade
- `ARTISAN_SKILL_CATEGORIES` in [`lib/constants.ts`](src/lib/constants.ts) is the single source of truth.
- Onboarding Specialty step, professional profile Overview tab, and `/artisan` filter all consume it.
- Server `/artisans` and `/artisans/nearby` accept `?category` AND `?skill`.

### Hire flow
- Public hire form is just two cards (urgent / book-for-later) + optional date + a daily-rate notice. Title/description/location move to chat.
- Job lifecycle uses dual-approval modals — see `JobActionModal` props for the per-action copy.
- `ActiveHiresIndicator` polls `/jobs/active` every 60s to keep the day count and cost fresh.

### Order flow
- Named action buttons replace the old generic transition list:
  - **Confirm order** (supplier, agreement checkbox)
  - **Mark as shipped** (supplier)
  - **Confirm delivery** / **Confirm receipt** (dual approval, both parties)
  - **Cancel order** (either, required reason)
- Pay-on-delivery: the supplier's delivery confirmation modal includes a **required cash-collected agreement** with the exact total. Server-side guard enforces both flags + paid status before the order finalises.

### Verification UI
- Status-aware banner on `/dashboard` overview: never-submitted (dashed CTA) / pending (amber clock) / rejected or revoked (red shield with reason) / approved (green pill).
- `/dashboard/verification` switches copy by role: suppliers see *"Verify your business"* and the CAC requirement; artisans see *"Verify your identity"* with the ID upload.
- Multi-doc submission UI: add multiple documents one-by-one, reassign type per doc.
- Public artisan/seller profile cards show two clear states: green ShieldCheck or muted ShieldOff with a dashed-border explanation block.

### Escrow + Wallet UI
- **Dashboard overview** (sellers): 3-bucket wallet card (In Escrow / Holding / Available), "X awaiting release" hint, banners for negative balance, fees-owed, payouts-paused, and account-suspended.
- **`/dashboard/wallet`**: full balance breakdown, paginated WalletTransaction ledger, lifetime stats.
- **`/dashboard/wallet/bank`**: Paystack-resolved account name verification before save, default-account toggle, deletes blocked while a payout uses the account.
- **`/dashboard/wallet/payouts`**: request form (range-validated against minPayout + available + pause flags), history with status pills (pending → processing → completed | failed | cancelled).
- **Job detail (artisan)**: "Awaiting client acceptance" callout with the auto-release date while escrow is held; "released to your wallet" confirmation once accepted or auto-released.
- **Accept-work modal (client)**: explicit disclosure that no dispute can be raised after acceptance; agreement checkbox required.

### Suspension UI
- Public artisan profile: red banner, hire CTA disabled with "Unavailable" label, hire form replaced with browse-others empty state.
- Public seller profile: red banner, message-seller CTA replaced with browse-other-sellers card, products tab carries an "Orders paused" notice.
- Artisan listing cards (`ArtisanCard`): grayscale image + opacity dim + red Unavailable badge + disabled Book Now.
- Seller dashboard: suspension banner top-of-overview with reason; in-progress work continues to completion.

### Skeleton loaders
- All admin pages, dashboard panels, and public detail pages have element-specific Skeleton loaders matching the eventual layout (no generic spinners).

---

## Scripts

| Command       | Description              |
|---------------|--------------------------|
| `pnpm dev`    | Dev server (Turbopack)   |
| `pnpm build`  | Production build         |
| `pnpm start`  | Serve production build   |
| `pnpm lint`   | ESLint                   |
