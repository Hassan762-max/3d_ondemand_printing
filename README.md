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

## Next phases

See `docs/ARCHITECTURE.md` §2 and §11.
