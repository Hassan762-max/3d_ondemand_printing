"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const HeroShirtCanvas = dynamic(
  () =>
    import("@/components/home/hero-shirt-canvas").then((m) => m.HeroShirtCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-40 w-32 animate-pulse rounded-xl bg-white/35" />
      </div>
    ),
  },
);

/** Premium garment stage — live R3F plain tee with studio chrome. */
export function HeroStage() {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[linear-gradient(165deg,#d9ddd8_0%,#c5cbc6_38%,#9aa39c_100%)] shadow-[0_32px_64px_-36px_rgba(12,14,18,0.45)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_20%,rgba(255,255,255,0.45),transparent_42%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(12,14,18,0.12),transparent_45%)]" />

      <HeroShirtCanvas />

      {/* Studio chrome */}
      <div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-wrap gap-2">
        <Chip>Front</Chip>
        <Chip muted>Back</Chip>
      </div>
      <div className="pointer-events-none absolute right-4 top-4 z-10">
        <Chip>AI ready</Chip>
      </div>

      <motion.div
        className="pointer-events-none absolute bottom-24 left-1/2 z-10 h-px w-24 -translate-x-1/2 bg-white/35"
        animate={{ opacity: [0.35, 0.7, 0.35] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[rgba(12,14,18,0.72)] via-[rgba(12,14,18,0.25)] to-transparent p-6 text-[var(--paper)]">
        <p className="text-[10px] uppercase tracking-[0.16em] text-white/55">
          3D preview
        </p>
        <p className="mt-1 font-[family-name:var(--font-display)] text-2xl tracking-tight">
          Plain tee · live 3D
        </p>
        <p className="mt-2 max-w-xs text-xs leading-relaxed text-white/65">
          Drag to orbit the blank tee — then place artwork in 3D Studio and try it on.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.12em] text-white/50">
          <span>360°</span>
          <span>·</span>
          <span>Orbit</span>
          <span>·</span>
          <span>Blank</span>
          <span>·</span>
          <span>Ready</span>
        </div>
      </div>
    </div>
  );
}

function Chip({
  children,
  muted,
}: {
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <span
      className={`rounded-md px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] backdrop-blur-sm ${
        muted
          ? "bg-black/20 text-white/55"
          : "bg-white/90 text-[var(--ink)]"
      }`}
    >
      {children}
    </span>
  );
}
