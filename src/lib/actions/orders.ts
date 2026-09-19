"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  designIdsFromPlacement,
  formatOrderItemTitle,
  parseDualCartPlacement,
} from "@/lib/catalog/display";
import { assignVendorToOrder } from "@/lib/fulfillment/router";
import { prisma } from "@/lib/db";
import { getPaymentProvider } from "@/lib/orders/payment";
import {
  computeLineUnitPrice,
  computeOrderTotals,
  countDesignSides,
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

  const secondaryDesignIds = [
    ...new Set(
      cart.items.flatMap((item) => {
        const placement = parseDualCartPlacement(item.placementJson);
        return designIdsFromPlacement(placement).filter(
          (id) => id !== item.designId,
        );
      }),
    ),
  ];
  const secondaryDesigns =
    secondaryDesignIds.length > 0
      ? await prisma.design.findMany({
          where: { id: { in: secondaryDesignIds } },
          select: { id: true, title: true },
        })
      : [];
  const designTitleById = new Map(
    secondaryDesigns.map((d) => [d.id, d.title] as const),
  );

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const totals = computeOrderTotals(subtotal, parsed.data.shippingCity);
  const orderNumber = generateOrderNumber();
  const paymentMethod = getPaymentProvider().name;

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        userId: user.id,
        // ADVANCE_PAID = order confirmed (legacy enum; no online advance collected).
        status: "ADVANCE_PAID",
        subtotal: totals.subtotal,
        deliveryFee: totals.deliveryFee,
        advanceAmount: 0,
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
            title: formatOrderItemTitle(
              item.product.name,
              item.placementJson,
              item.design
                ? { id: item.design.id, title: item.design.title }
                : null,
              designTitleById,
            ),
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
              kind: "COD_REMAINING",
              amount: totals.remainingAmount,
              status: "PENDING",
              method: "COD",
              metaJson: JSON.stringify({
                includesDeliveryFee: true,
                deliveryFee: totals.deliveryFee,
                paymentProvider: paymentMethod,
                fullAmountCod: true,
              }),
            },
          ],
        },
        shipments: {
          create: {
            status: "pending",
            carrier: "Pakistan courier network",
          },
        },
      },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    await tx.notification.create({
      data: {
        userId: user.id,
        title: "Order placed",
        body: `${orderNumber}: ${totals.totalPayable} PKR due on delivery (COD).`,
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
    message: `Order placed. Full amount due on COD.${assignNote}`,
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

    if (order.advanceAmount > 0) {
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
    }

    await tx.notification.create({
      data: {
        userId: user.id,
        title: "Order cancelled",
        body:
          order.advanceAmount > 0
            ? `${order.orderNumber} was cancelled. Advance refund is pending review.`
            : `${order.orderNumber} was cancelled. No online payment to refund.`,
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

    const placement = parseDualCartPlacement(item.placementJson);
    const designIds = designIdsFromPlacement(placement);
    if (designIds.length === 0 && item.designId) {
      designIds.push(item.designId);
    }

    let designsAllowed = true;
    for (const designId of designIds) {
      const design = await prisma.design.findUnique({ where: { id: designId } });
      if (!design) {
        designsAllowed = false;
        break;
      }
      const allowed =
        design.isLibrary ||
        design.ownerId === user.id ||
        Boolean(
          await prisma.designLicense.findFirst({
            where: { designId: design.id, buyerId: user.id },
          }),
        );
      if (!allowed) {
        designsAllowed = false;
        break;
      }
    }
    if (!designsAllowed) continue;

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
      let designSides = countDesignSides(placement);
      if (designSides === 0 && item.designId) designSides = 1;
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: item.productId,
          designId: item.designId,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          unitPrice: computeLineUnitPrice(item.product.basePrice, designSides),
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
