"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reorderOrder } from "@/lib/actions/orders";
import { Button } from "@/components/ui/button";

export function ReorderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            const result = await reorderOrder(orderId);
            if (!result.ok) {
              setMessage(result.message ?? "Could not reorder.");
              return;
            }
            setMessage(result.message ?? "Added to cart.");
            router.push("/cart");
            router.refresh();
          });
        }}
      >
        {pending ? "Adding…" : "Reorder to cart"}
      </Button>
      {message ? <p className="mt-2 text-xs text-[var(--muted)]">{message}</p> : null}
    </div>
  );
}
