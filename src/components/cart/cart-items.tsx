"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  clearCart,
  removeCartItem,
  updateCartItemQuantity,
} from "@/lib/actions/cart";
import { Button } from "@/components/ui/button";
import {
  DESIGN_SIDE_PRICE,
  FLAT_DELIVERY_FEE,
  type LinePriceBreakdown,
} from "@/lib/orders/pricing";
import { formatPkr } from "@/lib/utils";

export type CartLine = {
  id: string;
  quantity: number;
  unitPrice: number;
  size: string;
  color: string;
  product: { name: string; imageUrl: string | null; slug: string };
  design: { title: string; imageUrl: string } | null;
  /** Front/back print summary when dual designs are present. */
  printLabel?: string | null;
  /** Optional breakdown so customers see Front/Back print fees, not a flat sticker. */
  priceBreakdown?: LinePriceBreakdown | null;
};

export function CartItems({ items }: { items: CartLine[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const orderTotal = subtotal + FLAT_DELIVERY_FEE;

  return (
    <div className="space-y-8">
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-4 rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-4 sm:flex-row sm:items-center"
          >
            <div className="flex flex-1 gap-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[var(--mist)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.design?.imageUrl ?? item.product.imageUrl ?? "/products/tee.svg"}
                  alt={item.product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium tracking-tight">{item.product.name}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {item.size} · {item.color}
                  {item.printLabel
                    ? ` · ${item.printLabel}`
                    : item.design
                      ? ` · ${item.design.title}`
                      : " · Blank"}
                </p>
                {item.priceBreakdown && item.priceBreakdown.designSides > 0 ? (
                  <ul className="mt-2 space-y-0.5 text-xs text-[var(--muted)]">
                    <li>Blank {formatPkr(item.priceBreakdown.basePrice)}</li>
                    {item.priceBreakdown.hasFront ? (
                      <li>Front print +{formatPkr(DESIGN_SIDE_PRICE)}</li>
                    ) : null}
                    {item.priceBreakdown.hasBack ? (
                      <li>Back print +{formatPkr(DESIGN_SIDE_PRICE)}</li>
                    ) : null}
                  </ul>
                ) : null}
                <p className="mt-2 text-sm">{formatPkr(item.unitPrice)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="sr-only" htmlFor={`qty-${item.id}`}>
                Quantity
              </label>
              <input
                id={`qty-${item.id}`}
                type="number"
                min={1}
                max={20}
                defaultValue={item.quantity}
                disabled={pending}
                className="h-10 w-16 rounded-md border border-[var(--ink)]/12 bg-white px-2 text-sm"
                onChange={(e) => {
                  const qty = Number(e.target.value);
                  startTransition(async () => {
                    await updateCartItemQuantity(item.id, qty);
                    router.refresh();
                  });
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    await removeCartItem(item.id);
                    router.refresh();
                  });
                }}
              >
                Remove
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-6">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--muted)]">Subtotal</span>
          <span>{formatPkr(subtotal)}</span>
        </div>
        <div className="mt-3 flex justify-between text-sm">
          <span className="text-[var(--muted)]">Delivery (flat)</span>
          <span>{formatPkr(FLAT_DELIVERY_FEE)}</span>
        </div>
        <div className="mt-3 flex justify-between border-t border-[var(--ink)]/8 pt-3 text-sm font-medium">
          <span>Order total (COD)</span>
          <span>{formatPkr(orderTotal)}</span>
        </div>
        <p className="mt-4 text-xs text-[var(--muted)]">
          Pay the full amount on delivery. Print fee is{" "}
          {formatPkr(DESIGN_SIDE_PRICE)} per side (Front and/or Back) — no
          separate sticker charge.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/checkout">
            <Button type="button">Proceed to checkout</Button>
          </Link>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                await clearCart();
                router.refresh();
              });
            }}
          >
            Clear cart
          </Button>
        </div>
      </div>
    </div>
  );
}
