import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
  "360° preview",
  "Move design",
  "Resize",
  "Rotate",
  "Change colors",
  "Front / Back",
  "Multiple products",
];

export function StudioHighlight() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
            3D Studio
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
            See your design before you print it.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--muted)]">
            Place artwork on real garment silhouettes, adjust placement, and lock
            a look you are proud to wear — then send it to try-on or checkout.
          </p>
          <ul className="mt-8 flex flex-wrap gap-2">
            {features.map((f) => (
              <li
                key={f}
                className="rounded-md border border-[var(--ink)]/10 bg-[var(--paper-elevated)] px-3 py-1.5 text-xs text-[var(--muted)]"
              >
                {f}
              </li>
            ))}
          </ul>
          <Link href="/studio" className="mt-8 inline-block">
            <Button size="lg">Open 3D Studio</Button>
          </Link>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[linear-gradient(160deg,#1a1f28_0%,#0e1116_55%,#152019_100%)]">
          <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_30%_20%,rgba(42,143,120,0.35),transparent_40%)]" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/products/oversized.svg"
            alt="3D studio garment preview"
            className="absolute inset-0 h-full w-full object-contain p-10 opacity-90"
          />
          <div className="absolute inset-x-0 bottom-0 p-6 text-[var(--paper)]">
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/50">
              Live customizer
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-xl">
              Orbit · zoom · place
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
