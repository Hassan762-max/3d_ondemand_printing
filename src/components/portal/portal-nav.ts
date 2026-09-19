import type { Role } from "@prisma/client";
import { brand } from "@/lib/brand";

export type PortalNavItem = {
  href: string;
  label: string;
  match?: "exact" | "prefix";
};

export type PortalVariant = "customer" | "vendor" | "admin" | "ops";

export function portalHomeForRole(role: Role): string {
  switch (role) {
    case "VENDOR":
      return "/vendor";
    case "ADMIN":
    case "SUPER_ADMIN":
      return "/admin";
    case "SUPPORT_MANAGER":
    case "QC_MANAGER":
    case "FINANCE_MANAGER":
    case "PRODUCTION_MANAGER":
      return "/ops";
    default:
      return "/customer";
  }
}

export const CUSTOMER_NAV: PortalNavItem[] = [
  { href: "/customer", label: "Dashboard", match: "exact" },
  { href: "/products", label: "Products", match: "prefix" },
  { href: "/designs", label: "Designs", match: "prefix" },
  { href: "/orders", label: "Orders", match: "prefix" },
  { href: "/account/designs", label: "Saved designs", match: "prefix" },
  { href: "/account/wishlist", label: "Wishlist", match: "exact" },
  { href: "/account/profile", label: "Profile", match: "exact" },
  { href: "/account/notifications", label: "Notifications", match: "exact" },
  { href: "/cart", label: "Cart", match: "exact" },
];

export const VENDOR_NAV: PortalNavItem[] = [
  { href: "/vendor", label: "Dashboard", match: "exact" },
  { href: "/vendor/queue", label: "Queue", match: "prefix" },
  { href: "/vendor/jobs", label: "All jobs", match: "prefix" },
  { href: "/vendor/profile", label: "Profile", match: "exact" },
];

export const ADMIN_NAV: PortalNavItem[] = [
  { href: "/admin", label: "Dashboard", match: "exact" },
  { href: "/admin/vendors", label: "Vendors", match: "prefix" },
  { href: "/admin/catalog", label: "Catalog", match: "prefix" },
  { href: "/admin/users", label: "Users", match: "prefix" },
  { href: "/admin/finance", label: "Finance", match: "prefix" },
  { href: "/admin/health", label: "Health", match: "prefix" },
  { href: "/ops", label: "Ops desk", match: "prefix" },
];

export const OPS_NAV: PortalNavItem[] = [
  { href: "/ops", label: "Dashboard", match: "exact" },
];

export function portalMeta(variant: PortalVariant) {
  switch (variant) {
    case "customer":
      return {
        title: `My ${brand.name}`,
        eyebrow: "Customer portal",
        variantClass: "portal-customer",
      };
    case "vendor":
      return {
        title: "Vendor console",
        eyebrow: "Production portal",
        variantClass: "portal-vendor",
      };
    case "admin":
      return {
        title: "Admin console",
        eyebrow: "Platform control",
        variantClass: "portal-admin",
      };
    case "ops":
      return {
        title: "Ops desk",
        eyebrow: "Operations",
        variantClass: "portal-ops",
      };
  }
}
