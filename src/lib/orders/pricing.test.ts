import { describe, expect, it } from "vitest";
import {
  ADVANCE_AMOUNT,
  computeOrderTotals,
  computeRefundAmount,
  deliveryFeeForCity,
  estimateVendorCost,
} from "@/lib/orders/pricing";

describe("computeOrderTotals — money accuracy", () => {
  it("splits Rs.500 advance and COD remainder for a normal Lahore order", () => {
    const t = computeOrderTotals(2499, "Lahore");
    expect(t.deliveryFee).toBe(200);
    expect(t.totalPayable).toBe(2699);
    expect(t.advanceAmount).toBe(ADVANCE_AMOUNT);
    expect(t.remainingAmount).toBe(2699 - ADVANCE_AMOUNT);
    expect(t.advanceAmount + t.remainingAmount).toBe(t.totalPayable);
    expect(t.vendorCost).toBe(estimateVendorCost(2499));
    expect(t.platformMargin).toBe(2499 - t.vendorCost);
  });

  it("clamps advance when order is cheaper than ADVANCE_AMOUNT", () => {
    const t = computeOrderTotals(100, "Karachi");
    expect(t.totalPayable).toBe(300);
    expect(t.advanceAmount).toBe(300);
    expect(t.remainingAmount).toBe(0);
  });

  it("never goes negative on bad subtotals", () => {
    const t = computeOrderTotals(-50, "Quetta");
    expect(t.subtotal).toBe(0);
    expect(t.remainingAmount).toBeGreaterThanOrEqual(0);
    expect(t.vendorCost).toBe(0);
  });

  it("uses default delivery fee for unknown cities", () => {
    expect(deliveryFeeForCity("Gilgit")).toBe(300);
  });
});

describe("computeRefundAmount — ledger fidelity", () => {
  it("refunds only completed advance when COD is still pending", () => {
    const amount = computeRefundAmount([
      { kind: "ADVANCE", status: "COMPLETED", amount: 500 },
      { kind: "COD_REMAINING", status: "PENDING", amount: 2199 },
    ]);
    expect(amount).toBe(500);
  });

  it("includes completed COD after delivery collection", () => {
    const amount = computeRefundAmount([
      { kind: "ADVANCE", status: "COMPLETED", amount: 500 },
      { kind: "COD_REMAINING", status: "COMPLETED", amount: 2199 },
    ]);
    expect(amount).toBe(2699);
  });

  it("ignores refunds and settlements in the refund basis", () => {
    const amount = computeRefundAmount([
      { kind: "ADVANCE", status: "COMPLETED", amount: 500 },
      { kind: "VENDOR_SETTLEMENT", status: "COMPLETED", amount: 1000 },
      { kind: "REFUND", status: "COMPLETED", amount: 500 },
    ]);
    expect(amount).toBe(500);
  });
});
