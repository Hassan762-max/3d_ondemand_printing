"use client";

import { useActionState } from "react";
import {
  diagnoseDesignAction,
  type AiActionResult,
} from "@/lib/actions/ai";
import { Button } from "@/components/ui/button";

const initial: AiActionResult = { ok: false };

type Diagnosis = {
  score: number;
  issues: { severity: string; message: string }[];
  fixes: string[];
  provider: string;
};

export function DoctorPanel({
  designs,
  categories,
}: {
  designs: { id: string; title: string }[];
  categories: string[];
}) {
  const [state, action, pending] = useActionState(diagnoseDesignAction, initial);
  const data = state.data as Diagnosis | undefined;

  return (
    <form action={action} className="space-y-5">
      <p className="text-sm text-[var(--muted)]">
        Design Doctor checks print readiness and suggests concrete fixes before you order.
      </p>
      <label className="block text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
        Design
        <select
          name="designId"
          required
          className="mt-2 h-11 w-full rounded-md border border-[var(--ink)]/12 bg-white/80 px-3 text-sm normal-case tracking-normal"
        >
          {designs.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
        Target product
        <select
          name="category"
          className="mt-2 h-11 w-full rounded-md border border-[var(--ink)]/12 bg-white/80 px-3 text-sm normal-case tracking-normal"
        >
          <option value="">Any</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </label>
      <Button type="submit" disabled={pending || designs.length === 0}>
        {pending ? "Diagnosing…" : "Run Design Doctor"}
      </Button>
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-[var(--accent)]" : "text-[var(--danger)]"}`}>
          {state.message}
        </p>
      ) : null}
      {data ? (
        <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper)] p-4">
          <div className="flex items-end justify-between gap-3">
            <p className="font-[family-name:var(--font-display)] text-3xl">{data.score}</p>
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
              / 100 · {data.provider}
            </p>
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Issues</p>
          <ul className="mt-2 space-y-2 text-sm">
            {data.issues.map((issue) => (
              <li key={issue.message}>
                <span className="uppercase tracking-wider text-[10px] text-[var(--accent)]">
                  {issue.severity}
                </span>{" "}
                {issue.message}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Fixes</p>
          <ul className="mt-2 space-y-1 text-sm text-[var(--ink)]/85">
            {data.fixes.map((fix) => (
              <li key={fix}>· {fix}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </form>
  );
}
