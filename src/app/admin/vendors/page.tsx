import { redirect } from "next/navigation";
import { VendorReviewButtons } from "@/components/admin/vendor-review-buttons";
import { PortalSection } from "@/components/portal/portal-section";
import { PortalStat } from "@/components/portal/portal-stat";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { productCategoryLabel } from "@/lib/product-categories";
import { hasPermission } from "@/lib/rbac";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vendor approvals" };

export default async function AdminVendorsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in?callbackUrl=/admin/vendors");

  const role = session.user.role;
  const canManage =
    hasPermission(role, "vendor:manage") ||
    role === "ADMIN" ||
    role === "SUPER_ADMIN";

  if (!canManage) {
    return (
      <div className="max-w-xl space-y-3">
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
          Vendors
        </h1>
        <p className="text-sm text-[var(--muted)]">
          This account cannot review vendor applications.
        </p>
      </div>
    );
  }

  const vendors = await prisma.vendor.findMany({
    include: {
      user: { select: { name: true, email: true } },
      capabilities: true,
    },
    orderBy: [{ approvalStatus: "asc" }, { createdAt: "desc" }],
  });

  const pending = vendors.filter((v) => v.approvalStatus === "PENDING");
  const approved = vendors.filter((v) => v.approvalStatus === "APPROVED");
  const rejected = vendors.filter((v) => v.approvalStatus === "REJECTED");

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
          Partners
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
          Vendor approvals
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
          Review new print partners, their cities, and the products they can
          fulfill.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <PortalStat label="Pending" value={String(pending.length)} />
        <PortalStat label="Approved" value={String(approved.length)} />
        <PortalStat label="Rejected" value={String(rejected.length)} />
      </div>

      <PortalSection
        title="Awaiting approval"
        description="New vendors cannot receive jobs until approved."
      >
        {pending.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No pending applications.</p>
        ) : (
          <ul className="space-y-3">
            {pending.map((vendor) => (
              <li
                key={vendor.id}
                className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] px-4 py-4"
              >
                <div className="min-w-0 max-w-xl">
                  <p className="font-medium">{vendor.businessName}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {vendor.user.name ?? "—"} · {vendor.user.email} ·{" "}
                    {vendor.phone}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {vendor.city}, {vendor.province} · applied{" "}
                    {vendor.createdAt.toLocaleString("en-PK")}
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                    Can print
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {vendor.capabilities.map((cap) => (
                      <li
                        key={cap.id}
                        className="rounded-full border border-[var(--ink)]/10 bg-[var(--paper)] px-2.5 py-1 text-[11px]"
                      >
                        {productCategoryLabel(cap.category)}
                      </li>
                    ))}
                  </ul>
                  {vendor.servicesNote ? (
                    <p className="mt-3 text-sm text-[var(--ink)]">
                      {vendor.servicesNote}
                    </p>
                  ) : null}
                </div>
                <VendorReviewButtons vendorId={vendor.id} />
              </li>
            ))}
          </ul>
        )}
      </PortalSection>

      <PortalSection title="All partners" description={`${vendors.length} total`}>
        <div className="overflow-x-auto rounded-xl border border-[var(--ink)]/10">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--mist)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
              <tr>
                <th className="px-3 py-2">Business</th>
                <th className="px-3 py-2">City</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Products</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor.id} className="border-t border-[var(--ink)]/8">
                  <td className="px-3 py-2">
                    <p className="font-medium">{vendor.businessName}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {vendor.user.email}
                    </p>
                  </td>
                  <td className="px-3 py-2">{vendor.city}</td>
                  <td className="px-3 py-2">{vendor.approvalStatus}</td>
                  <td className="px-3 py-2 text-xs text-[var(--muted)]">
                    {vendor.capabilities
                      .map((c) => productCategoryLabel(c.category))
                      .join(", ") || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PortalSection>
    </div>
  );
}
