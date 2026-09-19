import { redirect } from "next/navigation";
import { PortalSection } from "@/components/portal/portal-section";
import { VendorQueueList } from "@/components/vendor/vendor-queue-list";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import {
  getVendorForUser,
  getVendorOrders,
  isQueueOrder,
} from "@/lib/vendor/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Queue" };

export default async function VendorQueuePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in?callbackUrl=/vendor/queue");

  const vendor = await getVendorForUser(session.user.id);
  if (!vendor) redirect("/vendor");
  if (vendor.approvalStatus !== "APPROVED") redirect("/vendor");

  const orders = await getVendorOrders(vendor.id);
  const queue = orders.filter((o) => isQueueOrder(o.status));

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
            Production
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
            Queue
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
            Jobs that need production, QC, or dispatch attention.
          </p>
        </div>
        <Button href="/vendor/jobs" variant="outline">
          All jobs
        </Button>
      </header>

      <PortalSection
        title={`${queue.length} Open`}
        description={vendor.businessName}
      >
        <VendorQueueList orders={queue} />
      </PortalSection>
    </div>
  );
}
