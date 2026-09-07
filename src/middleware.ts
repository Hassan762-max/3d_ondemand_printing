import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPrefixes = [
  "/account",
  "/orders",
  "/checkout",
  "/designs/upload",
  "/ai",
  "/try-on",
  "/vendor",
  "/ops",
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
  ],
};
