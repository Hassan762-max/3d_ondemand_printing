import { CustomerPortalFrame } from "@/components/portal/customer-portal-frame";

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CustomerPortalFrame callbackUrl="/orders">{children}</CustomerPortalFrame>
  );
}
