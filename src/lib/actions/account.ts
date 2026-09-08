"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export type AccountActionResult = { ok: boolean; message?: string };

const profileSchema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().max(20).optional(),
  city: z.string().max(80).optional(),
  province: z.string().max(80).optional(),
});

const styleSchema = z.object({
  defaultSize: z.string().max(10).optional(),
  fit: z.enum(["slim", "regular", "oversized", ""]).optional(),
  styles: z.string().max(200).optional(),
});

export async function updateProfile(
  _prev: AccountActionResult,
  formData: FormData,
): Promise<AccountActionResult> {
  const user = await requireUser();

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: String(formData.get("phone") || "").trim() || undefined,
    city: String(formData.get("city") || "").trim() || undefined,
    province: String(formData.get("province") || "").trim() || undefined,
  });
  if (!parsed.success) {
    return { ok: false, message: "Check your profile details and try again." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone ?? null,
      city: parsed.data.city ?? null,
      province: parsed.data.province ?? null,
    },
  });

  revalidatePath("/account");
  revalidatePath("/account/profile");
  revalidatePath("/checkout");
  return { ok: true, message: "Profile saved." };
}

export async function updateStyleProfile(
  _prev: AccountActionResult,
  formData: FormData,
): Promise<AccountActionResult> {
  const user = await requireUser();

  const parsed = styleSchema.safeParse({
    defaultSize: String(formData.get("defaultSize") || "").trim() || undefined,
    fit: formData.get("fit") || undefined,
    styles: String(formData.get("styles") || "").trim() || undefined,
  });
  if (!parsed.success) {
    return { ok: false, message: "Could not save style preferences." };
  }

  const styles = (parsed.data.styles ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);

  const preferences = JSON.stringify({
    fit: parsed.data.fit || undefined,
    styles,
  });
  const sizes = JSON.stringify({
    default: parsed.data.defaultSize || undefined,
  });

  await prisma.styleProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, preferences, sizes },
    update: { preferences, sizes },
  });

  revalidatePath("/account/profile");
  revalidatePath("/studio");
  revalidatePath("/ai");
  return { ok: true, message: "Style preferences saved." };
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(8).max(128),
    newPassword: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function changePassword(
  _prev: AccountActionResult,
  formData: FormData,
): Promise<AccountActionResult> {
  const user = await requireUser();
  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check passwords (8+ chars, new must match confirm).",
    };
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser?.passwordHash) {
    return { ok: false, message: "Password login is not set for this account." };
  }

  const bcrypt = await import("bcryptjs");
  const valid = await bcrypt.compare(
    parsed.data.currentPassword,
    dbUser.passwordHash,
  );
  if (!valid) return { ok: false, message: "Current password is incorrect." };

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "account.password_change",
      entity: "User",
      entityId: user.id,
    },
  });

  revalidatePath("/account/profile");
  return { ok: true, message: "Password updated." };
}
