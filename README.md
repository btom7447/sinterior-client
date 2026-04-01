# Sintherior — Frontend

The Next.js frontend for **Sintherior**, a marketplace connecting verified artisans, trusted suppliers, and clients across the Nigerian construction and interior design industry.

---

## Tech Stack

| Layer            | Technology                                        |
| ---------------- | ------------------------------------------------- |
| Framework        | Next.js 16.2.1 (App Router, Turbopack)            |
| Language         | TypeScript 5                                      |
| Styling          | TailwindCSS 4, tailwindcss-animate                |
| UI Components    | shadcn/ui + Radix UI (20+ primitives)             |
| Real-Time        | Socket.IO Client (chat, typing, presence)         |
| State            | React Context (auth, cart) + TanStack Query 5     |
| Forms            | react-hook-form + zod 4                           |
| Icons            | lucide-react                                      |
| Charts           | Recharts 3                                        |
| Dates            | date-fns, react-day-picker                        |
| Animations       | AOS (scroll), Embla Carousel                      |
| Notifications    | sonner (toast)                                    |
| Theme            | next-themes (light/dark)                          |
| Package Manager  | pnpm                                              |

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Running [Sintherior server](../server/README.md)

### Install

```bash
cd sinterior-client
pnpm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### Development

```bash
pnpm dev
```

Runs on [http://localhost:3000](http://localhost:3000).

### Production

```bash
pnpm build
pnpm start
```

---

## Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── (auth)/                 # Login, signup, forgot/reset password
│   ├── (company)/              # About, blog, careers, contact, feed
│   ├── (order)/                # Cart, checkout, order confirmation
│   ├── (support)/              # Help, privacy, safety, terms
│   ├── artisan/                # Artisan listing & [id] detail
│   ├── dashboard/              # Protected user dashboard
│   │   ├── appointments/
│   │   ├── chat/
│   │   ├── earnings/
│   │   ├── inventory/
│   │   ├── jobs/
│   │   ├── my-products/
│   │   ├── orders/
│   │   ├── profile/
│   │   ├── projects/
│   │   ├── properties/
│   │   ├── reviews/
│   │   ├── saved/
│   │   ├── settings/
│   │   └── subscription/
│   ├── onboarding/             # Artisan & supplier onboarding flows
│   ├── products/               # Product browsing & [id] detail
│   ├── real-estate/            # Property listings & [id] detail
│   └── seller/                 # Supplier storefront [supplierId]
├── components/
│   ├── artisan/                # ArtisanCard, search filters
│   ├── auth/                   # Auth guard components
│   ├── dashboard/              # Dashboard panels (overview, jobs, orders, profile, sidebar, etc.)
│   ├── home/                   # Landing sections (hero, featured, CTA, how it works)
│   ├── layout/                 # Navbar, Footer, MobileHeader
│   ├── products/               # ProductCard, CategorySidebar
│   ├── real-estate/            # PropertyCard
│   ├── signup/                 # RoleSelector (multi-step signup)
│   └── ui/                     # shadcn/ui primitives (button, input, dialog, etc.)
├── contexts/
│   ├── AuthContext.tsx          # JWT auth state, sign-in/up/out, profile refresh
│   └── CartContext.tsx          # Shopping cart state
├── hooks/
│   ├── useAuth.ts              # Auth context consumer
│   ├── useArtisanSearch.ts     # Artisan search with geo/filters
│   ├── useChat.ts              # Socket.IO chat (conversations, messages, typing, presence)
│   ├── useNotifications.ts     # Notification polling (30s interval)
│   ├── useGeolocation.ts       # Browser geolocation API
│   └── use-mobile.tsx          # Responsive breakpoint hook
├── lib/
│   ├── apiClient.ts            # Centralized HTTP client (JWT in memory, httpOnly refresh cookie)
│   └── utils.ts                # cn() helper, formatters
└── types/
    └── api.ts                  # Shared TypeScript interfaces (ApiArtisan, ApiProduct, ApiProperty)
```

---

## Routes

### Public

| Route              | Description                                    |
| ------------------ | ---------------------------------------------- |
| `/`                | Landing page — hero, featured sections, CTA    |
| `/artisan`         | Artisan listing with search & filters          |
| `/artisan/[id]`    | Artisan detail — portfolio, reviews, hire form |
| `/products`        | Product browsing with category sidebar         |
| `/products/[id]`   | Product detail — gallery, specs, add to cart   |
| `/real-estate`     | Property listings with filters                 |
| `/real-estate/[id]`| Property detail — gallery, amenities, agent    |
| `/seller/[id]`     | Supplier storefront with their products        |
| `/about`           | About us — mission, values, team               |
| `/blog`            | Blog posts                                     |
| `/careers`         | Open roles and perks                           |
| `/contact`         | Contact form                                   |
| `/help`            | Help center with FAQ                           |
| `/safety`          | Safety information                             |
| `/terms`           | Terms of service                               |
| `/privacy`         | Privacy policy                                 |

### Auth

| Route               | Description                  |
| -------------------- | ---------------------------- |
| `/login`             | Email/password sign-in       |
| `/signup`            | Multi-step registration      |
| `/forgot-password`   | Request password reset email |
| `/reset-password`    | Set new password from link   |

### Onboarding

| Route                    | Description                          |
| ------------------------ | ------------------------------------ |
| `/onboarding/artisan`    | Multi-step artisan profile setup     |
| `/onboarding/supplier`   | Multi-step supplier profile setup    |

### Dashboard (Authenticated)

| Route                        | Description                          |
| ---------------------------- | ------------------------------------ |
| `/dashboard`                 | Overview — stats, quick links, recent orders |
| `/dashboard/profile`         | Edit name, bio, phone, avatar        |
| `/dashboard/jobs`            | Job management with status transitions |
| `/dashboard/orders`          | Order tracking (client/supplier)     |
| `/dashboard/chat`            | Real-time messaging                  |
| `/dashboard/appointments`    | Appointment scheduling               |
| `/dashboard/my-products`     | Supplier product management          |
| `/dashboard/inventory`       | Supplier inventory                   |
| `/dashboard/earnings`        | Earnings overview                    |
| `/dashboard/reviews`         | Review management                    |
| `/dashboard/projects`        | Project tracking                     |
| `/dashboard/properties`      | Property management                  |
| `/dashboard/saved`           | Saved/bookmarked items               |
| `/dashboard/settings`        | Account settings                     |
| `/dashboard/subscription`    | Subscription plans                   |

### Commerce

| Route                  | Description                    |
| ---------------------- | ------------------------------ |
| `/cart`                | Shopping cart                  |
| `/checkout`            | Delivery & payment             |
| `/order-confirmation`  | Order success page             |

---

## Authentication

JWT-based authentication with the Express backend:

- **Access token** — stored in memory (never localStorage), sent as `Authorization: Bearer` header
- **Refresh token** — httpOnly cookie, auto-refreshed on app load via `POST /auth/refresh`
- **Session restore** — `AuthContext` calls `/auth/refresh` + `/auth/me` on mount
- **Profile state** — `toProfile()` maps API camelCase to snake_case for component compatibility
- **`refreshProfile()`** — re-fetches `/auth/me` after profile mutations (avatar, name, bio, phone)

## Real-Time

| Feature              | Transport    | Details                                               |
| -------------------- | ------------ | ----------------------------------------------------- |
| Chat messages        | Socket.IO    | `message:send` / `message:new` events, acknowledgment |
| Typing indicators    | Socket.IO    | `typing:start` / `typing:stop` with auto-timeout      |
| Online presence      | Socket.IO    | `user:online` / `user:offline`, bulk `user:check-online` |
| Read receipts        | Socket.IO    | `message:read` marks messages, updates conversation   |
| Conversation updates | Socket.IO    | `conversation:updated` for new messages in list        |
| Notifications        | Polling (30s)| `GET /notifications`                                  |

### Chat Architecture

- Singleton socket with ref-counting — `useChat` and `useMessages` share one connection
- `canChat()` server-side access control: requires an existing Job or Order relationship
- Deterministic `conversationId` from sorted profile IDs: `[idA, idB].sort().join('_')`
- Search users by email to initiate new conversations

## Dashboard Auth Guard

The dashboard layout (`/dashboard/*`) is protected by a client-side auth guard:
- Shows a loading spinner while session restore is in progress
- Redirects unauthenticated users to `/login?next=<current-path>`
- Prevents the dashboard from flashing before redirect

---

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `pnpm dev`     | Start dev server         |
| `pnpm build`   | Production build         |
| `pnpm start`   | Start production server  |
| `pnpm lint`    | Run ESLint               |
