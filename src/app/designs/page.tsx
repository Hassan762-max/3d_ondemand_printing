import Link from "next/link";
import { DesignLibraryCard } from "@/components/designs/design-library-card";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { brand } from "@/lib/brand";
import { prisma } from "@/lib/db";
import {
  DESIGN_CATEGORIES,
  designMatchesCategory,
  normalizeCategory,
} from "@/lib/design-categories";

export const dynamic = "force-dynamic";
export const metadata = { title: "Design Library" };

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
  ).filter(
    (d) =>
      !query ||
      d.title.toLowerCase().includes(query) ||
      (d.description ?? "").toLowerCase().includes(query),
  );

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
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] bg-[radial-gradient(ellipse_at_15%_0%,rgba(26,107,92,0.09),transparent_55%),radial-gradient(ellipse_at_85%_5%,rgba(12,14,18,0.04),transparent_40%)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6 sm:pt-16">
        <header className="flex flex-col gap-8 border-b border-[var(--ink)]/8 pb-10 sm:pb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              {brand.name} · Artwork
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-[1.05] tracking-tight sm:text-5xl">
              Design Library
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
              Browse curated prints or upload your own artwork to apply to any product.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 max-sm:sticky max-sm:bottom-4 max-sm:z-30 max-sm:rounded-2xl max-sm:border max-sm:border-[var(--ink)]/8 max-sm:bg-[var(--paper)]/95 max-sm:p-3 max-sm:shadow-lg max-sm:backdrop-blur-md lg:justify-end">
            <Link href="/designs/upload" className="max-sm:flex-1">
              <Button className="w-full sm:w-auto">Upload Design</Button>
            </Link>
            <Link href="/account/designs" className="max-sm:w-full">
              <Button variant="outline" className="w-full sm:w-auto">
                Saved Designs
              </Button>
            </Link>
          </div>
        </header>

        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <CategoryPill href={q ? `/designs?q=${encodeURIComponent(q)}` : "/designs"} active={!category} label="All" />
            {DESIGN_CATEGORIES.map((c) => {
              const params = new URLSearchParams();
              params.set("category", c);
              if (q) params.set("q", q);
              return (
                <CategoryPill
                  key={c}
                  href={`/designs?${params.toString()}`}
                  active={category === c}
                  label={c}
                />
              );
            })}
          </div>

          <form method="get" className="flex w-full gap-2 sm:max-w-xs">
            {category ? <input type="hidden" name="category" value={category} /> : null}
            <input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search designs…"
              className="h-10 min-w-0 flex-1 rounded-full border border-[var(--ink)]/10 bg-[var(--paper-elevated)] px-4 text-sm outline-none ring-[var(--accent)]/30 placeholder:text-[var(--muted)] focus:ring-2"
            />
            <button
              type="submit"
              className="h-10 shrink-0 rounded-full bg-[var(--ink)] px-4 text-xs uppercase tracking-[0.12em] text-[var(--paper)]"
            >
              Search
            </button>
          </form>
        </div>

        <p className="mt-6 text-xs text-[var(--muted)]">
          {filtered.length} design{filtered.length === 1 ? "" : "s"}
          {category ? ` · ${category}` : ""}
          {query ? ` · “${q}”` : ""}
        </p>

        {filtered.length === 0 ? (
          <div className="mt-14 rounded-2xl border border-dashed border-[var(--ink)]/15 px-6 py-20 text-center">
            <p className="text-sm text-[var(--muted)]">
              {query
                ? `No designs matching “${q}”. Try another search or clear filters.`
                : category
                  ? `No designs tagged “${category}” yet. Try another category or upload your own.`
                  : "No designs yet. Upload one to get started."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {category || query ? (
                <Link href="/designs">
                  <Button variant="outline">Clear filters</Button>
                </Link>
              ) : null}
              <Link href="/designs/upload">
                <Button>Upload Design</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((design) => (
              <DesignLibraryCard
                key={design.id}
                design={{
                  id: design.id,
                  title: design.title,
                  description: design.description,
                  imageUrl: design.imageUrl,
                  tags: design.tags,
                  isLibrary: design.isLibrary,
                  saved: savedIds.has(design.id),
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryPill({
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
      className={`inline-flex h-10 shrink-0 items-center rounded-full px-3.5 text-xs transition ${
        active
          ? "bg-[var(--ink)] text-[var(--paper)]"
          : "bg-[var(--paper-elevated)] text-[var(--muted)] ring-1 ring-[var(--ink)]/8 hover:text-[var(--ink)] hover:ring-[var(--ink)]/20"
      }`}
    >
      {label}
    </Link>
  );
}
