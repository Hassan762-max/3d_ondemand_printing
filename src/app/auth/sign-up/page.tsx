"use client";

import Link from "next/link";
import { Suspense, useActionState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ClearAuthLifetimeOnMount } from "@/components/auth/session-lifetime-root";
import { registerUser, type AuthActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { brand } from "@/lib/brand";

const initial: AuthActionState = { ok: false };

function SignUpForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";
  const [state, action, pending] = useActionState(registerUser, initial);
  const signInHref = callbackUrl
    ? `/auth/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/auth/sign-in";

  useEffect(() => {
    if (state.ok && state.redirectTo) {
      window.location.assign(state.redirectTo);
    }
  }, [state.ok, state.redirectTo]);

  const redirecting = state.ok && !!state.redirectTo;

  return (
    <>
      <ClearAuthLifetimeOnMount />
      <form action={action} className="mt-8 space-y-4">
        {callbackUrl ? (
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
        ) : null}
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" required autoComplete="name" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div>
          <Label htmlFor="city">City (Pakistan)</Label>
          <Input
            id="city"
            name="city"
            placeholder="Lahore, Karachi, …"
            autoComplete="address-level2"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        {state.message ? (
          <p className="text-sm text-[var(--danger)]">{state.message}</p>
        ) : null}
        <Button type="submit" className="w-full" disabled={pending || redirecting}>
          {pending || redirecting ? "Creating…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link href={signInHref} className="text-[var(--ink)] underline">
          Sign in
        </Link>
      </p>
    </>
  );
}

export default function SignUpPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
        Create a customer account
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Design custom clothing with AI and 3D tools, then order across Pakistan.
      </p>

      <Suspense fallback={<p className="mt-8 text-sm text-[var(--muted)]">Loading…</p>}>
        <SignUpForm />
      </Suspense>

      <p className="mt-8 text-sm text-[var(--muted)]">
        Own a print shop?{" "}
        <Link href="/auth/vendor/sign-up" className="text-[var(--ink)] underline">
          Apply as a vendor
        </Link>
      </p>
    </div>
  );
}
