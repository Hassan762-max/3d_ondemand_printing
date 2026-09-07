"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAuthorizedUser, requireUser } from "@/lib/session";

export type MarketplaceActionResult = {
  ok: boolean;
  message?: string;
  id?: string;
};

const publishSchema = z.object({
  designId: z.string().min(1),
  listedPrice: z.coerce.number().int().min(0).max(50000),
});

export async function publishDesign(
  _prev: MarketplaceActionResult,
  formData: FormData,
): Promise<MarketplaceActionResult> {
  const user = await requireUser("design:write");
  const parsed = publishSchema.safeParse({
    designId: formData.get("designId"),
    listedPrice: formData.get("listedPrice") ?? 0,
  });
  if (!parsed.success) {
    return { ok: false, message: "Invalid listing details." };
  }

  const design = await prisma.design.findUnique({
    where: { id: parsed.data.designId },
  });
  if (!design || design.ownerId !== user.id || design.isLibrary) {
    return { ok: false, message: "You can only publish your own uploads." };
  }

  const autoApprove =
    user.role === "DESIGNER" ||
    user.role === "ADMIN" ||
    user.role === "SUPER_ADMIN";

  await prisma.design.update({
    where: { id: design.id },
    data: {
      published: autoApprove,
      listedPrice: parsed.data.listedPrice,
      moderationStatus: autoApprove ? "approved" : "pending",
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "design.publish",
      entity: "Design",
      entityId: design.id,
      metaJson: JSON.stringify({
        listedPrice: parsed.data.listedPrice,
        moderationStatus: autoApprove ? "approved" : "pending",
      }),
    },
  });

  revalidatePath("/marketplace");
  revalidatePath("/creator");
  revalidatePath("/account/designs");
  revalidatePath("/designs");

  return {
    ok: true,
    id: design.id,
    message: autoApprove
      ? "Listed on the marketplace."
      : "Submitted for moderation.",
  };
}

export async function unpublishDesign(designId: string): Promise<MarketplaceActionResult> {
  const user = await requireUser("design:write");
  const design = await prisma.design.findUnique({ where: { id: designId } });
  if (!design || design.ownerId !== user.id) {
    return { ok: false, message: "Design not found." };
  }

  await prisma.design.update({
    where: { id: designId },
    data: { published: false, moderationStatus: "draft" },
  });

  revalidatePath("/marketplace");
  revalidatePath("/creator");
  revalidatePath("/account/designs");
  return { ok: true, message: "Listing removed." };
}

export async function moderateDesign(
  designId: string,
  decision: "approved" | "rejected",
): Promise<MarketplaceActionResult> {
  const user = await requireUser("design:moderate");
  const design = await prisma.design.findUnique({ where: { id: designId } });
  if (!design) return { ok: false, message: "Design not found." };

  await prisma.design.update({
    where: { id: designId },
    data: {
      moderationStatus: decision,
      published: decision === "approved",
    },
  });

  if (design.ownerId) {
    await prisma.notification.create({
      data: {
        userId: design.ownerId,
        title:
          decision === "approved"
            ? "Marketplace listing approved"
            : "Marketplace listing rejected",
        body: `"${design.title}" was ${decision}.`,
        href: "/creator",
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: `design.moderate.${decision}`,
      entity: "Design",
      entityId: designId,
    },
  });

  revalidatePath("/marketplace");
  revalidatePath("/ops");
  revalidatePath("/creator");
  return { ok: true, message: `Design ${decision}.` };
}

export async function licenseDesign(designId: string): Promise<MarketplaceActionResult> {
  const user = await getAuthorizedUser("design:read");
  if (!user) return { ok: false, message: "Please sign in to get this design." };

  const design = await prisma.design.findUnique({ where: { id: designId } });
  if (!design || !design.published || design.moderationStatus !== "approved") {
    return { ok: false, message: "This listing is not available." };
  }
  if (design.ownerId === user.id) {
    return { ok: false, message: "You already own this design." };
  }

  const existing = await prisma.designLicense.findUnique({
    where: { designId_buyerId: { designId, buyerId: user.id } },
  });
  if (existing) {
    await prisma.savedDesign.upsert({
      where: { userId_designId: { userId: user.id, designId } },
      update: {},
      create: { userId: user.id, designId, name: design.title },
    });
    return { ok: true, message: "Already in your collection." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.designLicense.create({
      data: {
        designId,
        buyerId: user.id,
        amount: design.listedPrice,
      },
    });
    await tx.design.update({
      where: { id: designId },
      data: { salesCount: { increment: 1 } },
    });
    await tx.savedDesign.upsert({
      where: { userId_designId: { userId: user.id, designId } },
      update: {},
      create: { userId: user.id, designId, name: design.title },
    });

    if (design.ownerId) {
      await tx.notification.create({
        data: {
          userId: design.ownerId,
          title: "Marketplace sale",
          body:
            design.listedPrice > 0
              ? `"${design.title}" licensed for Rs. ${design.listedPrice}.`
              : `"${design.title}" was added by a buyer (free listing).`,
          href: "/creator",
        },
      });
    }

    await tx.notification.create({
      data: {
        userId: user.id,
        title: "Design added",
        body: `"${design.title}" is in your saved designs.`,
        href: "/account/designs",
      },
    });

    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: "design.license",
        entity: "Design",
        entityId: designId,
        metaJson: JSON.stringify({ amount: design.listedPrice }),
      },
    });
  });

  revalidatePath("/marketplace");
  revalidatePath(`/marketplace/${designId}`);
  revalidatePath("/account/designs");
  revalidatePath("/creator");
  revalidatePath("/account/notifications");

  return {
    ok: true,
    message:
      design.listedPrice > 0
        ? `Licensed for Rs. ${design.listedPrice}.`
        : "Free design added to your collection.",
  };
}
