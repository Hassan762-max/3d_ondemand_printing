"use server";

import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { z } from "zod";
import { runTryOnReview, runVirtualTryOn } from "@/lib/ai/orchestrator";
import { prisma } from "@/lib/db";
import { getAuthorizedUser } from "@/lib/session";
import {
  parseTryOnMeta,
  type TryOnHistoryItem,
  type TryOnMeta,
} from "@/lib/try-on/types";
import { savePhotoUpload } from "@/lib/uploads";

export type TryOnActionResult = {
  ok: boolean;
  message?: string;
  sessionId?: string;
};

export async function createTryOnSession(
  _prev: TryOnActionResult,
  formData: FormData,
): Promise<TryOnActionResult> {
  const user = await getAuthorizedUser("tryon:use");
  if (!user) return { ok: false, message: "Please sign in to use Try-On." };

  const { checkRateLimit } = await import("@/lib/rate-limit");
  const limited = checkRateLimit(`tryon:${user.id}`, 12, 60_000);
  if (!limited.ok) {
    return {
      ok: false,
      message: `Too many try-on attempts. Try again in ${limited.retryAfterSec}s.`,
    };
  }

  const productId = String(formData.get("productId") ?? "");
  const designId = String(formData.get("designId") ?? "") || undefined;
  const size = String(formData.get("size") ?? "");
  const color = String(formData.get("color") ?? "");
  const file = formData.get("photo");

  if (!(file instanceof File)) {
    return { ok: false, message: "Upload a clear photo of yourself." };
  }
  if (!productId || !size || !color) {
    return { ok: false, message: "Select product, size, and color." };
  }

  const saved = await savePhotoUpload(file);
  if (!saved.ok) return { ok: false, message: saved.message };

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });
  if (!product || !product.active) {
    return { ok: false, message: "Product not available." };
  }

  const variant = product.variants.find(
    (v) => v.active && v.size === size && v.color === color,
  );
  if (!variant) {
    return { ok: false, message: "That size/color combination is unavailable." };
  }

  let designUrl: string | null = null;
  let designTitle: string | null = null;
  if (designId) {
    const { userCanUseDesign } = await import("@/lib/designs/access");
    const access = await userCanUseDesign(prisma, designId, user.id);
    if (!access.ok || !access.design) {
      return { ok: false, message: "You cannot use this design." };
    }
    designUrl = access.design.imageUrl;
    designTitle = access.design.title;
  }

  const { result: tryOn } = await runVirtualTryOn({
    photoUrl: saved.publicPath,
    garmentPreviewUrl: product.imageUrl ?? "/products/tee.svg",
    productName: product.name,
    garmentColor: variant.colorHex,
    designUrl,
    size,
  });

  const { result: review } = await runTryOnReview({
    resultUrl: tryOn.resultUrl,
    productName: product.name,
    size,
  });

  const historyItem: TryOnHistoryItem = {
    id: nanoid(8),
    resultUrl: tryOn.resultUrl,
    review,
    createdAt: new Date().toISOString(),
  };

  const meta: TryOnMeta = {
    productId: product.id,
    productName: product.name,
    productSlug: product.slug,
    size,
    color,
    colorHex: variant.colorHex,
    designId: designId ?? null,
    designTitle,
    garmentPreviewUrl: product.imageUrl ?? "/products/tee.svg",
    confidence: tryOn.confidence,
    latestReview: review,
    history: [historyItem],
    compareIds: [],
    finalized: false,
  };

  const session = await prisma.tryOnSession.create({
    data: {
      userId: user.id,
      designId: designId ?? null,
      photoUrl: saved.publicPath,
      resultUrl: tryOn.resultUrl,
      reviewJson: JSON.stringify(meta),
      status: "reviewed",
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "tryon.create",
      entity: "TryOnSession",
      entityId: session.id,
    },
  });

  revalidatePath("/try-on");
  revalidatePath(`/try-on/${session.id}`);
  return {
    ok: true,
    sessionId: session.id,
    message: "Try-on preview ready.",
  };
}

const iterateSchema = z.object({
  sessionId: z.string().min(1),
  note: z.string().max(300).optional(),
  size: z.string().optional(),
  color: z.string().optional(),
});

export async function iterateTryOnSession(
  _prev: TryOnActionResult,
  formData: FormData,
): Promise<TryOnActionResult> {
  const user = await getAuthorizedUser("tryon:use");
  if (!user) return { ok: false, message: "Please sign in." };

  const parsed = iterateSchema.safeParse({
    sessionId: formData.get("sessionId"),
    note: formData.get("note") || undefined,
    size: formData.get("size") || undefined,
    color: formData.get("color") || undefined,
  });
  if (!parsed.success) return { ok: false, message: "Invalid try-on session." };

  const session = await prisma.tryOnSession.findFirst({
    where: { id: parsed.data.sessionId, userId: user.id },
  });
  if (!session) return { ok: false, message: "Session not found." };

  const meta = parseTryOnMeta(session.reviewJson);
  if (!meta) return { ok: false, message: "Session data is corrupted." };
  if (meta.finalized) return { ok: false, message: "This try-on is finalized." };

  const product = await prisma.product.findUnique({
    where: { id: meta.productId },
    include: { variants: true },
  });
  if (!product) return { ok: false, message: "Product missing." };

  const nextSize = parsed.data.size ?? meta.size;
  const nextColor = parsed.data.color ?? meta.color;
  const variant = product.variants.find(
    (v) => v.active && v.size === nextSize && v.color === nextColor,
  );
  if (!variant) {
    return { ok: false, message: "That size/color combination is unavailable." };
  }

  let designUrl: string | null = null;
  if (meta.designId) {
    const design = await prisma.design.findUnique({ where: { id: meta.designId } });
    designUrl = design?.imageUrl ?? null;
  }

  const { result: tryOn } = await runVirtualTryOn({
    photoUrl: session.photoUrl,
    garmentPreviewUrl: product.imageUrl ?? "/products/tee.svg",
    productName: product.name,
    garmentColor: variant.colorHex,
    designUrl,
    size: nextSize,
  });

  const { result: review } = await runTryOnReview({
    resultUrl: tryOn.resultUrl,
    productName: product.name,
    size: nextSize,
  });

  const historyItem: TryOnHistoryItem = {
    id: nanoid(8),
    resultUrl: tryOn.resultUrl,
    review,
    note: parsed.data.note,
    createdAt: new Date().toISOString(),
  };

  const nextMeta: TryOnMeta = {
    ...meta,
    size: nextSize,
    color: nextColor,
    colorHex: variant.colorHex,
    confidence: tryOn.confidence,
    latestReview: review,
    history: [...meta.history, historyItem].slice(-6),
  };

  await prisma.tryOnSession.update({
    where: { id: session.id },
    data: {
      resultUrl: tryOn.resultUrl,
      reviewJson: JSON.stringify(nextMeta),
      status: "iterated",
    },
  });

  revalidatePath("/try-on");
  revalidatePath(`/try-on/${session.id}`);
  return { ok: true, sessionId: session.id, message: "New preview generated." };
}

export async function finalizeTryOnSession(sessionId: string): Promise<TryOnActionResult> {
  const user = await getAuthorizedUser("tryon:use");
  if (!user) return { ok: false, message: "Please sign in." };

  const session = await prisma.tryOnSession.findFirst({
    where: { id: sessionId, userId: user.id },
  });
  if (!session) return { ok: false, message: "Session not found." };

  const meta = parseTryOnMeta(session.reviewJson);
  if (!meta) return { ok: false, message: "Session data is corrupted." };

  meta.finalized = true;
  await prisma.tryOnSession.update({
    where: { id: session.id },
    data: {
      reviewJson: JSON.stringify(meta),
      status: "finalized",
    },
  });

  revalidatePath("/try-on");
  revalidatePath(`/try-on/${session.id}`);
  return { ok: true, sessionId: session.id, message: "Try-on finalized." };
}

export async function setTryOnCompare(
  sessionId: string,
  historyId: string,
): Promise<TryOnActionResult> {
  const user = await getAuthorizedUser("tryon:use");
  if (!user) return { ok: false, message: "Please sign in." };

  const session = await prisma.tryOnSession.findFirst({
    where: { id: sessionId, userId: user.id },
  });
  if (!session) return { ok: false, message: "Session not found." };
  const meta = parseTryOnMeta(session.reviewJson);
  if (!meta) return { ok: false, message: "Session data is corrupted." };

  const exists = meta.history.some((h) => h.id === historyId);
  if (!exists) return { ok: false, message: "Preview not found." };

  const current = new Set(meta.compareIds ?? []);
  if (current.has(historyId)) current.delete(historyId);
  else {
    current.add(historyId);
    while (current.size > 2) {
      const first = current.values().next().value as string;
      current.delete(first);
    }
  }
  meta.compareIds = [...current];

  await prisma.tryOnSession.update({
    where: { id: session.id },
    data: { reviewJson: JSON.stringify(meta) },
  });

  revalidatePath(`/try-on/${session.id}`);
  return { ok: true, sessionId: session.id };
}
