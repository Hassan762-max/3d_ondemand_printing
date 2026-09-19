"use client";

import { useActionState } from "react";
import {
  updateVendorOrderStatus,
  type VendorActionResult,
} from "@/lib/actions/vendor";
import { Button } from "@/components/ui/button";

const initial: VendorActionResult = { ok: false };

function statusOptions(currentStatus: string): { value: string; label: string }[] {
  switch (currentStatus) {
    case "ASSIGNED":
      return [{ value: "IN_PRODUCTION", label: "Start production" }];
    case "IN_PRODUCTION":
      return [
        { value: "QC", label: "Send to quality check" },
        { value: "SHIPPED", label: "Mark shipped" },
      ];
    case "QC":
      return [
        { value: "SHIPPED", label: "Mark shipped" },
        { value: "IN_PRODUCTION", label: "Return to production" },
      ];
    case "SHIPPED":
      return [
        { value: "OUT_FOR_DELIVERY", label: "Out for delivery" },
        { value: "DELIVERED", label: "Order completed (delivered)" },
      ];
    case "OUT_FOR_DELIVERY":
      return [{ value: "DELIVERED", label: "Order completed (delivered)" }];
    default:
      return [];
  }
}

export function VendorStatusForm({
  orderId,
  currentStatus,
  trackingNumber,
  suggestedTracking,
}: {
  orderId: string;
  currentStatus: string;
  trackingNumber?: string | null;
  suggestedTracking: string;
}) {
  const [state, action, pending] = useActionState(
    updateVendorOrderStatus,
    initial,
  );

  const options = statusOptions(currentStatus);
  const tracking = (trackingNumber?.trim() || suggestedTracking).trim();
  const isAssigned = Boolean(trackingNumber?.trim());

  if (options.length === 0) {
    return (
      <div className="space-y-2 text-sm text-[var(--muted)]">
        <p>
          No further vendor actions for status{" "}
          {currentStatus.replaceAll("_", " ")}.
        </p>
        {tracking ? (
          <p>
            Tracking:{" "}
            <span className="font-mono text-[var(--ink)]">{tracking}</span>
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="trackingNumber" value={tracking} />

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

      <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper)] px-4 py-3">
        <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
          Tracking number
        </p>
        <p className="mt-1 font-mono text-sm text-[var(--ink)]">{tracking}</p>
        <p className="mt-2 text-xs text-[var(--muted)]">
          {isAssigned
            ? "Auto-assigned for this vendor. Sent to the customer with each status update."
            : "Will be auto-assigned and sent to the customer when you update this order."}
        </p>
      </div>

      {state.message ? (
        <p
          className={`text-sm ${state.ok ? "text-[var(--accent)]" : "text-[var(--danger)]"}`}
        >
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Updating…" : "Update order"}
      </Button>
    </form>
  );
}
