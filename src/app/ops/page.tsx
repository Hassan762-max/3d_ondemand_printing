import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ApproveRefundButton,
  AssignVendorForm,
  QcDecisionForm,
  ResolveReturnForm,
  ResolveTicketForm,
} from "@/components/ops/ops-actions";
import { ModerateDesignButtons } from "@/components/ops/moderate-design-buttons";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, hasPermission } from "@/lib/rbac";
import { statusLabel } from "@/lib/orders/tracking";
import { formatPkr } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ops" };

export default async function OpsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in?callbackUrl=/ops");

  const role = session.user.role;
  const canOps = hasAnyPermission(role, [
    "support:manage",
    "qc:manage",
    "order:refund",
    "finance:manage",
    "order:read_all",
    "production:manage",
    "vendor:assign",
    "design:moderate",
  ]);
  if (!canOps && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">Ops</h1>
        <p className="mt-4 text-sm text-[var(--muted)]">
          This account does not have operations access.
        </p>
      </div>
    );
  }

  const [openReturns, pendingRefunds, qcOrders, vendors, recentOrders, pendingListings, openTickets, unassignedOrders] =
    await Promise.all([
      prisma.returnRequest.findMany({
        where: { status: "open" },
        include: { order: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.paymentLedger.findMany({
        where: { kind: "REFUND", status: "PENDING" },
        include: { order: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.order.findMany({
        where: { status: { in: ["QC", "REPRINT", "REPLACEMENT", "IN_PRODUCTION"] } },
        orderBy: { updatedAt: "desc" },
        take: 20,
        include: { vendor: true },
      }),
      prisma.vendor.findMany({
        where: { active: true },
        orderBy: { qualityScore: "desc" },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { vendor: true },
      }),
      prisma.design.findMany({
        where: { moderationStatus: "pending" },
        include: { owner: { select: { name: true, email: true } } },
        orderBy: { updatedAt: "desc" },
        take: 20,
      }),
      prisma.supportTicket.findMany({
        where: { status: "open" },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { order: { select: { orderNumber: true } } },
      }),
      prisma.order.findMany({
        where: { vendorId: null, status: { not: "CANCELLED" } },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

  const showSupport = hasPermission(role, "support:manage") || role === "ADMIN";
  const showFinance =
    hasPermission(role, "order:refund") ||
    hasPermission(role, "finance:manage") ||
    role === "ADMIN";
  const showQc = hasPermission(role, "qc:manage") || role === "ADMIN";
  const showModeration =
    hasPermission(role, "design:moderate") || role === "ADMIN";
  const canAssign = hasPermission(role, "vendor:assign") || role === "ADMIN";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">Operations</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
        Returns, QC & finance
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Signed in as {role.replaceAll("_", " ")}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Open returns" value={String(openReturns.length)} />
        <Stat label="Open tickets" value={String(openTickets.length)} />
        <Stat label="Pending refunds" value={String(pendingRefunds.length)} />
        <Stat label="QC / reprint queue" value={String(qcOrders.length)} />
        <Stat label="Pending listings" value={String(pendingListings.length)} />
      </div>

      {canAssign ? (
        <section className="mt-12">
          <h2 className="text-lg font-medium tracking-tight">Unassigned orders</h2>
          {unassignedOrders.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--muted)]">No unassigned orders.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {unassignedOrders.map((order) => (
                <li
                  key={order.id}
                  className="grid gap-4 rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-4 lg:grid-cols-[1.2fr_0.8fr]"
                >
                  <div>
                    <Link href={`/orders/${order.id}`} className="font-medium underline">
                      {order.orderNumber}
                    </Link>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                      {statusLabel(order.status)} · {order.shippingCity}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {order.shippingName} · {formatPkr(order.subtotal + order.deliveryFee)}
                    </p>
                  </div>
                  <AssignVendorForm
                    orderId={order.id}
                    vendors={vendors.map((v) => ({
                      id: v.id,
                      businessName: v.businessName,
                      city: v.city,
                    }))}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {showModeration ? (
        <section className="mt-12">
          <h2 className="text-lg font-medium tracking-tight">
            Marketplace moderation
          </h2>
          {pendingListings.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--muted)]">No pending listings.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {pendingListings.map((design) => (
                <li
                  key={design.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-4"
                >
                  <div className="flex gap-3">
                    <div className="h-14 w-14 overflow-hidden rounded-lg bg-[var(--mist)] p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={design.imageUrl}
                        alt={design.title}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{design.title}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {design.owner?.name ?? design.owner?.email ?? "Creator"} ·{" "}
                        {design.listedPrice > 0
                          ? formatPkr(design.listedPrice)
                          : "Free"}
                      </p>
                    </div>
                  </div>
                  <ModerateDesignButtons designId={design.id} />
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {showSupport ? (
        <section className="mt-12">
          <h2 className="text-lg font-medium tracking-tight">Support · open tickets</h2>
          {openTickets.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--muted)]">No open support tickets.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {openTickets.map((ticket) => (
                <li
                  key={ticket.id}
                  className="grid gap-4 rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-4 lg:grid-cols-[1.2fr_0.8fr]"
                >
                  <div>
                    <p className="font-medium">{ticket.subject}</p>
                    <p className="mt-2 text-sm text-[var(--muted)]">{ticket.body}</p>
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      {ticket.name ?? "Guest"} · {ticket.email}
                      {ticket.order
                        ? ` · order ${ticket.order.orderNumber}`
                        : ""}{" "}
                      · {ticket.createdAt.toLocaleString("en-PK")}
                    </p>
                  </div>
                  <ResolveTicketForm ticketId={ticket.id} />
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {showSupport ? (
        <section className="mt-12">
          <h2 className="text-lg font-medium tracking-tight">Support · open returns</h2>
          {openReturns.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--muted)]">No open returns.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {openReturns.map((ret) => (
                <li
                  key={ret.id}
                  className="grid gap-4 rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-4 lg:grid-cols-[1.2fr_0.8fr]"
                >
                  <div>
                    <Link href={`/orders/${ret.orderId}`} className="font-medium underline">
                      {ret.order.orderNumber}
                    </Link>
                    <p className="mt-2 text-sm text-[var(--muted)]">{ret.reason}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {ret.createdAt.toLocaleString("en-PK")} ·{" "}
                      {statusLabel(ret.order.status)}
                    </p>
                  </div>
                  <ResolveReturnForm returnId={ret.id} />
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {showQc ? (
        <section className="mt-12">
          <h2 className="text-lg font-medium tracking-tight">QC queue</h2>
          {qcOrders.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--muted)]">No QC items.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {qcOrders.map((order) => (
                <li
                  key={order.id}
                  className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <Link href={`/orders/${order.id}`} className="font-medium underline">
                        {order.orderNumber}
                      </Link>
                      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                        {statusLabel(order.status)}
                        {order.vendor ? ` · ${order.vendor.businessName}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <QcDecisionForm orderId={order.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {showFinance ? (
        <section className="mt-12">
          <h2 className="text-lg font-medium tracking-tight">Finance · pending refunds</h2>
          {pendingRefunds.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--muted)]">No pending refunds.</p>
          ) : (
            <ul className="mt-4 divide-y divide-[var(--ink)]/8 rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)]">
              {pendingRefunds.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{p.order.orderNumber}</p>
                    <p className="text-xs text-[var(--muted)]">{formatPkr(p.amount)} pending</p>
                  </div>
                  <ApproveRefundButton paymentId={p.id} />
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="text-lg font-medium tracking-tight">Vendor performance</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--ink)]/10">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--mist)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
              <tr>
                <th className="px-3 py-2">Vendor</th>
                <th className="px-3 py-2">City</th>
                <th className="px-3 py-2">Quality</th>
                <th className="px-3 py-2">Delivery</th>
                <th className="px-3 py-2">Return</th>
                <th className="px-3 py-2">Defect</th>
                <th className="px-3 py-2">QC fail</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id} className="border-t border-[var(--ink)]/8">
                  <td className="max-w-[10rem] truncate px-3 py-2" title={v.businessName}>
                    {v.businessName}
                  </td>
                  <td className="px-3 py-2">{v.city}</td>
                  <td className="px-3 py-2">{v.qualityScore.toFixed(1)}</td>
                  <td className="px-3 py-2">{v.deliveryScore.toFixed(1)}</td>
                  <td className="px-3 py-2">{(v.returnRate * 100).toFixed(1)}%</td>
                  <td className="px-3 py-2">{(v.defectRate * 100).toFixed(1)}%</td>
                  <td className="px-3 py-2">{(v.qcFailRate * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-medium tracking-tight">Recent orders</h2>
        <ul className="mt-4 space-y-2">
          {recentOrders.map((o) => (
            <li key={o.id} className="flex justify-between gap-3 text-sm">
              <Link href={`/orders/${o.id}`} className="underline">
                {o.orderNumber}
              </Link>
              <span className="text-[var(--muted)]">
                {statusLabel(o.status)}
                {o.vendor ? ` · ${o.vendor.city}` : ""}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10">
        <Link href="/">
          <Button variant="outline">Storefront</Button>
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-4">
      <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-2xl font-medium">{value}</p>
    </div>
  );
}
