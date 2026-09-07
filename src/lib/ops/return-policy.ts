export const RETURN_REASONS = [
  { id: "printing_defect", label: "Printing defect", allowsCustom: true },
  { id: "damaged", label: "Damaged in transit", allowsCustom: true },
  { id: "wrong_product", label: "Wrong product / color / size sent", allowsCustom: true },
  { id: "vendor_mistake", label: "Vendor production mistake", allowsCustom: true },
  { id: "failed_delivery", label: "Failed delivery", allowsCustom: true },
  { id: "cod_refusal", label: "COD refused / not accepted", allowsCustom: true },
  { id: "changed_mind", label: "Changed mind", allowsCustom: false },
] as const;

export type ReturnReasonId = (typeof RETURN_REASONS)[number]["id"];

export const RETURN_RESOLUTIONS = [
  "refund",
  "reprint",
  "replacement",
  "rejected",
] as const;

export type ReturnResolution = (typeof RETURN_RESOLUTIONS)[number];

/** Customized print-on-demand return policy. */
export function canRequestReturn(input: {
  orderStatus: string;
  hasCustomDesign: boolean;
  deliveredAt?: Date | null;
  reason: ReturnReasonId;
}) {
  if (input.orderStatus === "CANCELLED" || input.orderStatus === "REFUNDED") {
    return { ok: false as const, message: "This order cannot accept return requests." };
  }

  // COD refusal / failed delivery can be filed earlier in transit.
  if (input.reason === "cod_refusal" || input.reason === "failed_delivery") {
    if (!["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(input.orderStatus)) {
      return {
        ok: false as const,
        message: "Delivery issues can be reported after the order ships.",
      };
    }
    return { ok: true as const };
  }

  if (input.orderStatus !== "DELIVERED") {
    return {
      ok: false as const,
      message: "Returns for product issues open after delivery.",
    };
  }

  const reasonMeta = RETURN_REASONS.find((r) => r.id === input.reason);
  if (!reasonMeta) {
    return { ok: false as const, message: "Unknown return reason." };
  }

  if (input.hasCustomDesign && !reasonMeta.allowsCustom) {
    return {
      ok: false as const,
      message:
        "Customized prints cannot be returned for change-of-mind. Choose a defect or fulfillment issue.",
    };
  }

  if (input.deliveredAt) {
    const days =
      (Date.now() - input.deliveredAt.getTime()) / (1000 * 60 * 60 * 24);
    if (days > 7) {
      return {
        ok: false as const,
        message: "Return window is 7 days after delivery.",
      };
    }
  }

  return { ok: true as const };
}
