# Security — Web Client Slice

_Last updated: 2026-07-27_

Scope: what this repo is responsible for. The full platform threat model (webhook signatures, payment/payout fraud posture, rate limiting, CORS, injection defenses): server repo `/docs/security.md`.

## Token handling (XSS posture)

- **Access token (JWT, 15m) is held in memory only** — never localStorage, never a readable cookie. XSS can't exfiltrate what isn't stored.
- **Refresh token (7d) is an httpOnly SameSite cookie** the client JS can't read; `apiClient` sends it with `credentials: "include"` and auto-refreshes once on 401.
- React escaping is the baseline; **no `dangerouslySetInnerHTML` without sanitization** [REVIEW on any new use].
- Socket.IO handshake authenticates with the access token (function-form auth, freshest token per reconnect).

## Secrets

`NEXT_PUBLIC_*` is **public by definition** — inlined into the shipped bundle. Nothing sensitive ever goes in one. This repo holds no server secrets at all; anything secret lives in the Railway/Vercel env stores (and only non-`NEXT_PUBLIC` vars would even be safe on Vercel — this client needs none).

## Server-side enforcement (client must not fake it)

- **Board privacy is enforced server-side** on every board/pin-listing query. The client may hide private-board UI, but hiding is presentation — never treat client-side concealment as the protection.
- Same principle everywhere: role gates, ownership checks, and money logic are server-owned; client-side checks are UX, not security.
- Don't expose emails/phones on pin/author cards — contact happens through in-app chat/quotes (anti-scraping posture; the feed is public by design).

## Uploads (feed pivot)

- **EXIF is PII here** — pin uploads are photos of people's homes with location data. Cloudinary transcode strips EXIF server-side; the client upload flow must not bypass that pipeline (always upload through the API, never direct-to-anywhere-else).
- Per-author pin rate limits and file type/size caps are enforced server-side; surface their errors honestly in the UI.

## Standing rules (inherited)

- Secrets live in Railway/Vercel env stores only — never in git, chat logs, or client bundles.
- Compromised secret → rotate in the env store, redeploy, review logs for the abuse window (see ops-playbook.md).

> **Full threat model:** server repo `/docs/security.md`.
