"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleSaveDesign } from "@/lib/actions/designs";

export function SaveDesignButton({
  designId,
  initiallySaved,
  variant = "default",
}: {
  designId: string;
  initiallySaved: boolean;
  /** `icon` = heart overlay for catalog cards */
  variant?: "default" | "icon";
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initiallySaved);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onToggle = () => {
    setError(null);
    startTransition(async () => {
      const result = await toggleSaveDesign(designId);
      if (!result.ok) {
        setError(result.message ?? "Could not update.");
        if (result.message?.toLowerCase().includes("sign")) {
          router.push("/auth/sign-in?callbackUrl=/designs");
        }
        return;
      }
      setSaved((v) => !v);
      router.refresh();
    });
  };

  if (variant === "icon") {
    return (
      <div className="relative">
        <button
          type="button"
          aria-label={saved ? "Unsave design" : "Save design"}
          disabled={pending}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggle();
          }}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition ${
            saved
              ? "border-[var(--accent)]/30 bg-[var(--paper)] text-[var(--accent)]"
              : "border-[var(--ink)]/10 bg-[var(--paper)]/90 text-[var(--ink)] hover:border-[var(--ink)]/25"
          }`}
        >
          <HeartIcon filled={saved} />
        </button>
        {error ? (
          <p className="absolute right-0 top-11 z-20 w-36 text-right text-[10px] text-[var(--danger)]">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={onToggle}
        className={`inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs transition ${
          saved
            ? "border-[var(--accent)]/25 bg-[var(--accent)]/10 text-[var(--accent)]"
            : "border-[var(--ink)]/12 text-[var(--muted)] hover:border-[var(--ink)]/25 hover:text-[var(--ink)]"
        }`}
      >
        <HeartIcon filled={saved} />
        {pending ? "…" : saved ? "Saved" : "Save"}
      </button>
      {error ? <p className="mt-1 text-xs text-[var(--danger)]">{error}</p> : null}
    </div>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M12 21s-7.2-4.35-9.6-8.4C.6 9.45 2.1 5.7 5.7 5.1c1.95-.3 3.75.6 4.8 2.1 1.05-1.5 2.85-2.4 4.8-2.1 3.6.6 5.1 4.35 3.3 7.5C19.2 16.65 12 21 12 21z" />
    </svg>
  );
}
