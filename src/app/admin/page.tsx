import Link from "next/link";
import { redirect } from "next/navigation";
import { PortalSection } from "@/components/portal/portal-section";
import { PortalStat } from "@/components/portal/portal-stat";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getAiProvider } from "@/lib/ai";
import { catalogProductWhere } from "@/lib/catalog/display";
import { prisma } from "@/lib/db";
import { getPaymentProvider } from "@/lib/orders/payment";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in?callbackUrl=/admin");

  const role = session.user.role;

  const [
    productCount,
    orderCount,
    userCount,
    openReturns,
    pendingRefunds,
    toSettle,
    pendingVendors,
    audits,
  ] = await Promise.all([
    prisma.product.count({ where: catalogProductWhere() }),
    prisma.order.count(),
    prisma.user.count(),
    prisma.returnRequest.count({ where: { status: "open" } }),
    prisma.paymentLedger.count({
      where: { kind: "REFUND", status: "PENDING" },
    }),
    prisma.order.count({
      where: {
        status: "DELIVERED",
        vendorId: { not: null },
        vendorCost: { gt: 0 },
        payments: { none: { kind: "VENDOR_SETTLEMENT" } },
      },
    }),
    prisma.vendor.count({ where: { approvalStatus: "PENDING" } }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { user: { select: { email: true, name: true } } },
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-7">
        <PortalStat label="Products" value={String(productCount)} />
        <PortalStat label="Orders" value={String(orderCount)} />
        <PortalStat label="Users" value={String(userCount)} />
        <PortalStat label="Pending vendors" value={String(pendingVendors)} />
        <PortalStat label="Open returns" value={String(openReturns)} />
        <PortalStat label="Pending refunds" value={String(pendingRefunds)} />
        <PortalStat label="To settle" value={String(toSettle)} />
      </div>

      <PortalSection
        title="Quick actions"
        description="Jump into vendors, catalog, users, finance, or ops."
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/vendors">
            <Button>Vendors{pendingVendors > 0 ? ` (${pendingVendors})` : ""}</Button>
          </Link>
          <Link href="/admin/catalog">
            <Button variant="outline">Catalog</Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="outline">Users</Button>
          </Link>
          <Link href="/admin/finance">
            <Button variant="outline">Finance</Button>
          </Link>
          <Link href="/admin/health">
            <Button variant="outline">Health</Button>
          </Link>
          <Link href="/ops">
            <Button variant="outline">Ops desk</Button>
          </Link>
        </div>
      </PortalSection>

      <PortalSection
        title="Providers"
        description={`${payment.name} · ${ai.name}`}
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
      </PortalSection>

      <PortalSection title="Recent audit" description="Latest platform events.">
        {audits.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No audit events yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--ink)]/8 overflow-hidden rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] text-sm">
            {audits.map((a) => (
              <li key={a.id} className="px-4 py-3">
                <p className="font-medium">{a.action}</p>
                <p className="text-xs text-[var(--muted)]">
                  {a.user?.email ?? "system"} · {a.entity ?? "—"}{" "}
                  {a.entityId ?? ""} · {a.createdAt.toLocaleString("en-PK")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </PortalSection>
    </div>
  );
}
