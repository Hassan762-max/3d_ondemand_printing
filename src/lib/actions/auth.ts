"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn, signOut } from "@/lib/auth";
import { portalHomeForRole } from "@/components/portal/portal-nav";
import { prisma } from "@/lib/db";
import { safeCallbackUrl } from "@/lib/auth/safe-callback-url";
import { checkRateLimit } from "@/lib/rate-limit";

const signUpSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  city: z.string().min(2).max(80).optional(),
});

export type AuthActionState = {
  ok: boolean;
  message?: string;
  /** Hard-navigate here after success (avoids Server Action + Auth.js redirect 405). */
  redirectTo?: string;
};

export async function registerUser(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const emailHint = String(formData.get("email") ?? "anon");
  const limited = checkRateLimit(`signup:${emailHint.toLowerCase()}`, 5, 60_000);
  if (!limited.ok) {
    return {
      ok: false,
      message: `Too many sign-up attempts. Try again in ${limited.retryAfterSec}s.`,
    };
  }

  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    city: formData.get("city") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, message: "Please check your details and try again." };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, message: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
      city: parsed.data.city,
      role: "CUSTOMER",
    },
  });

  const dest = safeCallbackUrl(formData.get("callbackUrl"), "/customer");
  const redirectTo = `/auth/establish?next=${encodeURIComponent(dest)}`;

  try {
    const result = await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirect: false,
    });
    if (result?.error) {
      return { ok: false, message: "Account created. Please sign in." };
    }
    return { ok: true, redirectTo };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, message: "Account created. Please sign in." };
    }
    throw error;
  }
}

export async function loginUser(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const limited = checkRateLimit(`signin:${email.toLowerCase() || "anon"}`, 12, 60_000);
  if (!limited.ok) {
    return {
      ok: false,
      message: `Too many sign-in attempts. Try again in ${limited.retryAfterSec}s.`,
    };
  }

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { role: true },
  });
  const portalHome = existing ? portalHomeForRole(existing.role) : "/customer";
  const dest = safeCallbackUrl(formData.get("callbackUrl"), portalHome);
  const redirectTo = `/auth/establish?next=${encodeURIComponent(dest)}`;

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.error) {
      return { ok: false, message: "Invalid email or password." };
    }
    return { ok: true, redirectTo };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, message: "Invalid email or password." };
    }
    throw error;
  }
}

export async function signOutUser() {
  await signOut({ redirectTo: "/" });
}
