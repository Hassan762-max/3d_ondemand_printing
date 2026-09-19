import { redirect } from "next/navigation";
import { PortalSection } from "@/components/portal/portal-section";
import { VendorJobsTable } from "@/components/vendor/vendor-jobs-table";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getVendorForUser, getVendorOrders } from "@/lib/vendor/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "All jobs" };

export default async function VendorJobsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in?callbackUrl=/vendor/jobs");

  const vendor = await getVendorForUser(session.user.id);
  if (!vendor) redirect("/vendor");
  if (vendor.approvalStatus !== "APPROVED") redirect("/vendor");

  const orders = await getVendorOrders(vendor.id);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
            Production
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
            All jobs
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
            Every order assigned to {vendor.businessName}.
          </p>
        </div>
        <Button href="/vendor/queue" variant="outline">
          Queue
        </Button>
      </header>

      <PortalSection
        title={`${orders.length} Assignments`}
        description="Most recent first"
      >
        <VendorJobsTable orders={orders} />
      </PortalSection>
    </div>
  );
}
