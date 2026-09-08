import Link from "next/link";
import { Button } from "@/components/ui/button";

const garments = [
  { label: "T-Shirt", src: "/products/tee.svg" },
  { label: "Oversized Tee", src: "/products/oversized.svg" },
  { label: "Hoodie", src: "/products/hoodie.svg" },
  { label: "Polo", src: "/products/polo.svg" },
  { label: "Jacket", src: "/products/jacket.svg" },
];

export function MultiProduct({ designImage }: { designImage?: string | null }) {
  const print = designImage ?? "/designs/karachi-grid.svg";

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            Versatility
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
            One design. Multiple ways to wear it.
          </h2>
        </div>
        <Link href="/studio">
          <Button>Try Your Design</Button>
        </Link>
      </div>
      <div className="mt-10 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {garments.map((g) => (
          <div
            key={g.label}
            className="overflow-hidden rounded-xl border border-[var(--ink)]/8 bg-[var(--mist)]"
          >
            <div className="relative aspect-[4/5] p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={g.src}
                alt={g.label}
                className="h-full w-full object-contain opacity-90"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={print}
                alt=""
                className="pointer-events-none absolute left-1/2 top-[42%] h-10 w-10 -translate-x-1/2 -translate-y-1/2 object-contain opacity-90 sm:h-12 sm:w-12"
              />
            </div>
            <p className="border-t border-[var(--ink)]/8 bg-[var(--paper-elevated)] px-3 py-2 text-center text-xs text-[var(--muted)]">
              {g.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
