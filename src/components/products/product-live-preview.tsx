"use client";

import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import type { PrintZone } from "@/lib/catalog/display";
import { useKnockoutDesign } from "@/lib/catalog/knockout-design";
import { useGarmentPreview } from "@/lib/catalog/recolor-garment";

function GarmentLayer({
  garmentSrc,
  garmentAlt,
  designSrc,
  designAlt,
  zone,
  colorHex,
}: {
  garmentSrc: string;
  garmentAlt: string;
  designSrc?: string | null;
  designAlt?: string;
  zone: PrintZone;
  colorHex?: string;
}) {
  const garmentPreview = useGarmentPreview(garmentSrc, colorHex ?? "#8B8E96");
  const knockedDesign = useKnockoutDesign(designSrc);
  const surface = zone.surface;
  const isSmallLogo = (zone.maxHeightPct ?? 48) <= 20;

  // Perspective/tilt only — position stays pinned by the wrapper so rotateY
  // does not drag the mark off the front-panel optical center.
  const surfaceTransform = [
    surface?.perspectivePx
      ? `perspective(${surface.perspectivePx}px)`
      : null,
    surface?.rotateXDeg != null ? `rotateX(${surface.rotateXDeg}deg)` : null,
    surface?.rotateYDeg != null ? `rotateY(${surface.rotateYDeg}deg)` : null,
    surface?.rotateZDeg != null ? `rotateZ(${surface.rotateZDeg}deg)` : null,
    surface?.skewXDeg != null ? `skewX(${surface.skewXDeg}deg)` : null,
    surface?.skewYDeg != null ? `skewY(${surface.skewYDeg}deg)` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white p-3 sm:p-4">
      <div className="relative h-full w-full bg-white [transform-style:preserve-3d]">
        {garmentPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={garmentPreview}
            src={garmentPreview}
            alt={garmentAlt}
            className="h-full w-full bg-white object-contain"
            draggable={false}
          />
        ) : (
          <div
            className="mx-auto h-[78%] w-[62%] animate-pulse rounded-[28%_28%_18%_18%/22%_22%_12%_12%] bg-[var(--ink)]/8"
            aria-hidden
          />
        )}
        {designSrc && knockedDesign ? (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${zone.leftPct ?? 50}%`,
              top: `${zone.topPct}%`,
              width: `${zone.widthPct}%`,
              maxHeight: `${zone.maxHeightPct ?? 48}%`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={knockedDesign}
              alt={designAlt ?? "Selected design"}
              className="h-auto w-full object-contain will-change-transform"
              style={{
                maxHeight: "100%",
                transform: surfaceTransform || undefined,
                transformOrigin: "center center",
                filter: isSmallLogo
                  ? "drop-shadow(0 0.5px 0.75px rgba(0,0,0,0.2))"
                  : "drop-shadow(0 4px 12px rgba(0,0,0,0.35))",
              }}
              draggable={false}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CompareSlider({
  before,
  after,
  label,
  frameClassName = "aspect-[3/4]",
}: {
  before: ReactNode;
  after: ReactNode;
  label: string;
  frameClassName?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(55);
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
      className={`relative select-none overflow-hidden rounded-2xl bg-white ring-1 ring-[var(--ink)]/[0.06] touch-none ${frameClassName}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="img"
      aria-label={`Before and after. ${label}`}
    >
      <div className="absolute inset-0">{after}</div>
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        {before}
      </div>

      <div
        className="absolute inset-y-0 z-10 w-px bg-[var(--ink)]/80"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--ink)] text-[var(--paper)] shadow-lg">
          <span className="text-[10px] tracking-wide">⟷</span>
        </div>
      </div>

      <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-md bg-white/90 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--ink)] ring-1 ring-[var(--ink)]/8">
        Before
      </div>
      <div className="pointer-events-none absolute right-4 top-4 z-10 rounded-md bg-[var(--ink)] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--paper)]">
        After
      </div>
      <p className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-white via-white/85 to-transparent px-4 pb-4 pt-10 text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
        Drag to compare · {label}
      </p>
    </div>
  );
}

export function ProductLivePreview({
  garmentSrc,
  garmentBackSrc,
  productName,
  designSrc,
  designTitle,
  colorHex,
  side,
  onSideChange,
  frontZone,
  backZone,
  showSideToggle = true,
  squareFrame = false,
}: {
  garmentSrc: string;
  garmentBackSrc: string;
  productName: string;
  designSrc?: string | null;
  designTitle?: string | null;
  colorHex?: string;
  side: "front" | "back";
  onSideChange: (side: "front" | "back") => void;
  frontZone: PrintZone;
  backZone: PrintZone;
  showSideToggle?: boolean;
  squareFrame?: boolean;
}) {
  const zone = side === "front" ? frontZone : backZone;
  const activeGarment = side === "front" ? garmentSrc : garmentBackSrc;
  const sideLabel = side === "front" ? "Front" : "Back";
  const hasDesign = Boolean(designSrc);
  const frameClassName = squareFrame ? "aspect-square" : "aspect-[3/4]";

  const blank = (
    <GarmentLayer
      key={`blank-${side}`}
      garmentSrc={activeGarment}
      garmentAlt={`${productName} ${showSideToggle ? sideLabel.toLowerCase() + " " : ""}blank`}
      colorHex={colorHex}
      zone={zone}
    />
  );

  const printed = (
    <GarmentLayer
      key={`print-${side}-${designSrc ?? "none"}`}
      garmentSrc={activeGarment}
      garmentAlt={`${productName} with design`}
      designSrc={designSrc}
      designAlt={designTitle ?? "Design"}
      colorHex={colorHex}
      zone={zone}
    />
  );

  return (
    <div className="space-y-3">
      {showSideToggle ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-lg border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-1">
            {(["front", "back"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onSideChange(value)}
                className={`rounded-md px-3.5 py-1.5 text-xs uppercase tracking-[0.12em] transition ${
                  side === value
                    ? "bg-[var(--ink)] text-[var(--paper)]"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          <p className="text-xs text-[var(--muted)]">
            {hasDesign
              ? `${designTitle ?? "Design"} · ${sideLabel} print`
              : `Blank ${sideLabel.toLowerCase()} view`}
          </p>
        </div>
      ) : (
        <p className="text-xs text-[var(--muted)]">
          {hasDesign ? (designTitle ?? "Design") : "Blank preview"}
        </p>
      )}

      {hasDesign ? (
        <CompareSlider
          key={side}
          before={blank}
          after={printed}
          label={`${designTitle ?? "Design"} on ${productName.toLowerCase()}`}
          frameClassName={frameClassName}
        />
      ) : (
        <div
          className={`relative overflow-hidden rounded-2xl bg-white ring-1 ring-[var(--ink)]/[0.06] ${frameClassName}`}
        >
          {blank}
          <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/80 to-transparent px-4 pb-4 pt-10 text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Choose a design to preview the print
          </p>
        </div>
      )}
    </div>
  );
}
