"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleSaveDesign } from "@/lib/actions/designs";
import { Button } from "@/components/ui/button";

export function SaveDesignButton({
  designId,
  initiallySaved,
}: {
  designId: string;
  initiallySaved: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initiallySaved);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <Button
        type="button"
        size="sm"
        variant={saved ? "secondary" : "outline"}
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await toggleSaveDesign(designId);
            if (!result.ok) {
              setError(result.message ?? "Could not update.");
              if (result.message?.toLowerCase().includes("sign")) {
                router.push("/auth/sign-in");
              }
              return;
            }
            setSaved((v) => !v);
            router.refresh();
          });
        }}
      >
        {pending ? "…" : saved ? "Saved" : "Save"}
      </Button>
      {error ? <p className="mt-1 text-xs text-[var(--danger)]">{error}</p> : null}
    </div>
  );
}
