# Production Readiness Report

**Project:** Nivaro / 3d_ondemand_printing (Printora storefront)  
**Date:** 2026-09-19  
**Auditor role:** Principal / DevSecOps / Security Architect  
**Scope:** Full repository audit after remediation in this session  

---

## 1. Executive Summary

This is a **Next.js 16.3.4 / React 19 / Auth.js (JWT) / Prisma** on-demand apparel platform with Capacitor Android shell. Business logic lives primarily in **Server Actions**; only three REST routes exist under `/api`.

**Major findings before remediation**
- Vendors could open `/ops` and see platform-wide order/vendor data (RBAC over-grant).
- Admin finance/catalog lacked page-level permission checks.
- JWT did not revalidate `active` / `role` after login.
- Demo credentials were shown on sign-in/cart UI.
- JazzCash/Easypaisa stubs could mark payments `COMPLETED` in production.
- `/api/health` leaked provider/`nodeEnv` details publicly.
- No deploy-time environment validation or security response headers.
- SQLite + local uploads + payment/AI stubs are not production backends.

**Major fixes applied**
- Env validation (`APP_ENV=production` fail-fast), security headers, health redaction.
- Ops/admin/vendor authorization hardening; JWT revalidation; diagnose IDOR fix.
- Demo credentials gated; wallet stubs fail closed in production; notify recipient masking.
- `.env.example` / `.gitignore` / production checklist updates; TS blockers for build fixed.

**Remaining blockers**
- PostgreSQL, real payment gateway, object storage, Redis rate limits, and production secrets must be supplied externally.
- Capacitor cleartext HTTP and public `/uploads` remain architectural risks.

**Final status:** **PRODUCTION READY WITH EXTERNAL CONFIGURATION REQUIRED**

---

## 2. Credentials & Secrets

| ID | Finding | Severity | Location | Risk | Action Taken | Status |
|---|---|---|---|---|---|---|
| SEC-001 | Demo password shown in UI | High | `sign-in`, `cart` | Credential stuffing on seeded envs | Gated behind `SHOW_DEMO_CREDENTIALS` / `allowDemoCredentials()` | Fixed |
| SEC-002 | Weak/placeholder `AUTH_SECRET` usable in “prod” | Critical | deploy env | Session forgery | `getEnv()` rejects weak/placeholder secrets when `APP_ENV=production` | Fixed |
| SEC-003 | Wallet stubs auto-COMPLETE payments | Critical | `src/lib/orders/payment.ts` | Fake paid orders | Fail closed when `NODE_ENV=production` unless `ALLOW_PAYMENT_STUB=true` | Fixed |
| SEC-004 | Local `.env` may contain tunnel URLs / secrets | Medium | `.env` (gitignored) | Accidental commit / share | `.gitignore` already excludes `.env*`; expanded secret patterns | Fixed (process) |
| SEC-005 | CI uses disposable `AUTH_SECRET` | Low | `.github/workflows/ci.yml` | Misuse if copied to prod | Documented; deploy checks reject `ci-secret` substring | Fixed |
| SEC-006 | No live API keys in source | Info | repo scan | — | Confirmed none present | N/A |
| SEC-007 | Seed demo users/password in `prisma/seed.ts` | High (ops) | seed script | Prod seed = known passwords | Documented: never seed prod with demos | Requires external config |
| SEC-008 | Prisma `deepmerge-ts` advisory (npm audit) | High (dep) | prisma transitive | DoS in config merge | Not force-upgraded (breaking); track Prisma upgrade | Partially fixed / Blocked |

Git history check: no committed `.env` / `.env.local` files found in current history probes. `.env.example` is the only tracked env template.

---

## 3. Environment Variables

| Variable | Purpose | Required | Secret | Environment | Issue | Status |
|---|---|---|---|---|---|---|
| `APP_ENV` | Deploy-time env (`production` enables strict checks) | Prod deploy | No | All | Newly introduced | Fixed |
| `DATABASE_URL` | Prisma connection | Yes | Yes | All | SQLite OK for local; forbidden when `APP_ENV=production` | Fixed + blocker for prod |
| `AUTH_SECRET` | Auth.js JWT signing | Yes (prod) | Yes | All | Placeholder rejected in prod deploy | Fixed |
| `AUTH_URL` | Canonical app URL / metadata | Yes (prod) | No | All | Must be `https://` in prod deploy | Fixed |
| `NEXT_PUBLIC_APP_NAME` | Branding | No | No (public) | All | — | OK |
| `NEXT_PUBLIC_ADVANCE_AMOUNT` | Checkout advance (PKR) | No | No (public) | All | Validated as number when set | OK |
| `NEXT_PUBLIC_ALLOW_DEMO_CREDENTIALS` | Force demo hints | No | No | Never prod | Dangerous if true in prod | Documented |
| `AI_PROVIDER` | AI backend selector | No | No | All | Stubs only today | Requires external config |
| `PAYMENT_PROVIDER` | Payment adapter | No | No | All | Wallet stubs hardened | Partially fixed |
| `JAZZCASH_*` / `EASYPAISA_*` | Wallet merchant creds | If wallet mode | Yes | Prod | Presence alone does not enable live capture | Requires external config |
| `ALLOW_PAYMENT_STUB` | Drill override for wallet stubs | No | No | Prod drill only | Default fail-closed | Fixed |
| `STORAGE_PROVIDER` | Upload backend | No | No | All | Only `local` implemented | Requires external config |
| `NOTIFY_PROVIDER` | Email/SMS channel | No | No | All | `console` masks recipients in prod | Partially fixed |
| `CAPACITOR_SERVER_URL` | Android WebView origin | Mobile | No | Mobile | Must match `AUTH_URL` when tunneling | Documented |

---

## 4. API Audit

| API | Type | Authentication | Issue | Severity | Fix | Status |
|---|---|---|---|---|---|---|
| `/api/auth/[...nextauth]` | Auth.js | Credentials / session cookies | `trustHost: true` needed for proxies | Medium | Document + require HTTPS `AUTH_URL` in prod | Partially fixed |
| `/api/health` | Public health | None | Leaked providers/`nodeEnv` | Medium | Production response reduced to `ok`/`latencyMs`/`timestamp` | Fixed |
| `/api/vendor/orders/[id]/package` | Vendor package download | Session + vendor/admin scope | — | — | Existing auth retained | OK |
| Server Actions (`src/lib/actions/*`) | Internal | Session + RBAC | Some IDOR/over-broad reads | High | Diagnose ownership; ops/admin gates | Fixed / Partially fixed |
| Auth establish/end-session | Session helpers | Cookie-based | POST 405 on establish | High (UX/sec) | POST handler + hard nav after login | Fixed (prior + this audit) |

No payment webhooks or OAuth social providers are implemented.

---

## 5. Third-Party Integrations

| Service | Purpose | Credential Required | Configuration | Status |
|---|---|---|---|---|
| Auth.js / Credentials | Login | `AUTH_SECRET` | Env | Ready with external secret |
| Prisma / SQLite|Postgres | Data | `DATABASE_URL` | SQLite local; Postgres required for prod | Requires external config |
| JazzCash / Easypaisa | Wallet advance | Merchant ID/password | Stub only; fails closed in prod | Requires external config |
| COD hybrid | Advance simulation | None | Intentional business stub | OK for COD model; not a card PSP |
| AI (openai/replicate/fal names) | Design tools | Provider API keys | Degrades to stub | Requires external config |
| Local disk storage | Uploads | None | `public/uploads` | Not production-safe |
| Console/noop notify | Outbound messages | None | Masked in prod | Placeholder |
| Capacitor / Android | Mobile shell | `CAPACITOR_SERVER_URL` | Cleartext allowed | Requires external config |
| ngrok | Dev tunnel | Account | Dev only | N/A for prod |

---

## 6. Authentication & Authorization

### Current implementation
- Credentials provider; JWT sessions (`maxAge` 12h); presence cookie + heartbeat for browser-lifetime logout.
- RBAC permissions in `src/lib/rbac.ts`; mutations generally use `requireUser` / `getAuthorizedUser`.
- Middleware enforces session + fresh presence on protected prefixes (excludes `/api/*`).

### Issues found & fixes
| Issue | Fix | Status |
|---|---|---|
| Vendors accessed `/ops` via `order:read_all` / `production:manage` | Removed `order:read_all` from VENDOR; ops layouts exclude `VENDOR` | Fixed |
| Support/`user:manage` could open admin finance reads | Finance/catalog page gates; dashboard admin-only | Fixed |
| JWT ignored deactivation/role changes | Revalidate DB every 5 minutes in JWT callback | Fixed |
| Design diagnose IDOR | Owner/library check aligned with enhance | Fixed |
| Vendor layout open to any authenticated user | Redirect non-vendors without profile | Fixed |
| Order metadata IDOR in `generateMetadata` | Scope by `userId` | Fixed |
| Presence cookie not HttpOnly | Intentional for client heartbeat | Remaining risk (XSS can forge presence) |
| Capacitor cleartext | Not changed (breaks local Android HTTP) | Remaining risk |

---

## 7. Database & Storage

| Topic | State |
|---|---|
| Config | Prisma `sqlite` provider; prod must switch to PostgreSQL + `sslmode=require` |
| Credentials | Via `DATABASE_URL` only (server-side) |
| Migrations | No `prisma/migrations` tree observed — use `migrate deploy` after adopting Postgres |
| Uploads | Written under `public/uploads/**` (world-readable URLs); MIME-type only validation |
| Production requirement | Object storage (S3/R2) + private/signed access; magic-byte validation |

**Remaining issues:** SQLite schema provider, public uploads, MIME spoofing.

---

## 8. CI/CD & Deployment

| Topic | State |
|---|---|
| CI | `.github/workflows/ci.yml` — `npm ci`, tests, `prisma generate`, `next build` with disposable SQLite/`AUTH_SECRET` |
| Docker | None |
| Hosting manifests | None (Vercel/Fly/etc. not present) |
| Secrets | CI secrets are disposable and documented not for production |
| Deploy docs | `docs/PRODUCTION.md` updated |

**Blockers:** Choose host, wire secret manager, set `APP_ENV=production`, Postgres, HTTPS.

---

## 9. Security Improvements

1. Deploy-time env validation (`src/lib/env.ts` + `src/instrumentation.ts`).
2. Security headers (nosniff, frame deny, referrer, permissions-policy, COOP, HSTS in production builds).
3. Production health endpoint minimalization.
4. RBAC: vendor ops isolation; admin page permissions; vendor layout gate.
5. JWT role/`active` revalidation.
6. Design diagnose ownership check.
7. Demo credential UI gating.
8. Payment wallet stub fail-closed in production.
9. Notify recipient masking in production.
10. Order metadata ownership scoping.
11. Error logging reduced in production client.
12. Expanded `.gitignore` / `.env.example`.
13. Production build TypeScript blockers fixed (vendor status types, catalog where typing, access test).

---

## 10. Files Changed

| File | Change | Reason |
|---|---|---|
| `src/lib/env.ts` | New | Env validation |
| `src/lib/env.test.ts` | New | Env tests |
| `src/instrumentation.ts` | New | Startup validation |
| `src/lib/demo-credentials.ts` | New | Client-safe demo flag |
| `src/lib/auth/require-page-permission.ts` | New | Page permission helper |
| `src/lib/auth.ts` | JWT revalidation | Auth hardening |
| `src/lib/rbac.ts` / `rbac.test.ts` | Vendor perms | Ops isolation |
| `src/app/ops/layout.tsx` / `ops/page.tsx` | Exclude vendors | Authz |
| `src/app/admin/*` | Page gates | Authz |
| `src/app/vendor/layout.tsx` | Role/profile gate | Authz |
| `src/lib/actions/ai.ts` | Diagnose ownership | IDOR |
| `src/lib/orders/payment.ts` | Fail closed | Payments |
| `src/app/api/health/route.ts` | Redact prod | Recon |
| `next.config.ts` | Security headers | HTTP security |
| `src/lib/notify/outbound.ts` | Mask recipients | Logging |
| `src/app/orders/[id]/page.tsx` | Metadata scope | IDOR |
| `src/app/error.tsx` | Safer logging | Errors |
| `src/app/auth/sign-in/page.tsx` / `cart/page.tsx` | Hide demos | Secrets UX |
| `.env.example` / `.gitignore` / `docs/PRODUCTION.md` / CI | Docs & ignores | Config hygiene |
| Vendor table/queue + catalog/access tests | TS fixes | Build green |

---

## 11. Tests Executed

| Test | Result | Notes |
|---|---|---|
| `npm test` (Vitest) | **PASS** | 12 files / **76 tests** including new `env.test.ts` |
| `npx next build` | **PASS** | Production build + TypeScript finished successfully |
| `npm run lint` | **FAIL (pre-existing)** | 4 errors in studio/try-on/catalog hooks (not introduced by this audit); warnings in android bridge |
| `npx tsc --noEmit` | **PASS** after vendor/catalog/access fixes (via build typecheck) | Build TypeScript step green |
| `npm audit --omit=dev` | **3 high** | Prisma → `deepmerge-ts` advisory; force fix is breaking |
| Auth/API manual penetration suite | **Not run** | No dedicated e2e harness beyond unit/smoke scripts |
| `scripts/phase11-smoke.ts` | **Not run this session** | Exists; requires live DB/seed |

---

## 12. Remaining Production Blockers

```text
BLOCKER-001
Production PostgreSQL DATABASE_URL (sslmode=require) and Prisma migrate deploy.

BLOCKER-002
Strong AUTH_SECRET (≥32 chars, non-placeholder) and https AUTH_URL with APP_ENV=production.

BLOCKER-003
Real payment gateway integration (JazzCash/Easypaisa/card). Stubs must not process live money.

BLOCKER-004
Object storage for uploads (S3/R2) — do not serve private designs from public/uploads.

BLOCKER-005
Multi-instance rate limiting (Redis or edge) replacing in-memory Map.

BLOCKER-006
Do not run prisma/seed.ts demo users in production; rotate any shared demo passwords.

BLOCKER-007
Android release: disable cleartext traffic; pin CAPACITOR_SERVER_URL to HTTPS production host.

BLOCKER-008
Address npm audit high finding in Prisma toolchain (planned non-breaking upgrade path).
```

---

## 13. Required Production Environment Variables

```env
APP_ENV=production
DATABASE_URL=<SET_IN_PRODUCTION_SECRET_MANAGER_POSTGRES_SSL>
AUTH_SECRET=<GENERATE_SECURE_SECRET_MIN_32_CHARS>
AUTH_URL=https://<YOUR_PRODUCTION_DOMAIN>
NEXT_PUBLIC_APP_NAME=Nivaro
NEXT_PUBLIC_ADVANCE_AMOUNT=500
PAYMENT_PROVIDER=cod_hybrid
# When live wallets are wired:
# PAYMENT_PROVIDER=jazzcash
# JAZZCASH_MERCHANT_ID=<SET_IN_SECRET_MANAGER>
# JAZZCASH_PASSWORD=<SET_IN_SECRET_MANAGER>
AI_PROVIDER=<YOUR_LIVE_PROVIDER>
# OPENAI_API_KEY=<SET_IN_SECRET_MANAGER>
STORAGE_PROVIDER=<s3_or_r2_when_implemented>
NOTIFY_PROVIDER=noop
# CAPACITOR_SERVER_URL=https://<YOUR_PRODUCTION_DOMAIN>
```

Do **not** set `NEXT_PUBLIC_ALLOW_DEMO_CREDENTIALS=true` or `ALLOW_PAYMENT_STUB=true` on a live customer-facing site.

---

## 14. Final Production Checklist

| Requirement | Result |
|---|---|
| No hardcoded live production secrets in source | **PASS** |
| Secrets externalized / `.env.example` complete | **PASS** |
| Env validation for production deploy | **PASS** |
| Insecure JWT/auth secret defaults removed | **PASS** |
| Demo credentials hidden in production UI | **PASS** |
| Admin/ops authorization hardened | **PASS** |
| Session revalidation for active/role | **PASS** |
| Security headers configured | **PASS** |
| Health endpoint prod redaction | **PASS** |
| Payment stubs fail closed in production | **PASS** |
| HTTPS AUTH_URL enforced for prod deploy | **PASS** |
| Production database (Postgres) configured | **BLOCKED** |
| Real payment gateway live | **BLOCKED** |
| Private object storage | **BLOCKED** |
| Redis/distributed rate limits | **BLOCKED** |
| Docker/K8s deploy manifests | **NOT APPLICABLE** (none present) |
| Unit tests | **PASS** |
| Production build | **PASS** |
| Lint clean | **FAIL** (pre-existing) |
| Dependency audit clean | **WARNING** (Prisma advisory) |
| Capacitor release hardening | **WARNING** |
| Overall | **PRODUCTION READY WITH EXTERNAL CONFIGURATION REQUIRED** |
