import { brand } from "@/lib/brand";
import { CatalogGridSkeleton } from "@/components/products/catalog-skeleton";

export default function ProductsLoading() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_at_20%_0%,rgba(26,107,92,0.1),transparent_55%),radial-gradient(ellipse_at_90%_10%,rgba(12,14,18,0.05),transparent_45%)]"
      />
      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6 sm:pt-16">
        <header className="max-w-2xl pb-12 sm:pb-16">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            {brand.name} · Print on demand
          </p>
          <div className="mt-4 h-12 w-full max-w-md animate-pulse rounded-lg bg-[var(--mist)] sm:h-14" />
          <div className="mt-5 h-4 w-full max-w-xl animate-pulse rounded bg-[var(--mist)]" />
          <div className="mt-2 h-4 w-full max-w-md animate-pulse rounded bg-[var(--mist)]" />
        </header>
        <div className="space-y-4 border-y border-[var(--ink)]/8 py-6">
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-20 shrink-0 animate-pulse rounded-full bg-[var(--mist)]"
              />
            ))}
          </div>
        </div>
        <CatalogGridSkeleton />
      </div>
    </div>
  );
}
