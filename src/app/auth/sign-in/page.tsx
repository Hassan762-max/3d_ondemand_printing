"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ClearAuthLifetimeOnMount } from "@/components/auth/session-lifetime-root";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { brand } from "@/lib/brand";
import { safeCallbackUrl } from "@/lib/auth/safe-callback-url";

/**
 * Native HTML POST to Auth.js — full browser navigation so Set-Cookie is
 * applied before /auth/establish runs (fetch+redirect was dropping session
 * behind ngrok).
 */
function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";
  const signUpHref = callbackUrl
    ? `/auth/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/auth/sign-up";

  const next = safeCallbackUrl(callbackUrl, "/customer");
  const establishUrl = `/auth/establish?next=${encodeURIComponent(next)}`;

  const [csrfToken, setCsrfToken] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/auth/csrf", {
          credentials: "include",
          cache: "no-store",
          headers: { "ngrok-skip-browser-warning": "1" },
        });
        if (!res.ok) throw new Error("csrf");
        const data = (await res.json()) as { csrfToken?: string };
        if (!cancelled && data.csrfToken) setCsrfToken(data.csrfToken);
      } catch {
        if (!cancelled) {
          setMessage("Could not start sign-in. Refresh the page.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <ClearAuthLifetimeOnMount />
      <form
        method="post"
        action="/api/auth/callback/credentials"
        className="mt-8 space-y-4"
        onSubmit={() => {
          if (!csrfToken) {
            setMessage("Still preparing sign-in… try again in a moment.");
            return;
          }
          setPending(true);
        }}
      >
        <input type="hidden" name="csrfToken" value={csrfToken} />
        <input type="hidden" name="callbackUrl" value={establishUrl} />
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            minLength={8}
          />
        </div>
        {message ? (
          <p className="text-sm text-[var(--danger)]">{message}</p>
        ) : null}
        <Button type="submit" className="w-full" disabled={pending || !csrfToken}>
          {pending ? "Signing in…" : !csrfToken ? "Preparing…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-[var(--muted)]">
        New customer?{" "}
        <Link href={signUpHref} className="text-[var(--ink)] underline">
          Create an account
        </Link>
        {" · "}
        <Link href="/auth/vendor/sign-up" className="text-[var(--ink)] underline">
          Vendor application
        </Link>
      </p>
    </>
  );
}

export default function SignInPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
        Welcome back
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Sign in to {brand.name} to continue creating.
      </p>

      <Suspense fallback={<p className="mt-8 text-sm text-[var(--muted)]">Loading…</p>}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
