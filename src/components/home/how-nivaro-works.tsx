const steps = [
  { n: "01", title: "Choose or Upload", body: "Library design or your own file." },
  { n: "02", title: "AI Enhances", body: "Print-ready quality and guidance." },
  { n: "03", title: "Pick a Product", body: "Apply your design to the right blank." },
  { n: "04", title: "Try It On", body: "See it on your photo with AI." },
  { n: "05", title: "Order", body: "Full COD across Pakistan." },
];

export function HowNivaroWorks() {
  return (
    <section className="border-y border-[var(--ink)]/8 bg-[var(--paper-elevated)]/80 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          How it works
        </p>
        <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
          From your idea to something you can actually wear.
        </h2>
        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((s) => (
            <li key={s.n} className="border-t border-[var(--ink)]/10 pt-5">
              <p className="font-[family-name:var(--font-display)] text-sm text-[var(--accent)]">
                {s.n}
              </p>
              <h3 className="mt-2 text-base font-medium tracking-tight">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
