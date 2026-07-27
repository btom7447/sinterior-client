# Ops Playbook — Web Client

_Last updated: 2026-07-27_

Scope: incidents that start (or surface) in this app. API-down, payments/payouts, cron, and DB incidents: server repo `/docs/ops-playbook.md`.

## Daily signals

- Vercel: newest deployment ● Ready + Production (`vercel ls sinterior-client`)
- `https://www.sintherior.com` loads (200) and API-backed content renders
- `https://api.sintherior.com/health` → `ok / connected / production` (rules out the server before debugging the client)

## Incident: frontend can't reach API

1. Browser console shows a **CORS error** → `CLIENT_URL` on Railway must contain the exact origin (comma-separated list). Server-side fix — see server repo playbook.
2. **404s on API calls** → check `NEXT_PUBLIC_API_URL` ends with `/api/v1` AND the deployed bundle actually inlined it (deploy-vercel.md rule 2 — build cache replays are real). Fix: correct the var via the Git Bash `printf` method, then `vercel deploy --prod --force`, then grep the live chunks.
3. **Socket not connecting** → same env var (socket URL derives from it by stripping `/api/v1`); confirm wss to api.sintherior.com.
4. All of the above fine but requests 503 → server/Mongo issue; hand off to the server playbook.

## Incident: images broken

- Rendered via `next/image` with 400s → host missing from `next.config.ts` `images.remotePatterns` (needs a rebuild after adding).
- New uploads failing → Cloudinary creds on Railway; server-side (check upload response in server logs).

## Incident: Vercel build failures

- Sitemap-related timeout → `sitemap.ts` build-time API fetch; it carries an 8s `AbortSignal.timeout` so a hung API no longer stalls builds — if it recurs, check the API first.
- Prerender crash naming `window`/`location`/`router.push` → browser global executed in a render body; move it into `useEffect` (coding-guideline.md).
- Type errors → `npx tsc --noEmit` locally before pushing is the standing rule.

## Routine: deploy & rollback

Push `v1.1` → Vercel Production → verify ● Ready + a 200 from www.sintherior.com. Rollback: dashboard → Deployments → previous Production → **Instant Rollback** (or `vercel rollback`); stray Preview that should be prod → `vercel promote <url>`. Full runbook: deploy-vercel.md.

## Routine: change an env var

Git Bash `printf '%s' "value" | vercel env add NAME production` (never PowerShell pipes — BOM/CRLF corruption), then cache-less rebuild + bundle grep (deploy-vercel.md).

## Content moderation (feed, once live)

Reported/offending pin → admin hide (instant, reversible) → review → remove or restore. Takedown target: same business day. Repeat-offender authors → existing ban tooling on User. The admin screens live in this repo (`src/app/admin`); enforcement is server-side.

> **API / payments / bot incidents, secret rotation at providers, DB backups:** server repo `/docs/ops-playbook.md`.
