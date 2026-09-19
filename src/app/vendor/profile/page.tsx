import { redirect } from "next/navigation";
import { PortalSection } from "@/components/portal/portal-section";
import { PortalStat } from "@/components/portal/portal-stat";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getVendorForUser } from "@/lib/vendor/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vendor profile" };

export default async function VendorProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in?callbackUrl=/vendor/profile");

  const vendor = await getVendorForUser(session.user.id);
  if (!vendor) redirect("/vendor");

  const capabilities = await prisma.vendorCapability.findMany({
    where: {
      vendorId: vendor.id,
      category: {
        notIn: ["POLO", "CASUAL_SHIRT", "JOGGERS", "SHORTS"],
      },
    },
    orderBy: { category: "asc" },
  });

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
          Vendor profile
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
          {vendor.businessName}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {vendor.city}, {vendor.province} · {vendor.phone}
        </p>
        <p className="mt-2 text-sm">
          <span className="text-[var(--muted)]">Approval:</span>{" "}
          <span className="font-medium">
            {vendor.approvalStatus === "PENDING"
              ? "Pending admin review"
              : vendor.approvalStatus === "REJECTED"
                ? "Not approved"
                : "Approved"}
          </span>
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PortalStat label="Daily capacity" value={String(vendor.capacityDaily)} />
        <PortalStat label="Quality score" value={`${vendor.qualityScore}/5`} />
        <PortalStat label="Delivery score" value={`${vendor.deliveryScore}/5`} />
        <PortalStat label="Rating" value={`${vendor.rating}/5`} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PortalStat
          label="Cost factor"
          value={vendor.baseCostFactor.toFixed(2)}
        />
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
        title="Account"
        description="Linked Printora user for this shop."
      >
        <dl className="grid gap-4 rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-5 sm:grid-cols-2">
          <div>
            <dt className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
              Contact name
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {session.user.name ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
              Email
            </dt>
            <dd className="mt-1 text-sm font-medium">{session.user.email}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
              Phone
            </dt>
            <dd className="mt-1 text-sm font-medium">{vendor.phone}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
              Cancel rate
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {(vendor.cancelRate * 100).toFixed(1)}%
            </dd>
          </div>
        </dl>
      </PortalSection>

      <PortalSection
        title="What You Can Print"
        description="Product categories you selected for customer jobs."
      >
        {vendor.servicesNote ? (
          <p className="mb-4 text-sm leading-relaxed text-[var(--muted)]">
            {vendor.servicesNote}
          </p>
        ) : null}
        {capabilities.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No capabilities listed.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {capabilities.map((cap) => (
              <li
                key={cap.id}
                className="rounded-full border border-[var(--ink)]/10 bg-[var(--paper-elevated)] px-3 py-1.5 text-xs uppercase tracking-[0.12em]"
              >
                {cap.category.replaceAll("_", " ")}
              </li>
            ))}
          </ul>
        )}
      </PortalSection>
    </div>
  );
}
