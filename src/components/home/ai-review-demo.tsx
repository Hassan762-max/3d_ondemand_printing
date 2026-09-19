import { Button } from "@/components/ui/button";

export function AiReviewDemo() {
  return (
    <section className="border-y border-[var(--ink)]/8 bg-[var(--paper-elevated)]/80 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
          AI Style Review
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight">
          A consultant, not just a generator.
        </h2>
        <div className="mt-8 rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper)] p-6 sm:p-8">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Demo review · sample copy
          </p>
          <p className="mt-4 text-lg leading-relaxed tracking-tight text-[var(--ink)]">
            Your design works well with the oversized black tee. I&apos;d reduce
            the print slightly and move it higher for a cleaner streetwear look.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/studio">Open Studio</Button>
            <Button href="/products" variant="outline">
              Browse products
            </Button>
          </div>
          <p className="mt-4 text-xs text-[var(--muted)]">
            Jump into the 3D studio or product catalog to apply suggestions for real.
          </p>
        </div>
      </div>
    </section>
  );
}
