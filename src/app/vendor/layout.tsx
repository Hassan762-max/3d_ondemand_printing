import { redirect } from "next/navigation";
import { PortalShell } from "@/components/portal/portal-shell";
import { VENDOR_NAV } from "@/components/portal/portal-nav";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in?callbackUrl=/vendor");

  const vendor = await prisma.vendor.findUnique({
    where: { userId: session.user.id },
    select: { businessName: true, city: true, approvalStatus: true },
  });

  const badge = !vendor
    ? "No vendor profile linked"
    : vendor.approvalStatus === "PENDING"
      ? `${vendor.businessName} · pending approval`
      : vendor.approvalStatus === "REJECTED"
        ? `${vendor.businessName} · not approved`
        : `${vendor.businessName} · ${vendor.city}`;

  return (
    <PortalShell
      variant="vendor"
      nav={VENDOR_NAV}
      userName={session.user.name}
      userEmail={session.user.email}
      badge={badge}
    >
      {children}
    </PortalShell>
  );
}
