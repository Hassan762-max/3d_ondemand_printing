"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addToCart } from "@/lib/actions/cart";
import {
  selectActiveDesign,
  selectActiveProduct,
  useStudioStore,
} from "@/lib/studio/store";
import { formatPkr } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { CameraPreset } from "@/lib/studio/types";

const views: { id: CameraPreset; label: string }[] = [
  { id: "front", label: "Front" },
  { id: "back", label: "Back" },
  { id: "left", label: "Left" },
  { id: "right", label: "Right" },
  { id: "free", label: "360°" },
];

export function StudioControls() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const products = useStudioStore((s) => s.products);
  const designs = useStudioStore((s) => s.designs);
  const product = useStudioStore(selectActiveProduct);
  const design = useStudioStore(selectActiveDesign);
  const productId = useStudioStore((s) => s.productId);
  const designId = useStudioStore((s) => s.designId);
  const color = useStudioStore((s) => s.color);
  const colorHex = useStudioStore((s) => s.colorHex);
  const size = useStudioStore((s) => s.size);
  const side = useStudioStore((s) => s.side);
  const placement = useStudioStore((s) => s.placement);
  const cameraPreset = useStudioStore((s) => s.cameraPreset);
  const snapshots = useStudioStore((s) => s.snapshots);
  const compareId = useStudioStore((s) => s.compareId);

  const setProduct = useStudioStore((s) => s.setProduct);
  const setDesign = useStudioStore((s) => s.setDesign);
  const setColor = useStudioStore((s) => s.setColor);
  const setSize = useStudioStore((s) => s.setSize);
  const setSide = useStudioStore((s) => s.setSide);
  const setPlacement = useStudioStore((s) => s.setPlacement);
  const resetPlacement = useStudioStore((s) => s.resetPlacement);
  const setCameraPreset = useStudioStore((s) => s.setCameraPreset);
  const saveSnapshot = useStudioStore((s) => s.saveSnapshot);
  const restoreSnapshot = useStudioStore((s) => s.restoreSnapshot);
  const removeSnapshot = useStudioStore((s) => s.removeSnapshot);
  const setCompareId = useStudioStore((s) => s.setCompareId);

  const compareSnap = snapshots.find((s) => s.id === compareId) ?? null;

  return (
    <div className="flex h-full flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Product</p>
        <select
          className="mt-2 h-11 w-full rounded-md border border-[var(--ink)]/12 bg-white/80 px-3 text-sm"
          value={productId ?? ""}
          onChange={(e) => setProduct(e.target.value)}
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {formatPkr(p.basePrice)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Design</p>
        <select
          className="mt-2 h-11 w-full rounded-md border border-[var(--ink)]/12 bg-white/80 px-3 text-sm"
          value={designId ?? ""}
          onChange={(e) => setDesign(e.target.value || null)}
        >
          <option value="">No print</option>
          {designs.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Size</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(product?.sizes ?? []).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`h-9 min-w-9 rounded-md border px-2 text-sm ${
                  size === s
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                    : "border-[var(--ink)]/12"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Print side</p>
          <div className="mt-2 flex gap-1.5">
            {(["front", "back"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSide(s)}
                className={`h-9 flex-1 rounded-md border px-2 text-sm capitalize ${
                  side === s
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                    : "border-[var(--ink)]/12"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Color</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(product?.colors ?? []).map((c) => (
            <button
              key={c.name}
              type="button"
              title={c.name}
              onClick={() => setColor(c.name, c.hex)}
              className={`h-8 w-8 rounded-full border-2 ${
                color === c.name ? "border-[var(--ink)]" : "border-transparent"
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">
          {color} · {colorHex}
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
          Placement
        </p>
        <label className="block text-xs text-[var(--muted)]">
          Move X
          <input
            type="range"
            min={0.15}
            max={0.85}
            step={0.01}
            value={placement.x}
            onChange={(e) => setPlacement({ x: Number(e.target.value) })}
            className="mt-1 w-full accent-[var(--accent)]"
          />
        </label>
        <label className="block text-xs text-[var(--muted)]">
          Move Y
          <input
            type="range"
            min={0.15}
            max={0.85}
            step={0.01}
            value={placement.y}
            onChange={(e) => setPlacement({ y: Number(e.target.value) })}
            className="mt-1 w-full accent-[var(--accent)]"
          />
        </label>
        <label className="block text-xs text-[var(--muted)]">
          Scale
          <input
            type="range"
            min={0.4}
            max={1.8}
            step={0.01}
            value={placement.scale}
            onChange={(e) => setPlacement({ scale: Number(e.target.value) })}
            className="mt-1 w-full accent-[var(--accent)]"
          />
        </label>
        <label className="block text-xs text-[var(--muted)]">
          Rotate
          <input
            type="range"
            min={-45}
            max={45}
            step={1}
            value={placement.rotation}
            onChange={(e) => setPlacement({ rotation: Number(e.target.value) })}
            className="mt-1 w-full accent-[var(--accent)]"
          />
        </label>
        <Button type="button" variant="ghost" size="sm" onClick={resetPlacement}>
          Reset placement
        </Button>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">View</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {views.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setCameraPreset(v.id)}
              className={`h-9 rounded-md border px-3 text-sm ${
                cameraPreset === v.id
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                  : "border-[var(--ink)]/12"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            Save & compare
          </p>
          <Button type="button" size="sm" variant="outline" onClick={saveSnapshot}>
            Save look
          </Button>
        </div>
        {snapshots.length === 0 ? (
          <p className="mt-3 text-xs text-[var(--muted)]">
            Save up to 3 looks to compare side by side.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {snapshots.map((snap) => (
              <li
                key={snap.id}
                className="flex items-center justify-between gap-2 rounded-md border border-[var(--ink)]/10 px-3 py-2 text-sm"
              >
                <button
                  type="button"
                  className="text-left font-medium hover:underline"
                  onClick={() => restoreSnapshot(snap.id)}
                >
                  {snap.label}
                </button>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant={compareId === snap.id ? "secondary" : "ghost"}
                    onClick={() =>
                      setCompareId(compareId === snap.id ? null : snap.id)
                    }
                  >
                    Compare
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeSnapshot(snap.id)}
                  >
                    ×
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {compareSnap ? (
          <p className="mt-2 text-xs text-[var(--accent)]">
            Comparing with {compareSnap.label}: {compareSnap.color}, size{" "}
            {compareSnap.size}, {compareSnap.side} print.
            Restore anytime from the list.
          </p>
        ) : null}
      </div>

      <div className="mt-auto space-y-3 border-t border-[var(--ink)]/10 pt-5">
        <p className="text-sm text-[var(--muted)]">
          {product?.name ?? "Product"}
          {design ? ` · ${design.title}` : " · Blank"} · {size} · {color}
        </p>
        <Button
          type="button"
          className="w-full"
          disabled={pending || !product}
          onClick={() => {
            if (!product) return;
            const fd = new FormData();
            fd.set("productId", product.id);
            fd.set("size", size);
            fd.set("color", color);
            if (designId) fd.set("designId", designId);
            fd.set("quantity", "1");
            fd.set(
              "placementJson",
              JSON.stringify({
                side,
                x: placement.x,
                y: placement.y,
                scale: placement.scale,
                rotation: placement.rotation,
              }),
            );
            setMessage(null);
            startTransition(async () => {
              const result = await addToCart(fd);
              if (!result.ok) {
                if (result.message?.toLowerCase().includes("sign in")) {
                  router.push("/auth/sign-in?callbackUrl=/studio");
                  return;
                }
                setMessage(result.message ?? "Could not add to cart.");
                return;
              }
              setMessage("Added to cart with current customization.");
              router.refresh();
            });
          }}
        >
          {pending ? "Adding…" : "Add customized item to cart"}
        </Button>
        {message ? <p className="text-xs text-[var(--accent)]">{message}</p> : null}
      </div>
    </div>
  );
}
