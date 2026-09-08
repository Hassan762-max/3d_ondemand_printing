import Link from "next/link";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { formatPkr } from "@/lib/utils";

export const metadata = { title: "How it works" };

const steps = [
  {
    title: "Find or create a design",
    body: `Browse the ${brand.name} library by category, upload artwork, or generate in AI Studio. Enhance and check print readiness before you place it.`,
    href: "/designs",
    cta: "Browse designs",
  },
  {
    title: "Choose the garment",
    body: "Apply one design across tees, hoodies, caps, and more — each blank has its own print area and colorways.",
    href: "/products",
    cta: "See products",
  },
  {
    title: "Customize in 3D",
    body: "Move, resize, rotate, and recolor on a full-orbit preview. Front and back placements stay in sync with what vendors print.",
    href: "/studio",
    cta: "Open studio",
  },
  {
    title: "Try it on",
    body: "Upload a photo for virtual try-on. Get fit and placement hints, then iterate before you commit.",
    href: "/try-on",
    cta: "Try on",
  },
  {
    title: "Pay advance, rest on COD",
    body: `Confirm with ${formatPkr(brand.advanceAmount)} advance. Remaining balance is collected on delivery where COD is available.`,
    href: "/checkout",
    cta: "Checkout",
  },
  {
    title: "Pakistan partners fulfill",
    body: "We route to a vendor by city, capacity, cost, and quality. They print, ship, and you track from My Orders — returns for defects go through Support.",
    href: "/support/shipping",
    cta: "Shipping info",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(180,80,50,0.12),transparent_60%)]"
      />
      <div className="relative mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          {brand.tagline}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight sm:text-5xl">
          How {brand.name} works
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
          From idea to garment in six steps — design tools, try-on, hybrid payment, and local
          production across Pakistan.
        </p>

        <ol className="mt-14 space-y-0">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="grid gap-4 border-t border-[var(--ink)]/10 py-8 sm:grid-cols-[4rem_1fr_auto] sm:items-start"
            >
              <p className="font-[family-name:var(--font-display)] text-2xl text-[var(--accent)]">
                {String(i + 1).padStart(2, "0")}
              </p>
              <div>
                <h2 className="text-xl font-medium tracking-tight">{step.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{step.body}</p>
              </div>
              <Link href={step.href} className="sm:pt-1">
                <Button variant="outline" className="w-full sm:w-auto">
                  {step.cta}
                </Button>
              </Link>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-[var(--ink)]/10 pt-10">
          <Link href="/studio">
            <Button>Open 3D Studio</Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button variant="outline">Start creating</Button>
          </Link>
          <Link href="/support/help">
            <Button variant="ghost">Help center</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
