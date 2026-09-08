import Link from "next/link";
import { auth } from "@/lib/auth";
import { brand } from "@/lib/brand";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";

const links = [
  { href: "/products", label: "Products" },
  { href: "/designs", label: "Designs" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/studio", label: "3D Studio" },
  { href: "/ai", label: "AI Studio" },
  { href: "/try-on", label: "Try-On" },
];

export async function SiteHeader() {
  const session = await auth();
  const cartCount = session?.user?.id
    ? await prisma.cartItem.count({ where: { cart: { userId: session.user.id } } })
    : 0;
  const unreadCount = session?.user?.id
    ? await prisma.notification.count({
        where: { userId: session.user.id, read: false },
      })
    : 0;
  const isVendor = session?.user?.role === "VENDOR";
  const opsRoles = new Set([
    "ADMIN",
    "SUPER_ADMIN",
    "SUPPORT_MANAGER",
    "QC_MANAGER",
    "FINANCE_MANAGER",
    "PRODUCTION_MANAGER",
  ]);
  const isOps = session?.user?.role ? opsRoles.has(session.user.role) : false;
  const isAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--ink)]/8 bg-[var(--paper)]/90 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-xl tracking-tight text-[var(--ink)]"
          >
            {brand.name}
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[var(--muted)] transition hover:text-[var(--ink)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="relative hidden text-sm text-[var(--muted)] hover:text-[var(--ink)] sm:inline"
          >
            Cart
            {cartCount > 0 ? (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1.5 text-[10px] font-medium text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>

          {session?.user ? (
            <>
              <Link
                href="/account/notifications"
                className="relative hidden text-sm text-[var(--muted)] hover:text-[var(--ink)] lg:inline"
              >
                Alerts
                {unreadCount > 0 ? (
                  <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--ink)] px-1.5 text-[10px] font-medium text-[var(--paper)]">
                    {unreadCount}
                  </span>
                ) : null}
              </Link>
              {isVendor ? (
                <Link
                  href="/vendor"
                  className="hidden text-sm text-[var(--muted)] hover:text-[var(--ink)] lg:inline"
                >
                  Vendor
                </Link>
              ) : null}
              {isOps ? (
                <Link
                  href="/ops"
                  className="hidden text-sm text-[var(--muted)] hover:text-[var(--ink)] lg:inline"
                >
                  Ops
                </Link>
              ) : null}
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="hidden text-sm text-[var(--muted)] hover:text-[var(--ink)] lg:inline"
                >
                  Admin
                </Link>
              ) : null}
              <Link href="/account" className="hidden sm:inline-flex">
                <Button variant="outline" size="sm">
                  {session.user.name?.split(" ")[0] ?? "Account"}
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/sign-in" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/sign-up" className="hidden sm:block">
                <Button size="sm">Start Creating</Button>
              </Link>
            </>
          )}

          <MobileNav
            links={links}
            cartCount={cartCount}
            signedIn={Boolean(session?.user)}
            firstName={session?.user?.name?.split(" ")[0]}
          />
        </div>
      </div>
    </header>
  );
}
