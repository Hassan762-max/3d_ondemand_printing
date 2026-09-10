import { redirect } from "next/navigation";
import { SetUserRoleSelect } from "@/components/admin/admin-actions";
import { PortalSection } from "@/components/portal/portal-section";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/rbac";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin users" };

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in?callbackUrl=/admin/users");

  const role = session.user.role;
  const canManageUsers =
    hasPermission(role, "user:manage") ||
    role === "ADMIN" ||
    role === "SUPER_ADMIN";

  if (!canManageUsers) {
    return (
      <div className="max-w-xl space-y-3">
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
          Users
        </h1>
        <p className="text-sm text-[var(--muted)]">
          This account cannot manage users.
        </p>
      </div>
    );
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
          Access
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
          User management
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
          Assign roles for staff and partners.
        </p>
      </header>

      <PortalSection title={`${users.length} accounts`}>
        <div className="overflow-x-auto rounded-xl border border-[var(--ink)]/10">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--mist)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
              <tr>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-[var(--ink)]/8">
                  <td className="px-3 py-2">
                    <p className="font-medium">{u.name ?? "—"}</p>
                    <p className="text-xs text-[var(--muted)]">{u.email}</p>
                  </td>
                  <td className="px-3 py-2">
                    <SetUserRoleSelect userId={u.id} currentRole={u.role} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PortalSection>
    </div>
  );
}
