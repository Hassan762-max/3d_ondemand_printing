const cities = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
];

export function Fulfillment() {
  return (
    <section className="border-y border-[var(--ink)]/8 bg-[var(--paper-elevated)]/70 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          Fulfillment
        </p>
        <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
          Custom clothing, delivered across Pakistan.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
          Orders are fulfilled through our network of trusted local production
          partners — so your design is printed closer to home.
        </p>
        <ul className="mt-10 flex flex-wrap gap-2">
          {cities.map((city) => (
            <li
              key={city}
              className="rounded-md border border-[var(--ink)]/10 bg-[var(--paper)] px-3.5 py-2 text-sm text-[var(--ink)]"
            >
              {city}
            </li>
          ))}
          <li className="rounded-md border border-dashed border-[var(--ink)]/15 px-3.5 py-2 text-sm text-[var(--muted)]">
            and more
          </li>
        </ul>
      </div>
    </section>
  );
}
