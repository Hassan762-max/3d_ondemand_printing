"use client";

import { useActionState } from "react";
import { consultAiAction, type AiActionResult } from "@/lib/actions/ai";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const initial: AiActionResult = { ok: false };

type ConsultData = {
  answer: string;
  recommendations: string[];
  provider: string;
};

export function ConsultantPanel({ mode }: { mode: "style" | "design" }) {
  const [state, action, pending] = useActionState(consultAiAction, initial);
  const data = state.data as ConsultData | undefined;

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="mode" value={mode} />
      <p className="text-sm text-[var(--muted)]">
        {mode === "style"
          ? "Ask for outfit direction, silhouettes, and Pakistan-ready styling cues."
          : "Ask how to place, scale, and refine artwork for print-ready apparel."}
      </p>
      <div>
        <Label htmlFor={`q-${mode}`}>Your question</Label>
        <Input
          id={`q-${mode}`}
          name="question"
          required
          minLength={5}
          placeholder={
            mode === "style"
              ? "What should I wear with an oversized charcoal tee?"
              : "Where should a circular logo sit on a hoodie?"
          }
        />
      </div>
      <div>
        <Label htmlFor={`ctx-${mode}`}>Context (optional)</Label>
        <Input
          id={`ctx-${mode}`}
          name="context"
          placeholder="City, season, product type…"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Thinking…" : mode === "style" ? "Ask Style Consultant" : "Ask Design Consultant"}
      </Button>
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-[var(--accent)]" : "text-[var(--danger)]"}`}>
          {state.message}
        </p>
      ) : null}
      {data ? (
        <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper)] p-5">
          <p className="text-sm leading-relaxed text-[var(--ink)]/90">{data.answer}</p>
          <p className="mt-5 text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
            Recommendations
          </p>
          <ul className="mt-2 space-y-2 text-sm text-[var(--muted)]">
            {data.recommendations.map((r) => (
              <li key={r}>· {r}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </form>
  );
}
