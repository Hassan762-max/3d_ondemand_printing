import { CustomerPortalFrame } from "@/components/portal/customer-portal-frame";

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CustomerPortalFrame callbackUrl="/products" requireAuth={false}>
      {children}
    </CustomerPortalFrame>
  );
}
