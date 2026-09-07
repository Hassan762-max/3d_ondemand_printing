"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(31,107,90,0.14),transparent_50%),radial-gradient(ellipse_at_90%_20%,rgba(18,20,26,0.08),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(18,20,26,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(18,20,26,0.04)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-[family-name:var(--font-display)] text-5xl leading-[0.95] tracking-tight text-[var(--ink)] sm:text-6xl md:text-7xl"
          >
            Printora
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="mt-6 max-w-xl text-2xl font-medium leading-snug tracking-tight text-[var(--ink)] sm:text-3xl"
          >
            Design it. Try it on. Wear it across Pakistan.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="mt-5 max-w-md text-base leading-relaxed text-[var(--muted)]"
          >
            AI-enhanced prints, real-time 3D customization, and virtual try-on —
            fulfilled by local vendors from Karachi to Peshawar.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link href="/studio">
              <Button size="lg">Open 3D Studio</Button>
            </Link>
            <Link href="/designs">
              <Button size="lg" variant="outline">
                Browse designs
              </Button>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.12 }}
          className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[var(--ink)] shadow-[0_40px_80px_-40px_rgba(14,17,22,0.55)]"
        >
          <div className="absolute inset-0 bg-[linear-gradient(160deg,#1F6B5A_0%,#0E1116_48%,#1B2A4A_100%)]" />
          <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_35%)]" />
          <div className="absolute inset-x-0 bottom-0 p-8 text-[var(--paper)]">
            <p className="text-xs uppercase tracking-[0.18em] text-white/55">
              Studio preview
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-3xl leading-none">
              3D + AI Try-On
            </p>
            <p className="mt-3 max-w-xs text-sm text-white/65">
              Place artwork, rotate the garment, then preview on your photo before
              you order.
            </p>
          </div>
          <motion.div
            className="absolute left-[18%] top-[22%] h-40 w-40 rounded-full border border-white/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute right-[16%] top-[34%] h-24 w-24 rounded-lg border border-white/25 bg-white/5 backdrop-blur-sm"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </section>
  );
}
