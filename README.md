# Sinterior — Client

The Next.js 16 App Router frontend for [Sinterior](https://sinterior.ng), a marketplace connecting verified artisans, trusted suppliers, and clients across the Nigerian construction industry.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui + Radix UI |
| Auth | Supabase Auth |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| State | React Context + TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Animations | AOS (scroll), CSS keyframes |
| Package Manager | pnpm |
| Deployment | Vercel |

---

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `NEXT_PUBLIC_APP_URL` | Base URL of the app (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_API_URL` | Base URL of the Sinterior server API (e.g. `http://localhost:4000/api`) |

### 3. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Build for production

```bash
pnpm build
pnpm start
```

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── layout/             # Navbar, Footer, AppLayout, MobileHeader
│   ├── home/               # HeroSection, FeaturedProducts, etc.
│   ├── artisan/            # ArtisanCard, LocationPermissionBanner
│   ├── products/           # CategorySidebar, ProductCard, etc.
│   ├── real-estate/        # PropertyCard
│   ├── dashboard/          # DashboardSidebar, DashboardProfile, etc.
│   ├── signup/             # Multi-step signup forms
│   └── ui/                 # shadcn/ui primitives
├── contexts/
│   └── CartContext.tsx      # Cart state (items, add, remove, update)
├── data/                   # Static seed data (products, artisans, properties)
├── hooks/
│   ├── useAuth.ts           # Supabase auth state
│   └── useChat.ts           # Chat unread count
├── integrations/
│   └── supabase/            # Supabase client + type helpers
└── lib/
    └── utils.ts             # cn() helper
```

---

## Client-Side Routes

### Public

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Hero, how it works, featured artisans, products, real estate, CTA |
| `/about` | About Us | Mission, stats, values, team |
| `/careers` | Careers | Open roles, perks |
| `/blog` | Blog | Post listing with category filters |
| `/blog/[slug]` | Blog Post | Individual article |
| `/contact` | Contact | Contact form + office info |
| `/help` | Help Center | Topic categories, FAQ accordion, search |
| `/safety` | Safety | Safety pillars, tips, report flow |
| `/terms` | Terms of Service | Full legal content with sticky TOC |
| `/privacy` | Privacy Policy | Full policy with sticky TOC |

### Auth

| Route | Page | Description |
|---|---|---|
| `/login` | Login | Email/password sign-in |
| `/signup` | Sign Up | Multi-step: account type → details → avatar |
| `/forgot-password` | Forgot Password | Request password reset email |
| `/reset-password` | Reset Password | Set new password (from email link) |

### Marketplace — Products

| Route | Page | Description |
|---|---|---|
| `/products` | Products | Category sidebar, search, filter, product grid |
| `/products/[id]` | Product Detail | Gallery, specs, add to cart, reviews |
| `/cart` | Cart | Item list, quantity control, order summary |
| `/checkout` | Checkout | Delivery address, payment method |
| `/order-confirmation` | Order Confirmation | Success state, order reference |
| `/seller/[supplierId]` | Supplier Storefront | Supplier profile + all their products |

### Marketplace — Artisans

| Route | Page | Description |
|---|---|---|
| `/artisan` | Artisans | Search, filter by trade/location, artisan cards |
| `/artisan/[id]` | Artisan Profile | Portfolio, reviews, contact + booking panel |

### Real Estate

| Route | Page | Description |
|---|---|---|
| `/real-estate` | Real Estate | Filter sidebar, property cards (rent/sale) |
| `/real-estate/[id]` | Property Detail | Gallery, map, video, amenities, agent contact |

### Social / Feed

| Route | Page | Description |
|---|---|---|
| `/feed` | Community Feed | Posts, likes, comments, saves |
| `/chat` | Chat | Conversation list + message thread |

### Dashboard (Authenticated)

| Route | Page | Description |
|---|---|---|
| `/dashboard` | Dashboard Home | Overview stats, recent activity |
| `/dashboard/profile` | Profile | Edit name, bio, phone, avatar |
| `/dashboard/settings` | Settings | Notification preferences, account settings |
| `/dashboard/subscription` | Subscription | Current plan, upgrade options |

---

## Server API Endpoints Needed

The following REST endpoints must be implemented on the Sinterior server. All authenticated endpoints expect a `Bearer` token in the `Authorization` header (JWT issued by Supabase Auth).

### Auth & Profiles

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/auth/me` | ✅ | Get authenticated user profile |
| `PUT` | `/api/auth/me` | ✅ | Update profile (name, bio, phone, avatar_url) |
| `PUT` | `/api/auth/me/password` | ✅ | Change password |
| `DELETE` | `/api/auth/me` | ✅ | Deactivate account |

### Artisans

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/artisans` | ❌ | List artisans — query: `trade`, `location`, `radius_km`, `min_rating`, `verified`, `page`, `limit` |
| `GET` | `/api/artisans/:id` | ❌ | Get artisan detail (profile + portfolio + stats) |
| `GET` | `/api/artisans/:id/reviews` | ❌ | Paginated reviews for an artisan |
| `POST` | `/api/artisans/:id/reviews` | ✅ | Submit a review (rating + comment) |
| `POST` | `/api/artisans/:id/contact` | ✅ | Send a message / enquiry to an artisan |
| `POST` | `/api/artisans/:id/bookings` | ✅ | Request a booking / appointment |
| `GET` | `/api/artisans/me` | ✅ | Get own artisan profile (artisan role only) |
| `PUT` | `/api/artisans/me` | ✅ | Update own artisan profile |

### Products

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/products` | ❌ | List products — query: `category`, `supplier_id`, `min_price`, `max_price`, `q`, `sort`, `page`, `limit` |
| `GET` | `/api/products/:id` | ❌ | Get product detail |
| `GET` | `/api/products/categories` | ❌ | List all product categories |
| `GET` | `/api/products/:id/reviews` | ❌ | Paginated reviews for a product |
| `POST` | `/api/products/:id/reviews` | ✅ | Submit a product review |

### Cart & Orders

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/orders` | ✅ | List own orders — query: `status`, `page`, `limit` |
| `POST` | `/api/orders` | ✅ | Create order from cart (items, delivery address, payment ref) |
| `GET` | `/api/orders/:id` | ✅ | Get order detail |
| `PUT` | `/api/orders/:id/cancel` | ✅ | Cancel an order |
| `POST` | `/api/orders/:id/confirm` | ✅ | Confirm delivery (releases escrow) |

### Payments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/payments/initiate` | ✅ | Initiate payment (returns gateway URL/reference) |
| `POST` | `/api/payments/verify` | ✅ | Verify payment status after redirect |
| `GET` | `/api/payments/history` | ✅ | Transaction history for the user |

### Real Estate / Properties

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/properties` | ❌ | List properties — query: `type` (rent/sale), `min_price`, `max_price`, `bedrooms`, `location`, `featured`, `page`, `limit` |
| `GET` | `/api/properties/:id` | ❌ | Get property detail (includes agent info) |
| `POST` | `/api/properties/:id/enquire` | ✅ | Send enquiry to listing agent |
| `POST` | `/api/properties/:id/save` | ✅ | Save / unsave a property |
| `GET` | `/api/properties/saved` | ✅ | List saved properties for the user |

### Suppliers / Sellers

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/suppliers` | ❌ | List suppliers |
| `GET` | `/api/suppliers/:id` | ❌ | Get supplier storefront (profile + products) |
| `GET` | `/api/suppliers/me` | ✅ | Get own supplier profile (supplier role only) |
| `PUT` | `/api/suppliers/me` | ✅ | Update own supplier profile |
| `POST` | `/api/products` | ✅ | Create a product listing (supplier only) |
| `PUT` | `/api/products/:id` | ✅ | Update a product listing (owner only) |
| `DELETE` | `/api/products/:id` | ✅ | Delete a product listing (owner only) |

### Chat / Messaging

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/conversations` | ✅ | List conversations for the user |
| `GET` | `/api/conversations/:id/messages` | ✅ | Paginated messages in a conversation |
| `POST` | `/api/conversations` | ✅ | Start a new conversation (with artisan or supplier) |
| `POST` | `/api/conversations/:id/messages` | ✅ | Send a message |
| `PUT` | `/api/conversations/:id/read` | ✅ | Mark conversation as read |

### Notifications

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | ✅ | List notifications — query: `unread_only`, `page`, `limit` |
| `PUT` | `/api/notifications/read-all` | ✅ | Mark all notifications as read |
| `PUT` | `/api/notifications/:id/read` | ✅ | Mark a single notification as read |

### Feed / Community

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/feed` | ❌ | List feed posts — query: `page`, `limit` |
| `POST` | `/api/feed` | ✅ | Create a post |
| `POST` | `/api/feed/:id/like` | ✅ | Toggle like on a post |
| `POST` | `/api/feed/:id/save` | ✅ | Toggle save on a post |
| `GET` | `/api/feed/:id/comments` | ❌ | Get comments on a post |
| `POST` | `/api/feed/:id/comments` | ✅ | Post a comment |

### Subscriptions

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/subscriptions/plans` | ❌ | List available subscription plans |
| `GET` | `/api/subscriptions/me` | ✅ | Get current user's active subscription |
| `POST` | `/api/subscriptions` | ✅ | Subscribe to a plan |
| `PUT` | `/api/subscriptions/me/cancel` | ✅ | Cancel subscription at period end |

### Dashboard / Analytics

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | ✅ | Summary stats (orders, earnings, views — role-specific) |
| `GET` | `/api/dashboard/activity` | ✅ | Recent activity feed for the dashboard |

### Admin (Internal)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `PUT` | `/api/admin/artisans/:id/verify` | ✅ Admin | Approve artisan verification |
| `PUT` | `/api/admin/suppliers/:id/verify` | ✅ Admin | Approve supplier verification |
| `DELETE` | `/api/admin/reviews/:id` | ✅ Admin | Remove a review |
| `DELETE` | `/api/admin/posts/:id` | ✅ Admin | Remove a feed post |

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Server API (to be added once the server is set up)
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production — mirrors what's live on sinterior.ng |
| `v1.1` | Active development branch (current migration) |
| `feature/*` | Short-lived feature branches off `v1.1` |

---

## Related Repositories

- **sinterior-server** — Node.js/Express API server (to be set up) — implements all `/api/*` endpoints listed above
- **sinterior-connect** — Original Vite + React Router v6 app (archived, migrated to this repo)
