import type { OrderStatus } from "@prisma/client";

export type TrackingStep = {
  key: OrderStatus | "PLACED";
  label: string;
  description: string;
};

export const TRACKING_STEPS: TrackingStep[] = [
  {
    key: "ADVANCE_PAID",
    label: "Order confirmed",
    description: "Order placed · full amount due on COD",
  },
  {
    key: "ASSIGNED",
    label: "Vendor assigned",
    description: "Best Pakistan vendor selected for production",
  },
  {
    key: "IN_PRODUCTION",
    label: "In production",
    description: "Printing and finishing in progress",
  },
  {
    key: "QC",
    label: "Quality check",
    description: "Print QC before dispatch",
  },
  {
    key: "SHIPPED",
    label: "Shipped",
    description: "Handed to courier",
  },
  {
    key: "OUT_FOR_DELIVERY",
    label: "Out for delivery",
    description: "Courier is on the way · COD due on delivery",
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    description: "Delivered to customer",
  },
];

const STATUS_RANK: Record<string, number> = {
  PENDING_PAYMENT: 0,
  ADVANCE_PAID: 1,
  ASSIGNED: 2,
  IN_PRODUCTION: 3,
  QC: 4,
  SHIPPED: 5,
  OUT_FOR_DELIVERY: 6,
  DELIVERED: 7,
  CANCELLED: -1,
  RETURN_REQUESTED: 7,
  REFUNDED: -1,
  REPRINT: 3,
  REPLACEMENT: 3,
  DRAFT: 0,
};

export function trackingProgress(status: OrderStatus) {
  const current = STATUS_RANK[status] ?? 0;
  return TRACKING_STEPS.map((step) => {
    const stepRank = STATUS_RANK[step.key] ?? 0;
    return {
      ...step,
      state:
        status === "CANCELLED" || status === "REFUNDED"
          ? ("cancelled" as const)
          : current >= stepRank
            ? ("done" as const)
            : ("todo" as const),
    };
  });
}

export function statusLabel(status: OrderStatus) {
  return status.replaceAll("_", " ");
}
