"use client";

import { useActionState } from "react";
import {
  submitOrderReview,
  type ReviewActionResult,
} from "@/lib/actions/reviews";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const initial: ReviewActionResult = { ok: false };

export function OrderReviewForm({ orderId }: { orderId: string }) {
  const [state, action, pending] = useActionState(submitOrderReview, initial);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="orderId" value={orderId} />
      <label className="block text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
        Rating
        <select
          name="rating"
          required
          defaultValue="5"
          className="mt-2 h-11 w-full rounded-md border border-[var(--ink)]/12 bg-white/80 px-3 text-sm normal-case tracking-normal"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} / 5
            </option>
          ))}
        </select>
      </label>
      <div>
        <Label htmlFor="body">Review (optional)</Label>
        <Input id="body" name="body" placeholder="Print quality, fit, delivery…" />
      </div>
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-[var(--accent)]" : "text-[var(--danger)]"}`}>
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
