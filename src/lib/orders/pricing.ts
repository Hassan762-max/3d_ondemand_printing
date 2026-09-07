export const ADVANCE_AMOUNT = Number(process.env.NEXT_PUBLIC_ADVANCE_AMOUNT ?? 500);

const CITY_DELIVERY: Record<string, number> = {
  karachi: 200,
  lahore: 200,
  islamabad: 200,
  rawalpindi: 220,
  faisalabad: 250,
  multan: 250,
  peshawar: 280,
  quetta: 300,
};

export function deliveryFeeForCity(city: string) {
  const key = city.trim().toLowerCase();
  return CITY_DELIVERY[key] ?? 300;
}

export function estimateVendorCost(subtotal: number, costFactor = 1) {
  const safe = Math.max(0, subtotal);
  return Math.round(safe * 0.58 * costFactor);
}

export type OrderTotals = {
  subtotal: number;
  deliveryFee: number;
  advanceAmount: number;
  remainingAmount: number;
  vendorCost: number;
  platformMargin: number;
  totalPayable: number;
};

export function computeOrderTotals(subtotal: number, city: string): OrderTotals {
  const safeSubtotal = Math.max(0, Number.isFinite(subtotal) ? subtotal : 0);
  const deliveryFee = deliveryFeeForCity(city);
  const totalPayable = safeSubtotal + deliveryFee;
  const advanceAmount = Math.min(ADVANCE_AMOUNT, totalPayable);
  const remainingAmount = Math.max(0, totalPayable - advanceAmount);
  const vendorCost = estimateVendorCost(safeSubtotal);
  const platformMargin = Math.max(0, safeSubtotal - vendorCost);

  return {
    subtotal: safeSubtotal,
    deliveryFee,
    advanceAmount,
    remainingAmount,
    vendorCost,
    platformMargin,
    totalPayable,
  };
}

/**
 * Refund only what was actually collected on the ledger.
 * Never invent COD collection from order.remainingAmount alone.
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
