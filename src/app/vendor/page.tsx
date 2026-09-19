import { redirect } from "next/navigation";
import { PortalSection } from "@/components/portal/portal-section";
import { PortalStat } from "@/components/portal/portal-stat";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import {
  getVendorForUser,
  getVendorOrders,
  isQueueOrder,
} from "@/lib/vendor/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vendor dashboard" };

export default async function VendorDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in?callbackUrl=/vendor");

  const vendor = await getVendorForUser(session.user.id);

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

  if (vendor.approvalStatus === "PENDING") {
    return (
      <div className="max-w-2xl space-y-6">
        <header>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
            Application pending
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
            {vendor.businessName}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            Thanks for applying. An admin is reviewing your shop and the products
            you can print. You will get a notification when you are approved —
            until then you cannot receive customer jobs.
          </p>
        </header>
        <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-5 text-sm">
          <p>
            <span className="text-[var(--muted)]">City:</span> {vendor.city},{" "}
            {vendor.province}
          </p>
          <p className="mt-2">
            <span className="text-[var(--muted)]">Phone:</span> {vendor.phone}
          </p>
          {vendor.servicesNote ? (
            <p className="mt-2">
              <span className="text-[var(--muted)]">Services:</span>{" "}
              {vendor.servicesNote}
            </p>
          ) : null}
        </div>
        <Button href="/vendor/profile" variant="outline">
          View profile
        </Button>
      </div>
    );
  }

  if (vendor.approvalStatus === "REJECTED") {
    return (
      <div className="max-w-xl space-y-4">
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
          Application not approved
        </h1>
        <p className="text-sm text-[var(--muted)]">
          {vendor.businessName} was not approved for production. Contact support
          if you believe this is a mistake.
        </p>
      </div>
    );
  }

  const orders = await getVendorOrders(vendor.id);
  const queue = orders.filter((o) => isQueueOrder(o.status));
  const inProduction = orders.filter((o) => o.status === "IN_PRODUCTION").length;
  const inQc = orders.filter((o) => o.status === "QC").length;
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const shippedToday = orders.filter(
    (o) =>
      (o.status === "SHIPPED" ||
        o.status === "OUT_FOR_DELIVERY" ||
        o.status === "DELIVERED") &&
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
        title="Quick Actions"
        description="Jump into production work."
      >
        <div className="flex flex-wrap gap-3">
          <Button href="/vendor/queue">Queue ({queue.length})</Button>
          <Button href="/vendor/jobs" variant="outline">
            All jobs ({orders.length})
          </Button>
        </div>
      </PortalSection>

      <PortalSection
        title="Shop Profile"
        description="How this vendor is scored for routing."
      >
        <dl className="grid gap-4 rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-5 sm:grid-cols-2">
          <div>
            <dt className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
              Business
            </dt>
            <dd className="mt-1 text-sm font-medium">{vendor.businessName}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
              City
            </dt>
            <dd className="mt-1 text-sm font-medium">{vendor.city}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
              Capacity
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {vendor.capacityDaily} orders / day
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
              Cost factor
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {vendor.baseCostFactor.toFixed(2)}×
            </dd>
          </div>
        </dl>
      </PortalSection>
    </div>
  );
}
