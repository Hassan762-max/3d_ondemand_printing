import Link from "next/link";
import { Button } from "@/components/ui/button";

const garments = [
  { label: "T-Shirt", src: "/products/mp-tee-black.png" },
  { label: "Cap", src: "/products/mp-cap-black.png" },
  { label: "Hoodie", src: "/products/mp-hoodie-black.png" },
  { label: "Polo", src: "/products/mp-polo-black.png" },
  { label: "Jacket", src: "/products/mp-jacket-black.png" },
];

export function MultiProduct() {
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
        <Link href="/designs">
          <Button>Try Your Design</Button>
        </Link>
      </div>
      <div className="mt-10 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {garments.map((g) => (
          <div
            key={g.label}
            className="overflow-hidden rounded-xl border border-[var(--ink)]/8 bg-white"
          >
            <div className="relative aspect-[3/4] bg-white p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={g.src}
                alt={`${g.label} with cloud dragon print`}
                className="h-full w-full object-contain"
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
