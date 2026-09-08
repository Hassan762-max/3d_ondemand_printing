"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginUser, type AuthActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { brand } from "@/lib/brand";

const initial: AuthActionState = { ok: false };

export default function SignInPage() {
  const [state, action, pending] = useActionState(loginUser, initial);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
        Welcome back
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Sign in to {brand.name} to continue creating.
      </p>

      <form action={action} className="mt-8 space-y-4">
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
        {state.message ? (
          <p className="text-sm text-[var(--danger)]">{state.message}</p>
        ) : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-[var(--muted)]">
        New here?{" "}
        <Link href="/auth/sign-up" className="text-[var(--ink)] underline">
          Create an account
        </Link>
      </p>
      <p className="mt-4 text-xs text-[var(--muted)]">
        Demo: customer@printora.pk / password123
      </p>
    </div>
  );
}
