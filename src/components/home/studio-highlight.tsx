"use client";

import { useRef, useState, type PointerEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
  "Live preview",
  "Move design",
  "Resize",
  "Rotate",
  "Change colors",
  "Front / Back",
  "Multiple products",
];

type ProductKey = "shirt" | "mug" | "hoodie" | "cap";

const PRODUCTS: {
  key: ProductKey;
  label: string;
  before: string;
  after: string;
  blurb: string;
}[] = [
  {
    key: "shirt",
    label: "Shirt",
    before: "/products/ba-shirt-before.png",
    after: "/products/ba-shirt-after.png",
    blurb: "Blank tee → print-ready chest art",
  },
  {
    key: "mug",
    label: "Mug",
    before: "/products/ba-mug-before.png",
    after: "/products/ba-mug-after.png",
    blurb: "Plain ceramic → branded everyday piece",
  },
  {
    key: "hoodie",
    label: "Hoodie",
    before: "/products/ba-hoodie-before.png",
    after: "/products/ba-hoodie-after.png",
    blurb: "Empty fleece → locked typography look",
  },
  {
    key: "cap",
    label: "Cap",
    before: "/products/ba-cap-before.png",
    after: "/products/ba-cap-after.png",
    blurb: "Blank cap → branded front panel",
  },
];

export function StudioHighlight() {
  const [active, setActive] = useState<ProductKey>("shirt");
  const product = PRODUCTS.find((p) => p.key === active) ?? PRODUCTS[0];

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
            Studio
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
            See your design before you print it.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--muted)]">
            Drag the slider to compare blank vs printed — then open the studio to
            place artwork on shirts, mugs, hoodies, caps, and more.
          </p>
          <ul className="mt-8 flex flex-wrap gap-2">
            {features.map((f) => (
              <li
                key={f}
                className="rounded-md border border-[var(--ink)]/10 bg-[var(--paper-elevated)] px-3 py-1.5 text-xs text-[var(--muted)]"
              >
                {f}
              </li>
            ))}
          </ul>
          <Link href="/studio" className="mt-8 inline-block">
            <Button size="lg">Open Studio</Button>
          </Link>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {PRODUCTS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setActive(p.key)}
                className={`rounded-md px-3.5 py-2 text-xs uppercase tracking-[0.12em] transition ${
                  active === p.key
                    ? "bg-[var(--ink)] text-[var(--paper)]"
                    : "bg-[var(--paper-elevated)] text-[var(--muted)] ring-1 ring-[var(--ink)]/10 hover:text-[var(--ink)]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <BeforeAfterSlider
            key={product.key}
            beforeSrc={product.before}
            afterSrc={product.after}
            label={product.blurb}
          />
        </div>
      </div>
    </section>
  );
}

function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  label,
}: {
  beforeSrc: string;
  afterSrc: string;
  label: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(52);
  const dragging = useRef(false);

  const setFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(92, Math.max(8, next)));
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setFromClientX(e.clientX);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    setFromClientX(e.clientX);
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      ref={trackRef}
      className="relative aspect-square select-none overflow-hidden rounded-2xl bg-[#f5f5f5] ring-1 ring-[var(--ink)]/[0.06] touch-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="img"
      aria-label={`Before and after comparison. ${label}`}
    >
      {/* After (printed) — full frame */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={afterSrc}
        alt="After — with design applied"
        className="absolute inset-0 h-full w-full object-contain p-6"
        draggable={false}
      />

      {/* Before (blank) — revealed on the left */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={beforeSrc}
          alt="Before — blank product"
          className="absolute inset-0 h-full w-full object-contain p-6"
          draggable={false}
        />
      </div>

      {/* Divider handle */}
      <div
        className="absolute inset-y-0 z-10 w-px bg-[var(--ink)]/80"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--ink)] text-[var(--paper)] shadow-lg">
          <span className="text-[10px] tracking-wide">⟷</span>
        </div>
      </div>

      <div className="pointer-events-none absolute left-4 top-4 rounded-md bg-white/90 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--ink)] ring-1 ring-[var(--ink)]/8">
        Before
      </div>
      <div className="pointer-events-none absolute right-4 top-4 rounded-md bg-[var(--ink)] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--paper)]">
        After
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/80 to-transparent p-5 pt-12">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
          Drag to compare
        </p>
        <p className="mt-1 font-[family-name:var(--font-display)] text-lg tracking-tight text-[var(--ink)]">
          {label}
        </p>
      </div>
    </div>
  );
}
