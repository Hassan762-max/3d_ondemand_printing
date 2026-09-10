import { redirect } from "next/navigation";
import { portalHomeForRole } from "@/components/portal/portal-nav";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Account" };

/** Hub redirects each role to its dedicated portal. */
export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  redirect(portalHomeForRole(session.user.role));
}
