"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import type { ProductCategory } from "@prisma/client";
import { z } from "zod";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PRODUCT_CATEGORY_OPTIONS } from "@/lib/product-categories";
import { checkRateLimit } from "@/lib/rate-limit";
import type { AuthActionState } from "@/lib/actions/auth";

const allowedCategories = PRODUCT_CATEGORY_OPTIONS.map((c) => c.value);

const vendorSignUpSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  businessName: z.string().min(2).max(120),
  city: z.string().min(2).max(80),
  province: z.string().min(2).max(80),
  phone: z.string().min(8).max(30),
  servicesNote: z.string().max(500).optional(),
  categories: z.array(z.string()).min(1),
});

export async function registerVendor(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const emailHint = String(formData.get("email") ?? "anon");
  const limited = checkRateLimit(`vendor-signup:${emailHint.toLowerCase()}`, 5, 60_000);
  if (!limited.ok) {
    return {
      ok: false,
      message: `Too many sign-up attempts. Try again in ${limited.retryAfterSec}s.`,
    };
  }

  const categories = formData
    .getAll("categories")
    .map((v) => String(v))
    .filter((v) => (allowedCategories as readonly string[]).includes(v));

  const parsed = vendorSignUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    businessName: formData.get("businessName"),
    city: formData.get("city"),
    province: formData.get("province"),
    phone: formData.get("phone"),
    servicesNote: String(formData.get("servicesNote") ?? "").trim() || undefined,
    categories,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please complete all fields and choose at least one product you can print.",
    };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, message: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const vendor = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: parsed.data.name,
        email,
        passwordHash,
        city: parsed.data.city,
        role: "VENDOR",
      },
    });

    return tx.vendor.create({
      data: {
        userId: user.id,
        businessName: parsed.data.businessName,
        city: parsed.data.city,
        province: parsed.data.province,
        phone: parsed.data.phone,
        servicesNote: parsed.data.servicesNote,
        active: false,
        approvalStatus: "PENDING",
        capabilities: {
          create: parsed.data.categories.map((category) => ({
            category: category as ProductCategory,
          })),
        },
      },
    });
  });

  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] }, active: true },
    select: { id: true },
  });

  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        title: "New vendor awaiting approval",
        body: `${parsed.data.businessName} in ${parsed.data.city} applied to print for customers.`,
        href: "/admin/vendors",
      })),
    });
  }

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: `/auth/establish?next=${encodeURIComponent("/vendor")}`,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        ok: false,
        message: "Application submitted. Please sign in to track approval.",
      };
    }
    throw error;
  }

  void vendor;
  return { ok: true };
}
