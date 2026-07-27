# Glossary — Web Client

_Last updated: 2026-07-27 · The domain language — keep code, UI, and docs on these exact terms._

Trimmed to terms this codebase touches. **Canonical version:** server repo `/docs/glossary.md`.

## Roles

- **Client** — consumer who browses, saves, hires artisans, buys products, books property viewings.
- **Artisan** — service provider (tiler, POP installer, welder, painter…) with a profile, portfolio (→ pins), skills, geolocation, verification status.
- **Supplier** — seller of products (materials, furniture) and/or properties; business-verified.
- **Admin** — platform operator; moderates content, resolves disputes, manages verification.

## Feed (pivot vocabulary — use these, not synonyms)

- **Pin** — the atomic feed unit: one image or video + metadata, always attributed to an author. Never "post" or "card" in code/UI.
- **Native pin** — uploaded directly by an artisan/supplier through the create flow.
- **Derived pin** — auto-generated from a Product, Property, or legacy portfolio/FeedPost; stays in sync with its source (server-side).
- **Board** — a user's named collection of saved pins (e.g. "My Kitchen Project"). Public by default; private is enforced server-side.
- **Save** — adding a pin to a board; the platform's core engagement signal.
- **Follow** — subscribing to an author; boosts their pins in your feed.
- **Taxonomy** — a pin's three market axes: **trade** (skill), **room** (space), **budget band** (₦ tier) + free tags.
- **WCAF** — Weekly Commerce Actions from Feed; the north-star metric (quotes + orders + viewings originating from a pin).

## Marketplace & money (as surfaced in this UI)

- **Job** — a client's work request to an artisan. **Quote** — an artisan's priced offer on a job.
- **Appointment / Viewing** — scheduled meeting (artisan consult or property viewing).
- **Order** — a product purchase through cart/checkout.
- **Kobo** — all money is stored as integer kobo (₦1 = 100 kobo). Never floats; convert to ₦ at the display edge only.
- Escrow, wallet, payout, dispute mechanics are server-owned — definitions in the canonical glossary.

## Verification

- **Email verification** — account-level gate (all roles).
- **Platform verification** — admin-reviewed artisan/supplier credibility (VerificationRequest → verified badge).
- (Distinct from **Meta business verification**, which concerns the shelved WhatsApp bot — see canonical glossary.)
