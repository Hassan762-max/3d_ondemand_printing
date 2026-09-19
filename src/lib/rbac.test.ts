import { describe, expect, it } from "vitest";
import {
  hasAnyPermission,
  hasPermission,
  permissionsFor,
} from "@/lib/rbac";

describe("RBAC — role permission matrix", () => {
  it("gives customers shop + own-order access but not refunds or production", () => {
    expect(hasPermission("CUSTOMER", "order:create")).toBe(true);
    expect(hasPermission("CUSTOMER", "order:read_own")).toBe(true);
    expect(hasPermission("CUSTOMER", "cart:manage")).toBe(true);
    expect(hasPermission("CUSTOMER", "order:refund")).toBe(false);
    expect(hasPermission("CUSTOMER", "production:manage")).toBe(false);
    expect(hasPermission("CUSTOMER", "order:read_all")).toBe(false);
  });

  it("lets vendors manage production but not platform-wide order reads or refunds", () => {
    expect(hasPermission("VENDOR", "production:manage")).toBe(true);
    expect(hasPermission("VENDOR", "order:update_status")).toBe(true);
    expect(hasPermission("VENDOR", "order:read_all")).toBe(false);
    expect(hasPermission("VENDOR", "order:refund")).toBe(false);
    expect(hasPermission("VENDOR", "user:manage")).toBe(false);
  });

  it("scopes finance to refunds and audit, not production", () => {
    expect(hasPermission("FINANCE_MANAGER", "order:refund")).toBe(true);
    expect(hasPermission("FINANCE_MANAGER", "finance:manage")).toBe(true);
    expect(hasPermission("FINANCE_MANAGER", "audit:read")).toBe(true);
    expect(hasPermission("FINANCE_MANAGER", "production:manage")).toBe(false);
  });

  it("grants ADMIN every permission and SUPER_ADMIN always passes", () => {
    const admin = permissionsFor("ADMIN");
    expect(admin).toContain("user:manage");
    expect(admin).toContain("order:refund");
    expect(hasPermission("ADMIN", "ai:use")).toBe(true);
    expect(hasPermission("SUPER_ADMIN", "order:refund")).toBe(true);
    expect(hasPermission("SUPER_ADMIN", "audit:read")).toBe(true);
  });

  it("hasAnyPermission matches if at least one permission is held", () => {
    expect(
      hasAnyPermission("SUPPORT_MANAGER", ["order:cancel", "order:refund"]),
    ).toBe(true);
    expect(
      hasAnyPermission("DESIGNER", ["order:refund", "finance:manage"]),
    ).toBe(false);
  });
});
