"use client";

import { useActionState } from "react";
import {
  submitSupportTicket,
  type SupportActionResult,
} from "@/lib/actions/support";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const initial: SupportActionResult = { ok: false };

export function ContactForm({
  defaults,
  orders,
}: {
  defaults: { name: string; email: string };
  orders: { id: string; orderNumber: string }[];
}) {
  const [state, action, pending] = useActionState(submitSupportTicket, initial);

  return (
    <form action={action} className="mt-10 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={defaults.name} required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={defaults.email}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" required placeholder="Order help, design question…" />
      </div>
      {orders.length > 0 ? (
        <div>
          <Label htmlFor="orderId">Related order (optional)</Label>
          <select
            id="orderId"
            name="orderId"
            className="mt-1.5 h-11 w-full rounded-md border border-[var(--ink)]/12 bg-white/70 px-3 text-sm"
            defaultValue=""
          >
            <option value="">None</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.orderNumber}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <div>
        <Label htmlFor="body">Message</Label>
        <textarea
          id="body"
          name="body"
          required
          rows={5}
          className="mt-1.5 w-full rounded-md border border-[var(--ink)]/12 bg-white/70 px-3 py-2 text-sm"
          placeholder="Describe the issue. Include order numbers or screenshots references if useful."
        />
      </div>
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-[var(--accent)]" : "text-[var(--danger)]"}`}>
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
