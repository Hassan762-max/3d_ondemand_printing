/** Flat Pakistan-wide delivery — charged once per order. */
export const FLAT_DELIVERY_FEE = 250;

/**
 * Only design fee: Rs 100 per printed side (front and/or back).
 * There is no separate flat "sticker" charge on top of this.
 */
export const DESIGN_SIDE_PRICE = 100;

/**
 * @deprecated Advance + COD split removed; always 0. Kept briefly for any stale imports.
 */
export const ADVANCE_AMOUNT = 0;

export function deliveryFeeForCity(city?: string) {
  void city;
  return FLAT_DELIVERY_FEE;
}

export function estimateVendorCost(subtotal: number, costFactor = 1) {
  const safe = Math.max(0, subtotal);
  return Math.round(safe * 0.58 * costFactor);
}

/** Count sides that have a design (front and/or back). Same design on both sides = 2. */
export function countDesignSides(placement: {
  front?: { designId?: string | null } | null;
  back?: { designId?: string | null } | null;
}): number {
  let n = 0;
  if (placement.front?.designId) n += 1;
  if (placement.back?.designId) n += 1;
  return n;
}

export type LinePriceBreakdown = {
  basePrice: number;
  designSides: number;
  /** DESIGN_SIDE_PRICE × designSides — the only print fee. */
  designFee: number;
  unitPrice: number;
  hasFront: boolean;
  hasBack: boolean;
};

/**
 * Unit price for one apparel item:
 * basePrice + DESIGN_SIDE_PRICE × sides with a design.
 * No additional sticker/design surcharge.
 */
export function computeLineUnitPrice(basePrice: number, designSides: number): number {
  return linePriceBreakdown(basePrice, designSides).unitPrice;
}

/**
 * Structured unit price for cart/PDP breakdowns.
 * Prefer `{ front, back }` so labels match the printed sides;
 * a bare side count is fine when only the total fee matters.
 */
export function linePriceBreakdown(
  basePrice: number,
  input: number | { front?: boolean; back?: boolean },
): LinePriceBreakdown {
  const base = Math.max(0, Number.isFinite(basePrice) ? Math.round(basePrice) : 0);
  let hasFront = false;
  let hasBack = false;
  let count: number;

  if (typeof input === "number") {
    count = Math.max(0, Math.floor(Number.isFinite(input) ? input : 0));
    hasFront = count >= 1;
    hasBack = count >= 2;
  } else {
    hasFront = Boolean(input.front);
    hasBack = Boolean(input.back);
    count = (hasFront ? 1 : 0) + (hasBack ? 1 : 0);
  }

  const designFee = DESIGN_SIDE_PRICE * count;
  return {
    basePrice: base,
    designSides: count,
    designFee,
    unitPrice: base + designFee,
    hasFront,
    hasBack,
  };
}

export type OrderTotals = {
  subtotal: number;
  deliveryFee: number;
  /** Always 0 — online advance removed; full amount is COD. */
  advanceAmount: number;
  remainingAmount: number;
  vendorCost: number;
  platformMargin: number;
  totalPayable: number;
};

export function computeOrderTotals(subtotal: number, city?: string): OrderTotals {
  void city;
  const safeSubtotal = Math.max(0, Number.isFinite(subtotal) ? subtotal : 0);
  const deliveryFee = FLAT_DELIVERY_FEE;
  const totalPayable = safeSubtotal + deliveryFee;
  const vendorCost = estimateVendorCost(safeSubtotal);
  const platformMargin = Math.max(0, safeSubtotal - vendorCost);

  return {
    subtotal: safeSubtotal,
    deliveryFee,
    advanceAmount: 0,
    remainingAmount: totalPayable,
    vendorCost,
    platformMargin,
    totalPayable,
  };
}

/**
 * Refund only what was actually collected on the ledger.
 * Never invent COD collection from order.remainingAmount alone.
 * Historical ADVANCE rows are still counted for older orders.
 */
export function computeRefundAmount(
  payments: { kind: string; status: string; amount: number }[],
) {
  return payments
    .filter(
      (p) =>
        p.status === "COMPLETED" &&
        (p.kind === "ADVANCE" || p.kind === "COD_REMAINING"),
    )
    .reduce((sum, p) => sum + Math.max(0, p.amount), 0);
}

export function generateOrderNumber() {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PR-${stamp}-${rand}`;
}
