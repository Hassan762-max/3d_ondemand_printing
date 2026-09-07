import { describe, expect, it } from "vitest";
import {
  previewCodCollection,
  shouldCollectCodOnDelivery,
} from "@/lib/orders/cod";

describe("COD collection on delivery", () => {
  it("only triggers on DELIVERED", () => {
    expect(shouldCollectCodOnDelivery("DELIVERED")).toBe(true);
    expect(shouldCollectCodOnDelivery("OUT_FOR_DELIVERY")).toBe(false);
    expect(shouldCollectCodOnDelivery("SHIPPED")).toBe(false);
  });

  it("previews pending COD amount accurately", () => {
    const preview = previewCodCollection([
      { kind: "ADVANCE", status: "COMPLETED", amount: 500 },
      { kind: "COD_REMAINING", status: "PENDING", amount: 1800 },
      { kind: "COD_REMAINING", status: "COMPLETED", amount: 100 },
    ]);
    expect(preview.pendingBefore).toBe(1800);
    expect(preview.collected).toBe(1800);
  });
});
