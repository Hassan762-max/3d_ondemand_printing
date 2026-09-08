/**
 * Central brand config — change once, use everywhere.
 * Override display name via NEXT_PUBLIC_APP_NAME.
 */
export const brand = {
  name: process.env.NEXT_PUBLIC_APP_NAME?.trim() || "Nivaro",
  tagline: "Design it. Try it on. Make it yours.",
  description:
    "Create custom clothing with AI, customize it in 3D, try it on virtually, and order from anywhere in Pakistan.",
  trustLine: "AI-powered · 3D customization · Virtual try-on · Pakistan-wide fulfillment",
  advanceAmount: Number(process.env.NEXT_PUBLIC_ADVANCE_AMOUNT ?? 500),
  region: "Pakistan",
} as const;

export type Brand = typeof brand;
