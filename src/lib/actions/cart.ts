"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  catalogColorAliases,
  designIdsFromPlacement,
  parseDualCartPlacement,
  primaryDesignIdFromPlacement,
  serializeDualCartPlacement,
  type DualCartPlacement,
} from "@/lib/catalog/display";
import { prisma } from "@/lib/db";
import {
  computeLineUnitPrice,
  countDesignSides,
} from "@/lib/orders/pricing";
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

function defaultPlacement(): DualCartPlacement {
  return {
    side: "front",
    x: 0.5,
    y: 0.4,
    scale: 1,
    rotation: 0,
  };
}

function placementDesignKey(placement: DualCartPlacement): string {
  return `${placement.front?.designId ?? ""}|${placement.back?.designId ?? ""}`;
}

async function assertDesignAllowed(
  designId: string,
  userId: string,
): Promise<CartResult | null> {
  const design = await prisma.design.findUnique({ where: { id: designId } });
  if (!design) return { ok: false, message: "Design not found." };
  const allowed =
    design.isLibrary ||
    design.ownerId === userId ||
    Boolean(
      await prisma.designLicense.findFirst({
        where: { designId: design.id, buyerId: userId },
      }),
    );
  if (!allowed) {
    return { ok: false, message: "You cannot use this design." };
  }
  return null;
}

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

  let placement: DualCartPlacement = defaultPlacement();
  if (parsed.data.placementJson) {
    try {
      placement = parseDualCartPlacement(parsed.data.placementJson);
      // Dual payload from PDP — keep front/back as parsed.
      // Legacy flat payload — attach top-level designId to the active side when provided.
      if (
        !("front" in placement) &&
        !("back" in placement) &&
        parsed.data.designId
      ) {
        const sidePlacement = {
          designId: parsed.data.designId,
          x: placement.x,
          y: placement.y,
          scale: placement.scale,
          rotation: placement.rotation,
        };
        placement = {
          ...placement,
          front: placement.side === "front" ? sidePlacement : null,
          back: placement.side === "back" ? sidePlacement : null,
        };
      }
    } catch {
      return { ok: false, message: "Invalid placement data." };
    }
  } else if (parsed.data.designId) {
    placement = {
      ...defaultPlacement(),
      front: {
        designId: parsed.data.designId,
        x: 0.5,
        y: 0.4,
        scale: 1,
        rotation: 0,
      },
      back: null,
    };
  }

  const designIds = designIdsFromPlacement(placement);
  // Also accept a lone form designId when placement has no designs (studio blank coords).
  if (designIds.length === 0 && parsed.data.designId) {
    designIds.push(parsed.data.designId);
  }

  for (const id of designIds) {
    const err = await assertDesignAllowed(id, user.id);
    if (err) return err;
  }

  const primaryDesignId =
    primaryDesignIdFromPlacement(placement, parsed.data.designId ?? null) ??
    null;

  const placementJson = serializeDualCartPlacement(placement);

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
    include: { variants: true },
  });
  if (!product || !product.active) {
    return { ok: false, message: "Product not available." };
  }

  const colorAliases = catalogColorAliases(parsed.data.color);
  const variant = product.variants.find(
    (v) =>
      v.active &&
      v.size === parsed.data.size &&
      colorAliases.includes(v.color),
  );
  if (!variant) {
    return { ok: false, message: "That size/color combination is unavailable." };
  }

  const cart = await getOrCreateCart(user.id);
  const designKey = placementDesignKey(placement);

  const candidates = await prisma.cartItem.findMany({
    where: {
      cartId: cart.id,
      productId: product.id,
      designId: primaryDesignId,
      size: parsed.data.size,
      color: parsed.data.color,
    },
  });

  const existing = candidates.find((item) => {
    const other = parseDualCartPlacement(item.placementJson);
    return placementDesignKey(other) === designKey;
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
    let designSides = countDesignSides(placement);
    if (designSides === 0 && primaryDesignId) designSides = 1;
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: product.id,
        designId: primaryDesignId,
        size: parsed.data.size,
        color: parsed.data.color,
        quantity: parsed.data.quantity,
        unitPrice: computeLineUnitPrice(product.basePrice, designSides),
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
