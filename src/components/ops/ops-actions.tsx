"use client";

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  approveRefund,
  qcDecision,
  resolveReturnRequest,
  type OpsActionResult,
} from "@/lib/actions/ops";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const initial: OpsActionResult = { ok: false };

export function ResolveReturnForm({ returnId }: { returnId: string }) {
  const [state, action, pending] = useActionState(resolveReturnRequest, initial);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="returnId" value={returnId} />
      <select
        name="resolution"
        className="h-10 w-full rounded-md border border-[var(--ink)]/12 bg-white/80 px-3 text-sm"
        defaultValue="reprint"
      >
        <option value="reprint">Reprint</option>
        <option value="replacement">Replacement</option>
        <option value="refund">Refund</option>
        <option value="rejected">Reject</option>
      </select>
      <Input name="note" placeholder="Internal note (optional)" />
      {state.message ? (
        <p className={`text-xs ${state.ok ? "text-[var(--accent)]" : "text-[var(--danger)]"}`}>
          {state.message}
        </p>
      ) : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Resolve"}
      </Button>
    </form>
  );
}

export function QcDecisionForm({ orderId }: { orderId: string }) {
  const [state, action, pending] = useActionState(qcDecision, initial);

  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="orderId" value={orderId} />
      <div className="min-w-[140px] flex-1">
        <Label htmlFor={`note-${orderId}`}>Note</Label>
        <Input id={`note-${orderId}`} name="note" placeholder="QC note" />
      </div>
      <Button
        type="submit"
        name="decision"
        value="pass"
        size="sm"
        disabled={pending}
      >
        Pass
      </Button>
      <Button
        type="submit"
        name="decision"
        value="fail"
        size="sm"
        variant="outline"
        disabled={pending}
      >
        Fail
      </Button>
      {state.message ? (
        <p className="w-full text-xs text-[var(--muted)]">{state.message}</p>
      ) : null}
    </form>
  );
}

export function ApproveRefundButton({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      disabled={pending}
      onClick={() => {
        start(async () => {
          await approveRefund(paymentId);
          router.refresh();
        });
      }}
    >
      {pending ? "…" : "Approve refund"}
    </Button>
  );
}
