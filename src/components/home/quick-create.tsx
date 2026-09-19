import Link from "next/link";
import { Button } from "@/components/ui/button";

const paths = [
  {
    n: "01",
    title: "Choose a Design",
    body: "Pick from our curated design library.",
    href: "/designs",
    cta: "Browse designs",
  },
  {
    n: "02",
    title: "Upload Your Design",
    body: "Upload your artwork and get it print-ready.",
    href: "/designs/upload",
    cta: "Upload artwork",
  },
  {
    n: "03",
    title: "Customize your print",
    body: "Place your design on the garment in the studio before you order.",
    href: "/studio",
    cta: "Open Studio",
  },
];

export function QuickCreate() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
        How do you want to create?
      </h2>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {paths.map((p) => (
          <article
            key={p.n}
            className="flex flex-col border-t border-[var(--ink)]/12 pt-6"
          >
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
              {p.n}
            </p>
            <h3 className="mt-3 text-xl font-medium tracking-tight">{p.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--muted)]">
              {p.body}
            </p>
            <Link href={p.href} className="mt-6">
              <Button variant="outline" size="sm">
                {p.cta}
              </Button>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
