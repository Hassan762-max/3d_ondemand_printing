import { CustomerPortalFrame } from "@/components/portal/customer-portal-frame";

export default function TryOnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CustomerPortalFrame callbackUrl="/try-on">{children}</CustomerPortalFrame>
  );
}
