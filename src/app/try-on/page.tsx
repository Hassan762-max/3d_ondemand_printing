import { getAiProvider } from "@/lib/ai";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = { title: "AI Try-On" };

export default async function TryOnPage() {
  const ai = getAiProvider();
  const sample = await ai.reviewTryOn({
    resultUrl: "/try-on/sample.svg",
    productName: "Essential Tee",
    size: "L",
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">AI Try-On</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight sm:text-5xl">
        See it on you before you order.
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
        Upload a photo, apply your customized garment, get an AI preview, then
        receive fit and placement recommendations. Iterate until it feels right.
      </p>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            Flow
          </p>
          <ol className="mt-6 space-y-4">
            {[
              "Upload your photo (private, encrypted at rest in later phases)",
              "Select customized clothing from Studio",
              "Generate AI try-on preview",
              "Read AI review & suggestions",
              "Apply changes · compare · finalize",
            ].map((step, i) => (
              <li key={step} className="flex gap-4 text-sm">
                <span className="font-[family-name:var(--font-display)] text-[var(--accent)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[var(--ink)]/85">{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-8">
            <Link href="/auth/sign-up">
              <Button>Create account to try on</Button>
            </Link>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--ink)] p-6 text-[var(--paper)]">
          <p className="text-xs uppercase tracking-[0.14em] text-white/45">
            Sample AI review · {sample.provider}
          </p>
          <p className="mt-4 font-[family-name:var(--font-display)] text-2xl capitalize">
            {sample.overall.replace("_", " ")}
          </p>
          <ul className="mt-6 space-y-3 text-sm text-white/70">
            {sample.feedback.map((f) => (
              <li key={f}>· {f}</li>
            ))}
          </ul>
          <p className="mt-8 text-xs uppercase tracking-[0.14em] text-white/45">
            Suggestions
          </p>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            {sample.suggestions.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
