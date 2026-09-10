"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addToCart } from "@/lib/actions/cart";
import { Button } from "@/components/ui/button";

type ColorOption = { name: string; hex: string };

export function AddToCartForm({
  productId,
  sizes,
  colors,
  designs,
  initialDesignId,
  initialSize,
}: {
  productId: string;
  sizes: string[];
  colors: ColorOption[];
  designs: { id: string; title: string }[];
  initialDesignId?: string;
  initialSize?: string;
}) {
  const router = useRouter();
  const preferredSize =
    initialSize && sizes.includes(initialSize) ? initialSize : (sizes[0] ?? "");
  const preferredDesign =
    initialDesignId && designs.some((d) => d.id === initialDesignId)
      ? initialDesignId
      : "";
  const [size, setSize] = useState(preferredSize);
  const [color, setColor] = useState(colors[0]?.name ?? "");
  const [designId, setDesignId] = useState(preferredDesign);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.set("productId", productId);
        fd.set("size", size);
        fd.set("color", color);
        if (designId) fd.set("designId", designId);
        fd.set("quantity", "1");
        setMessage(null);
        startTransition(async () => {
          const result = await addToCart(fd);
          if (!result.ok) {
            if (result.message?.toLowerCase().includes("sign in")) {
              const next = `${window.location.pathname}${window.location.search}`;
              router.push(
                `/auth/sign-in?callbackUrl=${encodeURIComponent(next || "/cart")}`,
              );
              return;
            }
            setMessage(result.message ?? "Could not add to cart.");
            return;
          }
          setMessage(result.message ?? "Added.");
          router.push("/cart");
          router.refresh();
        });
      }}
    >
      <div>
        <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Size</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={`inline-flex h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm transition ${
                size === s
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                  : "border-[var(--ink)]/12 hover:border-[var(--ink)]/30"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Color</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {colors.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setColor(c.name)}
              className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
                color === c.name
                  ? "border-[var(--ink)]"
                  : "border-[var(--ink)]/12 hover:border-[var(--ink)]/30"
              }`}
            >
              <span
                className="h-4 w-4 rounded-full border border-[var(--ink)]/15"
                style={{ backgroundColor: c.hex }}
              />
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {designs.length > 0 ? (
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
            Design (optional)
          </p>
          <select
            value={designId}
            onChange={(e) => setDesignId(e.target.value)}
            className="mt-3 h-11 w-full rounded-md border border-[var(--ink)]/12 bg-white/70 px-3 text-sm"
          >
            <option value="">Blank — no print</option>
            {designs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" disabled={pending || !size || !color}>
          {pending ? "Adding…" : "Add to cart"}
        </Button>
      </div>
      {message ? (
        <p className="text-sm text-[var(--accent)]">
          {message}{" "}
          <button
            type="button"
            className="underline"
            onClick={() => router.push("/cart")}
          >
            View cart
          </button>
        </p>
      ) : null}
    </form>
  );
}
