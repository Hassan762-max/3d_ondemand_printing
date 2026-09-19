# Credential Security Audit Report

| Field | Value |
|---|---|
| **Project** | Nivaro / `3d_ondemand_printing` |
| **Repository path** | `C:\Users\mh627\OneDrive\Desktop\3d_ondemand_printing` |
| **Audit date** | 2026-09-19 |
| **Auditor role** | Credential / secrets security audit (read-only) |
| **Scope type** | Full repository credential surfaces |
| **Method** | DISCOVER → IDENTIFY → CLASSIFY → ANALYZE → STANDARD CHECK → RISK ASSESSMENT → REMEDIATION → VALIDATE → REPORT |
| **Code changes** | None (report file only) |
| **Secret handling** | No live secret values reproduced; placeholders / `[REDACTED]` / length-only masks |

---

## 1. Executive Summary

This Next.js 16 / Auth.js (JWT) / Prisma application manages credentials primarily through environment variables, bcrypt password hashes, Auth.js session cookies, and provider stubs (payments, AI, storage, notify). **No live third-party API keys** (`sk_`, `AKIA`, PEM private keys, etc.) were found in tracked source. `.env` is **gitignored** and **not present in git history**; only `.env.example` is tracked.

**Most important risks (evidence-based):**

1. **Shared demo password** `password123` is hardcoded in `prisma/seed.ts`, published in `README.md` / `MOBILE.md`, and rendered on the sign-in UI when demo hints are enabled — including **ADMIN** and ops roles. Running seed against any shared/staging/production database creates known privileged accounts (**production blocker**).
2. **`NEXT_PUBLIC_ALLOW_DEMO_CREDENTIALS=true`** (and the client `SHOW_DEMO_CREDENTIALS` gate) can **force demo password display even when `NODE_ENV=production`**, and `allowDemoCredentials()` returns `true` on that public flag **before** `APP_ENV=production` checks.
3. Production-grade secrets (`AUTH_SECRET`, Postgres `DATABASE_URL`, wallet/AI/object-storage keys) are **not wired for live use**; deploy-time checks in `src/lib/env.ts` reject weak secrets **only when** `APP_ENV=production` or `VERCEL_ENV=production`.
4. Supporting gaps: Auth.js `trustHost: true`, Android cleartext HTTP, in-memory login rate limits, and optional `ALLOW_PAYMENT_STUB=true` in production.

**Severity counts**

| Severity | Count |
|---|---|
| CRITICAL | 1 |
| HIGH | 3 |
| MEDIUM | 5 |
| LOW | 4 |
| INFORMATIONAL | 4 |

**Overall credential posture:** Suitable for local/demo development with clear controls for production *if* operators never seed demo users, never enable demo/stub flags, and supply strong secrets via a secret manager. **Not production-ready on credentials alone** until external secrets and seed/demo controls are enforced operationally.

---

## 2. Scope

| In scope | Out of scope |
|---|---|
| Source under `src/`, `prisma/`, `scripts/`, `docs/`, root configs | Runtime penetration testing of live hosts |
| `.env`, `.env.example` (keys/presence only; values redacted) | Rotating or rewriting credentials |
| `.gitignore`, `.github/workflows/*` | Destructive git history rewrites |
| Auth.js / sessions / cookies / bcrypt | Application feature bugs unrelated to credentials |
| Payment / AI / storage / notify credential hooks | Claiming OWASP/NIST “compliance” or certification |
| Git history probes for committed `.env` / high-entropy secret patterns | Modifying application code |
| Cross-check of `PRODUCTION_READINESS_REPORT.md` against current code | Full dependency CVE deep-dive beyond credential relevance |

**Primary stack observed:** Next.js `16.3.4`, `next-auth` `5.0.0-beta.32`, Prisma `6.x`, `bcryptjs`, Capacitor Android shell, GitHub Actions CI. No Dockerfile present.

---

## 3. Credential Inventory

| ID | Credential / secret type | Location(s) | Storage | Exposure surface | Prod required? | Status |
|---|---|---|---|---|---|---|
| INV-01 | `DATABASE_URL` | `.env` (local), `.env.example`, `prisma/schema.prisma`, CI | Env | Server-only | Yes (Postgres + TLS) | Local SQLite; prod blocked if `file:` + `APP_ENV=production` |
| INV-02 | `AUTH_SECRET` | `.env` (local, set), `.env.example`, CI, `src/lib/env.ts` | Env | Server-only (JWT signing) | Yes (≥32, non-placeholder) | Local placeholder-class value; CI disposable; prod rejected if weak |
| INV-03 | `AUTH_URL` / `AUTH_TRUST_HOST` | `.env*`, Auth.js config | Env | Host/cookie behavior | Yes (`https://` in prod deploy) | Validated for prod deploy |
| INV-04 | User `passwordHash` | DB via Prisma `User` | bcrypt (cost 12) | Server-only | Yes | Hashing aligned; seed uses known plaintext |
| INV-05 | Demo account plaintext password | `prisma/seed.ts`, `README.md`, `MOBILE.md`, `sign-in` UI | Source / docs / UI | Public repo + optional UI | Must **not** exist in prod | Documented shared password |
| INV-06 | Auth.js session JWT cookie | Auth.js (`authjs.session-token` / `__Secure-…`) | HttpOnly cookie (framework) | Browser | Yes | JWT strategy, 12h `maxAge` |
| INV-07 | Presence cookie `nivaro-auth-presence` | `session-lifetime.ts`, `establish` route | Non-httpOnly cookie | Browser JS | Supporting control | Not a signing secret |
| INV-08 | JazzCash / Easypaisa merchant ID + password | `.env.example` (commented), `payment.ts`, `env.ts` | Env (optional) | Server-only if set | If wallet mode | Stub only; presence detected, not used for live API |
| INV-09 | `ALLOW_PAYMENT_STUB` | `.env.example`, `payment.ts` | Env flag | Server behavior | Never on live | Fail-closed when `NODE_ENV=production` unless flag |
| INV-10 | AI provider keys (`OPENAI_API_KEY`, `REPLICATE_API_TOKEN`, `FAL_KEY`) | `.env.example` comments only | Not implemented | N/A today | When live AI wired | Not present in code paths |
| INV-11 | Object storage keys (`S3_*`) | `.env.example` comments; `storage/index.ts` stub | Not implemented | N/A today | When object storage wired | Stub throws |
| INV-12 | `NEXT_PUBLIC_*` branding / demo flag | `.env*`, `brand.ts`, `demo-credentials.ts` | Build-time public | Browser bundle | Demo flag must stay off | Public by design |
| INV-13 | CI build secrets | `.github/workflows/ci.yml` | Workflow env | CI logs (non-secret values) | N/A (disposable) | Explicit non-prod strings |
| INV-14 | Notify channel | `NOTIFY_PROVIDER` | Env | Console logs (masked recipient in prod) | Optional | No email/SMS API keys |

---

## 4. Critical & High Findings

| Finding ID | Title | Severity | Location | Status |
|---|---|---|---|---|
| CRED-001 | Shared demo password seeds privileged accounts (incl. ADMIN) | CRITICAL | `prisma/seed.ts`, `README.md`, `MOBILE.md` | Open (ops / production blocker) |
| CRED-002 | Public flag can force demo password display in production builds | HIGH | `src/lib/demo-credentials.ts`, `src/lib/env.ts`, `src/app/auth/sign-in/page.tsx` | Open |
| CRED-003 | Production Auth/DB secrets must be externally supplied and validated | HIGH | `src/lib/env.ts`, `.env.example`, `docs/PRODUCTION.md` | Open (config blocker; controls exist) |
| CRED-004 | Wallet stub drill flag can mark payments COMPLETED in production | HIGH | `src/lib/orders/payment.ts` | Open (misconfiguration risk) |

---

## 5. Complete Findings

### CRED-001 — Shared demo password seeds privileged accounts

| Field | Detail |
|---|---|
| **Finding ID** | CRED-001 |
| **Title** | Shared demo password seeds privileged accounts (including ADMIN) |
| **Severity** | CRITICAL |
| **Category** | Hardcoded / shared credentials · Seed data |
| **Location** | `prisma/seed.ts` (~L215–255, L594); `README.md` (Demo accounts); `MOBILE.md` (Demo logins) |
| **Evidence (redacted)** | `bcrypt.hash("password123", 12)` applied to all seed users including `admin@printora.pk`, ops, and vendor emails; console log announces the shared demo password; docs publish the same password. |
| **Current Behavior** | `npm run db:seed` / `db:setup` creates multiple role accounts with one well-known password. |
| **Security Risk** | Any environment seeded with this script has publicly known privileged credentials → account takeover, RBAC bypass, order/finance abuse. |
| **Applicable Standard/Principle** | OWASP ASVS V2 (password storage & credential management); NIST SP 800-63B (no shared/default passwords for production identities) — **alignment assessed, not certified**. |
| **Recommended Remediation** | Never run demo seed against staging/production; gate seed behind `APP_ENV!==production`; use unique strong passwords or disable seed users; remove admin from shared demo password set for any shared env. |
| **Status** | Open — production blocker if seed is used outside local demo |

### CRED-002 — Public flag forces demo password UI in production

| Field | Detail |
|---|---|
| **Finding ID** | CRED-002 |
| **Title** | `NEXT_PUBLIC_ALLOW_DEMO_CREDENTIALS` can expose demo password on sign-in in production |
| **Severity** | HIGH |
| **Category** | Secret leakage · Client-side configuration |
| **Location** | `src/lib/demo-credentials.ts`; `src/lib/env.ts` `allowDemoCredentials()`; `src/app/auth/sign-in/page.tsx` |
| **Evidence (redacted)** | UI shows `customer@printora.pk` / `password123` when `SHOW_DEMO_CREDENTIALS` is true. `SHOW_DEMO_CREDENTIALS = NEXT_PUBLIC_ALLOW_DEMO_CREDENTIALS === "true" \|\| NODE_ENV !== "production"`. `allowDemoCredentials()` returns `true` immediately if the public flag is `"true"`, **before** `isProductionDeploy()` returns false. |
| **Current Behavior** | Demo hints hidden under normal `next start` (`NODE_ENV=production`) unless the public flag is set; the public flag overrides production intent. |
| **Security Risk** | Misconfigured production/staging build advertises valid seeded credentials to all visitors. |
| **Applicable Standard/Principle** | Least privilege / secure defaults; ASVS V14 (configuration) |
| **Recommended Remediation** | Hard-deny demo UI when `isProductionDeploy()`; ignore public override in production; prefer server-only `allowDemoCredentials()` for UI gating; fail deploy if public demo flag is true. |
| **Status** | Open |

### CRED-003 — Production Auth/DB secrets are external blockers

| Field | Detail |
|---|---|
| **Finding ID** | CRED-003 |
| **Title** | Strong `AUTH_SECRET` and non-SQLite `DATABASE_URL` required for production deploy |
| **Severity** | HIGH |
| **Category** | Missing / weak production secrets |
| **Location** | `src/lib/env.ts` `assertProductionSecrets`; `.env.example`; local `.env` (gitignored) |
| **Evidence (redacted)** | Prod deploy requires `AUTH_SECRET` length ≥32 and rejects known placeholders (`replace-with`, `ci-secret`, documented printora-dev placeholder). Rejects `DATABASE_URL` starting with `file:`. Local `.env` has `AUTH_SECRET` set (`len=40`, placeholder-class) and SQLite `DATABASE_URL` (`file:…`). |
| **Current Behavior** | Local/CI can run with weak/disposable secrets; production deploy path fails closed when `APP_ENV=production` or `VERCEL_ENV=production`. |
| **Security Risk** | Deploying without setting `APP_ENV=production` could skip strict checks while still serving real traffic with weak JWT signing material / SQLite. |
| **Applicable Standard/Principle** | Secure defaults; secret management (NIST SP 800-57 conceptual) |
| **Recommended Remediation** | Always set `APP_ENV=production` on live hosts; generate unique `AUTH_SECRET` via secret manager; use Postgres `sslmode=require`; treat missing `APP_ENV` on public hosts as misconfiguration. |
| **Status** | Open (controls present; operational enforcement required) |

### CRED-004 — Payment stub flag enables fake COMPLETED captures in production

| Field | Detail |
|---|---|
| **Finding ID** | CRED-004 |
| **Title** | `ALLOW_PAYMENT_STUB=true` bypasses production fail-closed wallet stub |
| **Severity** | HIGH |
| **Category** | Dangerous operational flag · Payment integrity |
| **Location** | `src/lib/orders/payment.ts` (`WalletLiveReadyProvider.capture`) |
| **Evidence (redacted)** | When `NODE_ENV === "production"` and `ALLOW_PAYMENT_STUB !== "true"`, wallet stub returns FAILED. If stub flag is true, returns `status: "COMPLETED"` even without a live gateway (merchant env vars only change the message). |
| **Current Behavior** | Safe default; drill override exists. |
| **Security Risk** | Mis-set flag → fraudulent “paid” orders without real funds. |
| **Applicable Standard/Principle** | Business logic integrity; secure defaults |
| **Recommended Remediation** | Remove flag from production secret stores; require separate non-prod project for drills; alert if flag detected at boot when `APP_ENV=production`. |
| **Status** | Open (misconfiguration risk) |

### CRED-005 — Demo UI gate inconsistent with server `allowDemoCredentials()`

| Field | Detail |
|---|---|
| **Finding ID** | CRED-005 |
| **Title** | Sign-in uses `SHOW_DEMO_CREDENTIALS` instead of production-aware `allowDemoCredentials()` |
| **Severity** | MEDIUM |
| **Category** | Inconsistent credential disclosure controls |
| **Location** | `src/lib/demo-credentials.ts` vs `src/lib/env.ts`; consumer `sign-in/page.tsx` |
| **Evidence (redacted)** | Server helper considers `ALLOW_DEMO_CREDENTIALS` and `isProductionDeploy()`; client constant does not use `APP_ENV` / `VERCEL_ENV`. |
| **Current Behavior** | Dual logic; UI path is weaker/simpler. |
| **Security Risk** | Staging exposed with `NODE_ENV=development` or mismatched flags shows demo passwords even when operators believe deploy checks apply. |
| **Applicable Standard/Principle** | Consistent security controls |
| **Recommended Remediation** | Single source of truth gated on `isProductionDeploy()`; never bake demo passwords into client bundles for prod builds. |
| **Status** | Open |

### CRED-006 — Auth.js `trustHost: true`

| Field | Detail |
|---|---|
| **Finding ID** | CRED-006 |
| **Title** | Auth.js configured with `trustHost: true` |
| **Severity** | MEDIUM |
| **Category** | Session / host trust |
| **Location** | `src/lib/auth.ts` |
| **Evidence (redacted)** | `NextAuth({ trustHost: true, … })` with comments about ngrok / proxies. Prod requires `AUTH_URL` https via `assertProductionSecrets`. |
| **Current Behavior** | Host header trusted for Auth.js URL resolution behind proxies. |
| **Security Risk** | Misconfigured reverse proxy / missing canonical `AUTH_URL` can enable host-header related auth URL confusion. |
| **Applicable Standard/Principle** | ASVS V3 session management; host header hardening |
| **Recommended Remediation** | Keep `AUTH_URL` authoritative in production; restrict trusted hosts at the edge; document required proxy headers. |
| **Status** | Open (mitigated if `AUTH_URL` https enforced) |

### CRED-007 — Android cleartext traffic permitted

| Field | Detail |
|---|---|
| **Finding ID** | CRED-007 |
| **Title** | Capacitor Android allows cleartext HTTP |
| **Severity** | MEDIUM |
| **Category** | Credential transport |
| **Location** | `android/app/src/main/AndroidManifest.xml`; `network_security_config.xml` |
| **Evidence (redacted)** | `android:usesCleartextTraffic="true"`; `cleartextTrafficPermitted="true"`. |
| **Current Behavior** | Debug/mobile shell can speak HTTP. |
| **Security Risk** | Session cookies / credentials observable on hostile networks if app points at `http://` origins. |
| **Applicable Standard/Principle** | Transport security (TLS everywhere) |
| **Recommended Remediation** | Disable cleartext for release builds; force HTTPS `CAPACITOR_SERVER_URL` / `AUTH_URL`. |
| **Status** | Open |

### CRED-008 — In-memory rate limiting for login/signup

| Field | Detail |
|---|---|
| **Finding ID** | CRED-008 |
| **Title** | Credential stuffing mitigation is process-local only |
| **Severity** | MEDIUM |
| **Category** | Authentication abuse controls |
| **Location** | `src/lib/rate-limit.ts`; used from `src/lib/actions/auth.ts` |
| **Evidence (redacted)** | Comment: resets on restart; swap for Redis in multi-instance production. Limits: signup 5/min, sign-in 12/min per key. |
| **Current Behavior** | Per-instance Map buckets. |
| **Security Risk** | Horizontal scale / multi-worker bypasses limits → easier online password guessing against known demo emails. |
| **Applicable Standard/Principle** | ASVS V2.2 anti-automation |
| **Recommended Remediation** | Shared store (Redis) + edge WAF / CAPTCHA for auth endpoints in production. |
| **Status** | Open |

### CRED-009 — Local `.env` holds placeholder-class `AUTH_SECRET`

| Field | Detail |
|---|---|
| **Finding ID** | CRED-009 |
| **Title** | Local gitignored `.env` uses placeholder-class signing secret |
| **Severity** | LOW |
| **Category** | Local secret hygiene |
| **Location** | `.env` (untracked); rejection list in `src/lib/env.ts` |
| **Evidence (redacted)** | `AUTH_SECRET=<REDACTED set=true len=40>` — matches known development placeholder rejected for production deploys. File ignored by `.gitignore` rule `.env*`. |
| **Current Behavior** | Acceptable for local demo; refused when `APP_ENV=production`. |
| **Security Risk** | Accidental copy into a public host **without** `APP_ENV=production` yields forgeable sessions. |
| **Applicable Standard/Principle** | Secret uniqueness per environment |
| **Recommended Remediation** | Generate a unique local secret; never reuse across machines/environments. |
| **Status** | Open (local only; not committed) |

### CRED-010 — CI disposable `AUTH_SECRET`

| Field | Detail |
|---|---|
| **Finding ID** | CRED-010 |
| **Title** | CI workflow hardcodes disposable `AUTH_SECRET` |
| **Severity** | LOW |
| **Category** | CI/CD secrets |
| **Location** | `.github/workflows/ci.yml` |
| **Evidence (redacted)** | `AUTH_SECRET: "ci-secret-not-for-production"` with comment not to set `APP_ENV=production`. Prod validator rejects `ci-secret` substring. |
| **Current Behavior** | Safe for ephemeral CI builds. |
| **Security Risk** | Low — misuse only if copied into real deploy env. |
| **Applicable Standard/Principle** | Separation of CI vs production secrets |
| **Recommended Remediation** | Keep as-is; optionally use GitHub Actions secrets with random CI-only values. |
| **Status** | Accepted risk / documented |

### CRED-011 — Presence cookie not HttpOnly

| Field | Detail |
|---|---|
| **Finding ID** | CRED-011 |
| **Title** | Auth presence cookie readable by JavaScript |
| **Severity** | LOW |
| **Category** | Cookie security |
| **Location** | `src/app/auth/establish/route.ts`; `src/lib/auth/session-lifetime.ts` |
| **Evidence (redacted)** | `httpOnly: false` on `nivaro-auth-presence`; client heartbeat reads/writes cookie. |
| **Current Behavior** | Intentional for browser-lifetime logout UX. |
| **Security Risk** | XSS can clear/forge presence (session JWT still depends on Auth.js cookie attributes). Presence is not a signing secret. |
| **Applicable Standard/Principle** | Cookie flags (HttpOnly where feasible) |
| **Recommended Remediation** | Retain only if required; harden XSS controls; ensure session token remains HttpOnly (Auth.js default). |
| **Status** | Accepted design with residual XSS dependency |

### CRED-012 — Non-production `/api/health` discloses environment shape

| Field | Detail |
|---|---|
| **Finding ID** | CRED-012 |
| **Title** | Development health endpoint exposes provider/env metadata |
| **Severity** | LOW |
| **Category** | Information disclosure |
| **Location** | `src/app/api/health/route.ts` |
| **Evidence (redacted)** | Non-prod JSON includes `ai`, `payment`, `nodeEnv`. Production path limited to `ok` / `latencyMs` / `timestamp`. |
| **Current Behavior** | Prod redacted; dev verbose. |
| **Security Risk** | Low credential impact; aids reconnaissance on exposed non-prod. |
| **Applicable Standard/Principle** | Minimize error/info leakage |
| **Recommended Remediation** | Keep prod minimal; restrict non-prod health to private networks. |
| **Status** | Mitigated for `NODE_ENV=production` |

### CRED-013 — No live third-party API keys in tracked source

| Field | Detail |
|---|---|
| **Finding ID** | CRED-013 |
| **Title** | Repository scan found no live cloud API keys |
| **Severity** | INFORMATIONAL |
| **Category** | Positive control |
| **Location** | Repo-wide pattern search; `git grep` on HEAD |
| **Evidence (redacted)** | No matches for `sk_live`, `AKIA…`, `BEGIN … PRIVATE KEY`, `ghp_…` in tracked files. AI/S3 keys only as commented placeholders in `.env.example`. |
| **Current Behavior** | Integrations are stubs / local. |
| **Security Risk** | N/A — positive finding. |
| **Applicable Standard/Principle** | No secrets in source |
| **Recommended Remediation** | Maintain; add secret scanning in CI when live keys arrive. |
| **Status** | Pass |

### CRED-014 — Future provider secrets not yet in env schema

| Field | Detail |
|---|---|
| **Finding ID** | CRED-014 |
| **Title** | OpenAI / Replicate / FAL / S3 secrets documented but not validated in `getEnv()` |
| **Severity** | INFORMATIONAL |
| **Category** | Incomplete secret inventory in validator |
| **Location** | `.env.example`; `src/lib/env.ts`; `src/lib/ai/index.ts`; `src/lib/storage/index.ts` |
| **Evidence (redacted)** | Commented `OPENAI_API_KEY`, `REPLICATE_API_TOKEN`, `FAL_KEY`, `S3_*`. AI modes fall back to live-ready stub with console warn; object storage throws until wired. |
| **Current Behavior** | Cannot silently use missing live keys today. |
| **Security Risk** | Future wiring without schema/fail-fast could allow misconfig. |
| **Applicable Standard/Principle** | Fail-fast configuration |
| **Recommended Remediation** | Extend Zod schema + production assertions when providers go live. |
| **Status** | Deferred |

### CRED-015 — bcrypt password hashing with cost factor 12

| Field | Detail |
|---|---|
| **Finding ID** | CRED-015 |
| **Title** | User passwords hashed with bcrypt cost 12 |
| **Severity** | INFORMATIONAL |
| **Category** | Password storage (positive) |
| **Location** | `src/lib/auth.ts` `authorize`; `src/lib/actions/auth.ts` `registerUser`; `prisma/seed.ts` |
| **Evidence (redacted)** | `bcrypt.hash(..., 12)` / `bcrypt.compare`. Min password length 8 on register/login schema. |
| **Current Behavior** | Aligned with common practice for bcrypt. |
| **Security Risk** | Residual risk is weak/demo passwords (CRED-001), not algorithm choice. |
| **Applicable Standard/Principle** | ASVS V2.4 / NIST SP 800-63B hashing guidance (conceptual) |
| **Recommended Remediation** | Keep; consider argon2id in future migrations. |
| **Status** | Pass |

### CRED-016 — `.env` not committed; ignore rules present

| Field | Detail |
|---|---|
| **Finding ID** | CRED-016 |
| **Title** | `.env` gitignored; only `.env.example` tracked |
| **Severity** | INFORMATIONAL |
| **Category** | Source control hygiene (positive) |
| **Location** | `.gitignore` (`.env*` with `!.env.example`); git index |
| **Evidence (redacted)** | `git check-ignore -v .env` → `.gitignore:33:.env*`; `git ls-files` shows `.env.example` only; `git log -- .env` empty. |
| **Current Behavior** | Local secrets stay untracked. |
| **Security Risk** | Residual: OneDrive/sync/share of local `.env` outside git. |
| **Applicable Standard/Principle** | Secrets out of VCS |
| **Recommended Remediation** | Keep; add pre-commit secret scan optionally. |
| **Status** | Pass |

---

## 6. Environment Variable Audit

| Variable | Secret? | In `.env.example` | In local `.env` (presence) | Validated in `env.ts` | Client-exposed | Prod requirement | Notes |
|---|---|---|---|---|---|---|---|
| `APP_ENV` | No | Commented | Not observed set | Indirect (`isProductionDeploy`) | No | Must be `production` on live | Enables strict secret checks |
| `DATABASE_URL` | Yes | Yes (`file:./dev.db`) | Set (SQLite placeholder) | Yes | No | Postgres + `sslmode=require` | `file:` rejected in prod deploy |
| `AUTH_SECRET` | Yes | Placeholder token | Set (`len=40`, placeholder-class) | Yes (strict in prod) | No | Strong unique ≥32 | CI disposable string rejected |
| `AUTH_URL` | No | Yes | Set (localhost-class) | Yes (https in prod) | Indirect | https canonical URL | Affects secure cookies |
| `AUTH_TRUST_HOST` | No | Yes | Set | Not in Zod schema | No | Prefer explicit URL | Used by Auth.js ecosystem |
| `NEXT_PUBLIC_APP_NAME` | No | Yes | Set | Optional | Yes | Optional | Branding only |
| `NEXT_PUBLIC_APP_ORIGIN` | No | Yes | Set (may be tunnel URL) | Not in Zod schema | Yes | Optional | Client banners / Capacitor |
| `NEXT_PUBLIC_ALLOW_DEMO_CREDENTIALS` | No (dangerous flag) | Commented false | Not observed | Read by helpers | Yes | Must be unset/false | CRED-002 |
| `ALLOW_DEMO_CREDENTIALS` | No (flag) | No (server twin) | Not observed | boolish | No | Must be false | Server override |
| `AI_PROVIDER` | No | Yes | Set | Optional string | No | Optional | Stub modes only |
| `OPENAI_API_KEY` / `REPLICATE_API_TOKEN` / `FAL_KEY` | Yes | Commented placeholders | Not set | Not validated | No | When live AI | Not wired |
| `PAYMENT_PROVIDER` | No | Yes | Not observed (defaults) | Optional | No | Business choice | `cod_hybrid` default |
| `JAZZCASH_MERCHANT_ID` / `JAZZCASH_PASSWORD` | Yes | Commented | Not set | Optional | No | If JazzCash live | Presence-only today |
| `EASYPAISA_STORE_ID` / `EASYPAISA_PASSWORD` | Yes | Commented | Not set | Optional | No | If Easypaisa live | Presence-only today |
| `ALLOW_PAYMENT_STUB` | No (dangerous flag) | Commented | Not observed | boolish | No | Never on live | CRED-004 |
| `STORAGE_PROVIDER` | No | Yes | Not observed | Optional | No | `local` ≠ prod scale | S3 stub throws |
| `S3_*` | Yes | Commented | Not set | Not validated | No | When object storage | Future |
| `NOTIFY_PROVIDER` | No | Yes | Not observed | Optional | No | Prefer `noop`/real provider | Console masks recipient in prod |
| `CAPACITOR_SERVER_URL` | No | Commented | Set (tunnel-class URL) | Optional | Mobile config | HTTPS in release | Pair with AUTH_URL |
| `VERCEL_ENV` | No | Platform | N/A | Read for prod detect | No | `production` triggers checks | Alternate prod signal |
| `NODE_ENV` | No | Runtime | Runtime | Zod default | Indirect | `production` for next start | Not alone sufficient for `APP_ENV` checks |

---

## 7. API Credential Audit

| Endpoint / surface | Authn | Credentials touched | Leakage risk | Severity | Notes |
|---|---|---|---|---|---|
| `/api/auth/[...nextauth]` | Auth.js credentials + cookies | `AUTH_SECRET`, password verify via bcrypt | Session cookie theft if XSS/network weak | — | CSRF fetched for credentials sign-in |
| `/api/auth/csrf` | Public | CSRF token (not long-term secret) | Low | LOW | Expected |
| `/api/health` | None | None (reads providers/env meta in non-prod) | Info disclosure non-prod | LOW | Prod minimized |
| `/api/vendor/orders/[id]/package` | Session + vendor/admin | Session cookie | IDOR if auth broken (out of pure credential scope) | — | Uses `auth()` |
| `/auth/establish` | Session required | Sets presence cookie | Non-httpOnly presence | LOW | Not JWT secret |
| `/auth/end-session` | Session teardown | Clears session/presence | — | — | Lifetime control |
| Server Actions `loginUser` / `registerUser` | Credentials in FormData | Password → bcrypt; rate limited | Password in memory briefly (normal) | — | Do not log passwords (none observed) |
| Payment adapters | Server-only env | JazzCash/Easypaisa passwords if set | Stub does not transmit to gateway yet | HIGH if stub flag | CRED-004 |
| AI provider factory | Server-only | Would use API keys when wired | Warns and stubs today | INFO | No keys present |
| Storage provider | Server-only | Would use `S3_*` when wired | Local disk `/public/uploads` | INFO | Not credential leak |
| Notify console | Server-only | Recipient/subject/body logged | Recipient masked when `NODE_ENV=production` | LOW | Truncated body may include PII |

**OAuth / social providers:** Not implemented.  
**Payment webhooks:** Not implemented.  
**Hardcoded Bearer tokens in API clients:** Not found.

---

## 8. Authentication & Token Audit

| Topic | Evidence | Assessment |
|---|---|---|
| **Mechanism** | Auth.js Credentials provider + Prisma adapter; JWT session strategy | Expected for credentials-only app |
| **Password hashing** | `bcryptjs` cost **12** on register/seed; `bcrypt.compare` on login | **Aligned** with common bcrypt practice |
| **Password policy** | Min length 8 (Zod); max 128 on signup | **Partially Aligned** (no complexity/breach checks) |
| **JWT / signing** | Auth.js + `AUTH_SECRET`; session `maxAge` 12 hours | **Partially Aligned** — depends on secret strength |
| **Prod secret enforcement** | `assertProductionSecrets` when `APP_ENV=production` or `VERCEL_ENV=production` | **Aligned** for that gate; **Not Aligned** if live traffic omits `APP_ENV` |
| **Cookie security** | `useSecureCookies` when `AUTH_URL` is https (non-ngrok/non-localhost); HSTS in `next.config.ts` for `NODE_ENV=production` | **Partially Aligned** |
| **Presence / browser lifetime** | Non-httpOnly presence cookie + heartbeat; middleware requires presence for protected routes | Design tradeoff; residual XSS |
| **Role revalidation** | JWT callback re-reads `role`/`active` every 5 minutes | Positive control (not credential storage) |
| **CSRF** | Sign-in fetches `/api/auth/csrf` | Present for credentials flow |
| **Rate limiting** | In-memory per process | **Partially Aligned** (CRED-008) |
| **Demo accounts** | Shared password in seed/docs/UI | **Not Aligned** for any shared/prod DB (CRED-001/002) |
| **trustHost** | `true` | **Partially Aligned** with canonical `AUTH_URL` requirement |

---

## 9. Git & Source Control Audit

| Check | Result |
|---|---|
| Is `.env` tracked? | **No** — ignored by `.gitignore` `.env*` with exception `!.env.example` |
| `.env` / `.env.local` / `.env.production` in git history? | **No commits found** (`git log -- .env` empty) |
| Tracked env template | `.env.example` only (placeholders like `<GENERATE_SECURE_SECRET_…>`, `<YOUR_…>`) |
| High-entropy cloud key patterns in HEAD | **No matches** for sampled `sk_live` / `AKIA` / PEM / `ghp_` |
| Intentional shared demo password in history | **Yes** — `password123` introduced with seed/docs (known demo material, not a third-party API key) |
| Other secret filenames | Ignore rules for `*.pem`, `*.key`, `*credentials*.json`, `secrets/` |
| **Compromise classification** | **No evidence** that production third-party API keys were committed. Demo password is **public by design** in this repo → treat any seeded environment as **POTENTIALLY COMPROMISED** for those demo identities until passwords are rotated/removed. Local `.env` `AUTH_SECRET` is untracked placeholder-class — rotate if it was ever copied to a shared host. |

---

## 10. CI/CD Audit

| Item | Evidence | Assessment |
|---|---|---|
| Workflow | `.github/workflows/ci.yml` — `npm ci`, `npm test`, `prisma generate`, `next build` | Present |
| Secrets in workflow | Hardcoded disposable `DATABASE_URL=file:./ci.db`, `AUTH_SECRET=ci-secret-not-for-production`, `AUTH_URL=http://localhost:3000` | Acceptable for CI; must not promote to prod |
| `APP_ENV=production` in CI | Explicitly **not** set (commented rationale) | Correct — avoids fail-fast on disposable secrets |
| GitHub Actions secrets usage | None observed for app credentials | N/A until real deploy pipeline |
| Artifact leakage | Build uses SQLite file in runner workspace (ephemeral) | Low |
| Fork PR secret exposure | No org secrets referenced | Low risk today |
| Docker / deploy manifests | **None** found | N/A |

---

## 11. Standards Assessment

Evidence-based alignment only — **not** a compliance certification.

| Standard / principle | Area | Result | Notes |
|---|---|---|---|
| OWASP ASVS V2 (credentials) | Password hashing | **Aligned** | bcrypt cost 12 |
| OWASP ASVS V2 | Default/demo passwords | **Not Aligned** | Shared `password123` for privileged seed users |
| OWASP ASVS V3 | Session tokens | **Partially Aligned** | JWT + secure cookie heuristics; `trustHost`; presence non-httpOnly |
| OWASP ASVS V14 | Build/deploy config | **Partially Aligned** | Prod assertions exist; depend on `APP_ENV` |
| OWASP Secrets in code | VCS hygiene | **Aligned** | `.env` untracked; no live API keys found |
| NIST SP 800-63B (conceptual) | Authenticator secrets | **Partially Aligned** | Hashing OK; demo/default passwords not acceptable for production identities |
| NIST SP 800-57 (conceptual) | Key/secret management | **Partially Aligned** | Example + docs push secret manager; no runtime vault integration |
| CIS software supply chain (conceptual) | CI secrets | **Aligned** for disposable CI values | Separation documented |
| Transport security | TLS | **Partially Aligned** | HSTS in Next prod; Android cleartext enabled |
| Payment PCI (conceptual) | Card data | **Not Applicable** | No card PSP; COD/wallet stubs only |

---

## 12. Remediation Roadmap

### Immediate (before any public/production traffic)

1. Do **not** run `prisma/seed.ts` / `db:setup` against shared, staging, or production databases.
2. Set `APP_ENV=production`, strong unique `AUTH_SECRET` (`openssl rand -base64 32` or equivalent), `AUTH_URL=https://…`, Postgres `DATABASE_URL` with `sslmode=require`.
3. Ensure `NEXT_PUBLIC_ALLOW_DEMO_CREDENTIALS`, `ALLOW_DEMO_CREDENTIALS`, and `ALLOW_PAYMENT_STUB` are unset/false.
4. If any environment was seeded with demo users, **rotate or delete** those accounts (see §14).
5. Confirm `.env` remains untracked before every commit (`git status`).

### Short term (days–1 week)

1. Unify demo gating on `isProductionDeploy()` and fail deploy if demo/public flags are true.
2. Gate seed script to refuse `APP_ENV=production`.
3. Add CI secret scanning (e.g., pattern/gitleaks) for future key introductions.
4. Disable Android cleartext for release builds.
5. Document that README demo passwords are local-only.

### Medium term (weeks)

1. Replace in-memory rate limit with Redis/edge limits for auth.
2. Wire real payment gateway; remove or isolate stub COMPLETED path from production codepaths.
3. Extend `getEnv()` for AI/storage secrets with fail-fast when those providers are selected.
4. Move uploads off world-readable `public/uploads` when object storage lands (credential + data exposure adjacent).

### Long term

1. Central secret manager (platform secrets / Vault) + rotation policy.
2. Consider argon2id migration; phishing-resistant MFA for admin/ops roles.
3. Formal break-glass and audit logging for secret access.
4. Release-signing for Android without debug cleartext baselines.

---

## 13. Production Credential Requirements

| Requirement | Value / action |
|---|---|
| `APP_ENV` | `production` |
| `DATABASE_URL` | `<SECRET_REQUIRED>` Postgres URL with `sslmode=require` (not `file:`) |
| `AUTH_SECRET` | `<SECRET_REQUIRED>` cryptographically random ≥32 chars; not CI/dev placeholders |
| `AUTH_URL` | `https://<your-domain>` |
| `NEXT_PUBLIC_ALLOW_DEMO_CREDENTIALS` | unset / `false` |
| `ALLOW_DEMO_CREDENTIALS` | unset / `false` |
| `ALLOW_PAYMENT_STUB` | unset / `false` |
| `PAYMENT_PROVIDER` | `cod_hybrid` until live wallet/PSP wired; then real provider + merchant secrets |
| `JAZZCASH_*` / `EASYPAISA_*` | `<SECRET_REQUIRED>` only when live APIs implemented |
| `AI_PROVIDER` + API keys | `<SECRET_REQUIRED>` only when leaving stub |
| `STORAGE_PROVIDER` + `S3_*` | `<SECRET_REQUIRED>` for non-local storage |
| `NOTIFY_PROVIDER` | Prefer real provider secrets or `noop` (avoid logging PII) |
| Seed | **Do not** apply demo seed |
| Secret storage | Platform secret manager / host env — never commit |

---

## 14. Credential Rotation Requirements

| Category | Rotate? | Trigger / notes |
|---|---|---|
| **Demo user passwords** (`password123` identities) | **Yes — if any non-local DB was seeded** | Delete users or force reset; treat as compromised knowledge |
| **`AUTH_SECRET`** | **Yes — if placeholder/dev secret used on any shared host** | Invalidates all JWTs (expected) |
| **`DATABASE_URL` credentials** | **Yes — if connection string ever leaked or committed** | No commit evidence found; still rotate on exposure |
| **JazzCash / Easypaisa passwords** | **When issued / on suspicion** | None present in repo today |
| **AI API keys** | **When issued / on suspicion** | None present |
| **S3/R2 keys** | **When issued / on suspicion** | None present |
| **CI disposable `AUTH_SECRET`** | No | Ephemeral runners; do not reuse |
| **Local developer `.env` secrets** | Recommended unique per machine | Do not share via chat/cloud sync unencrypted |

**Git history rewrite:** **Not recommended / not performed** — no committed live `.env` found. Demo password in docs is intentional public demo material; rewriting history does not un-publish it from clones.

---

## 15. Final Checklist

| # | Check | Result |
|---|---|---|
| 1 | No live third-party API keys in tracked source | **PASS** |
| 2 | `.env` not tracked; ignore rules present | **PASS** |
| 3 | `.env.example` uses placeholders only | **PASS** |
| 4 | Production path rejects weak/placeholder `AUTH_SECRET` | **PASS** (when `APP_ENV`/`VERCEL_ENV=production`) |
| 5 | Production path rejects SQLite `DATABASE_URL` | **PASS** (same gate) |
| 6 | Passwords stored with modern KDF (bcrypt) | **PASS** |
| 7 | Demo/shared passwords absent from production data | **FAIL** until ops guarantees no seed + no demo flags |
| 8 | Demo password not shown in production UI by default | **PASS** default; **FAIL** if `NEXT_PUBLIC_ALLOW_DEMO_CREDENTIALS=true` |
| 9 | Payment stubs fail closed in production | **PASS** default; **FAIL** if `ALLOW_PAYMENT_STUB=true` |
| 10 | CI does not embed production secrets | **PASS** |
| 11 | Git history free of committed `.env` secrets | **PASS** (for `.env` files) |
| 12 | Client bundles free of server secrets | **PASS** (only `NEXT_PUBLIC_*` + demo password string when enabled) |
| 13 | Logging avoids printing passwords / API keys | **PASS** (no credential logging found; notify masks recipient in prod) |
| 14 | TLS / secure cookies for production auth | **PASS** with https `AUTH_URL` + HSTS; Android cleartext **FAIL** for release hardening |
| 15 | Rate limiting adequate for multi-instance prod | **FAIL** (in-memory only) |
| 16 | Secret manager / external prod secrets provisioned | **N/A** / **Unable to Verify** (outside repo) |
| 17 | OAuth client secrets secured | **N/A** (not implemented) |
| 18 | Overall production credential readiness | **FAIL** — blocked on external secrets + demo seed/flag controls |

---

## Appendix A — Workflow Trace

| Phase | Actions performed |
|---|---|
| DISCOVER | Glob env/CI/auth/prisma; ripgrep for secret patterns; read `package.json`, `.gitignore` |
| IDENTIFY | Inventory env vars, seed passwords, Auth.js, payment/AI/storage stubs, cookies |
| CLASSIFY | Map to inventory IDs; severity by exploitability × impact with evidence |
| ANALYZE | Cross-check `PRODUCTION_READINESS_REPORT.md` vs current code (verified, not copied blindly) |
| STANDARD CHECK | ASVS/NIST conceptual alignment table (no certification claims) |
| RISK ASSESSMENT | Critical/High focus on demo admin password + prod flag misuse + missing external secrets |
| REMEDIATION | Roadmap §12 without modifying application code |
| VALIDATE | Git ignore/history probes; redacted local `.env` key presence; pattern scans |
| REPORT | This file: `CREDENTIAL_SECURITY_AUDIT_REPORT.md` |

## Appendix B — Key files reviewed

- `src/lib/env.ts`, `src/lib/env.test.ts`
- `src/lib/auth.ts`, `src/lib/actions/auth.ts`, `src/lib/demo-credentials.ts`
- `src/lib/auth/session-lifetime.ts`, `src/app/auth/establish/route.ts`, `src/middleware.ts`
- `src/lib/orders/payment.ts`, `src/lib/ai/index.ts`, `src/lib/storage/index.ts`, `src/lib/notify/outbound.ts`
- `src/app/api/health/route.ts`, `next.config.ts`
- `prisma/seed.ts`, `prisma/schema.prisma`
- `.env.example`, local `.env` (redacted), `.gitignore`
- `.github/workflows/ci.yml`
- `README.md`, `MOBILE.md`, `docs/PRODUCTION.md`, `PRODUCTION_READINESS_REPORT.md`
- `android/app/src/main/AndroidManifest.xml`, `network_security_config.xml`

## Appendix C — Explicit non-actions

- No application code changes
- No `.env` edits
- No credential rotation performed
- No git history rewrite
- No secret values printed in this report
- No runtime exploit testing claimed

---

*End of credential security audit report.*
