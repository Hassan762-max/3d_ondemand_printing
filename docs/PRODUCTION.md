# Nivaro — Production readiness checklist

Use this when moving off local SQLite / stubs toward a live Pakistan deployment.

## 1. Infrastructure

- [ ] Switch `DATABASE_URL` to PostgreSQL (Prisma already models for Postgres-compatible SQL)
- [ ] Run `prisma migrate deploy` (or `db push` once) against production DB
- [ ] Host uploads on object storage (S3/R2/GCS) instead of `public/uploads`
- [ ] Set strong `AUTH_SECRET` and correct `AUTH_URL` (HTTPS)
- [ ] Put the app behind HTTPS with a CDN for `/products` static assets

## 2. Providers

- [ ] `AI_PROVIDER` → `openai` | `replicate` | `fal` with API keys (interface already stable)
- [ ] `PAYMENT_PROVIDER` → `jazzcash` | `easypaisa` | keep `cod_hybrid` for advance+COD
- [ ] Fill merchant env vars (`JAZZCASH_*` / `EASYPAISA_*`) and replace stub HTTP calls in `WalletLiveReadyProvider`
- [ ] Configure SMS/email for order notifications (`NOTIFY_PROVIDER=console` logs locally today; swap for Resend/Twilio)
- [x] Local storage + notify abstractions ready (`STORAGE_PROVIDER=local`, `NOTIFY_PROVIDER=console`)

## 3. Ops readiness

- [ ] Seed or invite real vendor accounts per city
- [ ] Train Support / QC / Finance on `/ops` and `/admin` (manual vendor assign + user management included)
- [ ] Confirm return policy copy matches legal counsel for customized goods
- [ ] Monitor `/api/health` from uptime checks
- [x] Vendor print-package JSON download at `/api/vendor/orders/[id]/package`

## 4. Smoke test before go-live

1. Sign up / sign in as customer  
2. License a marketplace design · customize in Studio · try-on  
3. Checkout with advance · vendor auto-assign  
4. Vendor moves order → QC → ship → deliver  
5. Customer review + return path · finance refund/settlement  
6. Admin deactivate a product · health endpoint returns `ok: true`

## 5. Rate limits

Checkout uses an in-process rate limit (`src/lib/rate-limit.ts`). For multi-instance deploys, back it with Redis.
