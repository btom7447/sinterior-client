# PRD — Sintherior Feed, Web Client Scope (Pinterest-style pivot)

_Last updated: 2026-07-27 · Owner: Sawyer · Status: approved for build_

Scope of this document: the **web client's** slice of the feed pivot. The data layer (Pin/Board/Follow models, ranking aggregation, backfill, derived-pin upsert hooks) is server work — see server repo `/docs/prd.md` and `/docs/system-architecture.md`.

## Problem

Clients plan visually but our discovery is search-first ("find a plumber"). The inspiration behavior already happens — in WhatsApp saved images and Instagram screenshots — disconnected from hireable artisans and buyable products. We lose the highest-intent moment: "I want *this* — who made it?"

## Solution

Make the feed the app. `sintherior.com` lands on a masonry grid of artisan work, products, and properties. Users save pins to project boards, follow artisans, and act on any pin through the existing quote/order/viewing flows.

## Decisions (locked 2026-07-27 — see DECISIONS.md)

1. **Feed becomes home** — replaces the current landing page; old home content moves to `/about`.
2. **Native pin creation: artisans + suppliers only** (plus auto-derived pins). Clients browse/save/act.
3. **Engagement = saves + boards + follows.** No likes or comments in v1.
4. **Video ships in v1** — with hard data-cost guardrails (below).

## Users & stories

**Client (browser/buyer)**
- Browse the feed without an account; filter by trade / room / budget band.
- Save a pin to a named board ("My Kitchen Project") in one tap — board picker after the save, never a form first.
- Open a pin → see author, details, price/budget context → **Request quote / Add to cart / Book viewing** above the fold.
- Follow an artisan; followed authors boost in my feed.
- Share any pin to WhatsApp via a real URL.

**Artisan / Supplier (creator/seller)**
- My existing portfolio/products appear as pins automatically — zero work to be in the feed (server-side derivation).
- Post a new pin (image or ≤60s video) with title, caption, trade, room, optional budget band, tags.
- See per-pin saves/views (P2) — evidence the platform brings work.

**Admin**
- Hide/remove any pin; existing admin feed tooling repurposed for moderation.

## Functional requirements — v1 (client)

| # | Requirement |
|---|---|
| C1 | Masonry feed at `/`, SSR'd first page, cursor-paginated infinite scroll, **zero layout shift** — cells sized from the server-provided `aspectRatio` (computed at upload; never measured client-side). |
| C2 | Pin detail = modal over feed with real URL `/pin/[id]` (Next intercepted route) — shareable + indexable. Commerce CTA above the fold, wired to existing quote/cart/viewing flows. |
| C3 | Save/board UX: one-tap save → board picker (never a form first); board create/rename/delete; board gallery on profile. |
| C4 | Follow/unfollow buttons on pins and profiles (feed boost is server-side ranking). |
| C5 | Native pin upload UI for artisan/supplier roles: image or video ≤60s (transcode/poster/aspect ratio are server+Cloudinary concerns). |
| C6 | Video in feed renders poster frame, **tap-to-play only** — no autoplay on mobile data. |
| C7 | Filter chips: trade, room, budget band. Text search over title/caption/tags. |
| C8 | Old home content → `/about`; nav/bottom-nav reworked around the feed. |
| C9 | Admin moderation screens: hide/remove pin, feature pin. Existing admin feed cards become admin-authored pins. |

Server-side counterparts (Pin entity, backfill, ranking aggregation F1/F9, derived-pin upserts): server repo `/docs/prd.md` F1–F10.

## Non-goals (v1)

Likes, comments, DMs beyond existing chat, ML personalization, visual search, autoplay video, client-authored pins, pin ads/promotion.

## Success metrics

- **WCAF** (north-star): commerce actions originating from a pin — instrument `source=pin:<id>` on quote/order/viewing creation.
- Save rate ≥ 5% of pin opens; D7 retention of users with ≥1 board noticeably above baseline; ≥30% of active artisans post natively within 60 days.

## Risks & mitigations (client-relevant)

| Risk | Mitigation |
|---|---|
| SEO regression from replacing home | SSR first feed page; `/about` keeps marketing copy; pin pages indexable |
| Video bandwidth costs on user data | Poster frames + tap-to-play only; 720p/60s caps enforced server-side |
| Layout shift wrecking the masonry feel | Server-stored aspect ratio sizes every cell before media loads |

## Mobile app note

The mobile app ships the same feed-first experience against the same API. Nothing in the API surface is web-only; the Next.js rendering details in this doc are this repo's concern alone.
