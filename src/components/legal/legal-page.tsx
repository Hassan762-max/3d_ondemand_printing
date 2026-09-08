import { brand } from "@/lib/brand";

export function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: { heading: string; body: string }[];
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Legal</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
        {title}
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {brand.name} · Last updated {updated}
      </p>
      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.heading} className="border-t border-[var(--ink)]/10 pt-6">
            <h2 className="text-lg font-medium tracking-tight">{s.heading}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
