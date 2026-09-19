import Link from "next/link";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { formatPkr } from "@/lib/utils";

export const metadata = { title: "Help" };

export default function HelpPage() {
  return (
    <SupportShell
      eyebrow="Support"
      title="Help center"
      intro={`Quick answers for creating, customizing, and ordering on ${brand.name}.`}
    >
      <Faq
        q="How do I start a design?"
        a="Open Designs to pick a library print, or Upload to add your own file — then apply it to a product."
      />
      <Faq
        q="How does payment work?"
        a={`You pay the full order total on delivery (COD). Flat ${formatPkr(brand.deliveryFee)} delivery; print fee is ${formatPkr(brand.designSidePrice)} per side (Front and/or Back) — no separate sticker charge.`}
      />
      <Faq
        q="Can I return a custom print?"
        a="Customized items follow defect and fulfillment rules (not change-of-mind). See Returns for details."
      />
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/support/contact">
          <Button>Contact</Button>
        </Link>
        <Link href="/how-it-works">
          <Button variant="outline">How it works</Button>
        </Link>
      </div>
    </SupportShell>
  );
}

function SupportShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{eyebrow}</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
        {title}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{intro}</p>
      <div className="mt-10 space-y-6">{children}</div>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="border-t border-[var(--ink)]/10 pt-5">
      <h2 className="font-medium tracking-tight">{q}</h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{a}</p>
    </div>
  );
}
