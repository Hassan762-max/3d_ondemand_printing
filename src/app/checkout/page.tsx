import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Button } from "@/components/ui/button";
import { requireFreshSession } from "@/lib/auth/fresh-session";
import { prisma } from "@/lib/db";
import { getPaymentProvider } from "@/lib/orders/payment";
import { formatPkr } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await requireFreshSession("/checkout");

  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          product: { select: { name: true } },
          design: { select: { title: true } },
        },
      },
    },
  });

  const items = cart?.items ?? [];
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">Checkout</h1>
        <div className="mt-12 rounded-xl border border-dashed border-[var(--ink)]/15 px-6 py-16 text-center">
          <p className="text-sm text-[var(--muted)]">Your cart is empty.</p>
          <Link href="/products" className="mt-6 inline-block">
            <Button>Browse products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const profile = await prisma.user.findUnique({ where: { id: user.id } });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">Checkout</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
        Confirm & place order
      </h1>
      <p className="mt-3 text-sm text-[var(--muted)]">
        {items.length} item{items.length === 1 ? "" : "s"} · subtotal {formatPkr(subtotal)}
      </p>

      <ul className="mt-8 space-y-2 rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-4 text-sm">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between gap-3">
            <span>
              {item.product.name}
              {item.design ? ` · ${item.design.title}` : ""} · {item.size}/{item.color} ×
              {item.quantity}
            </span>
            <span className="text-[var(--muted)]">
              {formatPkr(item.unitPrice * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-10">
        <CheckoutForm
          subtotal={subtotal}
          defaultName={profile?.name ?? undefined}
          defaultCity={profile?.city ?? "Lahore"}
          defaultPhone={profile?.phone ?? undefined}
          defaultProvince={profile?.province ?? undefined}
          paymentProviderLabel={getPaymentProvider().name}
        />
      </div>
    </div>
  );
}
