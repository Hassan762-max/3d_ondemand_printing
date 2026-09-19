"use client";

import Link from "next/link";
import { DeleteDesignButton } from "@/components/designs/delete-design-button";
import { SaveDesignButton } from "@/components/designs/save-design-button";
import { designStyleTags } from "@/lib/design-categories";

export type DesignCardData = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  tags: string;
  isLibrary: boolean;
  saved: boolean;
};

export function DesignLibraryCard({ design }: { design: DesignCardData }) {
  const tags = designStyleTags(design.tags, 3);
  const productHref = `/products?design=${design.id}`;
  const canDelete = !design.isLibrary;

  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#F5F5F5] shadow-[0_1px_0_rgba(12,14,18,0.04)] ring-1 ring-[var(--ink)]/[0.06]">
        <Link href={productHref} className="absolute inset-0 z-0 block" aria-label={design.title}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={design.imageUrl}
            alt={design.title}
            className="h-full w-full object-contain p-6 transition duration-700 ease-out group-hover:scale-[1.05]"
          />
        </Link>

        <div className="absolute right-3 top-3 z-20 flex flex-col gap-2">
          <SaveDesignButton
            designId={design.id}
            initiallySaved={design.saved}
            variant="icon"
          />
          {canDelete ? (
            <DeleteDesignButton
              designId={design.id}
              designTitle={design.title}
              variant="icon"
            />
          ) : null}
        </div>

        <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-[var(--ink)]/65 via-[var(--ink)]/10 to-transparent opacity-0 transition duration-500 group-hover:opacity-100 md:block" />
        <div className="absolute inset-x-0 bottom-0 z-10 hidden flex-col gap-2 p-4 opacity-0 transition duration-500 group-hover:opacity-100 md:flex">
          <Link
            href={productHref}
            className="pointer-events-auto inline-flex h-11 items-center justify-center rounded-md bg-[var(--paper)] px-4 text-sm font-medium text-[var(--ink)] transition hover:bg-white"
          >
            Apply to Product
          </Link>
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
          {design.isLibrary ? "Curated" : "Your upload"}
        </p>
        <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight text-[var(--ink)]">
          <Link href={productHref} className="hover:underline">
            {design.title}
          </Link>
        </h2>
        {design.description ? (
          <p className="line-clamp-1 text-sm text-[var(--muted)]">{design.description}</p>
        ) : null}
        {tags.length > 0 ? (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[var(--paper-elevated)] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-[var(--muted)] ring-1 ring-[var(--ink)]/8"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-3 flex flex-col gap-2 md:hidden">
          <Link
            href={productHref}
            className="inline-flex h-11 items-center justify-center rounded-md bg-[var(--ink)] px-4 text-sm font-medium text-[var(--paper)]"
          >
            Apply to Product
          </Link>
        </div>
      </div>
    </article>
  );
}
