"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CATALOG_FITS,
  CATALOG_GROUPS,
  CATALOG_SORTS,
  type CatalogFit,
  type CatalogGroup,
  type CatalogSort,
} from "@/lib/catalog/display";

function buildHref(base: {
  group: CatalogGroup;
  fit: CatalogFit | "all";
  sort: CatalogSort;
  q?: string;
  design?: string | null;
}) {
  const params = new URLSearchParams();
  if (base.group !== "all") params.set("group", base.group);
  if (base.fit !== "all") params.set("fit", base.fit);
  if (base.sort !== "popular") params.set("sort", base.sort);
  if (base.q) params.set("q", base.q);
  if (base.design) params.set("design", base.design);
  const qs = params.toString();
  return qs ? `/products?${qs}` : "/products";
}

export function CatalogFilters({
  group,
  fit,
  sort,
  q,
  designId,
}: {
  group: CatalogGroup;
  fit: CatalogFit | "all";
  sort: CatalogSort;
  q?: string;
  designId?: string | null;
}) {
  const base = { group, fit, sort, q, design: designId };
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  const activeCount =
    (group !== "all" ? 1 : 0) + (fit !== "all" ? 1 : 0) + (sort !== "popular" ? 1 : 0);

  return (
    <div className="border-y border-[var(--ink)]/8 py-6">
      {/* Desktop filters */}
      <div className="hidden space-y-5 md:block">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            Browse blanks
          </p>
          <SearchForm
            group={group}
            fit={fit}
            sort={sort}
            q={q}
            designId={designId}
          />
        </div>
        <FilterRow label="Category">
          {CATALOG_GROUPS.map((g) => (
            <Pill
              key={g.id}
              href={buildHref({ ...base, group: g.id })}
              active={group === g.id}
              label={g.label}
            />
          ))}
        </FilterRow>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <FilterRow label="Fit">
            {CATALOG_FITS.map((f) => (
              <Pill
                key={f.id}
                href={buildHref({ ...base, fit: f.id })}
                active={fit === f.id}
                label={f.label}
              />
            ))}
          </FilterRow>
          <FilterRow label="Sort by">
            {CATALOG_SORTS.map((s) => (
              <Pill
                key={s.id}
                href={buildHref({ ...base, sort: s.id })}
                active={sort === s.id || (s.id === "price" && sort === "price-asc")}
                label={s.label}
              />
            ))}
          </FilterRow>
        </div>
      </div>

      {/* Mobile: category pills + filter drawer trigger */}
      <div className="md:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            Browse blanks
          </p>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--ink)]/12 bg-[var(--paper-elevated)] px-4 text-xs font-medium uppercase tracking-[0.12em] text-[var(--ink)]"
          >
            Filters
            {activeCount > 0 ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--ink)] px-1.5 text-[10px] text-[var(--paper)]">
                {activeCount}
              </span>
            ) : null}
          </button>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATALOG_GROUPS.map((g) => (
            <Pill
              key={g.id}
              href={buildHref({ ...base, group: g.id })}
              active={group === g.id}
              label={g.label}
            />
          ))}
        </div>

        <div className="mt-4">
          <SearchForm
            group={group}
            fit={fit}
            sort={sort}
            q={q}
            designId={designId}
          />
        </div>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-[var(--ink)]/40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-[var(--paper)] px-4 pb-8 pt-4 shadow-xl">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--mist)]" />
            <div className="flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight">
                Filters
              </h2>
              <button
                type="button"
                className="text-sm text-[var(--muted)] underline"
                onClick={() => setDrawerOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-6">
              <FilterRow label="Category">
                {CATALOG_GROUPS.map((g) => (
                  <Pill
                    key={g.id}
                    href={buildHref({ ...base, group: g.id })}
                    active={group === g.id}
                    label={g.label}
                    onNavigate={() => setDrawerOpen(false)}
                  />
                ))}
              </FilterRow>
              <FilterRow label="Fit">
                {CATALOG_FITS.map((f) => (
                  <Pill
                    key={f.id}
                    href={buildHref({ ...base, fit: f.id })}
                    active={fit === f.id}
                    label={f.label}
                    onNavigate={() => setDrawerOpen(false)}
                  />
                ))}
              </FilterRow>
              <FilterRow label="Sort by">
                {CATALOG_SORTS.map((s) => (
                  <Pill
                    key={s.id}
                    href={buildHref({ ...base, sort: s.id })}
                    active={sort === s.id || (s.id === "price" && sort === "price-asc")}
                    label={s.label}
                    onNavigate={() => setDrawerOpen(false)}
                  />
                ))}
              </FilterRow>
              <Link
                href="/products"
                onClick={() => setDrawerOpen(false)}
                className="inline-flex h-11 w-full items-center justify-center rounded-md border border-[var(--ink)]/12 text-sm"
              >
                Clear all
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SearchForm({
  group,
  fit,
  sort,
  q,
  designId,
}: {
  group: CatalogGroup;
  fit: CatalogFit | "all";
  sort: CatalogSort;
  q?: string;
  designId?: string | null;
}) {
  return (
    <form method="get" className="flex w-full gap-2 sm:max-w-xs">
      {group !== "all" ? <input type="hidden" name="group" value={group} /> : null}
      {fit !== "all" ? <input type="hidden" name="fit" value={fit} /> : null}
      {sort !== "popular" ? <input type="hidden" name="sort" value={sort} /> : null}
      {designId ? <input type="hidden" name="design" value={designId} /> : null}
      <input
        type="search"
        name="q"
        defaultValue={q ?? ""}
        placeholder="Search blanks…"
        className="h-10 min-w-0 flex-1 rounded-full border border-[var(--ink)]/10 bg-[var(--paper-elevated)] px-4 text-sm outline-none ring-[var(--accent)]/30 placeholder:text-[var(--muted)] focus:ring-2"
      />
      <button
        type="submit"
        className="h-10 shrink-0 rounded-full bg-[var(--ink)] px-4 text-xs uppercase tracking-[0.12em] text-[var(--paper)]"
      >
        Search
      </button>
    </form>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Pill({
  href,
  active,
  label,
  onNavigate,
}: {
  href: string;
  active: boolean;
  label: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`shrink-0 rounded-full px-3.5 py-2 text-xs transition min-h-10 inline-flex items-center ${
        active
          ? "bg-[var(--ink)] text-[var(--paper)]"
          : "bg-[var(--paper-elevated)] text-[var(--muted)] ring-1 ring-[var(--ink)]/8 hover:text-[var(--ink)] hover:ring-[var(--ink)]/20"
      }`}
    >
      {label}
    </Link>
  );
}
