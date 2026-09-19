import { describe, expect, it } from "vitest";
import { canRequestReturn } from "@/lib/ops/return-policy";

describe("canRequestReturn — policy state machine", () => {
  it("blocks change-of-mind for customized prints", () => {
    const res = canRequestReturn({
      orderStatus: "DELIVERED",
      hasCustomDesign: true,
      deliveredAt: new Date(),
      reason: "changed_mind",
    });
    expect(res.ok).toBe(false);
  });

  it("allows defect returns within 7 days of delivery", () => {
    const res = canRequestReturn({
      orderStatus: "DELIVERED",
      hasCustomDesign: true,
      deliveredAt: new Date(),
      reason: "printing_defect",
    });
    expect(res.ok).toBe(true);
  });

  it("rejects product returns before delivery", () => {
    const res = canRequestReturn({
      orderStatus: "SHIPPED",
      hasCustomDesign: true,
      reason: "printing_defect",
    });
    expect(res.ok).toBe(false);
  });

  it("allows COD refusal while out for delivery", () => {
    const res = canRequestReturn({
      orderStatus: "OUT_FOR_DELIVERY",
      hasCustomDesign: true,
      reason: "cod_refusal",
    });
    expect(res.ok).toBe(true);
  });

  it("enforces 7-day window when deliveredAt is set", () => {
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
    const res = canRequestReturn({
      orderStatus: "DELIVERED",
      hasCustomDesign: false,
      deliveredAt: eightDaysAgo,
      reason: "changed_mind",
    });
    expect(res.ok).toBe(false);
  });

  it("blocks cancelled and refunded orders", () => {
    expect(
      canRequestReturn({
        orderStatus: "CANCELLED",
        hasCustomDesign: false,
        reason: "printing_defect",
      }).ok,
    ).toBe(false);
    expect(
      canRequestReturn({
        orderStatus: "REFUNDED",
        hasCustomDesign: false,
        reason: "printing_defect",
      }).ok,
    ).toBe(false);
  });

  it("blocks failed_delivery before the order ships", () => {
    const res = canRequestReturn({
      orderStatus: "IN_PRODUCTION",
      hasCustomDesign: true,
      reason: "failed_delivery",
    });
    expect(res.ok).toBe(false);
    expect(res.message).toMatch(/after the order ships/i);
  });

  it("allows change-of-mind for non-custom orders within 7 days", () => {
    const res = canRequestReturn({
      orderStatus: "DELIVERED",
      hasCustomDesign: false,
      deliveredAt: new Date(),
      reason: "changed_mind",
    });
    expect(res.ok).toBe(true);
  });
});
