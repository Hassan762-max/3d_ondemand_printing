import Link from "next/link";
import { CartItems } from "@/components/cart/cart-items";
import { Button } from "@/components/ui/button";
import { requireFreshSession } from "@/lib/auth/fresh-session";
import {
  designIdsFromPlacement,
  formatPrintLabel,
  parseDualCartPlacement,
} from "@/lib/catalog/display";
import { prisma } from "@/lib/db";
import { linePriceBreakdown } from "@/lib/orders/pricing";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cart" };

export default async function CartPage() {
  const user = await requireFreshSession("/cart");

  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          product: {
            select: { name: true, imageUrl: true, slug: true, basePrice: true },
          },
          design: { select: { id: true, title: true, imageUrl: true } },
        },
        orderBy: { id: "asc" },
      },
    },
  });

  const items = cart?.items ?? [];
  const secondaryIds = [
    ...new Set(
      items.flatMap((item) => {
        const placement = parseDualCartPlacement(item.placementJson);
        return designIdsFromPlacement(placement).filter(
          (id) => id !== item.designId,
        );
      }),
    ),
  ];
  const secondaryDesigns =
    secondaryIds.length > 0
      ? await prisma.design.findMany({
          where: { id: { in: secondaryIds } },
          select: { id: true, title: true },
        })
      : [];
  const designTitleById = new Map(
    secondaryDesigns.map((d) => [d.id, d.title] as const),
  );

  const cartLines = items.map((item) => {
    const placement = parseDualCartPlacement(item.placementJson);
    const hasFront = Boolean(placement.front?.designId);
    const hasBack = Boolean(placement.back?.designId);
    // Legacy single-design rows may lack front/back keys.
    const sides =
      hasFront || hasBack
        ? { front: hasFront, back: hasBack }
        : item.designId
          ? { front: true, back: false }
          : { front: false, back: false };

    return {
      id: item.id,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      size: item.size,
      color: item.color,
      product: {
        name: item.product.name,
        imageUrl: item.product.imageUrl,
        slug: item.product.slug,
      },
      design: item.design
        ? { title: item.design.title, imageUrl: item.design.imageUrl }
        : null,
      printLabel: formatPrintLabel(
        item.placementJson,
        item.design
          ? { id: item.design.id, title: item.design.title }
          : null,
        designTitleById,
      ),
      priceBreakdown: linePriceBreakdown(item.product.basePrice, sides),
    };
  });

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
          Checkout
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
          Cart
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {items.length} item{items.length === 1 ? "" : "s"} · pay full amount on COD
        </p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper)] px-6 py-14 text-center">
          <p className="text-sm text-[var(--muted)]">
            Your cart is empty. Add a product with an optional design.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/products">
              <Button>Browse products</Button>
            </Link>
            <Link href="/designs">
              <Button variant="outline">Browse designs</Button>
            </Link>
          </div>
        </div>
      ) : (
        <CartItems items={cartLines} />
      )}
    </div>
  );
}
