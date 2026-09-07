"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
        Something went wrong
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight">
        We hit a snag
      </h1>
      <p className="mt-3 text-sm text-[var(--muted)]">
        Try again, or head back to the storefront. Your cart and account are safe.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Link href="/">
          <Button variant="outline">Home</Button>
        </Link>
      </div>
    </div>
  );
}
