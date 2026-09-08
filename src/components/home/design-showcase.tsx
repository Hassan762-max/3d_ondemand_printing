import Link from "next/link";
import { SaveDesignButton } from "@/components/designs/save-design-button";
import { Button } from "@/components/ui/button";
import { DESIGN_CATEGORIES, designStyleTags } from "@/lib/design-categories";

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
            className="shrink-0 rounded-full bg-[var(--paper-elevated)] px-3.5 py-1.5 text-xs text-[var(--muted)] ring-1 ring-[var(--ink)]/8 transition hover:text-[var(--ink)] hover:ring-[var(--ink)]/20"
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
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {designs.map((design) => {
            const tags = designStyleTags(design.tags, 2);
            return (
              <article key={design.id} className="group">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#F5F5F5] ring-1 ring-[var(--ink)]/[0.06]">
                  <Link href={`/studio?design=${design.id}`} className="absolute inset-0 block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={design.imageUrl}
                      alt={design.title}
                      className="h-full w-full object-contain p-5 transition duration-500 group-hover:scale-[1.04]"
                    />
                  </Link>
                  <div className="absolute right-3 top-3 z-10">
                    <SaveDesignButton
                      designId={design.id}
                      initiallySaved={savedIds.has(design.id)}
                      variant="icon"
                    />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <h3 className="font-[family-name:var(--font-display)] text-lg tracking-tight">
                    {design.title}
                  </h3>
                  {tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[var(--paper-elevated)] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[var(--muted)] ring-1 ring-[var(--ink)]/8"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-3 text-sm">
                    <Link href={`/studio?design=${design.id}`} className="underline">
                      Use in 3D Studio
                    </Link>
                    <Link href={`/products?design=${design.id}`} className="text-[var(--muted)] underline">
                      Apply to Product
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
