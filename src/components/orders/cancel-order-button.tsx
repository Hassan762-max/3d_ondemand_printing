"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cancelOrder } from "@/lib/actions/orders";
import { Button } from "@/components/ui/button";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={() => {
        if (!confirm("Cancel this order? Advance refund will be pending review.")) return;
        startTransition(async () => {
          await cancelOrder(orderId);
          router.refresh();
        });
      }}
    >
      {pending ? "Cancelling…" : "Cancel order"}
    </Button>
  );
}
