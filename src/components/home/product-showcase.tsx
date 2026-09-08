import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  catalogDisplayName,
  catalogImageUrl,
} from "@/lib/catalog/display";
import { formatPkr } from "@/lib/utils";

export type ShowcaseProduct = {
  id: string;
  slug: string;
  name: string;
  basePrice: number;
  imageUrl: string | null;
  colors: { name: string; hex: string }[];
};

export function ProductShowcase({ products }: { products: ShowcaseProduct[] }) {
  return (
    <section className="border-y border-[var(--ink)]/8 bg-[var(--paper-elevated)]/70 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              Premium blanks
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
              Choose what you want to wear.
            </h2>
          </div>
          <Link href="/products">
            <Button variant="outline">View catalog</Button>
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="mt-10 text-sm text-[var(--muted)]">
            Catalog empty — run <code>npm run db:seed</code>.
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const name = catalogDisplayName(product.slug, product.name);
              const image = catalogImageUrl(product.slug, product.imageUrl);
              return (
                <article key={product.id} className="group">
                  <Link href={`/products/${product.slug}`} className="block">
                    <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-[#efece6] ring-1 ring-[var(--ink)]/[0.06]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image}
                        alt={name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                      />
                    </div>
                  </Link>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-[family-name:var(--font-display)] text-lg tracking-tight">
                        {name}
                      </h3>
                      <p className="text-sm text-[var(--muted)]">
                        From {formatPkr(product.basePrice)}
                      </p>
                    </div>
                    {product.colors.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {product.colors.slice(0, 5).map((c) => (
                          <span
                            key={c.name}
                            title={c.name}
                            className="h-3.5 w-3.5 rounded-full border border-[var(--ink)]/15"
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                      </div>
                    ) : null}
                    <Link href={`/studio?product=${product.slug}`}>
                      <Button size="sm" variant="outline">
                        Start Designing
                      </Button>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
