import { describe, expect, it } from "vitest";
import {
  DESIGN_SIDE_PRICE,
  FLAT_DELIVERY_FEE,
  computeLineUnitPrice,
  computeOrderTotals,
  computeRefundAmount,
  countDesignSides,
  deliveryFeeForCity,
  estimateVendorCost,
  generateOrderNumber,
  linePriceBreakdown,
} from "@/lib/orders/pricing";

describe("computeLineUnitPrice — base + design sides", () => {
  it("charges base only for blank items", () => {
    expect(computeLineUnitPrice(400, 0)).toBe(400);
  });

  it("adds Rs.100 per designed side only (no flat sticker fee)", () => {
    expect(computeLineUnitPrice(400, 1)).toBe(500);
    expect(computeLineUnitPrice(400, 2)).toBe(600);
    expect(DESIGN_SIDE_PRICE).toBe(100);
  });

  it("never goes negative", () => {
    expect(computeLineUnitPrice(-10, -2)).toBe(0);
  });
});

describe("linePriceBreakdown", () => {
  it("labels front/back print fees from side flags", () => {
    const both = linePriceBreakdown(400, { front: true, back: true });
    expect(both).toMatchObject({
      basePrice: 400,
      designSides: 2,
      designFee: 200,
      unitPrice: 600,
      hasFront: true,
      hasBack: true,
    });

    const backOnly = linePriceBreakdown(400, { front: false, back: true });
    expect(backOnly).toMatchObject({
      designSides: 1,
      designFee: 100,
      unitPrice: 500,
      hasFront: false,
      hasBack: true,
    });
  });
});

describe("countDesignSides", () => {
  it("counts front and back independently", () => {
    expect(countDesignSides({})).toBe(0);
    expect(countDesignSides({ front: { designId: "a" } })).toBe(1);
    expect(
      countDesignSides({ front: { designId: "a" }, back: { designId: "b" } }),
    ).toBe(2);
    expect(
      countDesignSides({ front: { designId: "a" }, back: { designId: "a" } }),
    ).toBe(2);
  });
});

describe("computeOrderTotals — money accuracy", () => {
  it("uses flat delivery and full COD (no advance)", () => {
    const t = computeOrderTotals(500, "Lahore");
    expect(t.deliveryFee).toBe(FLAT_DELIVERY_FEE);
    expect(t.totalPayable).toBe(500 + FLAT_DELIVERY_FEE);
    expect(t.advanceAmount).toBe(0);
    expect(t.remainingAmount).toBe(t.totalPayable);
    expect(t.vendorCost).toBe(estimateVendorCost(500));
    expect(t.platformMargin).toBe(500 - t.vendorCost);
  });

  it("ignores city for delivery fee", () => {
    expect(computeOrderTotals(400, "Karachi").deliveryFee).toBe(FLAT_DELIVERY_FEE);
    expect(computeOrderTotals(400, "Gilgit").deliveryFee).toBe(FLAT_DELIVERY_FEE);
    expect(deliveryFeeForCity("Quetta")).toBe(FLAT_DELIVERY_FEE);
  });

  it("never goes negative on bad subtotals", () => {
    const t = computeOrderTotals(-50, "Quetta");
    expect(t.subtotal).toBe(0);
    expect(t.remainingAmount).toBe(FLAT_DELIVERY_FEE);
    expect(t.vendorCost).toBe(0);
  });

  it("matches PO formula for a dual-sided tee order", () => {
    const unit = computeLineUnitPrice(400, 2);
    expect(unit).toBe(400 + DESIGN_SIDE_PRICE * 2);
    const subtotal = unit * 2; // qty 2
    const t = computeOrderTotals(subtotal, "Islamabad");
    expect(t.totalPayable).toBe(subtotal + FLAT_DELIVERY_FEE);
  });
});

describe("computeRefundAmount — ledger fidelity", () => {
  it("refunds nothing when only COD is pending (no online capture)", () => {
    const amount = computeRefundAmount([
      { kind: "COD_REMAINING", status: "PENDING", amount: 750 },
    ]);
    expect(amount).toBe(0);
  });

  it("includes completed COD after delivery collection", () => {
    const amount = computeRefundAmount([
      { kind: "COD_REMAINING", status: "COMPLETED", amount: 750 },
    ]);
    expect(amount).toBe(750);
  });

  it("still honors historical completed ADVANCE rows", () => {
    const amount = computeRefundAmount([
      { kind: "ADVANCE", status: "COMPLETED", amount: 500 },
      { kind: "COD_REMAINING", status: "PENDING", amount: 2199 },
    ]);
    expect(amount).toBe(500);
  });

  it("ignores refunds and settlements in the refund basis", () => {
    const amount = computeRefundAmount([
      { kind: "COD_REMAINING", status: "COMPLETED", amount: 750 },
      { kind: "VENDOR_SETTLEMENT", status: "COMPLETED", amount: 1000 },
      { kind: "REFUND", status: "COMPLETED", amount: 750 },
    ]);
    expect(amount).toBe(750);
  });
});

describe("generateOrderNumber", () => {
  it("matches PR-YYYYMMDD-#### shape", () => {
    expect(generateOrderNumber()).toMatch(/^PR-\d{8}-\d{4}$/);
  });
});
