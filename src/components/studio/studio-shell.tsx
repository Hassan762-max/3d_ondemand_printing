"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { StudioControls } from "@/components/studio/studio-controls";
import { useStudioStore } from "@/lib/studio/store";
import type {
  StudioDesignOption,
  StudioProductOption,
} from "@/lib/studio/types";

const StudioCanvas = dynamic(
  () =>
    import("@/components/studio/studio-canvas").then((m) => m.StudioCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[420px] items-center justify-center rounded-2xl bg-[var(--ink)] text-sm text-white/60">
        Loading 3D studio…
      </div>
    ),
  },
);

export function StudioShell({
  products,
  designs,
  initialProductSlug,
  initialDesignId,
}: {
  products: StudioProductOption[];
  designs: StudioDesignOption[];
  initialProductSlug?: string | null;
  initialDesignId?: string | null;
}) {
  const hydrate = useStudioStore((s) => s.hydrate);

  useEffect(() => {
    hydrate({
      products,
      designs,
      initialProductSlug,
      initialDesignId,
    });
  }, [hydrate, products, designs, initialProductSlug, initialDesignId]);

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--ink)]/15 px-6 py-16 text-center text-sm text-[var(--muted)]">
        No products available. Run <code>npm run db:seed</code> first.
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.35fr_0.85fr] lg:items-start">
      <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-7rem)]">
        <StudioCanvas />
      </div>
      <div className="rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)]/80 p-5 sm:p-6">
        <StudioControls />
      </div>
    </div>
  );
}
