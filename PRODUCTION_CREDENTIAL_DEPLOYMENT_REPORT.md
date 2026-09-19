# Production Credential Deployment Audit Report

| Field | Value |
|---|---|
| **Project** | Nivaro / `3d_ondemand_printing` |
| **Repository path** | `C:\Users\mh627\OneDrive\Desktop\3d_ondemand_printing` |
| **Audit date** | 2026-09-19 |
| **Focus** | Environment variables & credential **deployment safety** (not a full app security review) |
| **Method** | Evidence against live code, git, CI, and configs; cross-check of `CREDENTIAL_SECURITY_AUDIT_REPORT.md` verified, not copied blindly |
| **Code changes** | Report file only — no app code, `.env`, rotation, or history rewrite |
| **Secret handling** | No live values reproduced; `[REDACTED]` / type-only / length-only where relevant |

---

## Overall Verdict

### **NOT SAFE TO DEPLOY**

**Evidence-based justification:** The repository has solid *guards* for a production deploy path (`APP_ENV=production` / `VERCEL_ENV=production` → reject weak `AUTH_SECRET`, reject SQLite `DATABASE_URL`, fail-closed wallet stubs, minimize `/api/health`), and git hygiene for `.env` is good. However, **production is not currently provisioned or proven safe**:

1. **External production secrets are not verified as provisioned** — local `.env` uses SQLite (`file:`) and a placeholder-class `AUTH_SECRET` (length observed only; value not disclosed). No host secret manager configuration exists in-repo.
2. **Demo seed creates privileged accounts (including ADMIN) with a publicly documented shared password** — running seed against any shared/staging/production DB is a credential compromise.
3. **Client-reachable demo password string** can be forced into production UI via `NEXT_PUBLIC_ALLOW_DEMO_CREDENTIALS=true`.
4. **Wallet payment providers are stubs** — merchant env vars are detected but not used for live capture; `ALLOW_PAYMENT_STUB=true` can mark payments `COMPLETED` under `NODE_ENV=production`.
5. **Deploy-time secret checks are skippable** if a live host runs with `NODE_ENV=production` (Next default) but **without** `APP_ENV=production` / `VERCEL_ENV=production`.

A future deploy can become **SAFE WITH CONDITIONS** only after the Production Blockers and Deployment Requirements below are completed and re-verified.

| Severity | Count (this audit) |
|---|---|
| Production blockers | **5** |
| CRITICAL findings | **1** |
| HIGH findings | **4** |
| MEDIUM findings | **4** |
| LOW / INFORMATIONAL | **4** |

---

## CHECK 1 — Git

| Item | Result | Evidence |
|---|---|---|
| `.env` ignored | **PASS** | `.gitignore` lines 33–34: `.env*` with `!.env.example` |
| Production `.env` not tracked | **PASS** | `git ls-files` shows only `.env.example`; `git check-ignore -v .env` → ignored |
| `.env.example` placeholders only | **PASS** | Placeholders like `<GENERATE_…>`, `<YOUR_…>`, localhost URLs, commented provider keys; no live API keys |
| Credentials in source/docs | **FAIL (demo material)** | Shared demo password `password123` in `prisma/seed.ts`, `README.md`, `MOBILE.md`, gated sign-in UI — intentional for local demo, **unsafe if used in prod data** |
| Live third-party keys in tracked source | **PASS** | Pattern scan (`sk_live`, `AKIA…`, PEM private keys, `ghp_`, Slack tokens) — no matches |
| `.env` in git history | **PASS** | `git log --all --full-history` for `.env` / `.env.local` / `.env.production` — empty; no evidence `.env` was previously committed |
| Previously committed live secrets → rotate | **N/A (no `.env` commit found)** | Demo password in seed/docs is intentional public demo material — treat as compromised knowledge for any seeded non-local DB; **do not rewrite git history** for that |

**Status:** Git hygiene for env files is sound. Demo password publication is a **deployment/ops risk**, not a leaked production API key.

---

## CHECK 2 — Frontend Exposure

### Env vars that can reach the browser / public surface

| Variable | Classification | Reaches browser? | Evidence |
|---|---|---|---|
| `NEXT_PUBLIC_APP_NAME` | **PUBLIC** | Yes (bundle) | `src/lib/brand.ts` — branding only |
| `NEXT_PUBLIC_APP_ORIGIN` | **PUBLIC** | Yes if set at build | Documented in `.env.example` for client banners / Capacitor; not in Zod schema |
| `NEXT_PUBLIC_ALLOW_DEMO_CREDENTIALS` | **PUBLIC / DANGEROUS FLAG** | Yes (build-time) | `src/lib/demo-credentials.ts` → sign-in UI |
| Hardcoded demo password string `password123` | **SENSITIVE (when UI enabled)** | Yes when `SHOW_DEMO_CREDENTIALS` | `src/app/auth/sign-in/page.tsx` |
| `DATABASE_URL`, `AUTH_SECRET`, wallet passwords, future AI/S3 keys | **SERVER-ONLY / SENSITIVE** | No evidence of client import | Used only via `process.env` in server modules / Auth.js |
| `AUTH_URL` | **SERVER (metadata)** | Indirect | `layout.tsx` `metadataBase`, `sitemap.ts`, `robots.ts` — public URL only, not a secret |

### Client gate detail

```ts
// src/lib/demo-credentials.ts
SHOW_DEMO_CREDENTIALS =
  NEXT_PUBLIC_ALLOW_DEMO_CREDENTIALS === "true" || NODE_ENV !== "production"
```

- Default `next start` (`NODE_ENV=production`): demo hints **hidden**.
- If `NEXT_PUBLIC_ALLOW_DEMO_CREDENTIALS=true` at **build** time: demo emails + password appear in client JS even on production hosts → **production blocker / misconfiguration**.

`allowDemoCredentials()` in `src/lib/env.ts` is stricter about `isProductionDeploy()`, but the **sign-in page uses `SHOW_DEMO_CREDENTIALS`**, not that helper.

**No evidence** of `AUTH_SECRET`, `DATABASE_URL`, or wallet passwords embedded in client bundles via `NEXT_PUBLIC_*`. Source maps: Next default; `next.config.ts` does not enable `productionBrowserSourceMaps`.

**Status:** No server secrets found on the public surface by design; **demo password string is a browser exposure risk when the public flag is set**.

---

## CHECK 3 — Backend

| Topic | Assessment | Evidence |
|---|---|---|
| Secrets from runtime env | **PASS (pattern)** | Auth.js uses `AUTH_SECRET` from env; Prisma uses `DATABASE_URL`; payments/AI/storage/notify read env |
| Hardcoded fallbacks | **WARN** | `getEnv()` falls back `DATABASE_URL` → `file:./dev.db` when unset — safe for local, **dangerous if prod omit APP_ENV gate** |
| Default / placeholder AUTH_SECRET | **Rejected only on prod deploy gate** | Rejects length &lt;32 and substrings `replace-with`, `ci-secret`, exact `printora-dev-secret-change-in-production` when `isProductionDeploy()` |
| Hardcoded API keys | **PASS (none found)** | JazzCash/Easypaisa only check *presence*; AI/S3 stubs do not call live APIs with keys |
| Secrets in config files | **PASS** | No committed production secrets in tracked configs |
| Secrets in console logs | **Mostly PASS** | Seed logs demo password (ops risk); notify masks recipient in `NODE_ENV=production`; env warnings do not print secret values |
| Secrets in API responses | **PASS (prod path)** | `/api/health` returns only `{ ok, latencyMs, timestamp }` when `NODE_ENV=production` |

Auth.js: `trustHost: true` (`src/lib/auth.ts`) — required for proxies; mitigate with https `AUTH_URL` (enforced under prod deploy gate) + HSTS in `next.config.ts`.

**Status:** Backend secret *wiring* is env-based and acceptable; **operational gates must be set** or weak/SQLite defaults can slip through.

---

## CHECK 4 — Docker

| Item | Result |
|---|---|
| Dockerfile / compose / `.dockerignore` | **N/A** — none found under repo root (recursive listing empty) |
| Secrets in image layers | **N/A** |
| Build-time vs runtime secrets | **N/A** |

**Evidence:** No Docker artifacts; deployment assumed via Node host / Vercel-class platform / similar (CI builds with disposable env only).

---

## CHECK 5 — Deployment

### Recommended secret mechanism

Use the **hosting platform’s encrypted environment / secret store** (e.g. Vercel Project Environment Variables, Railway/Render secrets, AWS Secrets Manager / SSM, Azure Key Vault, GCP Secret Manager). **Do not commit `.env`**. Set production values at runtime (or build-time only for intentional `NEXT_PUBLIC_*`). Prefer separate projects/environments for staging vs production.

### Variable deployment table

| Variable | Required? | Secret? | Server/Client | Production Source | Validation |
|---|---|---|---|---|---|
| `APP_ENV` | **Yes** (set `production`) | No | Server | Platform env | `isProductionDeploy()`; enables assertProductionSecrets |
| `DATABASE_URL` | **Yes** | **Yes** | Server | Secret manager — Postgres + `sslmode=require` | Rejects `file:` when prod deploy |
| `AUTH_SECRET` | **Yes** | **Yes** | Server | Secret manager — `openssl rand -base64 32` (or stronger) | ≥32 chars; rejects known placeholders |
| `AUTH_URL` | **Yes** | No (public URL) | Server | Platform env — `https://…` | Must start with `https://` when prod deploy |
| `AUTH_TRUST_HOST` | Optional | No | Server | Platform env | Auth.js ecosystem; code also hardcodes `trustHost: true` |
| `NEXT_PUBLIC_APP_NAME` | Optional | No | Client | Build/runtime public | Branding |
| `NEXT_PUBLIC_APP_ORIGIN` | Optional | No | Client | Public origin URL | Capacitor / banners |
| `NEXT_PUBLIC_ALLOW_DEMO_CREDENTIALS` | **Must be unset/false** | No (dangerous) | Client | Never on live | Forces demo password UI |
| `ALLOW_DEMO_CREDENTIALS` | **Must be unset/false** | No | Server | Never on live | Server-side demo allowance |
| `ALLOW_PAYMENT_STUB` | **Must be unset/false** | No | Server | Drill only | Bypasses wallet fail-closed |
| `PAYMENT_PROVIDER` | Yes (choose mode) | No | Server | `cod_hybrid` until live gateway | Wallet modes are stubs |
| `JAZZCASH_MERCHANT_ID` / `JAZZCASH_PASSWORD` | If live JazzCash | **Yes** | Server | Secret manager | Presence only today — **not live API** |
| `EASYPAISA_STORE_ID` / `EASYPAISA_PASSWORD` | If live Easypaisa | **Yes** | Server | Secret manager | Presence only today — **not live API** |
| `AI_PROVIDER` + future API keys | When leaving stub | **Yes** (keys) | Server | Secret manager | Stub / live-ready only today |
| `STORAGE_PROVIDER` + `S3_*` | When not local disk | **Yes** (keys) | Server | Secret manager | Object stub **throws** until wired |
| `NOTIFY_PROVIDER` | Optional | Depends | Server | Prefer real provider or `noop` | `console` logs message bodies |
| `CAPACITOR_SERVER_URL` | Mobile only | No | Build | Device URL | Not a signing secret |
| `VERCEL_ENV` | If on Vercel | No | Server | Platform | `production` also triggers deploy checks |
| `NODE_ENV` | Set by Next | No | Both | Framework | `production` for `next start`; **alone does not assert secrets** |

CI (`.github/workflows/ci.yml`) sets disposable `DATABASE_URL=file:./ci.db` and `AUTH_SECRET=ci-secret-not-for-production` and **intentionally omits** `APP_ENV=production` — correct for CI; **must not** be copied to production.

---

## CHECK 6 — Environment Separation

| Concern | Status | Evidence |
|---|---|---|
| Dev / staging / prod naming | **Partial** | `APP_ENV`: `development` \| `test` \| `staging` \| `production` in Zod; `.env.example` documents it |
| Production creds not required locally | **PASS (design)** | Local SQLite + weak AUTH allowed when not prod deploy |
| Dev cannot access prod resources by default | **Unable to Verify (ops)** | No shared prod connection strings in repo; risk is operator copying prod URL into local `.env` |
| Staging isolation | **Not enforced in code** | Same binary; separation is env/project-level |
| Seed cross-contamination | **HIGH RISK** | `db:seed` / `db:setup` apply demo users to whatever `DATABASE_URL` points at — **no `APP_ENV` guard in seed** |

**Recommendation:** Separate DB instances and secret stores per environment; never point local tools at production `DATABASE_URL`; never run `prisma/seed.ts` against staging/prod.

---

## CHECK 7 — Credential Permissions

| Integration | Least-privilege notes | Status |
|---|---|---|
| PostgreSQL | App role: CRUD on app schema only; no superuser; TLS (`sslmode=require`) | **Required at provision time** (Unable to Verify live grants) |
| Auth.js JWT | Single signing secret; rotate invalidates sessions | Design OK |
| JazzCash / Easypaisa | Merchant credentials should be payment-capture scoped only | **N/A until live API** — do not over-privilege when wiring |
| AI providers | Restrict to needed models / spend caps | Keys not implemented in call path |
| Object storage | Bucket-scoped IAM; no account root keys | Stub only |
| Admin / demo users | Seed creates ADMIN + ops with shared password | **Violates least privilege if seeded outside local** |

---

## CHECK 8 — Credential Rotation

| Credential | Rotatable? | Longevity | Method | Zero-downtime | Rotate-before-prod? |
|---|---|---|---|---|---|
| `AUTH_SECRET` | Yes | Long-lived until rotate | Replace in secret manager + restart | Brief JWT invalidation (all sessions) | **Yes** if ever used placeholder/dev |
| `DATABASE_URL` password | Yes | Long-lived | DB user password rotate + update secret + rolling restart | Possible with dual-password / connection drain | **Yes** on any leak suspicion |
| Demo user passwords | Yes / delete | Fixed shared knowledge | Force reset or delete seeded users | Yes | **Mandatory** if any non-local seed occurred |
| Wallet merchant passwords | Yes | Provider-dependent | Portal rotate + env update | Provider-dependent | When issued |
| AI / S3 keys | Yes | Long-lived | Provider console + env | Rolling restart | When issued |
| CI disposable secrets | N/A | Ephemeral | Do not reuse | N/A | Never promote to prod |

**No git history rewrite recommended** — no committed `.env` found.

---

## CHECK 9 — Logging

| Surface | Risk | Evidence |
|---|---|---|
| App console | Low for secrets; medium for PII | `notify/outbound.ts` logs subject + body slice; masks recipient in production |
| Seed script | **High if run in prod** | Logs shared demo password in plaintext |
| `getEnv` warnings | Low | Prints validation messages, not secret values |
| `error.tsx` | Low | Full error only when not production; digest otherwise |
| Prisma | Low | `error` only in production (`src/lib/db.ts`) |
| `/api/health` | Low in prod | Minimal JSON; richer in non-prod |
| CI logs | Low | Disposable non-prod secrets printed as workflow `env:` (expected; not production material) |
| Request logging | Not observed as dumping Authorization / passwords | No credential dump middleware found |

**Status:** No evidence of logging `AUTH_SECRET` / DB URLs / wallet passwords. Avoid `NOTIFY_PROVIDER=console` on customer-facing prod if message bodies contain PII.

---

## CHECK 10 — Report Artifacts

This document includes: Credential Inventory, Findings, Deployment Requirements, Production Blockers, Final Checklist, and Overall Verdict.

---

## Credential Inventory

| Variable | Secret? | Client/Server | Environment | Risk | Status |
|---|---|---|---|---|---|
| `DATABASE_URL` | Yes | Server | All | Credential theft → full data access; SQLite forbidden in prod deploy | Local SQLite; prod must supply Postgres |
| `AUTH_SECRET` | Yes | Server | All | Session forgery if weak/leaked | Validated only when prod deploy gate on |
| `AUTH_URL` | No | Server | All | Cookie / redirect / metadata base | https required for prod deploy |
| `AUTH_TRUST_HOST` | No | Server | All | Host header trust | Hardcoded trustHost also true |
| `APP_ENV` | No | Server | All | Skipping `production` skips secret asserts | Must be set on live |
| `NEXT_PUBLIC_APP_NAME` | No | Client | All | None (branding) | OK |
| `NEXT_PUBLIC_APP_ORIGIN` | No | Client | All | Origin disclosure only | OK if correct URL |
| `NEXT_PUBLIC_ALLOW_DEMO_CREDENTIALS` | No (flag) | Client | Never prod | Exposes demo password in UI/bundle | Must stay false/unset |
| `ALLOW_DEMO_CREDENTIALS` | No (flag) | Server | Never prod | Enables demo allowance | Must stay false/unset |
| `ALLOW_PAYMENT_STUB` | No (flag) | Server | Drill only | Fake COMPLETED payments | Must stay false/unset |
| `PAYMENT_PROVIDER` | No | Server | All | Wrong mode → stub/fail | Prefer `cod_hybrid` until live |
| `JAZZCASH_*` | Yes | Server | When wallet live | Merchant account abuse | Unused for live API today |
| `EASYPAISA_*` | Yes | Server | When wallet live | Merchant account abuse | Unused for live API today |
| `AI_PROVIDER` / future AI keys | Keys: Yes | Server | Future | Spend / data exfil | Stub path |
| `STORAGE_PROVIDER` / `S3_*` | Keys: Yes | Server | Future | Object access | Local OK for single-node; object stub throws |
| `NOTIFY_PROVIDER` | Depends | Server | All | PII in logs if console | Prefer noop/real provider |
| `CAPACITOR_SERVER_URL` | No | Build | Mobile | Wrong origin | Dev/mobile |
| `VERCEL_ENV` | No | Server | Vercel | Triggers prod checks | Platform-managed |
| Demo password (seed/docs/UI) | Yes (knowledge) | Source/docs/UI | Local demo only | Account takeover if seeded | **Do not seed prod** |
| CI `AUTH_SECRET` / SQLite URL | Disposable | CI only | CI | Mis-copy to prod | Rejected by prod gate substrings |

---

## Findings

| ID | Issue | Severity | Evidence | Recommendation | Status |
|---|---|---|---|---|---|
| DEP-001 | Demo seed creates ADMIN/ops/customer users with publicly known shared password | **CRITICAL** | `prisma/seed.ts` hashes shared demo password for all seeded roles including `admin@printora.pk`; `README.md` / `MOBILE.md` publish it; seed has no prod guard | Never run seed on staging/prod; delete/reset if already seeded; gate seed with `APP_ENV` check in a future change | **Open — blocker** |
| DEP-002 | Production secrets / Postgres not verified as provisioned for live deploy | **HIGH** | Local `.env` present with SQLite scheme + placeholder-class `AUTH_SECRET` (length-only); no in-repo secret manager wiring | Provision via host secret store before go-live; set `APP_ENV=production` | **Open — blocker** |
| DEP-003 | `NEXT_PUBLIC_ALLOW_DEMO_CREDENTIALS` can expose demo password in production client UI | **HIGH** | `demo-credentials.ts` + `sign-in/page.tsx` | Keep unset/false; fail deploy if true; prefer server-only gating | **Open — blocker if set** |
| DEP-004 | Wallet stubs can COMPLETE payments if `ALLOW_PAYMENT_STUB=true` under `NODE_ENV=production` | **HIGH** | `WalletLiveReadyProvider` in `payment.ts` | Keep unset; use `cod_hybrid` until real gateway; never enable stub on live money | **Open — blocker if set / if wallet mode without live API** |
| DEP-005 | Prod secret asserts skipped unless `APP_ENV` or `VERCEL_ENV` is production | **HIGH** | `isProductionDeploy()` in `env.ts`; CI comment confirms intentional skip | Always set `APP_ENV=production` on customer-facing hosts | **Open — config blocker** |
| DEP-006 | `trustHost: true` always enabled | **MEDIUM** | `src/lib/auth.ts` | Require https `AUTH_URL`, reverse proxy TLS termination, monitor host spoofing | **Open (mitigated by https gate)** |
| DEP-007 | Local disk uploads (`STORAGE_PROVIDER=local`) unsuitable for multi-instance / durable prod | **MEDIUM** | `storage/index.ts` writes under `public/uploads` | Wire S3/R2 with least-privilege keys before multi-node | **Open (ops)** |
| DEP-008 | Notify console provider logs message bodies | **MEDIUM** | `notify/outbound.ts` | Use `noop` or real provider; avoid PII in logs | **Open** |
| DEP-009 | In-memory rate limits do not share across instances | **MEDIUM** | `docs/PRODUCTION.md`, `rate-limit.ts` usage | Redis (or equivalent) for multi-instance | **Open** |
| DEP-010 | Demo password published in tracked docs | **LOW** | `README.md`, `MOBILE.md` | Acceptable for local onboarding; document “local only” prominently | **Accepted risk for local** |
| DEP-011 | CI embeds disposable auth secret in workflow YAML | **LOW** | `.github/workflows/ci.yml` | Keep; never copy to prod (prod gate rejects `ci-secret`) | **Accepted** |
| DEP-012 | No Docker hardening surface | **INFO** | No Docker files | N/A; secure host/platform instead | **N/A** |
| DEP-013 | Object / AI / wallet live APIs not implemented | **INFO** | stubs throw or simulate | Do not claim live payments/AI/storage until wired | **Expected** |

---

## Deployment Requirements

Before any customer-facing production traffic:

1. Set **`APP_ENV=production`** (or deploy on Vercel production so `VERCEL_ENV=production`).
2. Set **`DATABASE_URL`** to PostgreSQL with TLS (`sslmode=require`) via secret manager — not SQLite.
3. Set strong unique **`AUTH_SECRET`** (≥32 chars, non-placeholder) via secret manager.
4. Set **`AUTH_URL=https://<production-domain>`**.
5. Ensure **`NEXT_PUBLIC_ALLOW_DEMO_CREDENTIALS`**, **`ALLOW_DEMO_CREDENTIALS`**, and **`ALLOW_PAYMENT_STUB`** are unset or `false`.
6. Set **`PAYMENT_PROVIDER=cod_hybrid`** until a real JazzCash/Easypaisa/card integration replaces the stub.
7. **Do not run** `npm run db:seed` / `db:setup` / `prisma db seed` against production.
8. Prefer **`NOTIFY_PROVIDER=noop`** (or a real provider with secrets) over console logging of message bodies.
9. Plan object storage before horizontal scale; keep uploads off ephemeral local disk for multi-instance.
10. Store all secrets in the **platform secret manager** — never commit `.env`.

---

## Production Blockers

Clear list — **must resolve before claiming deploy-safe:**

1. **Provision production `DATABASE_URL` (Postgres + TLS) and strong `AUTH_SECRET` + https `AUTH_URL` with `APP_ENV=production`** — not verified present for a live environment.
2. **Guarantee demo seed is never applied to production/staging data**; rotate/delete if already applied.
3. **Guarantee demo/public flags are off** (`NEXT_PUBLIC_ALLOW_DEMO_CREDENTIALS`, `ALLOW_DEMO_CREDENTIALS`).
4. **Do not enable `ALLOW_PAYMENT_STUB` or wallet `PAYMENT_PROVIDER` modes** until live gateway code exists.
5. **Treat local `.env` as non-production** (SQLite + placeholder-class secret observed) — do not promote it.

---

## Final Checklist

PASS only where verified in this audit:

| # | Check | Result |
|---|---|---|
| 1 | Git: `.env` ignored; production `.env` not tracked; `.env.example` placeholders; no live third-party keys in source; `.env` absent from accessible history | **PASS** (demo password in docs/seed is separate — see #7) |
| 2 | Frontend: env inventory classified; no server secrets found in client path; sensitive demo password only via gated public flag | **PASS** default / **FAIL** if `NEXT_PUBLIC_ALLOW_DEMO_CREDENTIALS=true` |
| 3 | Backend: secrets from runtime env; no hardcoded live API keys; prod health redacts; fallbacks gated | **PASS** with condition that `APP_ENV`/`VERCEL_ENV=production` is set |
| 4 | Docker: secrets not baked into images | **N/A** (no Docker — verified absence) |
| 5 | Deployment table + secret-manager recommendation documented | **PASS** (documentation); live provisioning **Unable to Verify** |
| 6 | Environment separation (dev vs prod resources) | **PARTIAL** — code supports `APP_ENV`; seed not gated; live isolation **Unable to Verify** |
| 7 | Credential permissions / least privilege | **FAIL** for demo seed ADMIN shared password; external API grants **Unable to Verify** |
| 8 | Credential rotation plan documented | **PASS** (plan); rotation **not performed** (audit-only) |
| 9 | Logging: no evidence of printing passwords/API keys/AUTH_SECRET | **PASS** (seed/demo password log is script-only risk) |
| 10 | Report structure complete (inventory, findings, requirements, blockers, checklist, verdict) | **PASS** |
| — | **Overall safe to deploy?** | **FAIL — NOT SAFE TO DEPLOY** until blockers cleared |

---

## Key Files Reviewed

- `.gitignore`, `.env.example`, local `.env` (**keys/metadata only**, values not reproduced)
- `src/lib/env.ts`, `src/lib/env.test.ts`, `src/instrumentation.ts`
- `src/lib/auth.ts`, `src/lib/demo-credentials.ts`, `src/app/auth/sign-in/page.tsx`
- `src/lib/orders/payment.ts`, `src/lib/storage/index.ts`, `src/lib/notify/outbound.ts`, `src/lib/ai/*`
- `src/app/api/health/route.ts`, `next.config.ts`, `src/app/layout.tsx`
- `prisma/seed.ts`
- `.github/workflows/ci.yml`
- `README.md`, `MOBILE.md`, `docs/PRODUCTION.md`
- Cross-check: `CREDENTIAL_SECURITY_AUDIT_REPORT.md` (verified against live code)

## Explicit Non-Actions

- No application code modified (except writing this report)
- No `.env` edits
- No credential rotation
- No git history rewrite
- No secret values printed

---

*End of production credential deployment audit report.*
