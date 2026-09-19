import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { hasPermission, type Permission } from "@/lib/rbac";

/** Require a signed-in user with a specific permission (or ADMIN / SUPER_ADMIN). */
export async function requirePagePermission(
  permission: Permission,
  callbackUrl: string,
) {
  const session = await auth();
  if (!session?.user) redirect(`/auth/sign-in?callbackUrl=${callbackUrl}`);

  const role = session.user.role as Role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN" && !hasPermission(role, permission)) {
    redirect("/");
  }

  return session;
}
