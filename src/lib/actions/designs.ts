"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAiProvider } from "@/lib/ai";
import { prisma } from "@/lib/db";
import { requireUser, getAuthorizedUser } from "@/lib/session";
import { saveDesignUpload } from "@/lib/uploads";

export type ActionResult = {
  ok: boolean;
  message?: string;
  designId?: string;
};

const metaSchema = z.object({
  title: z.string().min(2).max(80),
  description: z.string().max(400).optional(),
  enhance: z.enum(["on", "off"]).optional(),
});

export async function uploadDesign(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser("design:write");

  const parsed = metaSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    enhance: formData.get("enhance") === "on" ? "on" : "off",
  });
  if (!parsed.success) {
    return { ok: false, message: "Add a title (2–80 characters)." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, message: "Please choose an image file." };
  }

  const saved = await saveDesignUpload(file);
  if (!saved.ok) return { ok: false, message: saved.message };

  let imageUrl = saved.publicPath;
  let notes: string[] = [];

  if (parsed.data.enhance === "on") {
    const ai = getAiProvider();
    const enhanced = await ai.enhanceDesign({ imageUrl });
    imageUrl = enhanced.imageUrl;
    notes = enhanced.notes;

    await prisma.aiJob.create({
      data: {
        type: "ENHANCE",
        status: "SUCCEEDED",
        provider: enhanced.provider,
        inputJson: JSON.stringify({ imageUrl: saved.publicPath }),
        outputJson: JSON.stringify(enhanced),
        finishedAt: new Date(),
      },
    });
  }

  const design = await prisma.design.create({
    data: {
      ownerId: user.id,
      title: parsed.data.title,
      description:
        parsed.data.description ||
        (notes.length ? `AI notes: ${notes.join("; ")}` : null),
      imageUrl,
      thumbnailUrl: imageUrl,
      isLibrary: false,
      tags: JSON.stringify(["upload", ...(parsed.data.enhance === "on" ? ["ai-enhanced"] : [])]),
    },
  });

  await prisma.savedDesign.upsert({
    where: {
      userId_designId: { userId: user.id, designId: design.id },
    },
    update: {},
    create: {
      userId: user.id,
      designId: design.id,
      name: design.title,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "design.upload",
      entity: "Design",
      entityId: design.id,
      metaJson: JSON.stringify({ enhance: parsed.data.enhance === "on" }),
    },
  });

  revalidatePath("/designs");
  revalidatePath("/account/designs");
  revalidatePath("/studio");

  return {
    ok: true,
    designId: design.id,
    message: parsed.data.enhance === "on"
      ? "Design uploaded and enhanced."
      : "Design uploaded.",
  };
}

export async function toggleSaveDesign(designId: string): Promise<ActionResult> {
  const user = await getAuthorizedUser("design:read");
  if (!user) return { ok: false, message: "Please sign in to save designs." };

  const design = await prisma.design.findUnique({ where: { id: designId } });
  if (!design) return { ok: false, message: "Design not found." };
  const canSave =
    design.isLibrary ||
    design.ownerId === user.id ||
    (design.published && design.moderationStatus === "approved");
  if (!canSave) {
    return { ok: false, message: "You cannot save this design." };
  }

  const existing = await prisma.savedDesign.findUnique({
    where: { userId_designId: { userId: user.id, designId } },
  });

  if (existing) {
    await prisma.savedDesign.delete({ where: { id: existing.id } });
    revalidatePath("/designs");
    revalidatePath("/account/designs");
    return { ok: true, message: "Removed from saved designs." };
  }

  await prisma.savedDesign.create({
    data: { userId: user.id, designId, name: design.title },
  });
  revalidatePath("/designs");
  revalidatePath("/account/designs");
  return { ok: true, message: "Saved to your collection." };
}

export async function deleteOwnDesign(designId: string): Promise<ActionResult> {
  const user = await requireUser("design:write");
  const design = await prisma.design.findUnique({ where: { id: designId } });
  if (!design || design.ownerId !== user.id || design.isLibrary) {
    return { ok: false, message: "You cannot delete this design." };
  }

  await prisma.design.delete({ where: { id: designId } });
  revalidatePath("/designs");
  revalidatePath("/account/designs");
  return { ok: true, message: "Design deleted." };
}
