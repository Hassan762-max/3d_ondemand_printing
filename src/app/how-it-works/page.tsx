import Link from "next/link";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { formatPkr } from "@/lib/utils";

export const metadata = { title: "How it works" };

const steps = [
  {
    title: "Choose or upload a design",
    body: `Browse the ${brand.name} library or upload your artwork. AI can upscale and diagnose print readiness.`,
  },
  {
    title: "Pick a garment",
    body: "Apply one design across tees, hoodies, caps, and more — each with its own blank and print area.",
  },
  {
    title: "Customize in 3D",
    body: "Move, resize, rotate, recolor, and preview front/back with a full orbit camera.",
  },
  {
    title: "AI virtual try-on",
    body: "See the piece on your photo. Get fit and placement suggestions, then iterate.",
  },
  {
    title: "Order with hybrid payment",
    body: `Pay ${formatPkr(brand.advanceAmount)} advance. Remaining amount collected on COD at delivery.`,
  },
  {
    title: "Pakistan vendor fulfillment",
    body: "We auto-select the best vendor by city, capacity, cost, and quality — they print and ship to you.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Process</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
        How {brand.name} works
      </h1>
      <ol className="mt-12 space-y-8">
        {steps.map((step, i) => (
          <li key={step.title} className="border-t border-[var(--ink)]/10 pt-6">
            <p className="font-[family-name:var(--font-display)] text-sm text-[var(--accent)]">
              {String(i + 1).padStart(2, "0")}
            </p>
            <h2 className="mt-2 text-xl font-medium tracking-tight">{step.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{step.body}</p>
          </li>
        ))}
      </ol>
      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/studio">
          <Button>Open 3D Studio</Button>
        </Link>
        <Link href="/auth/sign-up">
          <Button variant="outline">Start Creating</Button>
        </Link>
      </div>
    </div>
  );
}
