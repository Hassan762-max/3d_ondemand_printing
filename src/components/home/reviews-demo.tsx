/**
 * Homepage reviews — live DB rows when present, otherwise clearly labeled demos.
 */

const DEMO_REVIEWS = [
  {
    rating: 5,
    name: "Demo customer",
    body: "The 3D studio made placement obvious before I ordered. Try-on sealed it.",
    product: "Oversized Studio Tee",
  },
  {
    rating: 5,
    name: "Demo customer",
    body: "AI doctor caught a low-contrast print issue I would have missed.",
    product: "Essential Tee",
  },
  {
    rating: 4,
    name: "Demo customer",
    body: "COD checkout felt straightforward. Print quality matched the preview.",
    product: "Monsoon Hoodie",
  },
];

export type HomeReview = {
  rating: number;
  name: string;
  body: string;
  product: string;
};

export function ReviewsDemo({ reviews }: { reviews?: HomeReview[] }) {
  const live = reviews && reviews.length > 0;
  const items = live ? reviews.slice(0, 6) : DEMO_REVIEWS;

  return (
    <section className="border-y border-[var(--ink)]/8 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          {live ? "Reviews" : "Reviews · demo"}
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
          What makers are saying
        </h2>
        <p className="mt-3 max-w-lg text-sm text-[var(--muted)]">
          {live
            ? "Recent ratings from delivered orders."
            : "Placeholder testimonials for layout — not real customer quotes. Live reviews appear here after delivered orders are rated."}
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {items.map((r) => (
            <article
              key={`${r.name}-${r.body.slice(0, 24)}`}
              className="rounded-xl border border-[var(--ink)]/8 bg-[var(--paper-elevated)] p-5"
            >
              <p className="text-sm font-medium tracking-tight">
                {"★".repeat(r.rating)}
                <span className="text-[var(--muted)]">
                  {"★".repeat(5 - r.rating)}
                </span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--ink)]">
                {r.body}
              </p>
              <p className="mt-4 text-xs text-[var(--muted)]">
                {r.name} · {r.product}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
