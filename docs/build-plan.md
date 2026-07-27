# Build Plan — Feed Pivot (web client scope)

_Last updated: 2026-07-27 · Timeline assumes one primary builder + Claude, part-week availability. Dates are targets, not promises._

## Milestone 0 — Foundations (server prerequisite) → target ~Aug 1

Server-side data layer, no user-visible change: `Pin`/`Board`/`BoardPin`/`Follow` models, pin/board/follow routes (`/api/v1/pins` etc.), derived-pin upsert hooks, backfill script, ranking + cursor-paginated feed endpoint (`/api/v1/pins/feed`). **No client changes deploy in M0.** Full checklist: server repo `/docs/build-plan.md`.

Client work in M1 starts against these endpoints — do not begin feed UI against mocked shapes that haven't landed.

## Milestone 1 — The feed ships (≈1.5–2 weeks) → target ~Aug 14

- [ ] Masonry home at `/` (SSR first page, infinite scroll, aspect-ratio-sized cells)
- [ ] Pin modal with intercepted route `/pin/[id]` — author card, taxonomy chips, commerce CTA above the fold (quote/cart/viewing wired to existing flows)
- [ ] Save flow: one-tap save → board picker; board CRUD; boards tab on profile
- [ ] Follow buttons on pins/profiles; feed boost live
- [ ] Filter chips (trade/room/budget) + basic text search
- [ ] Old home content → `/about`; nav/bottom-nav rework
- [ ] Admin: hide/remove/feature pin (repurpose admin feed screens)
- [ ] WCAF instrumentation: `source=pin:<id>` recorded on quote/order/viewing creation

**DoD:** a logged-out visitor lands on a full feed; can open, share, and (after signup) save a pin and request a quote from it; Lighthouse mobile ≥ 85 on the feed; zero CLS from images.

## Milestone 2 — Native creation + video (≈1 week) → target ~Aug 21

- [ ] Artisan/supplier "Create pin" flow: image or ≤60s video, Cloudinary transcode (720p cap) + poster frame, taxonomy fields, per-author upload rate limit
- [ ] Tap-to-play video cells in feed + modal player
- [ ] Cloudinary cost dashboard check + images-only kill-switch flag

**DoD:** an artisan posts a video pin from a phone on mobile data; it appears in the feed with a poster frame and plays on tap; transcodes verified ≤720p.

## Milestone 3 — Retention loops, client parts (P2, ≈1–1.5 weeks) → target ~Sep 1

- [ ] Pin counters (views/saves) + artisan stats UI ("your pin got 40 saves")
- [ ] Notifications UI: followed author posted; your pin was saved
- [ ] Pin reporting UI (moderation queue is admin + server work)
- [ ] SEO: pin sitemap, board pages, structured data

**DoD (client slice):** artisan sees per-pin stats; a user can report a pin; pins indexed.

Server parts of M3 and the M4 mobile-app spike: server repo `/docs/build-plan.md`.

## Standing rules

Every milestone lands as deployable increments behind the existing deploy flow — **Vercel production tracks branch `v1.1`; every push to it is a release** (see deploy-vercel.md). Docs move with code — schema or scope changes update prd.md / system-architecture.md in the same unit of work. Money paths (escrow/wallet) are untouched by this pivot; any incidental change to them requires explicit review.
