import { auth } from "@/lib/auth";
import { sameOriginUrl } from "@/lib/auth/request-origin";
import { safeCallbackUrl } from "@/lib/auth/safe-callback-url";
import { AUTH_PRESENCE_COOKIE } from "@/lib/auth/session-lifetime";
import { portalHomeForRole } from "@/components/portal/portal-nav";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

function establishResponse(request: Request, session: Session | null) {
  const url = new URL(request.url);
  const fallback =
    session?.user?.role != null
      ? portalHomeForRole(session.user.role)
      : "/customer";
  const next = safeCallbackUrl(url.searchParams.get("next"), fallback);

  if (!session?.user) {
    return NextResponse.redirect(sameOriginUrl("/auth/sign-in", request));
  }

  const response = NextResponse.redirect(sameOriginUrl(next, request));
  const secure =
    url.protocol === "https:" ||
    request.headers.get("x-forwarded-proto") === "https";

  response.cookies.set(AUTH_PRESENCE_COOKIE, String(Date.now()), {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    secure,
  });

  return response;
}

/**
 * After credentials sign-in, set a browser-session presence cookie (no Max-Age)
 * then redirect into the app.
 */
export async function GET(request: Request) {
  const session = await auth();
  return establishResponse(request, session);
}

/** Server Actions / Auth.js may POST here — accept and behave like GET. */
export async function POST(request: Request) {
  const session = await auth();
  return establishResponse(request, session);
}
