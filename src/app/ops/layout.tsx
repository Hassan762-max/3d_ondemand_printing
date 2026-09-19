import { redirect } from "next/navigation";
import { PortalShell } from "@/components/portal/portal-shell";
import { ADMIN_NAV, OPS_NAV } from "@/components/portal/portal-nav";
import { auth } from "@/lib/auth";
import { hasAnyPermission } from "@/lib/rbac";

export default async function OpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in?callbackUrl=/ops");

  const role = session.user.role;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  // Explicitly exclude VENDOR — they share production:manage for job updates
  // but must not see platform-wide ops data.
  const allowed =
    isAdmin ||
    (role !== "VENDOR" &&
      hasAnyPermission(role, [
        "support:manage",
        "qc:manage",
        "order:refund",
        "finance:manage",
        "vendor:assign",
        "design:moderate",
        "production:manage",
      ]));

  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
          Ops
        </h1>
        <p className="mt-4 text-sm text-[var(--muted)]">
          This account does not have operations access.
        </p>
      </div>
    );
  }

  // Admins share the same console chrome as /admin.
  if (isAdmin) {
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

  return (
    <PortalShell
      variant="ops"
      nav={OPS_NAV.filter((item) => item.href !== "/admin")}
      userName={session.user.name}
      userEmail={session.user.email}
      badge={role.replaceAll("_", " ")}
    >
      {children}
    </PortalShell>
  );
}
