import { CustomerPortalFrame } from "@/components/portal/customer-portal-frame";

export default function DesignsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CustomerPortalFrame callbackUrl="/designs" requireAuth={false}>
      {children}
    </CustomerPortalFrame>
  );
}
