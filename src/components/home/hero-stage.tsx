"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

/** Premium garment stage — SVG composition, studio-ready look without placeholder cards. */
export function HeroStage() {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[linear-gradient(165deg,#d9ddd8_0%,#c5cbc6_38%,#9aa39c_100%)] shadow-[0_32px_64px_-36px_rgba(12,14,18,0.45)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_20%,rgba(255,255,255,0.45),transparent_42%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(12,14,18,0.12),transparent_45%)]" />

      {/* Garment */}
      <svg
        viewBox="0 0 400 500"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="teeBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1a1e24" />
            <stop offset="55%" stopColor="#0e1116" />
            <stop offset="100%" stopColor="#151a20" />
          </linearGradient>
          <linearGradient id="printGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a8f78" />
            <stop offset="100%" stopColor="#1a6b5c" />
          </linearGradient>
        </defs>
        {/* Oversized tee silhouette, slight 3D yaw */}
        <g transform="translate(28,40) skewX(-4)">
          <path
            d="M70 70 L150 40 L190 95 L210 95 L250 40 L330 70 L300 130 L280 125 L280 390 L120 390 L120 125 L100 130 Z"
            fill="url(#teeBody)"
          />
          <path
            d="M150 40 L190 95 L210 95 L250 40"
            fill="none"
            stroke="#2a3038"
            strokeWidth="2"
          />
          {/* Custom print */}
          <rect
            x="155"
            y="165"
            width="90"
            height="90"
            rx="10"
            fill="url(#printGlow)"
            opacity="0.92"
          />
          <circle cx="200" cy="210" r="22" fill="#f7f6f3" opacity="0.9" />
          <path
            d="M188 210 h24 M200 198 v24"
            stroke="#0e1116"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      </svg>

      {/* Studio chrome */}
      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
        <Chip>Front</Chip>
        <Chip muted>Back</Chip>
      </div>
      <div className="absolute right-4 top-4">
        <Chip>AI ready</Chip>
      </div>

      <motion.div
        className="absolute bottom-24 left-1/2 h-px w-24 -translate-x-1/2 bg-white/35"
        animate={{ opacity: [0.35, 0.7, 0.35] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(12,14,18,0.72)] via-[rgba(12,14,18,0.25)] to-transparent p-6 text-[var(--paper)]">
        <p className="text-[10px] uppercase tracking-[0.16em] text-white/55">
          3D preview
        </p>
        <p className="mt-1 font-[family-name:var(--font-display)] text-2xl tracking-tight">
          Oversized tee · live print
        </p>
        <p className="mt-2 max-w-xs text-xs leading-relaxed text-white/65">
          Move, scale, and rotate your artwork — then try it on before you order.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.12em] text-white/50">
          <span>360°</span>
          <span>·</span>
          <span>Place</span>
          <span>·</span>
          <span>Resize</span>
          <span>·</span>
          <span>Color</span>
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
