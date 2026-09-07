"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { moderateDesign } from "@/lib/actions/marketplace";
import { Button } from "@/components/ui/button";

export function ModerateDesignButtons({ designId }: { designId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        disabled={pending}
        onClick={() => {
          start(async () => {
            await moderateDesign(designId, "approved");
            router.refresh();
          });
        }}
      >
        Approve
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => {
          start(async () => {
            await moderateDesign(designId, "rejected");
            router.refresh();
          });
        }}
      >
        Reject
      </Button>
    </div>
  );
}
