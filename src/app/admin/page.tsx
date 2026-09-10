import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CollectCodButton,
  SettleOrderButton,
  SetUserRoleSelect,
  ToggleProductButton,
  ToggleUserActiveButton,
} from "@/components/admin/admin-actions";
import { PortalSection } from "@/components/portal/portal-section";
import { PortalStat } from "@/components/portal/portal-stat";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getAiProvider } from "@/lib/ai";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/rbac";
import { getPaymentProvider } from "@/lib/orders/payment";
import { statusLabel } from "@/lib/orders/tracking";
import { formatPkr } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in?callbackUrl=/admin");

  const role = session.user.role;
  const canManageUsers =
    hasPermission(role, "user:manage") ||
    role === "ADMIN" ||
    role === "SUPER_ADMIN";

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
    users,
    settledHistory,
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
    canManageUsers
      ? prisma.user.findMany({
          orderBy: { createdAt: "desc" },
          take: 40,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            active: true,
          },
        })
      : Promise.resolve([]),
    prisma.paymentLedger.findMany({
      where: { kind: "VENDOR_SETTLEMENT", status: "COMPLETED" },
      include: { order: { include: { vendor: true } } },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
  ]);

  const payment = getPaymentProvider();
  const ai = getAiProvider();

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
          Platform control
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
          Admin command center
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Signed in as {role.replaceAll("_", " ")}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <PortalStat
          label="Products"
          value={`${activeProducts}/${productCount}`}
          hint="Active / total"
        />
        <PortalStat label="Orders" value={String(orderCount)} />
        <PortalStat label="Users" value={String(userCount)} />
        <PortalStat label="Open returns" value={String(openReturns)} />
        <PortalStat label="Pending refunds" value={String(pendingRefunds)} />
        <PortalStat label="To settle" value={String(settleable.length)} />
      </div>

      <PortalSection
        id="health"
        title="Provider health"
        description="Live integrations used by checkout and AI tools."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
              Payments
            </p>
            <p className="mt-1 font-medium">{payment.name}</p>
          </div>
          <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
              AI provider
            </p>
            <p className="mt-1 font-medium">{ai.name}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/ops">
            <Button>Open Ops desk</Button>
          </Link>
          <Link href="/api/health">
            <Button variant="outline">Health JSON</Button>
          </Link>
        </div>
      </PortalSection>

      <PortalSection
        id="catalog"
        title="Catalog"
        description="Toggle blanks available on the storefront."
      >
        <ul className="divide-y divide-[var(--ink)]/8 overflow-hidden rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)]">
          {products.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <div>
                <Link
                  href={`/products/${p.slug}`}
                  className="font-medium underline"
                >
                  {p.name}
                </Link>
                <p className="text-xs text-[var(--muted)]">
                  {p.category.replaceAll("_", " ")} · {p._count.variants}{" "}
                  variants · {formatPkr(p.basePrice)}
                  {p.active ? "" : " · inactive"}
                </p>
              </div>
              <ToggleProductButton productId={p.id} active={p.active} />
            </li>
          ))}
        </ul>
      </PortalSection>

      <PortalSection
        id="finance"
        title="Finance"
        description="COD collection and vendor settlements."
      >
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-medium tracking-tight">
              Pending COD collection
            </h3>
            {pendingCod.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--muted)]">
                No delivered orders with pending COD.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
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
          </div>

          <div>
            <h3 className="text-sm font-medium tracking-tight">
              Vendor settlements
            </h3>
            {settleable.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--muted)]">
                No delivered orders awaiting settlement.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
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
                        {order.vendor?.businessName} ·{" "}
                        {formatPkr(order.vendorCost)} ·{" "}
                        {statusLabel(order.status)}
                      </p>
                    </div>
                    <SettleOrderButton orderId={order.id} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {settledHistory.length > 0 ? (
            <div>
              <h3 className="text-sm font-medium tracking-tight">
                Settlement history
              </h3>
              <ul className="mt-3 divide-y divide-[var(--ink)]/8 overflow-hidden rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)]">
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
                    <span className="font-medium">
                      {formatPkr(entry.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </PortalSection>

      {canManageUsers && users.length > 0 ? (
        <PortalSection
          id="users"
          title="User management"
          description="Roles and account status."
        >
          <div className="overflow-x-auto rounded-xl border border-[var(--ink)]/10">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--mist)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                <tr>
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-[var(--ink)]/8">
                    <td className="px-3 py-2">
                      <p className="font-medium">{u.name ?? "—"}</p>
                      <p className="text-xs text-[var(--muted)]">{u.email}</p>
                    </td>
                    <td className="px-3 py-2">
                      <SetUserRoleSelect userId={u.id} currentRole={u.role} />
                    </td>
                    <td className="px-3 py-2">
                      {u.active ? (
                        <span className="text-[var(--accent)]">Active</span>
                      ) : (
                        <span className="text-[var(--danger)]">Inactive</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <ToggleUserActiveButton
                        userId={u.id}
                        active={u.active}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PortalSection>
      ) : null}

      <PortalSection title="Recent audit" description="Latest platform events.">
        <ul className="divide-y divide-[var(--ink)]/8 overflow-hidden rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] text-sm">
          {audits.map((a) => (
            <li key={a.id} className="px-4 py-3">
              <p className="font-medium">{a.action}</p>
              <p className="text-xs text-[var(--muted)]">
                {a.user?.email ?? "system"} · {a.entity ?? "—"} {a.entityId ?? ""}{" "}
                · {a.createdAt.toLocaleString("en-PK")}
              </p>
            </li>
          ))}
        </ul>
      </PortalSection>
    </div>
  );
}
