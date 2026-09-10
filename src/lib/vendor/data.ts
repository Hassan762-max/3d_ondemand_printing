import { prisma } from "@/lib/db";

export const QUEUE_STATUSES = [
  "ASSIGNED",
  "IN_PRODUCTION",
  "QC",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
] as const;

export async function getVendorForUser(userId: string) {
  return prisma.vendor.findUnique({ where: { userId } });
}

export async function getVendorOrders(vendorId: string) {
  return prisma.order.findMany({
    where: { vendorId },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      assignments: { orderBy: { assignedAt: "desc" }, take: 1 },
    },
  });
}

export function isQueueOrder(status: string) {
  return (QUEUE_STATUSES as readonly string[]).includes(status);
}
