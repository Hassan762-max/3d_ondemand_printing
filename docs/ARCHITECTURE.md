# Printora — Product Architecture

AI-powered 3D custom clothing & print-on-demand for Pakistan.

**Brand:** Printora  
**Stack:** Next.js (App Router) · TypeScript · Prisma · Auth.js · Tailwind · Framer Motion · R3F (Phase 3) · provider-agnostic AI layer

---

## 1. System architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Web App    │────▶│  Domain Services │────▶│  PostgreSQL     │
│  (Next.js)  │     │  (Server Actions │     │  (Prisma)       │
│             │     │   + Route APIs)  │     └─────────────────┘
└─────────────┘     └────────┬─────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ AI Orchestrator │ │ 3D Asset Pipe   │ │ Fulfillment     │
│ (mock → real)   │ │ (GLB / textures)│ │ Vendor Router   │
└─────────────────┘ └─────────────────┘ └─────────────────┘
         │                                       │
         ▼                                       ▼
┌─────────────────┐                     ┌─────────────────┐
│ Object Storage  │                     │ Job Queue       │
│ (designs/photos)│                     │ (print / COD)   │
└─────────────────┘                     └─────────────────┘
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
| 9 | Creator marketplace, reviews, notifications, hardening |

## 3. Primary customer flow

Choose/upload design → AI enhance → pick product → 3D customize → AI try-on → AI review → iterate → finalize → pay advance → vendor produce → deliver → settle COD.

## 4. Roles & permissions

Roles: `CUSTOMER`, `DESIGNER`, `VENDOR`, `PRODUCTION_MANAGER`, `QC_MANAGER`, `SUPPORT_MANAGER`, `FINANCE_MANAGER`, `ADMIN`, `SUPER_ADMIN`.

Permissions are granular strings (`order:read`, `vendor:assign`, `design:moderate`, …). RBAC maps role → permissions; SUPER_ADMIN bypasses checks.

## 5. Key pages (Phase 1+)

- `/` — Brand hero (fashion + AI)
- `/products`, `/products/[slug]` — Catalog
- `/designs` — Ready-made library
- `/studio` — Customizer entry (Phase 3)
- `/try-on` — Virtual try-on (Phase 5)
- `/cart`, `/checkout`, `/orders`
- `/account/*` — Profile, saved designs, wishlist
- `/auth/sign-in`, `/auth/sign-up`
- `/vendor/*`, `/ops/*`, `/admin/*` — Role dashboards

## 6. Domain structure

User · Role · Permission · Product · ProductVariant · Design · DesignPlacement · Cart · Order · OrderItem · PaymentLedger · Vendor · VendorCapability · FulfillmentAssignment · Shipment · ReturnRequest · Review · Notification · AuditLog · StyleProfile · TryOnSession · AiJob

## 7. AI architecture

Provider-agnostic `AiService` interface:

- `enhanceDesign`, `diagnoseDesign`, `generateDesign`
- `consultStyle`, `consultDesign`
- `virtualTryOn`, `reviewTryOn`

Phase 1–2: `MockAiProvider`. Later: Replicate / fal / OpenAI / custom PK-hosted models behind the same interface. All jobs logged as `AiJob` with status, cost, latency.

## 8. 3D architecture

React Three Fiber scene + garment GLB per product category. Design as textured decal (UV or plane projection). State: placement `{x,y,scale,rotation,side}`. Export: print-ready PNG + placement JSON for vendors.

## 9. Vendor / fulfillment

Score vendors by: customer city proximity, stock/capability, unit cost, capacity, SLA, quality metrics. Auto-assign best; allow ops override. Vendor gets production package (artwork + placement + size + color + shipping label data). Metrics (`returnRate`, `defectRate`, `qcFailRate`) update from ops resolutions and QC fails.

## 9b. Returns & ops (Phase 8)

Custom prints: no change-of-mind returns. Eligible reasons: defect, damage, wrong item, vendor mistake, failed delivery / COD refusal. Window: 7 days after delivery. Resolutions: refund (pending finance approval), reprint, replacement, reject. `/ops` serves Support / QC / Finance / Admin queues.

## 10. Payment / order flow

`advance (Rs.500)` + `remaining_on_cod` + `delivery_fee` − `vendor_cost` = `platform_margin`. Ledger entries for advance, COD collection, refunds, settlements. Gateway adapter ready for JazzCash/Easypaisa later.

## 11. Development phases

See section 2. After each major phase: smoke test, bugfix, no silent feature removal.
