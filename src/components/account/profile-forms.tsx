"use client";

import { useActionState } from "react";
import {
  changePassword,
  updateProfile,
  updateStyleProfile,
  type AccountActionResult,
} from "@/lib/actions/account";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const initial: AccountActionResult = { ok: false };

export function ProfileForms({
  profile,
  style,
}: {
  profile: {
    name: string;
    email: string;
    phone: string;
    city: string;
    province: string;
  };
  style: {
    defaultSize: string;
    fit: string;
    styles: string;
  };
}) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateProfile,
    initial,
  );
  const [styleState, styleAction, stylePending] = useActionState(
    updateStyleProfile,
    initial,
  );
  const [passwordState, passwordAction, passwordPending] = useActionState(
    changePassword,
    initial,
  );

  return (
    <div className="mt-10 space-y-12">
      <form action={profileAction} className="space-y-4">
        <h2 className="text-lg font-medium tracking-tight">Contact details</h2>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={profile.name} required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={profile.email} disabled />
          <p className="mt-1 text-xs text-[var(--muted)]">Email cannot be changed here.</p>
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={profile.phone}
            placeholder="03XXXXXXXXX"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" defaultValue={profile.city} />
          </div>
          <div>
            <Label htmlFor="province">Province</Label>
            <Input id="province" name="province" defaultValue={profile.province} />
          </div>
        </div>
        {profileState.message ? (
          <p
            className={`text-sm ${profileState.ok ? "text-[var(--accent)]" : "text-[var(--danger)]"}`}
          >
            {profileState.message}
          </p>
        ) : null}
        <Button type="submit" disabled={profilePending}>
          {profilePending ? "Saving…" : "Save profile"}
        </Button>
      </form>

      <form action={styleAction} className="space-y-4 border-t border-[var(--ink)]/10 pt-10">
        <h2 className="text-lg font-medium tracking-tight">Style profile</h2>
        <p className="text-sm text-[var(--muted)]">
          Used to default size suggestions and inform the AI style consultant.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="defaultSize">Default size</Label>
            <select
              id="defaultSize"
              name="defaultSize"
              defaultValue={style.defaultSize}
              className="mt-1.5 h-11 w-full rounded-md border border-[var(--ink)]/12 bg-white/70 px-3 text-sm"
            >
              <option value="">No preference</option>
              {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="fit">Preferred fit</Label>
            <select
              id="fit"
              name="fit"
              defaultValue={style.fit}
              className="mt-1.5 h-11 w-full rounded-md border border-[var(--ink)]/12 bg-white/70 px-3 text-sm"
            >
              <option value="">No preference</option>
              <option value="slim">Slim</option>
              <option value="regular">Regular</option>
              <option value="oversized">Oversized</option>
            </select>
          </div>
        </div>
        <div>
          <Label htmlFor="styles">Style tags</Label>
          <Input
            id="styles"
            name="styles"
            defaultValue={style.styles}
            placeholder="Minimal, Streetwear, Typography"
          />
          <p className="mt-1 text-xs text-[var(--muted)]">Comma-separated.</p>
        </div>
        {styleState.message ? (
          <p
            className={`text-sm ${styleState.ok ? "text-[var(--accent)]" : "text-[var(--danger)]"}`}
          >
            {styleState.message}
          </p>
        ) : null}
        <Button type="submit" variant="outline" disabled={stylePending}>
          {stylePending ? "Saving…" : "Save style preferences"}
        </Button>
      </form>

      <form action={passwordAction} className="space-y-4 border-t border-[var(--ink)]/10 pt-10">
        <h2 className="text-lg font-medium tracking-tight">Change password</h2>
        <div>
          <Label htmlFor="currentPassword">Current password</Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <div>
          <Label htmlFor="newPassword">New password</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
          />
        </div>
        {passwordState.message ? (
          <p
            className={`text-sm ${passwordState.ok ? "text-[var(--accent)]" : "text-[var(--danger)]"}`}
          >
            {passwordState.message}
          </p>
        ) : null}
        <Button type="submit" variant="outline" disabled={passwordPending}>
          {passwordPending ? "Updating…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}
