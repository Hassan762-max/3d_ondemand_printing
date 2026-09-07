"use client";

import { useState } from "react";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createTryOnSession,
  type TryOnActionResult,
} from "@/lib/actions/try-on";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";

const initial: TryOnActionResult = { ok: false };

type ProductOption = {
  id: string;
  name: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
};

export function TryOnCreateForm({
  products,
  designs,
}: {
  products: ProductOption[];
  designs: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(createTryOnSession, initial);
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const product = products.find((p) => p.id === productId) ?? products[0];
  const [size, setSize] = useState(product?.sizes[0] ?? "");
  const [color, setColor] = useState(product?.colors[0]?.name ?? "");

  useEffect(() => {
    if (product) {
      setSize(product.sizes[0] ?? "");
      setColor(product.colors[0]?.name ?? "");
    }
  }, [product]);

  useEffect(() => {
    if (state.ok && state.sessionId) {
      router.push(`/try-on/${state.sessionId}`);
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={action} className="space-y-5" encType="multipart/form-data">
      <div>
        <Label htmlFor="photo">Your photo</Label>
        <input
          id="photo"
          name="photo"
          type="file"
          required
          accept="image/png,image/jpeg,image/webp"
          className="mt-2 block w-full text-sm text-[var(--muted)] file:mr-4 file:rounded-md file:border-0 file:bg-[var(--ink)] file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-[var(--paper)]"
        />
        <p className="mt-2 text-xs text-[var(--muted)]">
          PNG, JPG, or WEBP · max 5MB · front-facing, well lit
        </p>
      </div>

      <label className="block text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
        Product
        <select
          name="productId"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="mt-2 h-11 w-full rounded-md border border-[var(--ink)]/12 bg-white/80 px-3 text-sm normal-case tracking-normal"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
          Size
          <select
            name="size"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-[var(--ink)]/12 bg-white/80 px-3 text-sm normal-case tracking-normal"
          >
            {(product?.sizes ?? []).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
          Color
          <select
            name="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-[var(--ink)]/12 bg-white/80 px-3 text-sm normal-case tracking-normal"
          >
            {(product?.colors ?? []).map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
        Design (optional)
        <select
          name="designId"
          className="mt-2 h-11 w-full rounded-md border border-[var(--ink)]/12 bg-white/80 px-3 text-sm normal-case tracking-normal"
          defaultValue=""
        >
          <option value="">Blank garment</option>
          {designs.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </select>
      </label>

      {state.message && !state.ok ? (
        <p className="text-sm text-[var(--danger)]">{state.message}</p>
      ) : null}

      <Button type="submit" disabled={pending || products.length === 0} className="w-full sm:w-auto">
        {pending ? "Generating try-on…" : "Generate AI try-on"}
      </Button>
    </form>
  );
}
