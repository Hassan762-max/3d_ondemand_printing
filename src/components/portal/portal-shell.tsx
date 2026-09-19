"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SignOutForm } from "@/components/auth/sign-out-form";
import { Button } from "@/components/ui/button";
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

function PortalNavLinks({
  nav,
  pathname,
  linkIdle,
  linkActive,
  onNavigate,
}: {
  nav: PortalNavItem[];
  pathname: string;
  linkIdle: string;
  linkActive: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => {
        const active = isActive(pathname, item);
        return (
          <Link
            key={item.href + item.label}
            href={item.href}
            prefetch
            scroll={false}
            onClick={onNavigate}
            className={`rounded-md px-3 py-2.5 text-sm transition ${
              active ? linkActive : linkIdle
            }`}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
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
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const meta = portalMeta(variant);
  const lightChrome = true;

  useEffect(() => {
    for (const item of nav) {
      router.prefetch(item.href);
    }
  }, [nav, router]);

  const sidebarTone = lightChrome
    ? "bg-[var(--paper-elevated)] text-[var(--ink)] ring-1 ring-[var(--ink)]/8"
    : "bg-[var(--ink-soft)] text-[var(--paper)]";

  const linkIdle = lightChrome
    ? "text-[var(--muted)] hover:bg-[var(--ink)]/[0.04] hover:text-[var(--ink)]"
    : "text-white/65 hover:bg-white/10 hover:text-white";

  const linkActive = lightChrome
    ? "bg-[var(--ink)] text-[var(--paper)]"
    : "bg-white/15 text-white";

  const homeHref =
    variant === "customer"
      ? "/customer"
      : variant === "vendor"
        ? "/vendor"
        : variant === "ops"
          ? "/ops"
          : "/admin";

  return (
    <div className={meta.variantClass}>
      <div className="mx-auto flex max-w-7xl items-start gap-0 lg:gap-8 lg:px-6 lg:py-8">
        <aside
          className={`sticky top-4 hidden h-fit w-64 shrink-0 flex-col self-start overflow-y-auto rounded-2xl p-5 lg:flex ${sidebarTone}`}
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
            prefetch
            scroll={false}
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
            <PortalNavLinks
              nav={nav}
              pathname={pathname}
              linkIdle={linkIdle}
              linkActive={linkActive}
            />
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
            <SignOutForm className="mt-4">
              <Button
                type="submit"
                size="sm"
                variant="outline"
                className="w-full"
              >
                Sign out
              </Button>
            </SignOutForm>
          </div>
        </aside>

        <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-0 lg:py-0">
          <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--accent)]">
                {meta.eyebrow}
              </p>
              <Link
                href={homeHref}
                prefetch
                scroll={false}
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
              <PortalNavLinks
                nav={nav}
                pathname={pathname}
                linkIdle={linkIdle}
                linkActive={linkActive}
                onNavigate={() => setOpen(false)}
              />
              <SignOutForm className="mt-4 border-t border-[var(--ink)]/10 pt-4">
                <Button type="submit" size="sm" variant="outline" className="w-full">
                  Sign out
                </Button>
              </SignOutForm>
            </div>
          ) : null}

          <div
            className={
              lightChrome
                ? "rounded-2xl border border-[var(--ink)]/8 bg-[var(--paper-elevated)] p-5 sm:p-8"
                : undefined
            }
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
