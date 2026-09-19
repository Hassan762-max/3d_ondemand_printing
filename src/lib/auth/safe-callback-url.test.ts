import { describe, expect, it } from "vitest";
import { safeCallbackUrl } from "@/lib/auth/safe-callback-url";

describe("safeCallbackUrl — open redirect guard", () => {
  it("allows same-origin relative paths", () => {
    expect(safeCallbackUrl("/checkout", "/customer")).toBe("/checkout");
    expect(safeCallbackUrl("/vendor/orders", "/customer")).toBe("/vendor/orders");
  });

  it("blocks protocol-relative and absolute URLs", () => {
    expect(safeCallbackUrl("//evil.example", "/customer")).toBe("/customer");
    expect(safeCallbackUrl("https://evil.example", "/customer")).toBe("/customer");
    expect(safeCallbackUrl("http://evil.example/phish", "/customer")).toBe(
      "/customer",
    );
  });

  it("falls back for empty or non-path values", () => {
    expect(safeCallbackUrl(null, "/customer")).toBe("/customer");
    expect(safeCallbackUrl("  ", "/customer")).toBe("/customer");
    expect(safeCallbackUrl("checkout", "/customer")).toBe("/customer");
  });
});
