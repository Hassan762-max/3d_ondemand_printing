"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import {
  printZoneToCartPlacement,
  type CartPlacement,
  type PrintZone,
} from "@/lib/catalog/display";
import { useKnockoutDesign } from "@/lib/catalog/knockout-design";
import { useGarmentPreview } from "@/lib/catalog/recolor-garment";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

type DragMode = "move" | "resize";
type PreviewMode = "before" | "after";

function EditablePrintSticker({
  zone,
  onZoneChange,
  knockedDesign,
  designAlt,
  editable,
  frameRef,
}: {
  zone: PrintZone;
  onZoneChange?: (next: PrintZone) => void;
  knockedDesign: string;
  designAlt: string;
  editable: boolean;
  frameRef: RefObject<HTMLDivElement | null>;
}) {
  const dragRef = useRef<{
    mode: DragMode;
    pointerId: number;
    startX: number;
    startY: number;
    originLeft: number;
    originTop: number;
    originWidth: number;
    originMaxH: number | undefined;
    frameW: number;
    frameH: number;
  } | null>(null);
  const [active, setActive] = useState(false);

  const surface = zone.surface;
  const isSmallLogo = (zone.maxHeightPct ?? 48) <= 20;

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

  const endDrag = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (!dragRef.current || dragRef.current.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setActive(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  }, []);

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== e.pointerId || !onZoneChange) return;
      e.preventDefault();
      e.stopPropagation();

      const dxPct = ((e.clientX - drag.startX) / drag.frameW) * 100;
      const dyPct = ((e.clientY - drag.startY) / drag.frameH) * 100;

      if (drag.mode === "move") {
        onZoneChange({
          ...zone,
          leftPct: clamp(drag.originLeft + dxPct, 8, 92),
          topPct: clamp(drag.originTop + dyPct, 10, 88),
        });
        return;
      }

      const nextWidth = clamp(drag.originWidth + dxPct, 6, 72);
      const widthRatio = nextWidth / Math.max(drag.originWidth, 1);
      const nextMaxH =
        drag.originMaxH != null
          ? clamp(drag.originMaxH * widthRatio, 4, 58)
          : undefined;

      onZoneChange({
        ...zone,
        widthPct: nextWidth,
        ...(nextMaxH != null ? { maxHeightPct: nextMaxH } : {}),
      });
    },
    [onZoneChange, zone],
  );

  const beginDrag = (
    e: ReactPointerEvent<HTMLElement>,
    mode: DragMode,
  ) => {
    if (!editable || !onZoneChange) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect || rect.width < 1 || rect.height < 1) return;

    dragRef.current = {
      mode,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originLeft: zone.leftPct ?? 50,
      originTop: zone.topPct,
      originWidth: zone.widthPct,
      originMaxH: zone.maxHeightPct,
      frameW: rect.width,
      frameH: rect.height,
    };
    setActive(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  return (
    <div
      className={`absolute -translate-x-1/2 -translate-y-1/2 ${
        editable
          ? "pointer-events-auto cursor-grab touch-none active:cursor-grabbing"
          : "pointer-events-none"
      } ${active ? "z-20" : "z-[1]"}`}
      style={{
        left: `${zone.leftPct ?? 50}%`,
        top: `${zone.topPct}%`,
        width: `${zone.widthPct}%`,
        maxHeight: `${zone.maxHeightPct ?? 48}%`,
      }}
      onPointerDown={(e) => beginDrag(e, "move")}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      role={editable ? "slider" : undefined}
      aria-label={editable ? "Drag to reposition print" : undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={knockedDesign}
        alt={designAlt}
        className={`h-auto max-h-full w-full object-contain will-change-transform ${
          editable
            ? "outline outline-2 outline-dashed outline-[var(--ink)]/35"
            : ""
        } ${active ? "outline-[var(--ink)]/70" : ""}`}
        style={{
          transform: surfaceTransform || undefined,
          transformOrigin: "center center",
          filter: isSmallLogo
            ? "drop-shadow(0 0.5px 0.75px rgba(0,0,0,0.2))"
            : "drop-shadow(0 2px 5px rgba(0,0,0,0.22))",
        }}
        draggable={false}
      />
      {editable ? (
        <button
          type="button"
          aria-label="Resize print"
          className="absolute -bottom-1.5 -right-1.5 z-30 flex h-5 w-5 cursor-nwse-resize items-center justify-center rounded-sm border border-[var(--ink)]/45 bg-[var(--paper)] shadow-sm touch-none sm:h-4 sm:w-4"
          onPointerDown={(e) => beginDrag(e, "resize")}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <span
            className="block h-1.5 w-1.5 border-b-2 border-r-2 border-[var(--ink)]/55"
            aria-hidden
          />
        </button>
      ) : null}
    </div>
  );
}

function GarmentLayer({
  garmentSrc,
  garmentAlt,
  designSrc,
  designAlt,
  zone,
  colorHex,
  editable,
  onZoneChange,
}: {
  garmentSrc: string;
  garmentAlt: string;
  designSrc?: string | null;
  designAlt?: string;
  zone: PrintZone;
  colorHex?: string;
  editable?: boolean;
  onZoneChange?: (next: PrintZone) => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const garmentPreview = useGarmentPreview(garmentSrc, colorHex ?? "#8B8E96");
  const knockedDesign = useKnockoutDesign(designSrc);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white p-3 sm:p-4">
      <div
        ref={frameRef}
        className="relative h-full w-full bg-white [transform-style:preserve-3d]"
      >
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
          <EditablePrintSticker
            zone={zone}
            knockedDesign={knockedDesign}
            designAlt={designAlt ?? "Selected design"}
            editable={Boolean(editable)}
            onZoneChange={onZoneChange}
            frameRef={frameRef}
          />
        ) : null}
      </div>
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
  onPlacementChange,
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
  /** Emits both sides' placements whenever either zone changes. */
  onPlacementChange?: (placements: {
    front: CartPlacement;
    back: CartPlacement;
  }) => void;
}) {
  const [baselines, setBaselines] = useState({
    front: frontZone,
    back: backZone,
  });
  const [frontEdit, setFrontEdit] = useState<PrintZone>(frontZone);
  const [backEdit, setBackEdit] = useState<PrintZone>(backZone);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("after");

  // Sync editable zones when catalog defaults change (e.g. navigated product).
  if (frontZone !== baselines.front || backZone !== baselines.back) {
    setBaselines({ front: frontZone, back: backZone });
    setFrontEdit(frontZone);
    setBackEdit(backZone);
  }

  const zone = side === "front" ? frontEdit : backEdit;
  const activeGarment = side === "front" ? garmentSrc : garmentBackSrc;
  const sideLabel = side === "front" ? "Front" : "Back";
  const hasDesign = Boolean(designSrc);
  const frameClassName = squareFrame ? "aspect-square" : "aspect-[3/4]";
  const showAfter = hasDesign && previewMode === "after";

  useEffect(() => {
    onPlacementChange?.({
      front: printZoneToCartPlacement(frontEdit, "front", frontZone),
      back: printZoneToCartPlacement(backEdit, "back", backZone),
    });
  }, [frontEdit, backEdit, frontZone, backZone, onPlacementChange]);

  // When a design is first chosen (or switched), land on After so editing is obvious.
  useEffect(() => {
    if (hasDesign) setPreviewMode("after");
  }, [hasDesign, designSrc]);

  const onZoneChange = useCallback(
    (next: PrintZone) => {
      if (side === "front") setFrontEdit(next);
      else setBackEdit(next);
    },
    [side],
  );

  const resetSide = () => {
    if (side === "front") setFrontEdit(frontZone);
    else setBackEdit(backZone);
  };

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
          <div className="flex items-center gap-3">
            {hasDesign ? (
              <button
                type="button"
                onClick={resetSide}
                className="text-xs text-[var(--muted)] underline-offset-2 hover:text-[var(--ink)] hover:underline"
              >
                Reset {sideLabel.toLowerCase()}
              </button>
            ) : null}
            <p className="text-xs text-[var(--muted)]">
              {hasDesign
                ? `${designTitle ?? "Design"} · ${sideLabel} print`
                : `Blank ${sideLabel.toLowerCase()} view`}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-[var(--muted)]">
            {hasDesign ? (designTitle ?? "Design") : "Blank preview"}
          </p>
          {hasDesign ? (
            <button
              type="button"
              onClick={resetSide}
              className="text-xs text-[var(--muted)] underline-offset-2 hover:text-[var(--ink)] hover:underline"
            >
              Reset placement
            </button>
          ) : null}
        </div>
      )}

      <div
        className={`relative overflow-hidden rounded-2xl bg-white ring-1 ring-[var(--ink)]/[0.06] ${frameClassName}`}
        role="img"
        aria-label={
          hasDesign
            ? `${previewMode === "before" ? "Before" : "After"} preview. ${designTitle ?? "Design"} on ${productName}`
            : `${productName} blank preview`
        }
      >
        {showAfter ? (
          <GarmentLayer
            key={`print-${side}-${designSrc ?? "none"}`}
            garmentSrc={activeGarment}
            garmentAlt={`${productName} with design`}
            designSrc={designSrc}
            designAlt={designTitle ?? "Design"}
            colorHex={colorHex}
            zone={zone}
            editable
            onZoneChange={onZoneChange}
          />
        ) : (
          <GarmentLayer
            key={`blank-${side}`}
            garmentSrc={activeGarment}
            garmentAlt={`${productName} ${showSideToggle ? sideLabel.toLowerCase() + " " : ""}blank`}
            colorHex={colorHex}
            zone={zone}
          />
        )}

        {hasDesign ? (
          <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setPreviewMode("before")}
              className={`rounded-md px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] transition ${
                previewMode === "before"
                  ? "bg-[var(--ink)] text-[var(--paper)]"
                  : "bg-white/90 text-[var(--ink)] ring-1 ring-[var(--ink)]/8 hover:bg-white"
              }`}
              aria-pressed={previewMode === "before"}
            >
              Before
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("after")}
              className={`rounded-md px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] transition ${
                previewMode === "after"
                  ? "bg-[var(--ink)] text-[var(--paper)]"
                  : "bg-white/90 text-[var(--ink)] ring-1 ring-[var(--ink)]/8 hover:bg-white"
              }`}
              aria-pressed={previewMode === "after"}
            >
              After
            </button>
          </div>
        ) : null}

        <p className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-white via-white/85 to-transparent px-4 pb-4 pt-10 text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
          {hasDesign
            ? previewMode === "after"
              ? `Drag print to place · corner to resize · ${designTitle ?? "Design"} on ${productName.toLowerCase()}`
              : `Blank garment · switch to After to edit print`
            : "Choose a design to preview the print"}
        </p>
      </div>
    </div>
  );
}
