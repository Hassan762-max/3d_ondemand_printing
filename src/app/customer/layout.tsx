import { CustomerPortalFrame } from "@/components/portal/customer-portal-frame";
import { requireFreshSession } from "@/lib/auth/fresh-session";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireFreshSession("/customer");

  return (
    <CustomerPortalFrame callbackUrl="/customer">{children}</CustomerPortalFrame>
  );
}
