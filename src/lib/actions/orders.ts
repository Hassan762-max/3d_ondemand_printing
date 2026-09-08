"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assignVendorToOrder } from "@/lib/fulfillment/router";
import { prisma } from "@/lib/db";
import { getPaymentProvider } from "@/lib/orders/payment";
import {
  computeOrderTotals,
  generateOrderNumber,
} from "@/lib/orders/pricing";
import { checkRateLimit } from "@/lib/rate-limit";
import { getAuthorizedUser, requireUser } from "@/lib/session";

export type OrderActionResult = {
  ok: boolean;
  message?: string;
  orderId?: string;
  orderNumber?: string;
};

const checkoutSchema = z.object({
  shippingName: z.string().min(2).max(80),
  shippingPhone: z.string().min(10).max(20),
  shippingCity: z.string().min(2).max(80),
  shippingAddress: z.string().min(5).max(240),
  shippingProvince: z.string().max(80).optional(),
  notes: z.string().max(400).optional(),
});

export async function placeOrder(
  _prev: OrderActionResult,
  formData: FormData,
): Promise<OrderActionResult> {
  const user = await getAuthorizedUser("order:create");
  if (!user) return { ok: false, message: "Please sign in to checkout." };

  const limited = checkRateLimit(`checkout:${user.id}`, 8, 60_000);
  if (!limited.ok) {
    return {
      ok: false,
      message: `Too many checkout attempts. Try again in ${limited.retryAfterSec}s.`,
    };
  }

  const parsed = checkoutSchema.safeParse({
    shippingName: formData.get("shippingName"),
    shippingPhone: formData.get("shippingPhone"),
    shippingCity: formData.get("shippingCity"),
    shippingAddress: formData.get("shippingAddress"),
    shippingProvince: formData.get("shippingProvince") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, message: "Please complete your delivery details." };
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          product: true,
          design: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return { ok: false, message: "Your cart is empty." };
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const totals = computeOrderTotals(subtotal, parsed.data.shippingCity);
  const orderNumber = generateOrderNumber();

  const payment = getPaymentProvider();
  const capture = await payment.capture({
    orderNumber,
    amount: totals.advanceAmount,
    kind: "ADVANCE",
    customerPhone: parsed.data.shippingPhone,
  });

  if (!capture.ok || capture.status !== "COMPLETED") {
    return {
      ok: false,
      message: capture.message ?? "Advance payment failed. Try again.",
    };
  }

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: "ADVANCE_PAID",
        subtotal: totals.subtotal,
        deliveryFee: totals.deliveryFee,
        advanceAmount: totals.advanceAmount,
        remainingAmount: totals.remainingAmount,
        vendorCost: totals.vendorCost,
        platformMargin: totals.platformMargin,
        shippingName: parsed.data.shippingName,
        shippingPhone: parsed.data.shippingPhone,
        shippingCity: parsed.data.shippingCity,
        shippingAddress: parsed.data.shippingAddress,
        shippingProvince: parsed.data.shippingProvince,
        notes: parsed.data.notes,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            designId: item.designId,
            title: item.design
              ? `${item.product.name} · ${item.design.title}`
              : item.product.name,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            placementJson: item.placementJson,
          })),
        },
        payments: {
          create: [
            {
              kind: "ADVANCE",
              amount: totals.advanceAmount,
              status: "COMPLETED",
              method: capture.provider,
              reference: capture.reference,
              metaJson: JSON.stringify({ message: capture.message }),
            },
            {
              kind: "COD_REMAINING",
              amount: totals.remainingAmount,
              status: "PENDING",
              method: "COD",
              metaJson: JSON.stringify({
                includesDeliveryFee: true,
                deliveryFee: totals.deliveryFee,
              }),
            },
          ],
        },
        shipments: {
          create: {
            status: "pending",
            carrier: "Vendor courier (TBD)",
          },
        },
      },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    await tx.notification.create({
      data: {
        userId: user.id,
        title: "Order placed",
        body: `${orderNumber}: advance ${totals.advanceAmount} PKR received. Remaining on COD.`,
        href: `/orders/${created.id}`,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: "order.place",
        entity: "Order",
        entityId: created.id,
        metaJson: JSON.stringify({ orderNumber, totals }),
      },
    });

    return created;
  });

  // Auto-route to best Pakistan vendor after payment succeeds.
  let assignNote = "";
  try {
    const assignment = await assignVendorToOrder(order.id);
    if (assignment.best) {
      assignNote = ` Assigned to ${assignment.best.businessName} (${assignment.best.city}).`;
    } else {
      assignNote = " Awaiting manual vendor assignment.";
    }
  } catch {
    assignNote = " Vendor routing will retry shortly.";
  }

  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/orders");
  revalidatePath(`/orders/${order.id}`);
  revalidatePath("/vendor");

  return {
    ok: true,
    orderId: order.id,
    orderNumber: order.orderNumber,
    message: `Order placed. Advance recorded.${assignNote}`,
  };
}

export async function cancelOrder(orderId: string): Promise<OrderActionResult> {
  const user = await requireUser("order:cancel");

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
  });
  if (!order) return { ok: false, message: "Order not found." };

  const cancellable = ["PENDING_PAYMENT", "ADVANCE_PAID"].includes(order.status);
  if (!cancellable) {
    return {
      ok: false,
      message: "This order can no longer be cancelled (production may have started).",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });

    await tx.paymentLedger.create({
      data: {
        orderId: order.id,
        kind: "REFUND",
        amount: order.advanceAmount,
        status: "PENDING",
        method: "MANUAL_REFUND",
        metaJson: JSON.stringify({ reason: "customer_cancel_before_production" }),
      },
    });

    await tx.notification.create({
      data: {
        userId: user.id,
        title: "Order cancelled",
        body: `${order.orderNumber} was cancelled. Advance refund is pending review.`,
        href: `/orders/${order.id}`,
      },
    });
  });

  revalidatePath("/orders");
  revalidatePath(`/orders/${order.id}`);
  return { ok: true, orderId: order.id, message: "Order cancelled." };
}

export async function reorderOrder(orderId: string): Promise<OrderActionResult> {
  const user = await requireUser("cart:manage");

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
    include: {
      items: {
        include: { product: { select: { id: true, active: true, basePrice: true } } },
      },
    },
  });
  if (!order) return { ok: false, message: "Order not found." };

  const cart = await prisma.cart.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  let added = 0;
  for (const item of order.items) {
    if (!item.product.active) continue;

    if (item.designId) {
      const design = await prisma.design.findUnique({ where: { id: item.designId } });
      if (!design) continue;
      const allowed =
        design.isLibrary ||
        design.ownerId === user.id ||
        Boolean(
          await prisma.designLicense.findFirst({
            where: { designId: design.id, buyerId: user.id },
          }),
        );
      if (!allowed) continue;
    }

    const existing = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: item.productId,
        designId: item.designId ?? null,
        size: item.size,
        color: item.color,
      },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: Math.min(20, existing.quantity + item.quantity),
          placementJson: item.placementJson,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: item.productId,
          designId: item.designId,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          unitPrice: item.product.basePrice,
          placementJson: item.placementJson,
        },
      });
    }
    added += 1;
  }

  if (added === 0) {
    return {
      ok: false,
      message: "No items could be re-added (products inactive or designs unavailable).",
    };
  }

  revalidatePath("/cart");
  revalidatePath(`/orders/${order.id}`);
  return {
    ok: true,
    orderId: order.id,
    message: `${added} item${added === 1 ? "" : "s"} added to cart.`,
  };
}
