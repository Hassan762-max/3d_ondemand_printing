"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  canRequestReturn,
  RETURN_REASONS,
  type ReturnReasonId,
  type ReturnResolution,
} from "@/lib/ops/return-policy";
import { computeRefundAmount } from "@/lib/orders/pricing";
import { getAuthorizedUser, requireUser } from "@/lib/session";

export type OpsActionResult = {
  ok: boolean;
  message?: string;
  id?: string;
};

const requestSchema = z.object({
  orderId: z.string().min(1),
  reason: z.string().min(2),
  details: z.string().max(500).optional(),
});

export async function createReturnRequest(
  _prev: OpsActionResult,
  formData: FormData,
): Promise<OpsActionResult> {
  const user = await getAuthorizedUser("order:read_own");
  if (!user) return { ok: false, message: "Please sign in." };

  const parsed = requestSchema.safeParse({
    orderId: formData.get("orderId"),
    reason: formData.get("reason"),
    details: formData.get("details") || undefined,
  });
  if (!parsed.success) return { ok: false, message: "Invalid return request." };

  const reason = parsed.data.reason as ReturnReasonId;
  if (!RETURN_REASONS.some((r) => r.id === reason)) {
    return { ok: false, message: "Select a valid reason." };
  }

  const order = await prisma.order.findFirst({
    where: { id: parsed.data.orderId, userId: user.id },
    include: {
      items: true,
      shipments: true,
      returns: { where: { status: { in: ["open", "approved"] } } },
    },
  });
  if (!order) return { ok: false, message: "Order not found." };
  if (order.returns.length > 0) {
    return { ok: false, message: "An open return already exists for this order." };
  }

  const hasCustomDesign = order.items.some((i) => Boolean(i.designId));
  const deliveredAt =
    order.shipments.find((s) => s.deliveredAt)?.deliveredAt ?? null;

  const policy = canRequestReturn({
    orderStatus: order.status,
    hasCustomDesign,
    deliveredAt,
    reason,
  });
  if (!policy.ok) return { ok: false, message: policy.message };

  const reasonLabel =
    RETURN_REASONS.find((r) => r.id === reason)?.label ?? reason;
  const body = parsed.data.details
    ? `${reasonLabel}: ${parsed.data.details}`
    : reasonLabel;

  const created = await prisma.$transaction(async (tx) => {
    const ret = await tx.returnRequest.create({
      data: {
        orderId: order.id,
        reason: body,
        status: "open",
      },
    });

    await tx.order.update({
      where: { id: order.id },
      data: { status: "RETURN_REQUESTED" },
    });

    await tx.notification.create({
      data: {
        userId: user.id,
        title: "Return requested",
        body: `${order.orderNumber}: ${reasonLabel}`,
        href: `/orders/${order.id}`,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: "return.create",
        entity: "ReturnRequest",
        entityId: ret.id,
        metaJson: JSON.stringify({ reason, orderId: order.id }),
      },
    });

    return ret;
  });

  revalidatePath(`/orders/${order.id}`);
  revalidatePath("/orders");
  revalidatePath("/ops");
  return { ok: true, id: created.id, message: "Return request submitted." };
}

const resolveSchema = z.object({
  returnId: z.string().min(1),
  resolution: z.enum(["refund", "reprint", "replacement", "rejected"]),
  note: z.string().max(400).optional(),
});

export async function resolveReturnRequest(
  _prev: OpsActionResult,
  formData: FormData,
): Promise<OpsActionResult> {
  const support = await getAuthorizedUser("support:manage");
  const finance = await getAuthorizedUser("order:refund");
  const actor = support ?? finance;
  if (!actor) return { ok: false, message: "Support or finance access required." };

  const parsed = resolveSchema.safeParse({
    returnId: formData.get("returnId"),
    resolution: formData.get("resolution"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) return { ok: false, message: "Invalid resolution." };

  const ret = await prisma.returnRequest.findUnique({
    where: { id: parsed.data.returnId },
    include: {
      order: {
        include: {
          items: true,
          vendor: true,
          payments: true,
        },
      },
    },
  });
  if (!ret || ret.status !== "open") {
    return { ok: false, message: "Return is not open." };
  }

  const resolution = parsed.data.resolution as ReturnResolution;

  await prisma.$transaction(async (tx) => {
    await tx.returnRequest.update({
      where: { id: ret.id },
      data: {
        status: resolution === "rejected" ? "rejected" : "resolved",
        resolution: parsed.data.note
          ? `${resolution}: ${parsed.data.note}`
          : resolution,
      },
    });

    if (resolution === "refund") {
      const refundAmount = computeRefundAmount(ret.order.payments);
      await tx.order.update({
        where: { id: ret.orderId },
        data: { status: "REFUNDED" },
      });
      if (refundAmount > 0) {
        await tx.paymentLedger.create({
          data: {
            orderId: ret.orderId,
            kind: "REFUND",
            amount: refundAmount,
            status: "PENDING",
            method: "MANUAL_REFUND",
            metaJson: JSON.stringify({
              returnId: ret.id,
              reason: ret.reason,
              basis: "completed_ledger_only",
            }),
          },
        });
      }
      if (ret.order.vendorId) {
        await bumpVendorMetric(tx, ret.order.vendorId, "returnRate", 0.02);
      }
    }

    if (resolution === "reprint" || resolution === "replacement") {
      await tx.order.update({
        where: { id: ret.orderId },
        data: {
          status: resolution === "reprint" ? "REPRINT" : "REPLACEMENT",
        },
      });
      if (ret.order.vendorId) {
        await bumpVendorMetric(tx, ret.order.vendorId, "defectRate", 0.015);
        await bumpVendorMetric(tx, ret.order.vendorId, "returnRate", 0.01);
      }
    }

    if (resolution === "rejected") {
      await tx.order.update({
        where: { id: ret.orderId },
        data: { status: "DELIVERED" },
      });
    }

    await tx.notification.create({
      data: {
        userId: ret.order.userId,
        title: "Return update",
        body: `${ret.order.orderNumber}: return ${resolution}.`,
        href: `/orders/${ret.orderId}`,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: actor.id,
        action: "return.resolve",
        entity: "ReturnRequest",
        entityId: ret.id,
        metaJson: JSON.stringify({ resolution }),
      },
    });
  });

  revalidatePath("/ops");
  revalidatePath(`/orders/${ret.orderId}`);
  return { ok: true, message: `Return marked as ${resolution}.` };
}

export async function approveRefund(paymentId: string): Promise<OpsActionResult> {
  const user = await requireUser("order:refund");

  const payment = await prisma.paymentLedger.findUnique({
    where: { id: paymentId },
    include: { order: true },
  });
  if (!payment || payment.kind !== "REFUND") {
    return { ok: false, message: "Refund entry not found." };
  }
  if (payment.status !== "PENDING") {
    return { ok: false, message: "Refund is not pending." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.paymentLedger.update({
      where: { id: payment.id },
      data: {
        status: "COMPLETED",
        reference: `REF-${payment.order.orderNumber}`,
      },
    });
    await tx.notification.create({
      data: {
        userId: payment.order.userId,
        title: "Refund completed",
        body: `${payment.order.orderNumber}: ${payment.amount} PKR refunded.`,
        href: `/orders/${payment.orderId}`,
      },
    });
    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: "refund.approve",
        entity: "PaymentLedger",
        entityId: payment.id,
      },
    });
  });

  revalidatePath("/ops");
  revalidatePath(`/orders/${payment.orderId}`);
  return { ok: true, message: "Refund approved." };
}

export async function qcDecision(
  _prev: OpsActionResult,
  formData: FormData,
): Promise<OpsActionResult> {
  const user = await requireUser("qc:manage");
  const orderId = String(formData.get("orderId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("note") ?? "");

  if (!orderId || !["pass", "fail"].includes(decision)) {
    return { ok: false, message: "Invalid QC decision." };
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { ok: false, message: "Order not found." };
  if (!["QC", "IN_PRODUCTION", "REPRINT", "REPLACEMENT"].includes(order.status)) {
    return { ok: false, message: "Order is not in a QC-ready state." };
  }

  await prisma.$transaction(async (tx) => {
    if (decision === "pass") {
      await tx.order.update({
        where: { id: order.id },
        data: { status: "SHIPPED" },
      });
      await tx.shipment.updateMany({
        where: { orderId: order.id },
        data: {
          status: "shipped",
          shippedAt: new Date(),
          trackingNumber: `PK-QC-${order.orderNumber.replace("PR-", "")}`,
        },
      });
    } else {
      await tx.order.update({
        where: { id: order.id },
        data: { status: "IN_PRODUCTION" },
      });
      if (order.vendorId) {
        await bumpVendorMetric(tx, order.vendorId, "qcFailRate", 0.02);
        await bumpVendorMetric(tx, order.vendorId, "defectRate", 0.01);
      }
    }

    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: `qc.${decision}`,
        entity: "Order",
        entityId: order.id,
        metaJson: JSON.stringify({ note }),
      },
    });

    await tx.notification.create({
      data: {
        userId: order.userId,
        title: decision === "pass" ? "QC passed" : "QC failed — reprinting",
        body: `${order.orderNumber}: ${note || decision}`,
        href: `/orders/${order.id}`,
      },
    });
  });

  revalidatePath("/ops");
  revalidatePath(`/orders/${order.id}`);
  return {
    ok: true,
    message: decision === "pass" ? "QC passed · marked shipped." : "QC failed · back to production.",
  };
}

async function bumpVendorMetric(
  // Prisma interactive transaction client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: any,
  vendorId: string,
  field: "returnRate" | "defectRate" | "qcFailRate" | "cancelRate",
  delta: number,
) {
  const vendor = await tx.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor) return;
  const next = Math.min(1, Number(vendor[field]) + delta);
  await tx.vendor.update({
    where: { id: vendorId },
    data: { [field]: next },
  });
}
