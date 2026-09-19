import { redirect } from "next/navigation";
import { PortalShell } from "@/components/portal/portal-shell";
import { ADMIN_NAV } from "@/components/portal/portal-nav";
import { auth } from "@/lib/auth";
import { hasAnyPermission } from "@/lib/rbac";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in?callbackUrl=/admin");

  const role = session.user.role;
  // Shell entry: admins + managers with an admin-console permission.
  // Individual pages enforce narrower permissions (finance/catalog/users).
  const allowed =
    role === "ADMIN" ||
    role === "SUPER_ADMIN" ||
    hasAnyPermission(role, [
      "catalog:write",
      "finance:manage",
      "vendor:manage",
      "user:manage",
    ]);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
          Admin
        </h1>
        <p className="mt-4 text-sm text-[var(--muted)]">
          This account does not have admin access.
        </p>
      </div>
    );
  }

  return (
    <PortalShell
      variant="admin"
      nav={ADMIN_NAV}
      userName={session.user.name}
      userEmail={session.user.email}
      badge={role.replaceAll("_", " ")}
    >
      {children}
    </PortalShell>
  );
}
