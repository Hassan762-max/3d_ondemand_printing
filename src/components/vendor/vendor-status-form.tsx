"use client";

import { useActionState } from "react";
import {
  updateVendorOrderStatus,
  type VendorActionResult,
} from "@/lib/actions/vendor";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const initial: VendorActionResult = { ok: false };

export function VendorStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [state, action, pending] = useActionState(
    updateVendorOrderStatus,
    initial,
  );

  const options: { value: string; label: string }[] = [];
  if (currentStatus === "ASSIGNED") {
    options.push({ value: "IN_PRODUCTION", label: "Start production" });
  }
  if (currentStatus === "IN_PRODUCTION") {
    options.push({ value: "QC", label: "Send to QC" });
    options.push({ value: "SHIPPED", label: "Mark shipped" });
  }
  if (currentStatus === "QC") {
    options.push({ value: "SHIPPED", label: "Mark shipped" });
    options.push({ value: "IN_PRODUCTION", label: "Return to production" });
  }
  if (currentStatus === "SHIPPED") {
    options.push({ value: "OUT_FOR_DELIVERY", label: "Out for delivery" });
    options.push({ value: "DELIVERED", label: "Mark delivered" });
  }
  if (currentStatus === "OUT_FOR_DELIVERY") {
    options.push({ value: "DELIVERED", label: "Mark delivered" });
  }

  if (options.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">
        No further vendor actions for status {currentStatus.replaceAll("_", " ")}.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="orderId" value={orderId} />
      <label className="block text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
        Next status
        <select
          name="status"
          className="mt-2 h-11 w-full rounded-md border border-[var(--ink)]/12 bg-white/80 px-3 text-sm normal-case tracking-normal"
          defaultValue={options[0].value}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <div>
        <Label htmlFor="trackingNumber">Tracking number (optional)</Label>
        <Input id="trackingNumber" name="trackingNumber" placeholder="PK-..." />
      </div>
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-[var(--accent)]" : "text-[var(--danger)]"}`}>
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Updating…" : "Update order"}
      </Button>
    </form>
  );
}
