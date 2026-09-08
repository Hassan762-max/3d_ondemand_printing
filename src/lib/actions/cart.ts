"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAuthorizedUser, requireUser } from "@/lib/session";

export type CartResult = { ok: boolean; message?: string };

async function getOrCreateCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

const addSchema = z.object({
  productId: z.string().min(1),
  designId: z.string().optional(),
  size: z.string().min(1),
  color: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(20).default(1),
  placementJson: z.string().optional(),
});

export async function addToCart(formData: FormData): Promise<CartResult> {
  const user = await getAuthorizedUser("cart:manage");
  if (!user) return { ok: false, message: "Please sign in to add items to your cart." };

  const parsed = addSchema.safeParse({
    productId: formData.get("productId"),
    designId: formData.get("designId") || undefined,
    size: formData.get("size"),
    color: formData.get("color"),
    quantity: formData.get("quantity") || 1,
    placementJson: formData.get("placementJson") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, message: "Select size and color to add to cart." };
  }

  let placementJson = JSON.stringify({
    side: "front",
    x: 0.5,
    y: 0.4,
    scale: 1,
    rotation: 0,
  });
  if (parsed.data.placementJson) {
    try {
      const parsedPlacement = JSON.parse(parsed.data.placementJson) as Record<
        string,
        unknown
      >;
      placementJson = JSON.stringify({
        side: parsedPlacement.side === "back" ? "back" : "front",
        x: Number(parsedPlacement.x ?? 0.5),
        y: Number(parsedPlacement.y ?? 0.4),
        scale: Number(parsedPlacement.scale ?? 1),
        rotation: Number(parsedPlacement.rotation ?? 0),
      });
    } catch {
      return { ok: false, message: "Invalid placement data." };
    }
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
    include: { variants: true },
  });
  if (!product || !product.active) {
    return { ok: false, message: "Product not available." };
  }

  const variant = product.variants.find(
    (v) =>
      v.active &&
      v.size === parsed.data.size &&
      v.color === parsed.data.color,
  );
  if (!variant) {
    return { ok: false, message: "That size/color combination is unavailable." };
  }

  if (parsed.data.designId) {
    const design = await prisma.design.findUnique({
      where: { id: parsed.data.designId },
    });
    if (!design) return { ok: false, message: "Design not found." };
    const allowed =
      design.isLibrary ||
      design.ownerId === user.id ||
      Boolean(
        await prisma.designLicense.findFirst({
          where: { designId: design.id, buyerId: user.id },
        }),
      );
    if (!allowed) {
      return { ok: false, message: "You cannot use this design." };
    }
  }

  const cart = await getOrCreateCart(user.id);

  const existing = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId: product.id,
      designId: parsed.data.designId ?? null,
      size: parsed.data.size,
      color: parsed.data.color,
    },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: {
        quantity: Math.min(20, existing.quantity + parsed.data.quantity),
        placementJson,
      },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: product.id,
        designId: parsed.data.designId,
        size: parsed.data.size,
        color: parsed.data.color,
        quantity: parsed.data.quantity,
        unitPrice: product.basePrice,
        placementJson,
      },
    });
  }

  revalidatePath("/cart");
  revalidatePath("/");
  return { ok: true, message: "Added to cart." };
}

export async function updateCartItemQuantity(
  itemId: string,
  quantity: number,
): Promise<CartResult> {
  const user = await requireUser("cart:manage");
  const qty = Math.max(1, Math.min(20, Math.floor(quantity)));

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cart: { userId: user.id } },
  });
  if (!item) return { ok: false, message: "Cart item not found." };

  await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity: qty },
  });
  revalidatePath("/cart");
  return { ok: true };
}

export async function removeCartItem(itemId: string): Promise<CartResult> {
  const user = await requireUser("cart:manage");
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cart: { userId: user.id } },
  });
  if (!item) return { ok: false, message: "Cart item not found." };

  await prisma.cartItem.delete({ where: { id: item.id } });
  revalidatePath("/cart");
  return { ok: true, message: "Removed from cart." };
}

export async function clearCart(): Promise<CartResult> {
  const user = await requireUser("cart:manage");
  const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
  if (!cart) return { ok: true };

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  revalidatePath("/cart");
  return { ok: true, message: "Cart cleared." };
}
