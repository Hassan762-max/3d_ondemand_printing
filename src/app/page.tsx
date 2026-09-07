import Link from "next/link";
import { Hero } from "@/components/home/hero";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { formatPkr } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    take: 4,
    orderBy: { basePrice: "asc" },
  });

  return (
    <>
      <Hero />

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-xl">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            How Printora works
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
            From idea to doorstep — without the guesswork.
          </h2>
        </div>
        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Create",
              body: "Pick a library design or upload yours. AI enhances it for apparel print quality.",
            },
            {
              step: "02",
              title: "Customize & try",
              body: "Place artwork in 3D, change color and size, then preview on your photo with AI.",
            },
            {
              step: "03",
              title: "Order locally",
              body: "Pay Rs. 500 advance. We route to the best Pakistan vendor. Rest on COD.",
            },
          ].map((item) => (
            <li key={item.step} className="border-t border-[var(--ink)]/10 pt-6">
              <p className="font-[family-name:var(--font-display)] text-sm text-[var(--accent)]">
                {item.step}
              </p>
              <h3 className="mt-3 text-xl font-medium tracking-tight">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-[var(--ink)]/8 bg-[var(--paper-elevated)]/70 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                Products
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight">
                Blank canvases, premium blanks.
              </h2>
            </div>
            <Link href="/products" className="hidden sm:block">
              <Button variant="outline">View all</Button>
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.length === 0 ? (
              <p className="text-sm text-[var(--muted)] col-span-full">
                Catalog seeding in progress — run <code>npm run db:seed</code>.
              </p>
            ) : (
              products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group block"
                >
                  <div className="aspect-[4/5] overflow-hidden rounded-xl bg-[var(--mist)] transition duration-300 group-hover:bg-[var(--mist)]/80">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.imageUrl ?? "/products/tee.svg"}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="mt-4 flex items-baseline justify-between gap-3">
                    <h3 className="text-sm font-medium tracking-tight">{product.name}</h3>
                    <p className="text-sm text-[var(--muted)]">{formatPkr(product.basePrice)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid items-center gap-10 rounded-2xl bg-[var(--ink)] px-8 py-12 text-[var(--paper)] md:grid-cols-[1.2fr_0.8fr] md:px-12">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
              AI that helps you decide — not just decorate.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/65">
              Design Doctor, Style Consultant, and Try-On Review give you clear
              next steps so every order feels intentional.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link href="/ai">
              <Button variant="secondary" size="lg">
                Open AI Studio
              </Button>
            </Link>
            <Link href="/try-on">
              <Button
                size="lg"
                className="border border-white/20 bg-transparent text-white hover:bg-white/10"
              >
                Try AI Try-On
              </Button>
            </Link>
            <Link href="/studio">
              <Button
                size="lg"
                className="border border-white/20 bg-transparent text-white hover:bg-white/10"
              >
                Enter Studio
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
