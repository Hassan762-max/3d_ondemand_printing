"use server";

import { revalidatePath } from "next/cache";
import type { Role } from "@prisma/client";
import { z } from "zod";
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

const roleSchema = z.enum([
  "CUSTOMER",
  "DESIGNER",
  "VENDOR",
  "PRODUCTION_MANAGER",
  "QC_MANAGER",
  "SUPPORT_MANAGER",
  "FINANCE_MANAGER",
  "ADMIN",
]);

export async function setUserRole(
  userId: string,
  role: string,
): Promise<AdminActionResult> {
  const admin = await requireUser("user:manage");
  const parsed = roleSchema.safeParse(role);
  if (!parsed.success) return { ok: false, message: "Invalid role." };
  if (userId === admin.id) {
    return { ok: false, message: "You cannot change your own role here." };
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { ok: false, message: "User not found." };
  if (target.role === "SUPER_ADMIN") {
    return { ok: false, message: "Cannot modify SUPER_ADMIN." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: parsed.data as Role },
  });
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "user.role",
      entity: "User",
      entityId: userId,
      metaJson: JSON.stringify({ from: target.role, to: parsed.data }),
    },
  });

  revalidatePath("/admin");
  return { ok: true, message: `Role set to ${parsed.data}.` };
}

export async function setUserActive(
  userId: string,
  active: boolean,
): Promise<AdminActionResult> {
  const admin = await requireUser("user:manage");
  if (userId === admin.id) {
    return { ok: false, message: "You cannot deactivate yourself." };
  }
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { ok: false, message: "User not found." };
  if (target.role === "SUPER_ADMIN") {
    return { ok: false, message: "Cannot deactivate SUPER_ADMIN." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { active },
  });
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: active ? "user.activate" : "user.deactivate",
      entity: "User",
      entityId: userId,
    },
  });

  revalidatePath("/admin");
  return { ok: true, message: active ? "User activated." : "User deactivated." };
}
