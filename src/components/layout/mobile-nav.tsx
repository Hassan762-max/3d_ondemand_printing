"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";

export type NavLink = { href: string; label: string };

export function MobileNav({
  links,
  roleLinks = [],
  cartCount,
  signedIn,
  firstName,
  portalHref = "/customer",
  showCart = true,
}: {
  links: NavLink[];
  roleLinks?: NavLink[];
  cartCount: number;
  signedIn: boolean;
  firstName?: string | null;
  portalHref?: string;
  showCart?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--ink)]/12 text-[var(--ink)]"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="sr-only">Menu</span>
        <span className="flex flex-col gap-1.5">
          <span
            className={`block h-px w-4 bg-current transition ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
          />
          <span className={`block h-px w-4 bg-current transition ${open ? "opacity-0" : ""}`} />
          <span
            className={`block h-px w-4 bg-current transition ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
          />
        </span>
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-16 z-50 border-b border-[var(--ink)]/8 bg-[var(--paper)]/98 px-4 py-5 shadow-sm backdrop-blur-md">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                className="rounded-md px-3 py-2.5 text-sm text-[var(--ink)] hover:bg-[var(--ink)]/[0.04]"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {roleLinks.length > 0 ? (
            <nav className="mt-3 flex flex-col gap-1 border-t border-[var(--ink)]/8 pt-3">
              {roleLinks.map((link) => (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  className="rounded-md px-3 py-2.5 text-sm text-[var(--ink)] hover:bg-[var(--ink)]/[0.04]"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          ) : null}
          <div className="mt-4 flex flex-col gap-2 border-t border-[var(--ink)]/8 pt-4">
            {showCart ? (
              <Link href="/cart" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full justify-between" size="sm">
                  Cart
                  {cartCount > 0 ? <span>{cartCount}</span> : null}
                </Button>
              </Link>
            ) : null}
            {signedIn ? (
              <Link href={portalHref} onClick={() => setOpen(false)}>
                <Button className="w-full" size="sm">
                  {firstName ?? "Portal"}
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/sign-in" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/auth/sign-up" onClick={() => setOpen(false)}>
                  <Button className="w-full" size="sm">
                    Start Creating
                  </Button>
                </Link>
              </>
            )}
          </div>
          <p className="mt-4 text-center text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
            {brand.name}
          </p>
        </div>
      ) : null}
    </div>
  );
}
