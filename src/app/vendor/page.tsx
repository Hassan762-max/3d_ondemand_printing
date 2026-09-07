import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { statusLabel } from "@/lib/orders/tracking";
import { formatPkr } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vendor dashboard" };

export default async function VendorDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in?callbackUrl=/vendor");

  const vendor = await prisma.vendor.findUnique({
    where: { userId: session.user.id },
  });
  if (!vendor) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">
          Vendor dashboard
        </h1>
        <p className="mt-4 text-sm text-[var(--muted)]">
          No vendor profile is linked to this account. Sign in as{" "}
          <code>vendor@printora.pk</code> or a city vendor account.
        </p>
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      assignments: { orderBy: { assignedAt: "desc" }, take: 1 },
    },
  });

  const queue = orders.filter((o) =>
    ["ASSIGNED", "IN_PRODUCTION", "QC", "SHIPPED", "OUT_FOR_DELIVERY"].includes(
      o.status,
    ),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
        Vendor · {vendor.city}
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
        {vendor.businessName}
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Capacity {vendor.capacityDaily}/day · quality {vendor.qualityScore}/5 · delivery{" "}
        {vendor.deliveryScore}/5
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Open queue</p>
          <p className="mt-2 text-2xl font-medium">{queue.length}</p>
        </div>
        <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">All assigned</p>
          <p className="mt-2 text-2xl font-medium">{orders.length}</p>
        </div>
        <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Cost factor</p>
          <p className="mt-2 text-2xl font-medium">{vendor.baseCostFactor.toFixed(2)}</p>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-medium tracking-tight">Production queue</h2>
        {queue.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted)]">No open production orders.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {queue.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/vendor/orders/${order.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] px-4 py-4 transition hover:border-[var(--ink)]/25"
                >
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                      {statusLabel(order.status)} · {order.shippingCity} ·{" "}
                      {order.items.length} item{order.items.length === 1 ? "" : "s"}
                      {order.assignments[0]
                        ? ` · score ${order.assignments[0].score.toFixed(2)}`
                        : ""}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p>{formatPkr(order.subtotal)}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      vendor cost {formatPkr(order.vendorCost)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-10">
        <Link href="/">
          <Button variant="outline">Back to storefront</Button>
        </Link>
      </div>
    </div>
  );
}
