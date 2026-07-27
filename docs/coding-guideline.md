# Coding Guideline — Web Client

_Last updated: 2026-07-27 · Tags: **[LINT]** automatable · **[TEST]** needs a test · **[REVIEW]** human judgment_

Adapts Sawyer's house style to this repo (TypeScript, Next.js App Router). Server and bot rules: server repo `/docs/coding-guideline.md`.

## Repo & branches

- This repo deploys from branch **`v1.1` = Vercel production**. Pushes to `v1.1` auto-deploy — **treat every push as a production deploy.** [REVIEW]
- Feature-scale work (e.g. feed milestones): branch per unit of work, merge when the increment is deployable. Small fixes may land directly per current practice. [REVIEW]
- **One summarized commit message covering all changes in the push** — not split-by-feature commit trains. (Established project convention.)
- Every commit builds: `npx tsc --noEmit` before push. [LINT]

## TypeScript / React

- `strict` stays on; **no `any`** — `unknown` + narrowing. [LINT]
- **Zod at the boundaries:** zod for external data shapes; derive types from schemas where a schema exists. New API-consuming code validates at the boundary. [REVIEW]
- **API calls go through `src/lib/apiClient.ts`** — never raw `fetch` to the API from components (the auth-refresh loop lives there). Exception: intentional cookie-only calls (see AuthContext). [REVIEW]
- **Browser globals (`location`, `window`, `localStorage`) never execute at module scope or in render bodies** — effects/handlers only. Statically generated pages execute render server-side; this has bitten us (checkout SSG crash). Same rule covers `router.push()` in a render body. [REVIEW]
- Remote image hosts must be whitelisted in `next.config.ts` `images.remotePatterns` before use (needs a rebuild). [REVIEW]
- Feed vocabulary is law: **Pin**, never "post" or "card", in code and UI (see glossary.md). [REVIEW]

## Size ceilings [LINT]

Warn at 300 lines/file, error at 500 (split by responsibility); ≤60 lines/function. Current outliers (600-line feed page) are acknowledged debt — do not add to them; shrink when touched.

## Money [REVIEW — always]

All money is integer **kobo** end to end; convert to ₦ at the display edge only, never store or compute in floats client-side. Wallet/escrow logic is server-owned — the client displays, it never derives balances.

## Docs move with code [REVIEW]

Env, deploy, routing, or scope changes update the relevant `/docs` file **in this repo** in the same unit of work. Decisions of consequence get a dated entry in the platform-canonical log (server repo `/docs/DECISIONS.md`) and, when repo-relevant, in this repo's DECISIONS.md extract.

## Server (pointer)

Node/Express/Mongoose rules — env access via `config`, route→controller→model layering, validator rules, index discipline, no-FS-writes, append-only money paths: server repo `/docs/coding-guideline.md`.
