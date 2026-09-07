"use server";

import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAuthorizedUser } from "@/lib/session";

export type VendorActionResult = {
  ok: boolean;
  message?: string;
};

const statusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum([
    "IN_PRODUCTION",
    "QC",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ]),
  trackingNumber: z.string().max(80).optional(),
});

async function getVendorForUser(userId: string) {
  return prisma.vendor.findUnique({ where: { userId } });
}

export async function updateVendorOrderStatus(
  _prev: VendorActionResult,
  formData: FormData,
): Promise<VendorActionResult> {
  const user = await getAuthorizedUser("production:manage");
  if (!user) return { ok: false, message: "Vendor access required." };

  const vendor = await getVendorForUser(user.id);
  if (!vendor) return { ok: false, message: "No vendor profile linked." };

  const parsed = statusSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
    trackingNumber: formData.get("trackingNumber") || undefined,
  });
  if (!parsed.success) return { ok: false, message: "Invalid status update." };

  const order = await prisma.order.findFirst({
    where: { id: parsed.data.orderId, vendorId: vendor.id },
  });
  if (!order) return { ok: false, message: "Order not found for this vendor." };

  const allowedFrom: Record<string, OrderStatus[]> = {
    ASSIGNED: ["IN_PRODUCTION"],
    IN_PRODUCTION: ["QC", "SHIPPED"],
    QC: ["SHIPPED", "IN_PRODUCTION"],
    SHIPPED: ["OUT_FOR_DELIVERY", "DELIVERED"],
    OUT_FOR_DELIVERY: ["DELIVERED"],
  };

  const next = parsed.data.status as OrderStatus;
  if (!(allowedFrom[order.status] ?? []).includes(next)) {
    return {
      ok: false,
      message: `Cannot move from ${order.status} to ${next}.`,
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: { status: next },
    });

    if (next === "SHIPPED" || next === "OUT_FOR_DELIVERY" || next === "DELIVERED") {
      await tx.shipment.updateMany({
        where: { orderId: order.id },
        data: {
          status: next.toLowerCase(),
          trackingNumber:
            parsed.data.trackingNumber ??
            `PK-${order.orderNumber.replace("PR-", "")}`,
          carrier: `${vendor.businessName} courier`,
          shippedAt: next === "SHIPPED" ? new Date() : undefined,
          deliveredAt: next === "DELIVERED" ? new Date() : undefined,
        },
      });
    }

    if (next === "DELIVERED") {
      await tx.paymentLedger.updateMany({
        where: { orderId: order.id, kind: "COD_REMAINING", status: "PENDING" },
        data: { status: "COMPLETED", reference: `COD-${order.orderNumber}` },
      });
    }

    await tx.notification.create({
      data: {
        userId: order.userId,
        title: "Order update",
        body: `${order.orderNumber} is now ${next.replaceAll("_", " ").toLowerCase()}.`,
        href: `/orders/${order.id}`,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: "vendor.status_update",
        entity: "Order",
        entityId: order.id,
        metaJson: JSON.stringify({ from: order.status, to: next }),
      },
    });
  });

  revalidatePath("/vendor");
  revalidatePath(`/vendor/orders/${order.id}`);
  revalidatePath(`/orders/${order.id}`);
  revalidatePath("/orders");

  return { ok: true, message: `Order moved to ${next.replaceAll("_", " ")}.` };
}
