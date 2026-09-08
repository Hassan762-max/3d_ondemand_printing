"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerUser, type AuthActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { brand } from "@/lib/brand";

const initial: AuthActionState = { ok: false };

export default function SignUpPage() {
  const [state, action, pending] = useActionState(registerUser, initial);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
        Create your {brand.name}
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Start designing custom clothing with AI and 3D tools.
      </p>

      <form action={action} className="mt-8 space-y-4">
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
          <Input id="city" name="city" placeholder="Lahore, Karachi, …" autoComplete="address-level2" />
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
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link href="/auth/sign-in" className="text-[var(--ink)] underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
