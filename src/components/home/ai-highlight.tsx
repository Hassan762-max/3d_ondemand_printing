import Link from "next/link";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";

const capabilities = [
  "Design enhancement",
  "Print quality checks",
  "Placement advice",
  "Color guidance",
  "Product selection",
  "Style recommendations",
  "AI design generation",
];

export function AiHighlight() {
  return (
    <section className="border-y border-[var(--ink)]/8 bg-[var(--ink)] py-16 text-[var(--paper)] sm:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent-bright)]">
            AI Studio
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
            Your AI design consultant.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/65">
            Not just generation — clear next steps for print readiness, styling,
            and product fit before you spend on production.
          </p>
          <ul className="mt-8 grid gap-2 sm:grid-cols-2">
            {capabilities.map((c) => (
              <li key={c} className="text-sm text-white/75">
                <span className="mr-2 text-[var(--accent-bright)]">→</span>
                {c}
              </li>
            ))}
          </ul>
          <Link href="/ai" className="mt-8 inline-block">
            <Button variant="secondary" size="lg">
              Try AI Studio
            </Button>
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
          <p className="text-[10px] uppercase tracking-[0.14em] text-white/45">
            Assistant preview
          </p>
          <div className="mt-4 space-y-3">
            <Bubble role="you">Enhance this logo for an oversized black tee.</Bubble>
            <Bubble role="ai">
              Sharpen edges for DTG, boost contrast, and keep a 0.5&quot; safe margin
              from seams. Ready for Studio placement.
            </Bubble>
            <Bubble role="ai">
              Suggested next: open Design Doctor, then try-on for fit feedback.
            </Bubble>
          </div>
          <p className="mt-4 text-[11px] text-white/40">
            Live tools run in AI Studio — this panel is a product preview.
          </p>
        </div>
      </div>
    </section>
  );
}

function Bubble({
  role,
  children,
}: {
  role: "you" | "ai";
  children: React.ReactNode;
}) {
  const mine = role === "you";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[90%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
          mine
            ? "bg-[var(--accent)] text-white"
            : "bg-white/10 text-white/85"
        }`}
      >
        {!mine ? (
          <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-white/45">
            {brand.name} AI
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}
