import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { signOut } from "@/lib/auth";
import { sameOriginUrl } from "@/lib/auth/request-origin";

/** Hard-clear Auth.js cookies when the browser-lifetime guard ends a session. */
export async function GET(request: Request) {
  try {
    await signOut({ redirect: false });
  } catch {
    // Continue and clear cookies even if Auth.js throws.
  }

  const response = NextResponse.redirect(
    sameOriginUrl("/auth/sign-in", request),
  );

  const jar = await cookies();
  for (const cookie of jar.getAll()) {
    if (
      cookie.name.includes("authjs") ||
      cookie.name.includes("next-auth") ||
      cookie.name.startsWith("nivaro-auth")
    ) {
      response.cookies.set(cookie.name, "", {
        path: "/",
        maxAge: 0,
      });
    }
  }

  // Always clear known names even if jar enumeration missed chunked cookies.
  for (const name of [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "nivaro-auth-presence",
  ]) {
    response.cookies.set(name, "", { path: "/", maxAge: 0 });
  }

  return response;
}
