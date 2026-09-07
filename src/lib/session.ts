import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { hasPermission, type Permission } from "@/lib/rbac";

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  permissions: string[];
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user as SessionUser;
}

export async function requireUser(permission?: Permission): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth/sign-in");
  }
  if (permission && !hasPermission(user.role, permission)) {
    throw new Error("Forbidden");
  }
  return user;
}

/** Prefer for client toggles on public pages — returns null instead of redirecting. */
export async function getAuthorizedUser(
  permission?: Permission,
): Promise<SessionUser | null> {
  const user = await getSessionUser();
  if (!user) return null;
  if (permission && !hasPermission(user.role, permission)) return null;
  return user;
}
