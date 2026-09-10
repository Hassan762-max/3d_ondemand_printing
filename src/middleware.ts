import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPrefixes = [
  "/account",
  "/customer",
  "/orders",
  "/checkout",
  "/designs/upload",
  "/ai",
  "/try-on",
  "/vendor",
  "/ops",
  "/creator",
  "/admin",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuth = protectedPrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (!needsAuth) return NextResponse.next();

  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ??
    request.cookies.get("__Secure-authjs.session-token")?.value;

  if (!sessionToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/sign-in";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/account/:path*",
    "/customer",
    "/customer/:path*",
    "/orders/:path*",
    "/checkout/:path*",
    "/designs/upload",
    "/ai",
    "/ai/:path*",
    "/try-on",
    "/try-on/:path*",
    "/vendor",
    "/vendor/:path*",
    "/ops",
    "/ops/:path*",
    "/creator",
    "/creator/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
