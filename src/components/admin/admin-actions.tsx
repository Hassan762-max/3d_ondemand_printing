"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  settleVendorOrder,
  toggleProductActive,
  collectCodRemaining,
} from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

export function ToggleProductButton({
  productId,
  active,
}: {
  productId: string;
  active: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "outline" : "secondary"}
      disabled={pending}
      onClick={() => {
        start(async () => {
          await toggleProductActive(productId);
          router.refresh();
        });
      }}
    >
      {pending ? "…" : active ? "Deactivate" : "Activate"}
    </Button>
  );
}

export function SettleOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      disabled={pending}
      onClick={() => {
        start(async () => {
          await settleVendorOrder(orderId);
          router.refresh();
        });
      }}
    >
      {pending ? "…" : "Settle vendor"}
    </Button>
  );
}

export function CollectCodButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() => {
        start(async () => {
          await collectCodRemaining(orderId);
          router.refresh();
        });
      }}
    >
      {pending ? "…" : "Collect COD"}
    </Button>
  );
}
