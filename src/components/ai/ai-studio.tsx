"use client";

import { useState } from "react";
import { EnhancePanel } from "@/components/ai/enhance-panel";
import { DoctorPanel } from "@/components/ai/doctor-panel";
import { GeneratorPanel } from "@/components/ai/generator-panel";
import { ConsultantPanel } from "@/components/ai/consultant-panel";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "enhance", label: "Enhance" },
  { id: "doctor", label: "Design Doctor" },
  { id: "generate", label: "Generator" },
  { id: "style", label: "Style Consultant" },
  { id: "design", label: "Design Consultant" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function AiStudio({
  designs,
  categories,
  provider,
}: {
  designs: { id: string; title: string; imageUrl: string }[];
  categories: string[];
  provider: string;
}) {
  const [tab, setTab] = useState<TabId>("generate");

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-[var(--ink)]/10 pb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "h-10 rounded-md px-4 text-sm transition",
              tab === t.id
                ? "bg-[var(--ink)] text-[var(--paper)]"
                : "text-[var(--muted)] hover:bg-[var(--ink)]/[0.04] hover:text-[var(--ink)]",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-6">
          {tab === "enhance" ? <EnhancePanel designs={designs} /> : null}
          {tab === "doctor" ? (
            <DoctorPanel designs={designs} categories={categories} />
          ) : null}
          {tab === "generate" ? <GeneratorPanel /> : null}
          {tab === "style" ? <ConsultantPanel mode="style" /> : null}
          {tab === "design" ? <ConsultantPanel mode="design" /> : null}
        </div>

        <aside className="rounded-2xl bg-[var(--ink)] p-6 text-[var(--paper)]">
          <p className="text-xs uppercase tracking-[0.16em] text-white/45">AI layer</p>
          <p className="mt-3 font-[family-name:var(--font-display)] text-2xl">
            Provider-agnostic
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            Active provider: <span className="text-white">{provider}</span>. Swap{" "}
            <code className="text-white/85">AI_PROVIDER</code> to{" "}
            <code className="text-white/85">live-ready</code>, or later{" "}
            <code className="text-white/85">openai</code> /{" "}
            <code className="text-white/85">replicate</code> without changing the UI.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-white/70">
            <li>· Every run is logged as an AiJob</li>
            <li>· Generated art can save to your library</li>
            <li>· Enhanced copies keep originals intact</li>
            <li>· Virtual Try-On lives at /try-on</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
