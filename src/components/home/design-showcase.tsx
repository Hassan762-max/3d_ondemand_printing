import Link from "next/link";
import { SaveDesignButton } from "@/components/designs/save-design-button";
import { Button } from "@/components/ui/button";
import { DESIGN_CATEGORIES } from "@/lib/design-categories";

export type ShowcaseDesign = {
  id: string;
  title: string;
  imageUrl: string;
  tags: string;
};

export function DesignShowcase({
  designs,
  savedIds,
}: {
  designs: ShowcaseDesign[];
  savedIds: Set<string>;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            Design library
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
            Find a design. Make it yours.
          </h2>
        </div>
        <Link href="/designs">
          <Button variant="outline">Explore All Designs</Button>
        </Link>
      </div>

      <div className="mt-8 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {DESIGN_CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/designs?category=${encodeURIComponent(c)}`}
            className="shrink-0 rounded-md border border-[var(--ink)]/10 bg-[var(--paper-elevated)] px-3 py-1.5 text-xs text-[var(--muted)] transition hover:border-[var(--ink)]/25 hover:text-[var(--ink)]"
          >
            {c}
          </Link>
        ))}
      </div>

      {designs.length === 0 ? (
        <p className="mt-10 text-sm text-[var(--muted)]">
          No designs yet. Seed the library or upload your first piece.
        </p>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {designs.map((design) => {
            const tags = safeTags(design.tags);
            const category = tags[0] ?? "Library";
            return (
              <article
                key={design.id}
                className="group overflow-hidden rounded-xl border border-[var(--ink)]/8 bg-[var(--paper-elevated)]"
              >
                <Link href={`/studio?design=${design.id}`} className="block">
                  <div className="aspect-square bg-[var(--mist)] p-5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={design.imageUrl}
                      alt={design.title}
                      className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                </Link>
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
                        {category}
                      </p>
                      <h3 className="mt-1 font-medium tracking-tight">{design.title}</h3>
                    </div>
                    <SaveDesignButton
                      designId={design.id}
                      initiallySaved={savedIds.has(design.id)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <Link href={`/studio?design=${design.id}`} className="underline">
                      Use Design
                    </Link>
                    <Link href={`/try-on`} className="text-[var(--muted)] underline">
                      Try On
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function safeTags(raw: string) {
  try {
    return JSON.parse(raw || "[]") as string[];
  } catch {
    return [] as string[];
  }
}
