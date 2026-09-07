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

export function estimateVendorCost(subtotal: number) {
  return Math.round(subtotal * 0.58);
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
  const deliveryFee = deliveryFeeForCity(city);
  const totalPayable = subtotal + deliveryFee;
  const advanceAmount = Math.min(ADVANCE_AMOUNT, totalPayable);
  const remainingAmount = Math.max(0, totalPayable - advanceAmount);
  const vendorCost = estimateVendorCost(subtotal);
  const platformMargin = Math.max(0, subtotal - vendorCost);

  return {
    subtotal,
    deliveryFee,
    advanceAmount,
    remainingAmount,
    vendorCost,
    platformMargin,
    totalPayable,
  };
}

export function generateOrderNumber() {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PR-${stamp}-${rand}`;
}
