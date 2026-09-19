"use client";

import { useKnockoutDesign } from "@/lib/catalog/knockout-design";

/** Same Karachi Grid sticker used on the studio before/after shirt. */
const HERO_DESIGN_SRC = "/designs/karachi-grid.png";

/** Chest placement tuned for the plain-black-tee cutout (mirrors essential-tee zone). */
const HERO_PRINT_ZONE = {
  leftPct: 50,
  topPct: 42,
  widthPct: 34,
  maxHeightPct: 28,
};

/** Premium garment stage — plain tee with a printed sticker on the chest. */
export function HeroStage() {
  const knockedDesign = useKnockoutDesign(HERO_DESIGN_SRC);

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-white shadow-[0_32px_64px_-36px_rgba(12,14,18,0.35)] ring-1 ring-[var(--ink)]/[0.06]">
      <div className="absolute inset-0 p-8 sm:p-10">
        <div className="relative h-full w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/products/plain-black-tee-cutout.png"
            alt="Plain black tee with custom print"
            className="h-full w-full object-contain"
            draggable={false}
          />
          {knockedDesign ? (
            <div
              className="pointer-events-none absolute z-[1] -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${HERO_PRINT_ZONE.leftPct}%`,
                top: `${HERO_PRINT_ZONE.topPct}%`,
                width: `${HERO_PRINT_ZONE.widthPct}%`,
                maxHeight: `${HERO_PRINT_ZONE.maxHeightPct}%`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={knockedDesign}
                alt="Karachi Grid print on chest"
                className="h-auto max-h-full w-full object-contain"
                style={{
                  filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.22))",
                }}
                draggable={false}
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-white from-45% to-transparent p-6 pt-14">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
          Print ready
        </p>
        <p className="mt-1 font-[family-name:var(--font-display)] text-2xl tracking-tight text-[var(--ink)]">
          Plain tee with print
        </p>
        <p className="mt-2 max-w-xs text-xs leading-relaxed text-[var(--muted)]">
          Your sticker design, printed on a quality blank tee.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
          <span>Custom print</span>
          <span>·</span>
          <span>Sticker</span>
          <span>·</span>
          <span>Ready</span>
        </div>
      </div>
    </div>
  );
}
