# Decision Log — Web Client

**Repo-scoped extract — platform-canonical log: server repo /docs/DECISIONS.md.**

_Newest first. Every entry: date · decision · why · what it forecloses._

## 2026-07-27 — Pinterest-style pivot: four scope decisions
1. **Feed becomes home** — sintherior.com lands on the masonry feed; old home → `/about`. Full commitment to inspiration-first identity.
2. **Native pin creation: artisans + suppliers only** (clients browse/save/act). Keeps every pin commercially actionable and moderation load low.
3. **Engagement = saves + boards + follows; no likes/comments in v1.** Saves are the only engagement currency → saving must be one-tap frictionless.
4. **Video ships in v1** (overriding an images-first recommendation) — with guardrails: ≤60s, 720p transcode cap, poster + tap-to-play, no autoplay on mobile data, monthly Cloudinary cost review + images-only kill-switch.

Also: **Pin becomes the canonical entity** for feed media (derived pins auto-upsert from Products/Properties; legacy embedded portfolios backfilled once, then read-only).

## 2026-07-27 — Docs split per repo (no monorepo)
The three (soon four) codebases are independent git repos; a workspace-root docs folder would be unversioned and cross-cutting. Each repo carries its own tailored `/docs`; the **server repo holds the platform-canonical** north-star, glossary, and decision log (server is the hub every surface consumes). This repo's docs are the web-client-scoped set and point there for platform context.

## 2026-07-04 — Vercel production tracks `v1.1`
Production branch corrected from `master` (repo's live branch is `v1.1`). Every push to `v1.1` is a production release.

## 2026-07-04 — Legacy uploads purged instead of migrated
All 10 DB references to dead `/uploads/` disk files nulled (8 chat attachments pulled, 2 avatars unset; backup JSON retained). The physical files died with Render's disk; hand-matching survivors was disproportionate. Forecloses: those assets are gone; affected users re-upload. Client impact: new uploads live on Cloudinary — `res.cloudinary.com` is whitelisted in `next.config.ts` `images.remotePatterns` alongside the Railway/API hosts.
