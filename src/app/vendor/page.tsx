import Link from "next/link";
import { redirect } from "next/navigation";
import { PortalSection } from "@/components/portal/portal-section";
import { PortalStat } from "@/components/portal/portal-stat";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { statusLabel } from "@/lib/orders/tracking";
import { formatPkr } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vendor dashboard" };

const QUEUE_STATUSES = [
  "ASSIGNED",
  "IN_PRODUCTION",
  "QC",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
] as const;

export default async function VendorDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in?callbackUrl=/vendor");

  const vendor = await prisma.vendor.findUnique({
    where: { userId: session.user.id },
  });

  if (!vendor) {
    return (
      <div className="max-w-xl space-y-4">
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
          Vendor dashboard
        </h1>
        <p className="text-sm text-[var(--muted)]">
          No vendor profile is linked to this account. Sign in with a seeded vendor
          such as{" "}
          <code className="font-mono text-xs">vendor@printora.pk</code>.
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
    (QUEUE_STATUSES as readonly string[]).includes(o.status),
  );
  const inProduction = orders.filter((o) => o.status === "IN_PRODUCTION").length;
  const inQc = orders.filter((o) => o.status === "QC").length;
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const shippedToday = orders.filter(
    (o) =>
      (o.status === "SHIPPED" || o.status === "OUT_FOR_DELIVERY" || o.status === "DELIVERED") &&
      o.updatedAt >= startOfDay,
  ).length;

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
          Vendor · {vendor.city}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
          {vendor.businessName}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Capacity {vendor.capacityDaily}/day · quality {vendor.qualityScore}/5 ·
          delivery {vendor.deliveryScore}/5
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PortalStat label="Open queue" value={String(queue.length)} />
        <PortalStat label="In production" value={String(inProduction)} />
        <PortalStat label="In QC" value={String(inQc)} />
        <PortalStat
          label="Shipped today"
          value={String(shippedToday)}
          hint={`Daily capacity ${vendor.capacityDaily}`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <PortalStat
          label="Return rate"
          value={`${(vendor.returnRate * 100).toFixed(1)}%`}
        />
        <PortalStat
          label="Defect rate"
          value={`${(vendor.defectRate * 100).toFixed(1)}%`}
        />
        <PortalStat
          label="QC fail rate"
          value={`${(vendor.qcFailRate * 100).toFixed(1)}%`}
        />
      </div>

      <PortalSection
        id="queue"
        title="Production queue"
        description="Jobs that need production, QC, or dispatch attention."
      >
        {queue.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--ink)]/15 bg-[var(--paper-elevated)] px-4 py-8 text-sm text-[var(--muted)]">
            No open production orders.
          </p>
        ) : (
          <ul className="space-y-3">
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
                      {order.items.length} item
                      {order.items.length === 1 ? "" : "s"}
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
                    <span className="mt-2 inline-block text-xs font-medium text-[var(--accent)]">
                      Open →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PortalSection>

      <PortalSection
        id="all"
        title="All assigned jobs"
        description={`${orders.length} total assignments`}
      >
        {orders.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No assigned orders yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)]">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--mist)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 25).map((order) => (
                  <tr key={order.id} className="border-t border-[var(--ink)]/8">
                    <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">
                      {statusLabel(order.status)}
                    </td>
                    <td className="px-4 py-3">{order.shippingCity}</td>
                    <td className="px-4 py-3">{formatPkr(order.subtotal)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/vendor/orders/${order.id}`}
                        className="text-xs font-medium underline"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PortalSection>

      <Link href="/">
        <Button variant="outline">Back to storefront</Button>
      </Link>
    </div>
  );
}
