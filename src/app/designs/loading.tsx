import { brand } from "@/lib/brand";
import { DesignGridSkeleton } from "@/components/designs/design-skeleton";

export default function DesignsLoading() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] bg-[radial-gradient(ellipse_at_15%_0%,rgba(26,107,92,0.09),transparent_55%)]"
      />
      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6 sm:pt-16">
        <header className="border-b border-[var(--ink)]/8 pb-10">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            {brand.name} · Artwork
          </p>
          <div className="mt-4 h-12 w-64 animate-pulse rounded-lg bg-[var(--mist)]" />
          <div className="mt-5 h-4 w-full max-w-xl animate-pulse rounded bg-[var(--mist)]" />
        </header>
        <div className="mt-8 flex gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-10 w-20 shrink-0 animate-pulse rounded-full bg-[var(--mist)]" />
          ))}
        </div>
        <DesignGridSkeleton />
      </div>
    </div>
  );
}
