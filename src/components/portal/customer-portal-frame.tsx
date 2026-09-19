import { redirect } from "next/navigation";
import { PortalShell } from "@/components/portal/portal-shell";
import { CUSTOMER_NAV } from "@/components/portal/portal-nav";
import { auth } from "@/lib/auth";
import {
  getFreshSessionUser,
} from "@/lib/auth/fresh-session";

/** Wraps storefront pages with the customer portal chrome when appropriate. */
export async function CustomerPortalFrame({
  children,
  callbackUrl = "/customer",
  requireAuth = true,
}: {
  children: React.ReactNode;
  callbackUrl?: string;
  /** When false, guests still see the page without portal chrome. */
  requireAuth?: boolean;
}) {
  const freshUser = await getFreshSessionUser();

  if (!freshUser) {
    const session = await auth();
    // JWT restored without presence — never show portal as logged-in.
    if (session?.user) {
      redirect("/auth/end-session");
    }
    if (requireAuth) {
      redirect(`/auth/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
    return <>{children}</>;
  }

  const role = freshUser.role;
  const useShell = role === "CUSTOMER" || role === "DESIGNER";

  if (!useShell) {
    return <>{children}</>;
  }

  return (
    <PortalShell
      variant="customer"
      nav={CUSTOMER_NAV}
      userName={freshUser.name}
      userEmail={freshUser.email}
      badge="Your orders, designs, and preferences"
    >
      {children}
    </PortalShell>
  );
}
