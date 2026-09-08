import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="rounded-2xl bg-[var(--ink)] px-8 py-14 text-center text-[var(--paper)] sm:px-12">
        <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl md:text-5xl">
          Your next favorite piece starts with an idea.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/65">
          Choose a design, upload your own, or create something completely new.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/auth/sign-up">
            <Button variant="secondary" size="lg">
              Start Creating
            </Button>
          </Link>
          <Link href="/designs">
            <Button
              size="lg"
              className="border border-white/20 bg-transparent text-white hover:bg-white/10"
            >
              Explore Designs
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
