"use client";

import dynamic from "next/dynamic";

const HeroShirtCanvas = dynamic(
  () =>
    import("@/components/home/hero-shirt-canvas").then((m) => m.HeroShirtCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-white">
        <div className="h-48 w-40 animate-pulse rounded-xl bg-neutral-100" />
      </div>
    ),
  },
);

/** Premium garment stage — white chrome + Sketchfab black tee. */
export function HeroStage() {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-white shadow-[0_32px_64px_-36px_rgba(12,14,18,0.35)] ring-1 ring-[var(--ink)]/[0.06]">
      <HeroShirtCanvas />

      <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-end bg-white px-4 py-3">
        <span className="rounded-md bg-[var(--ink)] px-2.5 py-1.5 text-[10px] uppercase tracking-[0.12em] text-[var(--paper)]">
          AI ready
        </span>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-white from-45% to-transparent p-6 pt-14">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
          3D preview
        </p>
        <p className="mt-1 font-[family-name:var(--font-display)] text-2xl tracking-tight text-[var(--ink)]">
          Plain black tee · 3D model
        </p>
        <p className="mt-2 max-w-xs text-xs leading-relaxed text-[var(--muted)]">
          Drag to orbit — then choose a design to print.
        </p>
        <p className="mt-3 text-[10px] text-[var(--muted)]/80">
          Model:{" "}
          <a
            href="https://sketchfab.com/3d-models/black-t-shirt-f335319363024c58b907533fe5e89627"
            target="_blank"
            rel="noreferrer"
            className="pointer-events-auto underline underline-offset-2"
          >
            Black T-Shirt
          </a>{" "}
          by Dizzy Engine (CC BY)
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
          <span>360°</span>
          <span>·</span>
          <span>Orbit</span>
          <span>·</span>
          <span>Blank</span>
          <span>·</span>
          <span>Ready</span>
        </div>
      </div>
    </div>
  );
}
