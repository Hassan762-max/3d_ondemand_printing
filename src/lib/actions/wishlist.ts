"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getAuthorizedUser } from "@/lib/session";

export type WishlistResult = { ok: boolean; message?: string; saved?: boolean };

export async function toggleWishlist(productId: string): Promise<WishlistResult> {
  const user = await getAuthorizedUser("catalog:read");
  if (!user) return { ok: false, message: "Please sign in." };

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.active) {
    return { ok: false, message: "Product not found." };
  }

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/account/wishlist");
    revalidatePath(`/products/${product.slug}`);
    revalidatePath("/products");
    return { ok: true, saved: false, message: "Removed from wishlist." };
  }

  await prisma.wishlistItem.create({
    data: { userId: user.id, productId },
  });
  revalidatePath("/account/wishlist");
  revalidatePath(`/products/${product.slug}`);
  revalidatePath("/products");
  return { ok: true, saved: true, message: "Added to wishlist." };
}
