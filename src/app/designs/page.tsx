import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SaveDesignButton } from "@/components/designs/save-design-button";
import { auth } from "@/lib/auth";
import { brand } from "@/lib/brand";
import { prisma } from "@/lib/db";
import {
  DESIGN_CATEGORIES,
  designMatchesCategory,
  normalizeCategory,
} from "@/lib/design-categories";

export const dynamic = "force-dynamic";
export const metadata = { title: "Design library" };

type Props = { searchParams: Promise<{ category?: string; q?: string }> };

export default async function DesignsPage({ searchParams }: Props) {
  const session = await auth();
  const { category: categoryRaw, q } = await searchParams;
  const category = normalizeCategory(categoryRaw);
  const query = q?.trim().toLowerCase() ?? "";

  const designs = await prisma.design.findMany({
    where: {
      OR: [
        { isLibrary: true },
        ...(session?.user?.id ? [{ ownerId: session.user.id }] : []),
      ],
    },
    orderBy: [{ isLibrary: "desc" }, { createdAt: "desc" }],
  });

  const filtered = (category
    ? designs.filter((d) => designMatchesCategory(d.tags, category))
    : designs
  ).filter((d) => !query || d.title.toLowerCase().includes(query));

  const savedIds = new Set(
    session?.user?.id
      ? (
          await prisma.savedDesign.findMany({
            where: { userId: session.user.id },
            select: { designId: true },
          })
        ).map((s) => s.designId)
      : [],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            Ready-made & yours
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
            Design library
          </h1>
          <p className="mt-3 max-w-xl text-sm text-[var(--muted)]">
            Browse curated prints or upload your own. Save favorites and apply them on{" "}
            {brand.name}.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/designs/upload">
            <Button>Upload design</Button>
          </Link>
          <Link href="/marketplace">
            <Button variant="outline">Marketplace</Button>
          </Link>
          <Link href="/account/designs">
            <Button variant="outline">Saved designs</Button>
          </Link>
        </div>
      </div>

      <form method="get" className="mt-8 flex flex-wrap gap-2">
        {category ? <input type="hidden" name="category" value={category} /> : null}
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search designs…"
          className="h-10 min-w-[200px] flex-1 rounded-md border border-[var(--ink)]/12 bg-white/80 px-3 text-sm sm:max-w-xs"
        />
        <button
          type="submit"
          className="h-10 rounded-md border border-[var(--ink)]/12 bg-[var(--ink)] px-4 text-xs uppercase tracking-[0.12em] text-[var(--paper)]"
        >
          Search
        </button>
      </form>

      <div className="mt-8 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <CategoryChip href="/designs" active={!category} label="All" />
        {DESIGN_CATEGORIES.map((c) => (
          <CategoryChip
            key={c}
            href={`/designs?category=${encodeURIComponent(c)}`}
            active={category === c}
            label={c}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 rounded-xl border border-dashed border-[var(--ink)]/15 px-6 py-16 text-center">
          <p className="text-sm text-[var(--muted)]">
            {query
              ? `No designs matching “${q}”. Try another search or clear filters.`
              : category
                ? `No designs tagged “${category}” yet. Try another category or upload your own.`
                : "No designs yet. Upload one to get started."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {category ? (
              <Link href="/designs">
                <Button variant="outline">Clear filter</Button>
              </Link>
            ) : null}
            <Link href="/designs/upload">
              <Button>Upload design</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((design) => {
            const tags = JSON.parse(design.tags || "[]") as string[];
            return (
              <article
                key={design.id}
                className="group overflow-hidden rounded-xl border border-[var(--ink)]/8 bg-[var(--paper-elevated)] transition hover:border-[var(--ink)]/20"
              >
                <Link href={`/studio?design=${design.id}`} className="block">
                  <div className="aspect-square bg-[var(--mist)] p-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={design.imageUrl}
                      alt={design.title}
                      className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
                        {design.isLibrary ? "Library" : "Your upload"}
                      </p>
                      <h2 className="mt-1 font-medium tracking-tight">{design.title}</h2>
                    </div>
                    <SaveDesignButton
                      designId={design.id}
                      initiallySaved={savedIds.has(design.id)}
                    />
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                    {design.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-[var(--mist)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--muted)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link href={`/studio?design=${design.id}`} className="text-sm underline">
                      Use in Studio
                    </Link>
                    <Link
                      href={`/products?design=${design.id}`}
                      className="text-sm text-[var(--muted)] underline"
                    >
                      Apply to product
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CategoryChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-md border px-3 py-1.5 text-xs transition ${
        active
          ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
          : "border-[var(--ink)]/10 bg-[var(--paper-elevated)] text-[var(--muted)] hover:border-[var(--ink)]/25 hover:text-[var(--ink)]"
      }`}
    >
      {label}
    </Link>
  );
}
