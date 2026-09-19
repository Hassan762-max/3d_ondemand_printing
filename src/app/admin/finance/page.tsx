import Link from "next/link";
import { CollectCodButton, SettleOrderButton } from "@/components/admin/admin-actions";
import { PortalSection } from "@/components/portal/portal-section";
import { PortalStat } from "@/components/portal/portal-stat";
import { requirePagePermission } from "@/lib/auth/require-page-permission";
import { prisma } from "@/lib/db";
import { statusLabel } from "@/lib/orders/tracking";
import { formatPkr } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin finance" };

export default async function AdminFinancePage() {
  await requirePagePermission("finance:manage", "/admin/finance");

  const [settleable, pendingCod, settledHistory, pendingRefunds] =
    await Promise.all([
      prisma.order.findMany({
        where: {
          status: "DELIVERED",
          vendorId: { not: null },
          vendorCost: { gt: 0 },
          payments: { none: { kind: "VENDOR_SETTLEMENT" } },
        },
        include: { vendor: true },
        orderBy: { updatedAt: "desc" },
        take: 30,
      }),
      prisma.order.findMany({
        where: {
          status: { in: ["DELIVERED", "RETURN_REQUESTED"] },
          payments: { some: { kind: "COD_REMAINING", status: "PENDING" } },
        },
        include: {
          payments: {
            where: { kind: "COD_REMAINING", status: "PENDING" },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 30,
      }),
      prisma.paymentLedger.findMany({
        where: { kind: "VENDOR_SETTLEMENT", status: "COMPLETED" },
        include: { order: { include: { vendor: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.paymentLedger.count({
        where: { kind: "REFUND", status: "PENDING" },
      }),
    ]);

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
          Finance
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
          COD & settlements
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
          Collect remaining COD and settle vendor payouts.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <PortalStat label="Pending COD" value={String(pendingCod.length)} />
        <PortalStat label="To settle" value={String(settleable.length)} />
        <PortalStat label="Pending refunds" value={String(pendingRefunds)} />
      </div>

      <PortalSection title="Pending COD Collection">
        {pendingCod.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            No delivered orders with pending COD.
          </p>
        ) : (
          <ul className="space-y-3">
            {pendingCod.map((order) => (
              <li
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] px-4 py-3 text-sm"
              >
                <div>
                  <Link
                    href={`/orders/${order.id}`}
                    className="font-medium underline"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="text-xs text-[var(--muted)]">
                    {formatPkr(
                      order.payments.reduce((s, p) => s + p.amount, 0),
                    )}{" "}
                    pending · {statusLabel(order.status)}
                  </p>
                </div>
                <CollectCodButton orderId={order.id} />
              </li>
            ))}
          </ul>
        )}
      </PortalSection>

      <PortalSection title="Vendor Settlements">
        {settleable.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            No delivered orders awaiting settlement.
          </p>
        ) : (
          <ul className="space-y-3">
            {settleable.map((order) => (
              <li
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] px-4 py-3 text-sm"
              >
                <div>
                  <Link
                    href={`/orders/${order.id}`}
                    className="font-medium underline"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="text-xs text-[var(--muted)]">
                    {order.vendor?.businessName} · {formatPkr(order.vendorCost)}{" "}
                    · {statusLabel(order.status)}
                  </p>
                </div>
                <SettleOrderButton orderId={order.id} />
              </li>
            ))}
          </ul>
        )}
      </PortalSection>

      {settledHistory.length > 0 ? (
        <PortalSection title="Settlement History">
          <ul className="divide-y divide-[var(--ink)]/8 overflow-hidden rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)]">
            {settledHistory.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <div>
                  <Link
                    href={`/orders/${entry.orderId}`}
                    className="font-medium underline"
                  >
                    {entry.order.orderNumber}
                  </Link>
                  <p className="text-xs text-[var(--muted)]">
                    {entry.order.vendor?.businessName ?? "Vendor"} ·{" "}
                    {entry.createdAt.toLocaleString("en-PK")}
                  </p>
                </div>
                <span className="font-medium">{formatPkr(entry.amount)}</span>
              </li>
            ))}
          </ul>
        </PortalSection>
      ) : null}
    </div>
  );
}
