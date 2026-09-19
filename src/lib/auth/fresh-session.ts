import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  AUTH_PRESENCE_COOKIE,
  isAuthPresenceValid,
} from "@/lib/auth/session-lifetime";

/** Session user only when Auth.js JWT + fresh presence cookie are both valid. */
export async function getFreshSessionUser() {
  const session = await auth();
  if (!session?.user) return null;

  const presence = (await cookies()).get(AUTH_PRESENCE_COOKIE)?.value;
  if (!isAuthPresenceValid(presence)) return null;

  return session.user;
}

/**
 * Require a fresh login. Stale JWT without presence → hard end-session
 * (never show portal chrome as “Ayesha” while the header says Sign in).
 */
export async function requireFreshSession(callbackUrl: string) {
  const session = await auth();
  if (!session?.user) {
    redirect(`/auth/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const presence = (await cookies()).get(AUTH_PRESENCE_COOKIE)?.value;
  if (!isAuthPresenceValid(presence)) {
    redirect("/auth/end-session");
  }

  return session.user;
}
