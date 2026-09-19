"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteOwnDesign } from "@/lib/actions/designs";

export function DeleteDesignButton({
  designId,
  designTitle,
  variant = "icon",
}: {
  designId: string;
  designTitle?: string;
  /** `icon` = trash overlay for catalog cards */
  variant?: "default" | "icon";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onDelete = () => {
    const label = designTitle ? `"${designTitle}"` : "this design";
    if (!confirm(`Delete ${label}? This cannot be undone.`)) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteOwnDesign(designId);
      if (!result.ok) {
        setError(result.message ?? "Could not delete.");
        return;
      }
      router.refresh();
    });
  };

  if (variant === "icon") {
    return (
      <div className="relative">
        <button
          type="button"
          aria-label="Delete design"
          disabled={pending}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--ink)]/10 bg-[var(--paper)]/90 text-[var(--ink)] backdrop-blur-md transition hover:border-[var(--danger)]/40 hover:text-[var(--danger)] disabled:opacity-50"
        >
          <TrashIcon />
        </button>
        {error ? (
          <p className="absolute left-0 top-11 z-20 w-36 text-[10px] text-[var(--danger)]">
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
        onClick={onDelete}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[var(--ink)]/12 px-3 text-xs text-[var(--muted)] transition hover:border-[var(--danger)]/40 hover:text-[var(--danger)] disabled:opacity-50"
      >
        <TrashIcon />
        {pending ? "Deleting…" : "Delete"}
      </button>
      {error ? <p className="mt-1 text-xs text-[var(--danger)]">{error}</p> : null}
    </div>
  );
}

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}
