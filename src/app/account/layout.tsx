import { CustomerPortalFrame } from "@/components/portal/customer-portal-frame";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CustomerPortalFrame callbackUrl="/account">{children}</CustomerPortalFrame>
  );
}
