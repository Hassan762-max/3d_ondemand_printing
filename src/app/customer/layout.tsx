import { redirect } from "next/navigation";
import { CustomerPortalFrame } from "@/components/portal/customer-portal-frame";
import { auth } from "@/lib/auth";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in?callbackUrl=/customer");

  return (
    <CustomerPortalFrame callbackUrl="/customer">{children}</CustomerPortalFrame>
  );
}
