import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CollectCodButton,
  SettleOrderButton,
  ToggleProductButton,
} from "@/components/admin/admin-actions";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission } from "@/lib/rbac";
import { statusLabel } from "@/lib/orders/tracking";
import { formatPkr } from "@/lib/utils";
import { getPaymentProvider } from "@/lib/orders/payment";
import { getAiProvider } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in?callbackUrl=/admin");

  const role = session.user.role;
  const allowed =
    role === "ADMIN" ||
    role === "SUPER_ADMIN" ||
    hasAnyPermission(role, [
      "catalog:write",
      "finance:manage",
      "audit:read",
      "user:manage",
    ]);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">
          Admin
        </h1>
        <p className="mt-4 text-sm text-[var(--muted)]">
          This account does not have admin access.
        </p>
      </div>
    );
  }

  const [
    productCount,
    activeProducts,
    orderCount,
    userCount,
    openReturns,
    pendingRefunds,
    products,
    settleable,
    pendingCod,
    audits,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { active: true } }),
    prisma.order.count(),
    prisma.user.count(),
    prisma.returnRequest.count({ where: { status: "open" } }),
    prisma.paymentLedger.count({
      where: { kind: "REFUND", status: "PENDING" },
    }),
    prisma.product.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { variants: true } } },
    }),
    prisma.order.findMany({
      where: {
        status: "DELIVERED",
        vendorId: { not: null },
        vendorCost: { gt: 0 },
        payments: { none: { kind: "VENDOR_SETTLEMENT" } },
      },
      include: { vendor: true },
      orderBy: { updatedAt: "desc" },
      take: 15,
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
      take: 15,
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { user: { select: { email: true, name: true } } },
    }),
  ]);

  const payment = getPaymentProvider();
  const ai = getAiProvider();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
        Production · Admin
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
        Platform control
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Signed in as {role.replaceAll("_", " ")} · payments via {payment.name} · AI via{" "}
        {ai.name}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Products" value={`${activeProducts}/${productCount}`} />
        <Stat label="Orders" value={String(orderCount)} />
        <Stat label="Users" value={String(userCount)} />
        <Stat label="Open returns" value={String(openReturns)} />
        <Stat label="Pending refunds" value={String(pendingRefunds)} />
        <Stat label="To settle" value={String(settleable.length)} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/ops">
          <Button variant="outline">Ops desk</Button>
        </Link>
        <Link href="/marketplace">
          <Button variant="outline">Marketplace</Button>
        </Link>
        <Link href="/api/health">
          <Button variant="ghost">Health JSON</Button>
        </Link>
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-medium tracking-tight">Catalog</h2>
        <ul className="mt-4 divide-y divide-[var(--ink)]/8 rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)]">
          {products.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <div>
                <Link href={`/products/${p.slug}`} className="font-medium underline">
                  {p.name}
                </Link>
                <p className="text-xs text-[var(--muted)]">
                  {p.category.replaceAll("_", " ")} · {p._count.variants} variants ·{" "}
                  {formatPkr(p.basePrice)}
                  {p.active ? "" : " · inactive"}
                </p>
              </div>
              <ToggleProductButton productId={p.id} active={p.active} />
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-medium tracking-tight">Pending COD collection</h2>
        {pendingCod.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">
            No delivered orders with pending COD.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {pendingCod.map((order) => (
              <li
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] px-4 py-3 text-sm"
              >
                <div>
                  <Link href={`/orders/${order.id}`} className="font-medium underline">
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
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-medium tracking-tight">Vendor settlements</h2>
        {settleable.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">
            No delivered orders awaiting settlement.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {settleable.map((order) => (
              <li
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] px-4 py-3 text-sm"
              >
                <div>
                  <Link href={`/orders/${order.id}`} className="font-medium underline">
                    {order.orderNumber}
                  </Link>
                  <p className="text-xs text-[var(--muted)]">
                    {order.vendor?.businessName} · {formatPkr(order.vendorCost)} ·{" "}
                    {statusLabel(order.status)}
                  </p>
                </div>
                <SettleOrderButton orderId={order.id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-medium tracking-tight">Recent audit</h2>
        <ul className="mt-4 divide-y divide-[var(--ink)]/8 rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] text-sm">
          {audits.map((a) => (
            <li key={a.id} className="px-4 py-3">
              <p className="font-medium">{a.action}</p>
              <p className="text-xs text-[var(--muted)]">
                {a.user?.email ?? "system"} · {a.entity ?? "—"} {a.entityId ?? ""} ·{" "}
                {a.createdAt.toLocaleString("en-PK")}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-4">
      <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-xl font-medium">{value}</p>
    </div>
  );
}
