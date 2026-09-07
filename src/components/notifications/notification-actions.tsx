"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/actions/reviews";
import { Button } from "@/components/ui/button";

export function MarkReadButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() => {
        start(async () => {
          await markNotificationRead(id);
          router.refresh();
        });
      }}
    >
      Mark read
    </Button>
  );
}

export function MarkAllReadButton() {
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
          await markAllNotificationsRead();
          router.refresh();
        });
      }}
    >
      {pending ? "…" : "Mark all read"}
    </Button>
  );
}
