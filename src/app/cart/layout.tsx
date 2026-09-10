import { CustomerPortalFrame } from "@/components/portal/customer-portal-frame";

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CustomerPortalFrame callbackUrl="/cart">{children}</CustomerPortalFrame>;
}
