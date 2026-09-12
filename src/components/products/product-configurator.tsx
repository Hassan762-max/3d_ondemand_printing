"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { addToCart } from "@/lib/actions/cart";
import { Button } from "@/components/ui/button";
import { WishlistButton } from "@/components/products/wishlist-button";
import { ProductLivePreview } from "@/components/products/product-live-preview";
import type { PrintZones, ProductSpecs } from "@/lib/catalog/display";
import { formatPkr } from "@/lib/utils";

type ColorOption = { name: string; hex: string };
type DesignOption = { id: string; title: string; imageUrl: string };

type Review = {
  id: string;
  rating: number;
  body: string | null;
  userName: string | null;
};

export function ProductConfigurator({
  productId,
  displayName,
  categoryTag,
  description,
  basePrice,
  imageUrl,
  imageBackUrl,
  sizes,
  colors,
  designs,
  initialDesignId,
  initialSize,
  printZones,
  specs,
  wishlisted,
  avgRating,
  reviews,
  showSideToggle = true,
}: {
  productId: string;
  displayName: string;
  categoryTag: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  imageBackUrl: string;
  sizes: string[];
  colors: ColorOption[];
  designs: DesignOption[];
  initialDesignId?: string;
  initialSize?: string;
  printZones: PrintZones;
  specs: ProductSpecs;
  wishlisted: boolean;
  avgRating: number | null;
  reviews: Review[];
  showSideToggle?: boolean;
}) {
  const router = useRouter();
  const preferredSize =
    initialSize && sizes.includes(initialSize) ? initialSize : (sizes[0] ?? "");
  const preferredDesign =
    initialDesignId && designs.some((d) => d.id === initialDesignId)
      ? initialDesignId
      : "";

  const [size, setSize] = useState(preferredSize);
  const [color, setColor] = useState(
    colors.find((c) => c.name === "Off-White")?.name ??
      colors.find((c) => c.name === "Charcoal Grey")?.name ??
      colors[0]?.name ??
      "",
  );
  const [designId, setDesignId] = useState(preferredDesign);
  const [side, setSide] = useState<"front" | "back">("front");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selectedDesign = useMemo(
    () => designs.find((d) => d.id === designId) ?? null,
    [designs, designId],
  );
  const colorHex = colors.find((c) => c.name === color)?.hex;

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2">
      <ProductLivePreview
        garmentSrc={imageUrl}
        garmentBackSrc={imageBackUrl}
        productName={displayName}
        designSrc={selectedDesign?.imageUrl}
        designTitle={selectedDesign?.title}
        colorHex={colorHex}
        side={side}
        onSideChange={setSide}
        frontZone={printZones.front}
        backZone={printZones.back}
        showSideToggle={showSideToggle}
        squareFrame={!showSideToggle}
      />

      <div className="flex flex-col justify-center">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          {categoryTag} · Starts at {formatPkr(basePrice)}
          {avgRating
            ? ` · ${avgRating.toFixed(1)}/5 (${reviews.length})`
            : ""}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
          {displayName}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
          {description}
        </p>

        <form
          className="mt-8 space-y-6"
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
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
              Size
            </p>
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
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
              Color
            </p>
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
              {selectedDesign ? (
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Preview updates live — drag the slider and switch front/back.
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" size="lg" disabled={pending || !size || !color}>
              {pending ? "Adding…" : "Add to cart"}
            </Button>
            <WishlistButton productId={productId} initiallySaved={wishlisted} />
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

        <section className="mt-10 space-y-6 border-t border-[var(--ink)]/8 pt-8">
          <div>
            <h2 className="text-xs uppercase tracking-[0.14em] text-[var(--accent)]">
              Description
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]">
              {description}
            </p>
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-[0.14em] text-[var(--accent)]">
              Material
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              {specs.material}
            </p>
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-[0.14em] text-[var(--accent)]">
              Quality
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              {specs.quality}
            </p>
          </div>
          {specs.care ? (
            <div>
              <h2 className="text-xs uppercase tracking-[0.14em] text-[var(--accent)]">
                Care
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {specs.care}
              </p>
            </div>
          ) : null}
        </section>

        {reviews.length > 0 ? (
          <section className="mt-10 border-t border-[var(--ink)]/8 pt-8">
            <h2 className="text-lg font-medium tracking-tight">Customer reviews</h2>
            <ul className="mt-4 space-y-4">
              {reviews.map((review) => (
                <li key={review.id} className="text-sm">
                  <p className="font-medium">
                    {review.rating}/5 · {review.userName ?? "Customer"}
                  </p>
                  {review.body ? (
                    <p className="mt-1 text-[var(--muted)]">{review.body}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
