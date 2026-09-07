import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "3D Studio" };

export default function StudioPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
        Phase 3 · coming next
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight sm:text-5xl">
        3D Clothing Studio
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
        Place, resize, and rotate artwork on real garment models. Change color,
        switch front/back, orbit 360°, and save comparisons — built on React Three Fiber
        in the next phase.
      </p>

      <div className="relative mt-12 overflow-hidden rounded-2xl bg-[var(--ink)] px-8 py-16 text-[var(--paper)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(42,143,120,0.35),transparent_45%)]" />
        <div className="relative grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-white/50">Preview canvas</p>
            <p className="mt-4 font-[family-name:var(--font-display)] text-3xl">
              Interactive garment viewport
            </p>
            <ul className="mt-6 space-y-2 text-sm text-white/65">
              <li>Apply designs · move · resize · rotate</li>
              <li>Garment color · size · front/back print</li>
              <li>Orbit · zoom · save & compare</li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/designs">
                <Button variant="secondary">Pick a design first</Button>
              </Link>
              <Link href="/products">
                <Button className="border border-white/20 bg-transparent text-white hover:bg-white/10">
                  Choose product
                </Button>
              </Link>
            </div>
          </div>
          <div className="aspect-square rounded-xl border border-white/15 bg-white/5 backdrop-blur-sm" />
        </div>
      </div>
    </div>
  );
}
