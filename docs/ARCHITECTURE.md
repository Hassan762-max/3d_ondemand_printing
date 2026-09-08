# Nivaro â€” Product Architecture

AI-powered 3D custom clothing & print-on-demand for Pakistan.

**Brand:** Nivaro  
**Stack:** Next.js (App Router) Â· TypeScript Â· Prisma Â· Auth.js Â· Tailwind Â· Framer Motion Â· R3F (Phase 3) Â· provider-agnostic AI layer

---

## 1. System architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Web App    â”‚â”€â”€â”€â”€â–¶â”‚  Domain Services â”‚â”€â”€â”€â”€â–¶â”‚  PostgreSQL     â”‚
â”‚  (Next.js)  â”‚     â”‚  (Server Actions â”‚     â”‚  (Prisma)       â”‚
â”‚             â”‚     â”‚   + Route APIs)  â”‚     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                             â”‚
         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
         â–¼                   â–¼                   â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ AI Orchestrator â”‚ â”‚ 3D Asset Pipe   â”‚ â”‚ Fulfillment     â”‚
â”‚ (mock â†’ real)   â”‚ â”‚ (GLB / textures)â”‚ â”‚ Vendor Router   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚                                       â”‚
         â–¼                                       â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Object Storage  â”‚                     â”‚ Job Queue       â”‚
â”‚ (designs/photos)â”‚                     â”‚ (print / COD)   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

## 2. Core features (by phase)

| Phase | Focus |
|-------|--------|
| 1 | Foundation: design system, auth/RBAC, catalog shell, domain schema, AI stubs |
| 2 | Designs: library, upload, save, wishlist, cart skeleton (**done**) |
| 3 | 3D customizer (R3F): place, scale, rotate, color, front/back (**done**) |
| 4 | AI tools: enhance, doctor, generator, consultants (**done**) |
| 5 | Virtual try-on loop + review/recommendations (**done**) |
| 6 | Checkout: Rs.500 advance + COD remainder, orders, tracking (**done**) |
| 7 | Multi-vendor fulfillment router (PK cities) (**done**) |
| 8 | Returns/refunds/reprints/QC + ops dashboards (**done**) |
| 9 | Creator marketplace, reviews, notifications, hardening (**done**) |
| 10 | Production readiness: admin, settlements, payment adapters, health (**done**) |
| 11 | Launch polish: full catalog, COD finance tools, CI/smoke (**done**) |
| 12 | Storefront polish: design filters, support/legal, live reviews (**done**) |
| 13 | Account & catalog: profile/StyleProfile, product filters, reorder, tickets, SEO (**done**) |

## 3. Primary customer flow

Choose/upload design â†’ AI enhance â†’ pick product â†’ 3D customize â†’ AI try-on â†’ AI review â†’ iterate â†’ finalize â†’ pay advance â†’ vendor produce â†’ deliver â†’ settle COD.

## 4. Roles & permissions

Roles: `CUSTOMER`, `DESIGNER`, `VENDOR`, `PRODUCTION_MANAGER`, `QC_MANAGER`, `SUPPORT_MANAGER`, `FINANCE_MANAGER`, `ADMIN`, `SUPER_ADMIN`.

Permissions are granular strings (`order:read`, `vendor:assign`, `design:moderate`, â€¦). RBAC maps role â†’ permissions; SUPER_ADMIN bypasses checks.

## 5. Key pages (Phase 1+)

- `/` â€” Brand hero (fashion + AI)
- `/products`, `/products/[slug]` â€” Catalog
- `/designs` â€” Ready-made library
- `/studio` â€” Customizer entry (Phase 3)
- `/try-on` â€” Virtual try-on (Phase 5)
- `/cart`, `/checkout`, `/orders`
- `/account/*` â€” Profile, saved designs, wishlist
- `/auth/sign-in`, `/auth/sign-up`
- `/vendor/*`, `/ops/*`, `/admin/*` â€” Role dashboards
- `/marketplace`, `/creator` â€” Creator marketplace & hub
- `/account/notifications` â€” In-app alerts
- `/api/health` â€” Readiness probe

## 6. Domain structure

User Â· Role Â· Permission Â· Product Â· ProductVariant Â· Design Â· DesignLicense Â· DesignPlacement Â· Cart Â· Order Â· OrderItem Â· PaymentLedger Â· Vendor Â· VendorCapability Â· FulfillmentAssignment Â· Shipment Â· ReturnRequest Â· Review Â· Notification Â· AuditLog Â· StyleProfile Â· TryOnSession Â· AiJob

## 7. AI architecture

Provider-agnostic `AiService` interface:

- `enhanceDesign`, `diagnoseDesign`, `generateDesign`
- `consultStyle`, `consultDesign`
- `virtualTryOn`, `reviewTryOn`

Phase 1â€“2: `MockAiProvider`. Later: Replicate / fal / OpenAI / custom PK-hosted models behind the same interface. All jobs logged as `AiJob` with status, cost, latency.

## 8. 3D architecture

React Three Fiber scene + garment GLB per product category. Design as textured decal (UV or plane projection). State: placement `{x,y,scale,rotation,side}`. Export: print-ready PNG + placement JSON for vendors.

## 9. Vendor / fulfillment

Score vendors by: customer city proximity, stock/capability, unit cost, capacity, SLA, quality metrics. Auto-assign best; allow ops override. Vendor gets production package (artwork + placement + size + color + shipping label data). Metrics (`returnRate`, `defectRate`, `qcFailRate`) update from ops resolutions and QC fails.

## 9b. Returns & ops (Phase 8)

Custom prints: no change-of-mind returns. Eligible reasons: defect, damage, wrong item, vendor mistake, failed delivery / COD refusal. Window: 7 days after delivery. Resolutions: refund (pending finance approval), reprint, replacement, reject. `/ops` serves Support / QC / Finance / Admin queues.

## 9c. Marketplace, reviews & notifications (Phase 9)

Creators publish uploads (`/creator`) with free or paid license fees. Designers auto-approve; customers go through moderation. Buyers license designs into Saved Designs. Delivered orders accept 1â€“5 reviews (shown on product pages). Notifications center at `/account/notifications` with unread badge in the header.

## 10. Payment / order flow

`advance (Rs.500)` + `remaining_on_cod` + `delivery_fee` âˆ’ `vendor_cost` = `platform_margin`. Ledger entries for advance, COD collection, refunds, settlements. Providers: `cod_hybrid` (default), `jazzcash` / `easypaisa` live-ready stubs, `online` reserved for card PSP.

## 11. Development phases

See section 2. After each major phase: smoke test, bugfix, no silent feature removal.

Go-live steps: `docs/PRODUCTION.md`.

## 12. Production notes (Phase 10)

- Admin (`/admin`): catalog activate/deactivate, vendor settlements, audit trail
- Checkout rate-limited per user; health at `GET /api/health`
- SQLite for local; PostgreSQL URL documented for production

## 13. Launch polish (Phase 11)

- Catalog covers all ProductCategory enums; vendor capabilities sync on seed
- Delivery marks pending COD as collected; finance can force-collect on `/admin`
- CI: `.github/workflows/ci.yml` · smoke: `npm run smoke`

## 14. Storefront polish (Phase 12)

- Design library category filter (`/designs?category=`) shared with homepage chips
- Support pages: `/support/help`, `/contact`, `/shipping`, `/returns`
- Legal: `/legal/privacy`, `/legal/terms`
- Homepage reviews use live `Review` rows when present; demo fallback labeled
- `/how-it-works` refreshed to Nivaro narrative with per-step CTAs

## 15. Account & catalog completion (Phase 13)

- `/account/profile` edits contact + StyleProfile (sizes/fit/tags); AI style consult uses profile
- Product category filters + `/products?design=` deep-link into product detail
- Order reorder-to-cart; cart accepts licensed marketplace designs
- Support tickets from contact form → `/ops` queue + in-app notifications
- SEO: `sitemap.ts`, `robots.ts`, OpenGraph/`metadataBase`
