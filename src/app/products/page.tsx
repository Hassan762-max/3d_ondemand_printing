import { brand } from "@/lib/brand";
import {
  catalogColorOption,
  catalogDisplayName,
  catalogFitForSlug,
  catalogImageUrl,
  catalogProductWhere,
  categoriesForGroup,
  normalizeCatalogFit,
  normalizeCatalogGroup,
  normalizeCatalogSort,
  type CatalogSort,
} from "@/lib/catalog/display";
import { CatalogFilters } from "@/components/products/catalog-filters";
import { CatalogProductCard } from "@/components/products/catalog-product-card";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Products" };

type Props = {
  searchParams: Promise<{
    category?: string;
    group?: string;
    fit?: string;
    sort?: string;
    design?: string;
    q?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const group = normalizeCatalogGroup(sp.group);
  // Legacy ?category= still works via product-categories when group not set
  const fit = normalizeCatalogFit(sp.fit);
  const sort = normalizeCatalogSort(sp.sort);
  const query = sp.q?.trim().toLowerCase() ?? "";
  const designId = sp.design;

  const groupCategories = categoriesForGroup(group);

  const [productsRaw, design] = await Promise.all([
    prisma.product.findMany({
      where: catalogProductWhere({
        ...(groupCategories ? { category: { in: groupCategories } } : {}),
        ...(sp.category && !sp.group
          ? { category: sp.category.toUpperCase() as never }
          : {}),
      }),
      include: {
        variants: { select: { color: true, colorHex: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    designId
      ? prisma.design.findUnique({
          where: { id: designId },
          select: { id: true, title: true },
        })
      : Promise.resolve(null),
  ]);

  let products = productsRaw.map((p) => {
    const colorMap = new Map(
      p.variants.map((v) => {
        const option = catalogColorOption(v.color, v.colorHex);
        return [option.name, option];
      }),
    );
    return {
      ...p,
      displayName: catalogDisplayName(p.slug, p.name),
      imageUrl: catalogImageUrl(p.slug, p.imageUrl),
      fit: catalogFitForSlug(p.slug),
      colors: [...colorMap.values()],
    };
  });

  if (fit !== "all") {
    products = products.filter((p) => p.fit === fit);
  }

  if (query) {
    products = products.filter(
      (p) =>
        p.displayName.toLowerCase().includes(query) ||
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query),
    );
  }

  products = sortProducts(products, sort);

  const designQuery = design ? `?design=${encodeURIComponent(design.id)}` : "";

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_at_20%_0%,rgba(26,107,92,0.1),transparent_55%),radial-gradient(ellipse_at_90%_10%,rgba(12,14,18,0.05),transparent_45%)]"
      />

      <div className="portal-bleed relative mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6 sm:pt-16">
        <header className="max-w-2xl pb-12 sm:pb-16">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            {brand.name} · Print on demand
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.25rem]">
            Premium Blanks. Printed on Demand.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            Choose a high-quality blank garment, apply your design once, preview it in true 3D,
            and we&apos;ll print it on demand just for you.
          </p>
        </header>

        {design ? (
          <p className="mb-8 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 px-4 py-3 text-sm text-[var(--ink)]">
            Applying design <span className="font-medium">{design.title}</span> — pick a blank to
            continue.
          </p>
        ) : null}

        <CatalogFilters
          group={group}
          fit={fit}
          sort={sort}
          q={sp.q}
          designId={design?.id}
        />

        <p className="mt-6 text-xs text-[var(--muted)]">
          {products.length} blank{products.length === 1 ? "" : "s"}
          {fit !== "all" ? ` · ${fit}` : ""}
          {query ? ` · “${sp.q}”` : ""}
        </p>

        {products.length === 0 ? (
          <div className="mt-14 rounded-2xl border border-dashed border-[var(--ink)]/15 px-6 py-20 text-center">
            <p className="text-sm text-[var(--muted)]">
              No blanks match these filters. Clear search or try another category.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <CatalogProductCard
                key={product.id}
                product={{
                  id: product.id,
                  slug: product.slug,
                  displayName: product.displayName,
                  category: product.category,
                  basePrice: product.basePrice,
                  description: product.description,
                  imageUrl: product.imageUrl,
                  colors: product.colors,
                  href: `/products/${product.slug}${designQuery}`,
                }}
              />
            ))}
          </div>
        )}

        <p className="mt-16 max-w-lg text-sm leading-relaxed text-[var(--muted)]">
          {brand.name} does not stock printed inventory. Every order is custom-printed after you
          confirm your design — blanks ship blank until your artwork is applied.
        </p>
      </div>
    </div>
  );
}

function sortProducts<
  T extends { basePrice: number; createdAt: Date; displayName: string; slug: string },
>(items: T[], sort: CatalogSort) {
  const next = [...items];
  switch (sort) {
    case "price":
    case "price-asc":
      return next.sort((a, b) => a.basePrice - b.basePrice);
    case "price-desc":
      return next.sort((a, b) => b.basePrice - a.basePrice);
    case "newest":
      return next.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    case "popular":
    default: {
      // Stable “editorial” popular order by known slug priority
      const rank: Record<string, number> = {
        "monsoon-hoodie": 0,
        "oversized-studio-tee": 1,
        "essential-tee": 2,
        "city-polo": 3,
        "crew-sweat": 4,
        "city-shell-jacket": 5,
        "studio-joggers": 6,
        "everyday-casual-shirt": 7,
        "court-shorts": 8,
        "weekend-cap": 9,
      };
      return next.sort(
        (a, b) => (rank[a.slug] ?? 50) - (rank[b.slug] ?? 50) || a.displayName.localeCompare(b.displayName),
      );
    }
  }
}
