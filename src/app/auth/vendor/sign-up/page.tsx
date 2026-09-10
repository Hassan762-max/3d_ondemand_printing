"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  registerVendor,
} from "@/lib/actions/vendor-onboarding";
import type { AuthActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { brand } from "@/lib/brand";
import { PRODUCT_CATEGORY_OPTIONS } from "@/lib/product-categories";

const initial: AuthActionState = { ok: false };

export default function VendorSignUpPage() {
  const [state, action, pending] = useActionState(registerVendor, initial);

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
        Production partners
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
        Become a {brand.name} vendor
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
        Apply to print for customers across Pakistan. Choose the products you
        can fulfill — your account stays pending until an admin approves it.
      </p>

      <form action={action} className="mt-10 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Contact name</Label>
            <Input id="name" name="name" required autoComplete="name" />
          </div>
          <div>
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="businessName">Business / shop name</Label>
          <Input id="businessName" name="businessName" required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              required
              placeholder="Lahore, Karachi, …"
              autoComplete="address-level2"
            />
          </div>
          <div>
            <Label htmlFor="province">Province</Label>
            <Input
              id="province"
              name="province"
              required
              placeholder="Punjab, Sindh, …"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
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

        <fieldset>
          <legend className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
            Products you can print
          </legend>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Select every blank you can fulfill for customers.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {PRODUCT_CATEGORY_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--ink)]/10 bg-[var(--paper-elevated)] px-3 py-2.5 text-sm"
              >
                <input
                  type="checkbox"
                  name="categories"
                  value={option.value}
                  className="accent-[var(--ink)]"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <Label htmlFor="servicesNote">What you can print (optional)</Label>
          <textarea
            id="servicesNote"
            name="servicesNote"
            rows={3}
            maxLength={500}
            placeholder="e.g. DTG tees & hoodies, embroidery on caps, 48-hour turnaround…"
            className="mt-2 w-full rounded-md border border-[var(--ink)]/12 bg-white/80 px-3 py-2.5 text-sm outline-none ring-[var(--accent)]/30 placeholder:text-[var(--muted)] focus:ring-2"
          />
        </div>

        {state.message ? (
          <p className="text-sm text-[var(--danger)]">{state.message}</p>
        ) : null}

        <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
          {pending ? "Submitting…" : "Submit vendor application"}
        </Button>
      </form>

      <p className="mt-8 text-sm text-[var(--muted)]">
        Looking to order custom clothing instead?{" "}
        <Link href="/auth/sign-up" className="text-[var(--ink)] underline">
          Create a customer account
        </Link>
        {" · "}
        <Link href="/auth/sign-in" className="text-[var(--ink)] underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
