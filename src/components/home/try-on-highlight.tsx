import Link from "next/link";
import { Button } from "@/components/ui/button";

const flow = [
  "Upload Photo",
  "Try On",
  "AI Review",
  "Improve",
  "Compare",
  "Buy",
];

export function TryOnHighlight() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="order-2 grid grid-cols-3 gap-3 lg:order-1">
          <Panel label="Your photo" tone="mist" />
          <Panel label="Custom piece" tone="ink" />
          <Panel label="AI try-on" tone="accent" />
        </div>
        <div className="order-1 lg:order-2">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            Virtual try-on
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
            Try it before you buy it.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--muted)]">
            Upload your photo, see your custom clothing on yourself, get AI
            feedback, make changes and compare again.
          </p>
          <ol className="mt-8 flex flex-wrap gap-2">
            {flow.map((step, i) => (
              <li
                key={step}
                className="flex items-center gap-2 text-xs text-[var(--muted)]"
              >
                {i > 0 ? <span className="text-[var(--ink)]/25">→</span> : null}
                <span className="rounded-md border border-[var(--ink)]/10 bg-[var(--paper-elevated)] px-2.5 py-1">
                  {step}
                </span>
              </li>
            ))}
          </ol>
          <Link href="/try-on" className="mt-8 inline-block">
            <Button size="lg">Try Virtual Try-On</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Panel({
  label,
  tone,
}: {
  label: string;
  tone: "mist" | "ink" | "accent";
}) {
  const bg =
    tone === "mist"
      ? "bg-[var(--mist)]"
      : tone === "ink"
        ? "bg-[var(--ink)]"
        : "bg-[var(--accent)]";
  return (
    <div className={`aspect-[3/4] overflow-hidden rounded-xl ${bg} p-3`}>
      <p
        className={`text-[10px] uppercase tracking-[0.12em] ${
          tone === "mist" ? "text-[var(--muted)]" : "text-white/70"
        }`}
      >
        {label}
      </p>
      <div
        className={`mt-6 mx-auto h-16 w-12 rounded-t-full opacity-40 ${
          tone === "mist" ? "bg-[var(--ink)]" : "bg-white"
        }`}
      />
      <div
        className={`mx-auto mt-1 h-24 w-16 rounded-md opacity-35 ${
          tone === "mist" ? "bg-[var(--ink)]" : "bg-white"
        }`}
      />
    </div>
  );
}
