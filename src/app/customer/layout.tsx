import { redirect } from "next/navigation";
import { PortalShell } from "@/components/portal/portal-shell";
import { CUSTOMER_NAV } from "@/components/portal/portal-nav";
import { auth } from "@/lib/auth";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in?callbackUrl=/customer");

  return (
    <PortalShell
      variant="customer"
      nav={CUSTOMER_NAV}
      userName={session.user.name}
      userEmail={session.user.email}
      badge="Your orders, designs, and preferences"
    >
      {children}
    </PortalShell>
  );
}
