"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOutUser } from "@/lib/actions/auth";
import {
  portalMeta,
  type PortalNavItem,
  type PortalVariant,
} from "@/components/portal/portal-nav";

function isActive(pathname: string, item: PortalNavItem) {
  if (item.href.includes("#")) {
    const base = item.href.split("#")[0] || "/";
    return pathname === base || pathname.startsWith(`${base}/`);
  }
  if (item.href === "/vendor/jobs" && pathname.startsWith("/vendor/orders")) {
    return true;
  }
  if (item.match === "prefix") {
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }
  return pathname === item.href;
}

export function PortalShell({
  variant,
  nav,
  userName,
  userEmail,
  badge,
  children,
}: {
  variant: PortalVariant;
  nav: PortalNavItem[];
  userName?: string | null;
  userEmail?: string | null;
  badge?: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const meta = portalMeta(variant);
  const lightChrome = true;

  const sidebarTone = lightChrome
    ? "bg-[var(--paper-elevated)] text-[var(--ink)] ring-1 ring-[var(--ink)]/8"
    : "bg-[var(--ink-soft)] text-[var(--paper)]";

  const linkIdle = lightChrome
    ? "text-[var(--muted)] hover:bg-[var(--ink)]/[0.04] hover:text-[var(--ink)]"
    : "text-white/65 hover:bg-white/10 hover:text-white";

  const linkActive = lightChrome
    ? "bg-[var(--ink)] text-[var(--paper)]"
    : "bg-white/15 text-white";

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => {
        const active = isActive(pathname, item);
        return (
          <Link
            key={item.href + item.label}
            href={item.href}
            onClick={onNavigate}
            className={`rounded-md px-3 py-2.5 text-sm transition ${
              active ? linkActive : linkIdle
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const homeHref =
    variant === "customer"
      ? "/customer"
      : variant === "vendor"
        ? "/vendor"
        : variant === "ops"
          ? "/ops"
          : "/admin";

  return (
    <div className={`-mt-0 ${meta.variantClass}`}>
      <div className="mx-auto flex max-w-7xl items-start gap-0 lg:gap-8 lg:px-6 lg:py-8">
        {/* Desktop sidebar — sticky, content-height so nav + account stay one block */}
        <aside
          className={`sticky top-20 hidden h-fit w-64 shrink-0 flex-col self-start overflow-y-auto rounded-2xl p-5 lg:flex ${sidebarTone}`}
        >
          <p
            className={`text-[10px] uppercase tracking-[0.16em] ${
              lightChrome ? "text-[var(--accent)]" : "text-white/50"
            }`}
          >
            {meta.eyebrow}
          </p>
          <Link
            href={homeHref}
            className="mt-2 font-[family-name:var(--font-display)] text-xl tracking-tight hover:opacity-80"
          >
            {meta.title}
          </Link>
          {badge ? (
            <p
              className={`mt-2 text-xs ${
                lightChrome ? "text-[var(--muted)]" : "text-white/55"
              }`}
            >
              {badge}
            </p>
          ) : null}
          <div className="mt-8">
            <NavLinks />
          </div>
          <div
            className={`mt-6 border-t pt-4 ${
              lightChrome ? "border-[var(--ink)]/10" : "border-white/10"
            }`}
          >
            <p className="truncate text-sm font-medium">{userName ?? "Account"}</p>
            <p
              className={`mt-0.5 truncate text-xs ${
                lightChrome ? "text-[var(--muted)]" : "text-white/50"
              }`}
            >
              {userEmail}
            </p>
            <form action={signOutUser} className="mt-4">
              <Button
                type="submit"
                size="sm"
                variant={lightChrome ? "outline" : "secondary"}
                className={
                  lightChrome
                    ? "w-full"
                    : "w-full border-white/20 bg-white/10 text-white hover:bg-white/20"
                }
              >
                Sign out
              </Button>
            </form>
          </div>
        </aside>

        {/* Main column */}
        <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-0 lg:py-0">
          <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--accent)]">
                {meta.eyebrow}
              </p>
              <Link
                href={homeHref}
                className="font-[family-name:var(--font-display)] text-xl tracking-tight hover:opacity-80"
              >
                {meta.title}
              </Link>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
            >
              {open ? "Close" : "Menu"}
            </Button>
          </div>

          {open ? (
            <div className="mb-6 rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-4 lg:hidden">
              <NavLinks onNavigate={() => setOpen(false)} />
              <form action={signOutUser} className="mt-4 border-t border-[var(--ink)]/10 pt-4">
                <Button type="submit" size="sm" variant="outline" className="w-full">
                  Sign out
                </Button>
              </form>
            </div>
          ) : null}

          {children}
        </div>
      </div>
    </div>
  );
}
