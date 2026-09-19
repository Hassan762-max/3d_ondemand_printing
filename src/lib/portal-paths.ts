/** Routes that use PortalShell — no marketing header/footer. */
export function isPortalAppPath(pathname: string): boolean {
  return (
    pathname === "/customer" ||
    pathname.startsWith("/customer/") ||
    pathname.startsWith("/vendor") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/ops") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/creator")
  );
}
