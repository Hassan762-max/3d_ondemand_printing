import Link from "next/link";
import { PortalSection } from "@/components/portal/portal-section";
import { requirePagePermission } from "@/lib/auth/require-page-permission";
import { catalogProductWhere } from "@/lib/catalog/display";
import { prisma } from "@/lib/db";
import { formatPkr } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin catalog" };

export default async function AdminCatalogPage() {
  await requirePagePermission("catalog:write", "/admin/catalog");

  const products = await prisma.product.findMany({
    where: catalogProductWhere(),
    orderBy: { name: "asc" },
    include: { _count: { select: { variants: true } } },
  });

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
          Catalog
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
          Product blanks
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
          Blanks available for customization on the storefront.
        </p>
      </header>

      <PortalSection title={`${products.length} Products`}>
        <ul className="divide-y divide-[var(--ink)]/8 overflow-hidden rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)]">
          {products.map((p) => (
            <li key={p.id} className="px-4 py-3 text-sm">
              <Link
                href={`/products/${p.slug}`}
                className="font-medium underline"
              >
                {p.name}
              </Link>
              <p className="text-xs text-[var(--muted)]">
                {p.category.replaceAll("_", " ")} · {p._count.variants} variants
                · {formatPkr(p.basePrice)}
              </p>
            </li>
          ))}
        </ul>
      </PortalSection>
    </div>
  );
}
