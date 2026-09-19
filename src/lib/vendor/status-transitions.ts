import type { OrderStatus } from "@prisma/client";

/** Vendor portal may only move orders along this production → delivery path. */
export const VENDOR_STATUS_TRANSITIONS: Partial<
  Record<OrderStatus, OrderStatus[]>
> = {
  ASSIGNED: ["IN_PRODUCTION"],
  IN_PRODUCTION: ["QC", "SHIPPED"],
  QC: ["SHIPPED", "IN_PRODUCTION"],
  SHIPPED: ["OUT_FOR_DELIVERY", "DELIVERED"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
};

export function canVendorTransition(
  from: OrderStatus | string,
  to: OrderStatus | string,
) {
  return (VENDOR_STATUS_TRANSITIONS[from as OrderStatus] ?? []).includes(
    to as OrderStatus,
  );
}
