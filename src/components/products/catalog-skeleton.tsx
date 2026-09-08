export function CatalogProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] rounded-2xl bg-[#e8e4dc] ring-1 ring-[var(--ink)]/[0.04]" />
      <div className="mt-4 space-y-3">
        <div className="h-2 w-16 rounded bg-[var(--mist)]" />
        <div className="h-5 w-28 rounded bg-[var(--mist)]" />
        <div className="h-3 w-24 rounded bg-[var(--mist)]" />
        <div className="h-3 w-full max-w-[12rem] rounded bg-[var(--mist)]" />
        <div className="flex gap-2 pt-1">
          <div className="h-3.5 w-3.5 rounded-full bg-[var(--mist)]" />
          <div className="h-3.5 w-3.5 rounded-full bg-[var(--mist)]" />
          <div className="h-3.5 w-3.5 rounded-full bg-[var(--mist)]" />
        </div>
      </div>
    </div>
  );
}

export function CatalogGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CatalogProductSkeleton key={i} />
      ))}
    </div>
  );
}
