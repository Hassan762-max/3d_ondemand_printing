# Printora

AI-powered 3D custom clothing & print-on-demand for Pakistan.

## Quick start

```bash
npm install
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts

Password for all: `password123`

- customer@printora.pk
- designer@printora.pk
- vendor@printora.pk
- admin@printora.pk

## Phase 1 (done)

- Product architecture (`docs/ARCHITECTURE.md`)
- Premium brand shell (Printora)
- Auth.js credentials + RBAC permissions
- Prisma domain model (catalog, designs, orders, vendors, AI jobs, …)
- Catalog + design library + account/cart shells
- Provider-agnostic AI layer with mock provider

## Phase 2 (done)

- Secure design upload (type/size/SVG checks + optional AI enhance)
- Save/unsave designs · personal uploads library
- Product wishlist
- Cart add/update/remove with size, color, optional design
- Account hubs for designs & wishlist · cart totals with advance/COD preview

## Phase 3 (done)

- Interactive R3F 3D studio with orbit/zoom and camera presets
- Design placement (move, scale, rotate) · garment color · size · front/back
- Save & compare looks · add customized item to cart with placement JSON

## Phase 4 (done)

- AI Studio (`/ai`): Enhance, Design Doctor, Generator, Style & Design Consultants
- Job orchestration with `AiJob` logging · `live-ready` provider (swap via `AI_PROVIDER`)
- Generated/enhanced designs save into personal library

## Next phases

See `docs/ARCHITECTURE.md` §2 and §11.
