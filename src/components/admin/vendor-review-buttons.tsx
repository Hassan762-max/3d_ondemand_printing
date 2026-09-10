"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  approveVendor,
  rejectVendor,
} from "@/lib/actions/vendor-approval";
import { Button } from "@/components/ui/button";

export function VendorReviewButtons({ vendorId }: { vendorId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<"approve" | "reject" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function run(kind: "approve" | "reject") {
    setPending(kind);
    setMessage(null);
    const result =
      kind === "approve"
        ? await approveVendor(vendorId)
        : await rejectVendor(vendorId);
    setPending(null);
    setMessage(result.message ?? (result.ok ? "Done." : "Failed."));
    if (result.ok) router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={pending !== null}
          onClick={() => void run("approve")}
        >
          {pending === "approve" ? "…" : "Approve"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending !== null}
          onClick={() => void run("reject")}
        >
          {pending === "reject" ? "…" : "Reject"}
        </Button>
      </div>
      {message ? (
        <p className="text-xs text-[var(--muted)]">{message}</p>
      ) : null}
    </div>
  );
}
