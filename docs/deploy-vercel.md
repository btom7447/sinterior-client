# Deploy Runbook — Vercel (sinterior-client)

_Last updated: 2026-07-27 · Project: **sinterior-client** (team btom7447s-projects, Pro) · Production: https://www.sintherior.com_

## Setup

- **Production tracks branch `v1.1`** (Settings → Environments → Production). Pushes to `v1.1` deploy straight to production — treat every push as a release.
- Vercel DNS hosts `sintherior.com` (apex + www + `api`/`bot` CNAMEs to Railway). Manage: `vercel dns ls sintherior.com`.
- Local dir is `vercel link`ed; CLI ≥ 54 required for `vercel deploy` (older versions fail the upload endpoint).

## Environment variables (Production + Preview)

| Var | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.sintherior.com/api/v1` | **Must end exactly `/api/v1`, no trailing slash.** Socket URL is derived by stripping it; 5 of 9 usage sites append paths directly — a suffix-less value 404s every REST call (this happened; see History). |
| `NEXT_PUBLIC_APP_URL` | `https://sintherior.com` | Canonical site URL for SEO files. |

### ⚠️ Setting env values — two hard-won rules

1. **Set values from Git Bash**: `printf '%s' "value" | vercel env add NAME production` — PowerShell's pipeline corrupts values with a BOM + trailing CRLF (invisible, breaks everything downstream).
2. **`NEXT_PUBLIC_*` are inlined at build time** — after changing one, a normal rebuild may still replay cached chunks with the old value. Force a cache-less build: `vercel deploy --prod --force`. Verify by grepping the deployed bundle:
   the live chunks must contain `https://api.sintherior.com/api/v1`.

## Verify a deploy

```bash
vercel ls sinterior-client            # newest row: ● Ready + Production
curl -I https://www.sintherior.com    # 200
# spot-check the bundle inlined the right API URL (see rule 2 above)
```

## Rollback / promote

- Instant rollback: Vercel dashboard → Deployments → previous Production deployment → **Instant Rollback** (or `vercel rollback`).
- If a build lands as Preview that should be Production: `vercel promote <deployment-url>`.

## Build gotchas

- `sitemap.ts` fetches the API at build time with an 8s `AbortSignal.timeout` — a hung API can no longer stall the build (Next kills sitemap workers at 60s×3 and fails the deploy; this happened).
- Never call `router.push()` (or touch `location`/`window`) in a render body — statically generated pages execute render server-side. Guards belong in `useEffect` (see coding-guideline.md).
- Image hosts must be whitelisted in `next.config.ts` `images.remotePatterns` — currently `localhost`, `api.sintherior.com`, `*.up.railway.app`, `res.cloudinary.com` (plus `images.unsplash.com` and `api.dicebear.com` for placeholder/avatar assets). New media hosts (e.g. video CDN) must be added there + rebuilt.

## History

2026-07-04: backend re-pointed Render → Railway. Root causes documented above so they never recur: BOM-corrupted env value (PowerShell pipe), stale build cache re-inlining old API URL, sitemap hang killing builds, production branch mistakenly tracking `master` while the repo lives on `v1.1`.
