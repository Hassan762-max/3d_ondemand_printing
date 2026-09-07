"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleWishlist } from "@/lib/actions/wishlist";
import { Button } from "@/components/ui/button";

export function WishlistButton({
  productId,
  initiallySaved,
}: {
  productId: string;
  initiallySaved: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initiallySaved);
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="lg"
      variant={saved ? "secondary" : "outline"}
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await toggleWishlist(productId);
          if (!result.ok) {
            router.push("/auth/sign-in");
            return;
          }
          setSaved(Boolean(result.saved));
          router.refresh();
        });
      }}
    >
      {pending ? "…" : saved ? "In wishlist" : "Wishlist"}
    </Button>
  );
}
