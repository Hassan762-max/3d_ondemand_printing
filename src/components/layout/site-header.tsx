import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/products", label: "Products" },
  { href: "/designs", label: "Designs" },
  { href: "/studio", label: "3D Studio" },
  { href: "/ai", label: "AI Studio" },
  { href: "/try-on", label: "Try-On" },
  { href: "/how-it-works", label: "How it works" },
];

export async function SiteHeader() {
  const session = await auth();
  const cartCount = session?.user?.id
    ? await prisma.cartItem.count({ where: { cart: { userId: session.user.id } } })
    : 0;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--ink)]/8 bg-[var(--paper)]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-[family-name:var(--font-display)] text-xl tracking-tight text-[var(--ink)]">
            Printora
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
          <Link href="/cart" className="relative hidden text-sm text-[var(--muted)] hover:text-[var(--ink)] sm:inline">
            Cart
            {cartCount > 0 ? (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1.5 text-[10px] font-medium text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
          {session?.user ? (
            <Link href="/account">
              <Button variant="outline" size="sm">
                {session.user.name?.split(" ")[0] ?? "Account"}
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/auth/sign-in" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button size="sm">Start creating</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
