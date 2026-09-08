"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  runDesignConsult,
  runDiagnose,
  runEnhance,
  runGenerate,
  runStyleConsult,
} from "@/lib/ai/orchestrator";
import { prisma } from "@/lib/db";
import { getAuthorizedUser, requireUser } from "@/lib/session";

export type AiActionResult = {
  ok: boolean;
  message?: string;
  data?: unknown;
  designId?: string;
};

export async function enhanceDesignAction(
  _prev: AiActionResult,
  formData: FormData,
): Promise<AiActionResult> {
  const user = await getAuthorizedUser("ai:use");
  if (!user) return { ok: false, message: "Please sign in to use AI tools." };

  const designId = String(formData.get("designId") ?? "");
  const design = await prisma.design.findUnique({ where: { id: designId } });
  if (!design) return { ok: false, message: "Design not found." };
  if (!design.isLibrary && design.ownerId !== user.id) {
    return { ok: false, message: "You cannot enhance this design." };
  }

  const { jobId, result } = await runEnhance({ imageUrl: design.imageUrl });

  const enhanced = await prisma.design.create({
    data: {
      ownerId: user.id,
      title: `${design.title} (Enhanced)`,
      description: result.notes.join(" · "),
      imageUrl: result.imageUrl,
      thumbnailUrl: result.imageUrl,
      isLibrary: false,
      tags: JSON.stringify(["ai-enhanced", "from-library"]),
    },
  });

  await prisma.savedDesign.upsert({
    where: { userId_designId: { userId: user.id, designId: enhanced.id } },
    update: {},
    create: { userId: user.id, designId: enhanced.id, name: enhanced.title },
  });

  revalidatePath("/ai");
  revalidatePath("/account/designs");
  revalidatePath("/designs");

  return {
    ok: true,
    message: `Enhanced with ${result.provider} (job ${jobId.slice(0, 8)}).`,
    designId: enhanced.id,
    data: result,
  };
}

export async function diagnoseDesignAction(
  _prev: AiActionResult,
  formData: FormData,
): Promise<AiActionResult> {
  const user = await getAuthorizedUser("ai:use");
  if (!user) return { ok: false, message: "Please sign in to use AI tools." };

  const designId = String(formData.get("designId") ?? "");
  const category = String(formData.get("category") ?? "") || undefined;
  const design = await prisma.design.findUnique({ where: { id: designId } });
  if (!design) return { ok: false, message: "Design not found." };

  const { result } = await runDiagnose({
    imageUrl: design.imageUrl,
    productCategory: category,
  });

  return {
    ok: true,
    message: `Print readiness score: ${result.score}/100`,
    data: result,
  };
}

const generateSchema = z.object({
  prompt: z.string().min(3).max(240),
  style: z.string().max(40).optional(),
  save: z.enum(["on", "off"]).optional(),
});

export async function generateDesignAction(
  _prev: AiActionResult,
  formData: FormData,
): Promise<AiActionResult> {
  const user = await getAuthorizedUser("ai:use");
  if (!user) return { ok: false, message: "Please sign in to use AI tools." };

  const parsed = generateSchema.safeParse({
    prompt: formData.get("prompt"),
    style: formData.get("style") || undefined,
    save: formData.get("save") === "on" ? "on" : "off",
  });
  if (!parsed.success) {
    return { ok: false, message: "Enter a prompt (at least 3 characters)." };
  }

  const { result } = await runGenerate({
    prompt: parsed.data.prompt,
    style: parsed.data.style,
  });

  let designId: string | undefined;
  if (parsed.data.save === "on") {
    const design = await prisma.design.create({
      data: {
        ownerId: user.id,
        title: parsed.data.prompt.slice(0, 60),
        description: result.promptUsed,
        imageUrl: result.imageUrl,
        thumbnailUrl: result.imageUrl,
        isLibrary: false,
        tags: JSON.stringify(["ai-generated", parsed.data.style ?? "modern"]),
      },
    });
    await prisma.savedDesign.create({
      data: { userId: user.id, designId: design.id, name: design.title },
    });
    designId = design.id;
    revalidatePath("/account/designs");
    revalidatePath("/designs");
    revalidatePath("/studio");
  }

  revalidatePath("/ai");
  return {
    ok: true,
    message: designId ? "Generated and saved to your designs." : "Generated preview ready.",
    designId,
    data: result,
  };
}

const consultSchema = z.object({
  question: z.string().min(5).max(500),
  mode: z.enum(["style", "design"]),
  context: z.string().optional(),
});

export async function consultAiAction(
  _prev: AiActionResult,
  formData: FormData,
): Promise<AiActionResult> {
  const user = await getAuthorizedUser("ai:use");
  if (!user) return { ok: false, message: "Please sign in to use AI tools." };

  const parsed = consultSchema.safeParse({
    question: formData.get("question"),
    mode: formData.get("mode"),
    context: formData.get("context") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, message: "Ask a clearer question (5+ characters)." };
  }

  const contextFromForm = parsed.data.context
    ? { note: parsed.data.context }
    : undefined;

  let context = contextFromForm;
  if (parsed.data.mode === "style") {
    const profile = await prisma.styleProfile.findUnique({
      where: { userId: user.id },
    });
    if (profile) {
      const { parseStylePreferences, parseStyleSizes, styleContextNote } =
        await import("@/lib/style-profile");
      const note = styleContextNote(
        parseStylePreferences(profile.preferences),
        parseStyleSizes(profile.sizes),
      );
      if (note) {
        context = {
          note: [contextFromForm?.note, note].filter(Boolean).join(" "),
        };
      }
    }
  }

  const { result } =
    parsed.data.mode === "style"
      ? await runStyleConsult({ question: parsed.data.question, context })
      : await runDesignConsult({ question: parsed.data.question, context });

  return {
    ok: true,
    message: `${parsed.data.mode === "style" ? "Style" : "Design"} consultant · ${result.provider}`,
    data: result,
  };
}

export async function requireAiUser() {
  return requireUser("ai:use");
}
