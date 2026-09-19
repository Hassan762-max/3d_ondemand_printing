import { Role } from "@prisma/client";

/** Granular permissions used across Nivaro RBAC. */
export const PERMISSIONS = [
  "catalog:read",
  "catalog:write",
  "design:read",
  "design:write",
  "design:moderate",
  "cart:manage",
  "order:create",
  "order:read_own",
  "order:read_all",
  "order:update_status",
  "order:cancel",
  "order:refund",
  "vendor:read",
  "vendor:manage",
  "vendor:assign",
  "production:manage",
  "qc:manage",
  "support:manage",
  "finance:manage",
  "user:manage",
  "audit:read",
  "ai:use",
  "studio:use",
  "tryon:use",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ALL = [...PERMISSIONS] as Permission[];

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  CUSTOMER: [
    "catalog:read",
    "design:read",
    "design:write",
    "cart:manage",
    "order:create",
    "order:read_own",
    "order:cancel",
    "ai:use",
    "studio:use",
    "tryon:use",
  ],
  DESIGNER: [
    "catalog:read",
    "design:read",
    "design:write",
    "ai:use",
    "studio:use",
    "tryon:use",
    "order:read_own",
    "cart:manage",
    "order:create",
  ],
  // Vendors manage assigned jobs only — never platform-wide order:read_all
  // (that permission previously also unlocked /ops).
  VENDOR: [
    "order:update_status",
    "production:manage",
    "vendor:read",
  ],
  PRODUCTION_MANAGER: [
    "order:read_all",
    "order:update_status",
    "production:manage",
    "vendor:assign",
  ],
  QC_MANAGER: ["order:read_all", "order:update_status", "qc:manage"],
  SUPPORT_MANAGER: [
    "order:read_all",
    "order:cancel",
    "support:manage",
    "user:manage",
  ],
  FINANCE_MANAGER: [
    "order:read_all",
    "order:refund",
    "finance:manage",
    "audit:read",
  ],
  ADMIN: ALL,
  SUPER_ADMIN: ALL,
};

export function permissionsFor(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(role: Role, permission: Permission): boolean {
  if (role === "SUPER_ADMIN") return true;
  return permissionsFor(role).includes(permission);
}

export function hasAnyPermission(role: Role, needed: Permission[]): boolean {
  return needed.some((p) => hasPermission(role, p));
}
