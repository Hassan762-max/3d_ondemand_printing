import type { ProductCategory } from "@prisma/client";
import Link from "next/link";
import {
  normalizeProductCategory,
  PRODUCT_CATEGORY_OPTIONS,
  productCategoryLabel,
} from "@/lib/product-categories";
import { prisma } from "@/lib/db";
import { formatPkr } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Products" };

type Props = {
  searchParams: Promise<{ category?: string; design?: string; q?: string }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const { category: categoryRaw, design: designId, q } = await searchParams;
  const category = normalizeProductCategory(categoryRaw) as ProductCategory | null;
  const query = q?.trim().toLowerCase() ?? "";

  const [productsRaw, design] = await Promise.all([
    prisma.product.findMany({
      where: {
        active: true,
        ...(category ? { category } : {}),
      },
      orderBy: { name: "asc" },
    }),
    designId
      ? prisma.design.findUnique({
          where: { id: designId },
          select: { id: true, title: true },
        })
      : Promise.resolve(null),
  ]);

  const products = query
    ? productsRaw.filter((p) => p.name.toLowerCase().includes(query))
    : productsRaw;

  const designQuery = design ? `?design=${encodeURIComponent(design.id)}` : "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Catalog</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
        Products
      </h1>
      <p className="mt-3 max-w-xl text-sm text-[var(--muted)]">
        Choose a blank, apply any design once, and print across multiple garments.
      </p>

      {design ? (
        <p className="mt-6 rounded-lg border border-[var(--ink)]/10 bg-[var(--paper-elevated)] px-4 py-3 text-sm">
          Applying design <span className="font-medium">{design.title}</span> — pick a garment
          to continue.
        </p>
      ) : null}

      <form method="get" className="mt-8 flex flex-wrap gap-2">
        {category ? <input type="hidden" name="category" value={category} /> : null}
        {design ? <input type="hidden" name="design" value={design.id} /> : null}
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search products…"
          className="h-10 min-w-[200px] flex-1 rounded-md border border-[var(--ink)]/12 bg-white/80 px-3 text-sm sm:max-w-xs"
        />
        <button
          type="submit"
          className="h-10 rounded-md border border-[var(--ink)]/12 bg-[var(--ink)] px-4 text-xs uppercase tracking-[0.12em] text-[var(--paper)]"
        >
          Search
        </button>
      </form>

      <div className="mt-8 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <CategoryChip href={design ? `/products?design=${design.id}` : "/products"} active={!category} label="All" />
        {PRODUCT_CATEGORY_OPTIONS.map((c) => {
          const params = new URLSearchParams();
          params.set("category", c.value);
          if (design) params.set("design", design.id);
          return (
            <CategoryChip
              key={c.value}
              href={`/products?${params.toString()}`}
              active={category === c.value}
              label={c.label}
            />
          );
        })}
      </div>

      {products.length === 0 ? (
        <div className="mt-16 rounded-xl border border-dashed border-[var(--ink)]/15 px-6 py-16 text-center">
          <p className="text-sm text-[var(--muted)]">
            {query
              ? `No products matching “${q}”. Try another search or clear filters.`
              : "No products in this category. Try another filter or seed the database."}
          </p>
        </div>
      ) : (
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}${designQuery}`}
              className="group"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-xl bg-[var(--mist)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.imageUrl ?? "/products/tee.svg"}
                  alt={product.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-4">
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                  {productCategoryLabel(product.category)}
                </p>
                <div className="mt-1 flex items-baseline justify-between gap-3">
                  <h2 className="text-lg font-medium tracking-tight">{product.name}</h2>
                  <span className="text-sm text-[var(--muted)]">
                    {formatPkr(product.basePrice)}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">
                  {product.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-md border px-3 py-1.5 text-xs transition ${
        active
          ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
          : "border-[var(--ink)]/10 bg-[var(--paper-elevated)] text-[var(--muted)] hover:border-[var(--ink)]/25 hover:text-[var(--ink)]"
      }`}
    >
      {label}
    </Link>
  );
}
