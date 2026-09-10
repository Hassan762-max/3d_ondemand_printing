"use client";

import Link from "next/link";
import { formatPkr } from "@/lib/utils";
import { catalogCategoryTag } from "@/lib/catalog/display";

export type CatalogProductCardData = {
  id: string;
  slug: string;
  displayName: string;
  category: string;
  basePrice: number;
  description: string;
  imageUrl: string;
  colors: { name: string; hex: string }[];
  href: string;
};

export function CatalogProductCard({ product }: { product: CatalogProductCardData }) {
  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#efece6] shadow-[0_1px_0_rgba(12,14,18,0.04)] ring-1 ring-[var(--ink)]/[0.06]">
        <Link href={product.href} className="absolute inset-0 z-0 block" aria-label={product.displayName}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={product.displayName}
            className="h-full w-full object-cover object-center transition duration-700 ease-out group-hover:scale-[1.06] md:group-hover:rotate-[0.5deg]"
          />
        </Link>
        <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-[var(--ink)]/60 via-[var(--ink)]/10 to-transparent opacity-0 transition duration-500 group-hover:opacity-100 md:block" />
        <div className="absolute inset-x-0 bottom-0 z-10 hidden flex-col gap-2 p-4 opacity-0 transition duration-500 group-hover:opacity-100 md:flex">
          <Link
            href={product.href}
            className="pointer-events-auto inline-flex h-11 items-center justify-center rounded-md bg-[var(--paper)] px-4 text-sm font-medium text-[var(--ink)] transition hover:bg-white"
          >
            Start Designing
          </Link>
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
          {catalogCategoryTag(product.category)}
        </p>
        <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight text-[var(--ink)]">
          <Link href={product.href} className="hover:underline">
            {product.displayName}
          </Link>
        </h2>
        <p className="text-sm text-[var(--ink-soft)]">
          Starts at {formatPkr(product.basePrice)}
        </p>
        <p className="line-clamp-1 text-sm text-[var(--muted)]">{product.description}</p>
        {product.colors.length > 0 ? (
          <div className="mt-1 flex items-center gap-2">
            <span className="sr-only">Available colors</span>
            {product.colors.slice(0, 6).map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="h-3.5 w-3.5 rounded-full border border-[var(--ink)]/12 shadow-inner"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-3 md:hidden">
          <Link
            href={product.href}
            className="inline-flex h-11 min-w-[9.5rem] flex-1 items-center justify-center rounded-md bg-[var(--ink)] px-4 text-sm font-medium text-[var(--paper)]"
          >
            Start Designing
          </Link>
        </div>
      </div>
    </article>
  );
}
