"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export type AdminActionResult = {
  ok: boolean;
  message?: string;
};

export async function toggleProductActive(
  productId: string,
): Promise<AdminActionResult> {
  const user = await requireUser("catalog:write");
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { ok: false, message: "Product not found." };

  await prisma.product.update({
    where: { id: productId },
    data: { active: !product.active },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: product.active ? "product.deactivate" : "product.activate",
      entity: "Product",
      entityId: productId,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/products");
  revalidatePath(`/products/${product.slug}`);
  return {
    ok: true,
    message: product.active ? "Product deactivated." : "Product activated.",
  };
}

export async function settleVendorOrder(orderId: string): Promise<AdminActionResult> {
  const user = await requireUser("finance:manage");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      vendor: true,
      payments: { where: { kind: "VENDOR_SETTLEMENT" } },
    },
  });
  if (!order) return { ok: false, message: "Order not found." };
  if (!order.vendorId || !order.vendor) {
    return { ok: false, message: "Order has no vendor assigned." };
  }
  if (order.status !== "DELIVERED" && order.status !== "REFUNDED") {
    return { ok: false, message: "Settle only after delivery (or record adjustment on refund)." };
  }
  if (order.payments.some((p) => p.status === "COMPLETED" || p.status === "PENDING")) {
    return { ok: false, message: "Settlement already exists for this order." };
  }
  if (order.vendorCost <= 0) {
    return { ok: false, message: "Vendor cost is zero — nothing to settle." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.paymentLedger.create({
      data: {
        orderId: order.id,
        kind: "VENDOR_SETTLEMENT",
        amount: order.vendorCost,
        status: "COMPLETED",
        method: "MANUAL_SETTLEMENT",
        reference: `SET-${order.orderNumber}`,
        metaJson: JSON.stringify({
          vendorId: order.vendorId,
          vendor: order.vendor?.businessName,
        }),
      },
    });

    if (order.vendor?.userId) {
      await tx.notification.create({
        data: {
          userId: order.vendor.userId,
          title: "Settlement paid",
          body: `${order.orderNumber}: Rs. ${order.vendorCost} settled.`,
          href: `/vendor/orders/${order.id}`,
        },
      });
    }

    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: "vendor.settle",
        entity: "Order",
        entityId: order.id,
        metaJson: JSON.stringify({ amount: order.vendorCost }),
      },
    });
  });

  revalidatePath("/admin");
  revalidatePath("/ops");
  revalidatePath(`/orders/${order.id}`);
  revalidatePath(`/vendor/orders/${order.id}`);
  return { ok: true, message: `Settled Rs. ${order.vendorCost} to vendor.` };
}

/** Finance fallback when COD was received but vendor status was not flipped. */
export async function collectCodRemaining(
  orderId: string,
): Promise<AdminActionResult> {
  const user = await requireUser("finance:manage");
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      payments: { where: { kind: "COD_REMAINING", status: "PENDING" } },
    },
  });
  if (!order) return { ok: false, message: "Order not found." };
  if (order.status !== "DELIVERED" && order.status !== "RETURN_REQUESTED") {
    return { ok: false, message: "COD collection applies after delivery." };
  }
  if (order.payments.length === 0) {
    return { ok: false, message: "No pending COD amount on this order." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.paymentLedger.updateMany({
      where: { orderId: order.id, kind: "COD_REMAINING", status: "PENDING" },
      data: { status: "COMPLETED", reference: `COD-FIN-${order.orderNumber}` },
    });
    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: "cod.collect",
        entity: "Order",
        entityId: order.id,
      },
    });
  });

  revalidatePath("/admin");
  revalidatePath(`/orders/${order.id}`);
  return { ok: true, message: "COD marked collected." };
}
