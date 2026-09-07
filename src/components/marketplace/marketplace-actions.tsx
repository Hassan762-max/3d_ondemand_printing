"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  licenseDesign,
  publishDesign,
  unpublishDesign,
  type MarketplaceActionResult,
} from "@/lib/actions/marketplace";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const initial: MarketplaceActionResult = { ok: false };

export function PublishDesignForm({
  designId,
  defaultPrice = 0,
}: {
  designId: string;
  defaultPrice?: number;
}) {
  const [state, action, pending] = useActionState(publishDesign, initial);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="designId" value={designId} />
      <div>
        <Label htmlFor={`price-${designId}`}>License price (PKR)</Label>
        <Input
          id={`price-${designId}`}
          name="listedPrice"
          type="number"
          min={0}
          max={50000}
          defaultValue={defaultPrice}
        />
        <p className="mt-1 text-[11px] text-[var(--muted)]">0 = free listing</p>
      </div>
      {state.message ? (
        <p className={`text-xs ${state.ok ? "text-[var(--accent)]" : "text-[var(--danger)]"}`}>
          {state.message}
        </p>
      ) : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Publishing…" : "Publish to marketplace"}
      </Button>
    </form>
  );
}

export function UnpublishButton({ designId }: { designId: string }) {
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
          await unpublishDesign(designId);
          router.refresh();
        });
      }}
    >
      {pending ? "…" : "Unpublish"}
    </Button>
  );
}

export function LicenseDesignButton({
  designId,
  price,
  alreadyLicensed,
}: {
  designId: string;
  price: number;
  alreadyLicensed?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");

  if (alreadyLicensed) {
    return <p className="text-sm text-[var(--accent)]">In your collection</p>;
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        disabled={pending}
        onClick={() => {
          start(async () => {
            const res = await licenseDesign(designId);
            setMessage(res.message ?? "");
            router.refresh();
          });
        }}
      >
        {pending
          ? "Adding…"
          : price > 0
            ? `License · Rs. ${price}`
            : "Get free design"}
      </Button>
      {message ? <p className="text-xs text-[var(--muted)]">{message}</p> : null}
    </div>
  );
}
