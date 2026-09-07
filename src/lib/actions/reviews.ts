"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAuthorizedUser, requireUser } from "@/lib/session";

export type ReviewActionResult = {
  ok: boolean;
  message?: string;
};

const reviewSchema = z.object({
  orderId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().max(600).optional(),
});

export async function submitOrderReview(
  _prev: ReviewActionResult,
  formData: FormData,
): Promise<ReviewActionResult> {
  const user = await getAuthorizedUser("order:read_own");
  if (!user) return { ok: false, message: "Please sign in." };

  const parsed = reviewSchema.safeParse({
    orderId: formData.get("orderId"),
    rating: formData.get("rating"),
    body: formData.get("body") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, message: "Choose a rating from 1–5." };
  }

  const order = await prisma.order.findFirst({
    where: { id: parsed.data.orderId, userId: user.id },
    include: { reviews: { where: { userId: user.id } } },
  });
  if (!order) return { ok: false, message: "Order not found." };
  if (order.status !== "DELIVERED") {
    return { ok: false, message: "Reviews open after delivery." };
  }
  if (order.reviews.length > 0) {
    return { ok: false, message: "You already reviewed this order." };
  }

  await prisma.review.create({
    data: {
      orderId: order.id,
      userId: user.id,
      rating: parsed.data.rating,
      body: parsed.data.body?.trim() || null,
    },
  });

  if (order.vendorId) {
    const vendor = await prisma.vendor.findUnique({
      where: { id: order.vendorId },
    });
    if (vendor) {
      // Soft blend rating into quality score (1–5 scale)
      const blended =
        vendor.qualityScore * 0.9 + parsed.data.rating * 0.1;
      await prisma.vendor.update({
        where: { id: vendor.id },
        data: { qualityScore: Math.min(5, Math.max(1, blended)) },
      });
    }
  }

  await prisma.notification.create({
    data: {
      userId: user.id,
      title: "Thanks for your review",
      body: `${order.orderNumber}: ${parsed.data.rating}/5 recorded.`,
      href: `/orders/${order.id}`,
    },
  });

  revalidatePath(`/orders/${order.id}`);
  revalidatePath("/orders");
  revalidatePath("/products");
  revalidatePath("/account/notifications");

  return { ok: true, message: "Review submitted." };
}

export async function markNotificationRead(id: string) {
  const user = await requireUser();
  await prisma.notification.updateMany({
    where: { id, userId: user.id },
    data: { read: true },
  });
  revalidatePath("/account/notifications");
}

export async function markAllNotificationsRead() {
  const user = await requireUser();
  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });
  revalidatePath("/account/notifications");
}
