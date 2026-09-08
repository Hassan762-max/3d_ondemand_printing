export function DesignCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-2xl bg-[#ebe8e2] ring-1 ring-[var(--ink)]/[0.04]" />
      <div className="mt-4 space-y-3">
        <div className="h-2 w-14 rounded bg-[var(--mist)]" />
        <div className="h-5 w-36 rounded bg-[var(--mist)]" />
        <div className="h-3 w-full max-w-[14rem] rounded bg-[var(--mist)]" />
        <div className="flex gap-2 pt-1">
          <div className="h-6 w-16 rounded-full bg-[var(--mist)]" />
          <div className="h-6 w-14 rounded-full bg-[var(--mist)]" />
        </div>
      </div>
    </div>
  );
}

export function DesignGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <DesignCardSkeleton key={i} />
      ))}
    </div>
  );
}
