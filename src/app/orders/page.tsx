import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { statusLabel } from "@/lib/orders/tracking";
import { formatPkr } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Orders" };

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in?callbackUrl=/orders");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: { select: { id: true } },
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">Orders</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Track production and delivery across Pakistan.
          </p>
        </div>
        <Link href="/products">
          <Button variant="outline">Shop again</Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-[var(--ink)]/15 px-6 py-16 text-center">
          <p className="text-sm text-[var(--muted)]">No orders yet.</p>
          <Link href="/products" className="mt-6 inline-block">
            <Button>Start an order</Button>
          </Link>
        </div>
      ) : (
        <ul className="mt-10 space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/orders/${order.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] px-4 py-4 transition hover:border-[var(--ink)]/25"
              >
                <div>
                  <p className="font-medium tracking-tight">{order.orderNumber}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                    {statusLabel(order.status)} · {order.items.length} item
                    {order.items.length === 1 ? "" : "s"} · {order.shippingCity}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p>{formatPkr(order.subtotal + order.deliveryFee)}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    COD left {formatPkr(order.remainingAmount)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
