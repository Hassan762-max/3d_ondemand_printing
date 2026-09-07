import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPkr } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Products" };

const categoryLabel: Record<string, string> = {
  T_SHIRT: "T-Shirt",
  OVERSIZED_T_SHIRT: "Oversized Tee",
  POLO: "Polo",
  HOODIE: "Hoodie",
  SWEATSHIRT: "Sweatshirt",
  CASUAL_SHIRT: "Casual Shirt",
  JACKET: "Jacket",
  JOGGERS: "Joggers",
  SHORTS: "Shorts",
  CAP: "Cap",
};

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Catalog</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
        Products
      </h1>
      <p className="mt-3 max-w-xl text-sm text-[var(--muted)]">
        Choose a blank, apply any design once, and print across multiple garments.
      </p>

      {products.length === 0 ? (
        <div className="mt-16 rounded-xl border border-dashed border-[var(--ink)]/15 px-6 py-16 text-center">
          <p className="text-sm text-[var(--muted)]">No products yet. Seed the database to continue.</p>
        </div>
      ) : (
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`} className="group">
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
                  {categoryLabel[product.category] ?? product.category}
                </p>
                <div className="mt-1 flex items-baseline justify-between gap-3">
                  <h2 className="text-lg font-medium tracking-tight">{product.name}</h2>
                  <span className="text-sm text-[var(--muted)]">{formatPkr(product.basePrice)}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">{product.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
