import { DESIGN_SIDE_PRICE, FLAT_DELIVERY_FEE } from "@/lib/orders/pricing";

/**
 * Central brand config — change once, use everywhere.
 * Override display name via NEXT_PUBLIC_APP_NAME.
 */
export const brand = {
  name: process.env.NEXT_PUBLIC_APP_NAME?.trim() || "Nivaro",
  tagline: "Design it. Print it. Make it yours.",
  description:
    "Create custom clothing, place your design on quality blanks, and order from anywhere in Pakistan.",
  trustLine: "Custom print · Quality blanks · Pakistan-wide fulfillment",
  deliveryFee: FLAT_DELIVERY_FEE,
  designSidePrice: DESIGN_SIDE_PRICE,
  region: "Pakistan",
} as const;

export type Brand = typeof brand;
