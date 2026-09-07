"use client";

import { useActionState } from "react";
import { createReturnRequest, type OpsActionResult } from "@/lib/actions/ops";
import { RETURN_REASONS } from "@/lib/ops/return-policy";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const initial: OpsActionResult = { ok: false };

export function ReturnRequestForm({
  orderId,
  hasCustomDesign,
}: {
  orderId: string;
  hasCustomDesign: boolean;
}) {
  const [state, action, pending] = useActionState(createReturnRequest, initial);
  const reasons = hasCustomDesign
    ? RETURN_REASONS.filter((r) => r.allowsCustom)
    : [...RETURN_REASONS];

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="orderId" value={orderId} />
      <p className="text-sm text-[var(--muted)]">
        Customized items follow defect/fulfillment rules (7-day window after delivery).
      </p>
      <label className="block text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
        Reason
        <select
          name="reason"
          required
          className="mt-2 h-11 w-full rounded-md border border-[var(--ink)]/12 bg-white/80 px-3 text-sm normal-case tracking-normal"
          defaultValue={reasons[0]?.id}
        >
          {reasons.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </label>
      <div>
        <Label htmlFor="details">Details</Label>
        <Input id="details" name="details" placeholder="Describe the issue" />
      </div>
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-[var(--accent)]" : "text-[var(--danger)]"}`}>
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Request return / reprint"}
      </Button>
    </form>
  );
}
