"use server";

import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { shouldCollectCodOnDelivery } from "@/lib/orders/cod";
import { getAuthorizedUser } from "@/lib/session";
import { canVendorTransition } from "@/lib/vendor/status-transitions";
import {
  customerStatusNotification,
  resolveTrackingNumber,
} from "@/lib/vendor/tracking";

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
    trackingNumber:
      String(formData.get("trackingNumber") ?? "").trim() || undefined,
  });
  if (!parsed.success) return { ok: false, message: "Invalid status update." };

  const order = await prisma.order.findFirst({
    where: { id: parsed.data.orderId, vendorId: vendor.id },
    include: { shipments: { orderBy: { id: "asc" }, take: 1 } },
  });
  if (!order) return { ok: false, message: "Order not found for this vendor." };

  const next = parsed.data.status as OrderStatus;
  if (!canVendorTransition(order.status, next)) {
    return {
      ok: false,
      message: `Cannot move from ${order.status} to ${next}.`,
    };
  }

  const existingTracking = order.shipments[0]?.trackingNumber?.trim() || null;
  const trackingNumber = resolveTrackingNumber({
    existing: existingTracking,
    fromForm: parsed.data.trackingNumber,
    orderNumber: order.orderNumber,
    vendorCity: vendor.city,
  });

  const shipmentStatus =
    next === "IN_PRODUCTION"
      ? "in_production"
      : next === "QC"
        ? "qc"
        : next === "SHIPPED"
          ? "shipped"
          : next === "OUT_FOR_DELIVERY"
            ? "out_for_delivery"
            : next === "DELIVERED"
              ? "delivered"
              : "pending";

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: { status: next },
    });

    const shipmentData = {
      status: shipmentStatus,
      trackingNumber,
      carrier: `${vendor.businessName} courier`,
      shippedAt:
        next === "SHIPPED" ||
        next === "OUT_FOR_DELIVERY" ||
        next === "DELIVERED"
          ? (order.shipments[0]?.shippedAt ?? new Date())
          : (order.shipments[0]?.shippedAt ?? undefined),
      deliveredAt: next === "DELIVERED" ? new Date() : undefined,
    };

    if (order.shipments[0]) {
      await tx.shipment.update({
        where: { id: order.shipments[0].id },
        data: shipmentData,
      });
    } else {
      await tx.shipment.create({
        data: {
          orderId: order.id,
          ...shipmentData,
        },
      });
    }

    if (shouldCollectCodOnDelivery(next)) {
      await tx.paymentLedger.updateMany({
        where: {
          orderId: order.id,
          kind: "COD_REMAINING",
          status: "PENDING",
        },
        data: {
          status: "COMPLETED",
          reference: `COD-${order.orderNumber}`,
        },
      });
    }

    const notice = customerStatusNotification({
      orderNumber: order.orderNumber,
      status: next,
      trackingNumber,
      vendorName: vendor.businessName,
    });

    await tx.notification.create({
      data: {
        userId: order.userId,
        title: notice.title,
        body: notice.body,
        href: `/orders/${order.id}`,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: "vendor.status_update",
        entity: "Order",
        entityId: order.id,
        metaJson: JSON.stringify({
          from: order.status,
          to: next,
          trackingNumber,
        }),
      },
    });
  });

  revalidatePath("/vendor");
  revalidatePath("/vendor/queue");
  revalidatePath("/vendor/jobs");
  revalidatePath(`/vendor/orders/${order.id}`);
  revalidatePath(`/orders/${order.id}`);
  revalidatePath("/orders");
  revalidatePath("/customer");

  const notice = customerStatusNotification({
    orderNumber: order.orderNumber,
    status: next,
    trackingNumber,
    vendorName: vendor.businessName,
  });

  return {
    ok: true,
    message:
      next === "IN_PRODUCTION"
        ? `Production started. Tracking ${trackingNumber} assigned. Customer notified.`
        : next === "DELIVERED"
          ? `Order completed. Tracking ${trackingNumber}. Customer notified.`
          : `${notice.title}. Tracking ${trackingNumber}. Customer notified.`,
  };
}
