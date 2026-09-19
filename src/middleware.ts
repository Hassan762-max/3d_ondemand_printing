import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  AUTH_PRESENCE_COOKIE,
  isAuthPresenceValid,
} from "@/lib/auth/session-lifetime";

const protectedPrefixes = [
  "/account",
  "/customer",
  "/cart",
  "/orders",
  "/checkout",
  "/designs/upload",
  "/ai",
  "/vendor",
  "/ops",
  "/creator",
  "/admin",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  const needsAuth = protectedPrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ??
    request.cookies.get("__Secure-authjs.session-token")?.value;
  const presenceValid = isAuthPresenceValid(
    request.cookies.get(AUTH_PRESENCE_COOKIE)?.value,
  );

  // Homepage / storefront: JWT without fresh presence → force logout
  // (stops "Ayesha" showing after Chrome restores cookies).
  if (sessionToken && !presenceValid && !pathname.startsWith("/auth/")) {
    const end = request.nextUrl.clone();
    end.pathname = "/auth/end-session";
    end.search = "";
    return NextResponse.redirect(end);
  }

  if (!needsAuth) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  if (!sessionToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/sign-in";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (!presenceValid) {
    const end = request.nextUrl.clone();
    end.pathname = "/auth/end-session";
    end.search = "";
    return NextResponse.redirect(end);
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
