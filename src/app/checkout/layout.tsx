import { CustomerPortalFrame } from "@/components/portal/customer-portal-frame";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CustomerPortalFrame callbackUrl="/checkout">{children}</CustomerPortalFrame>
  );
}
