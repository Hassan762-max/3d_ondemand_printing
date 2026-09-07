"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  enhanceDesignAction,
  type AiActionResult,
} from "@/lib/actions/ai";
import { Button } from "@/components/ui/button";

const initial: AiActionResult = { ok: false };

export function EnhancePanel({
  designs,
}: {
  designs: { id: string; title: string; imageUrl: string }[];
}) {
  const [state, action, pending] = useActionState(enhanceDesignAction, initial);
  const data = state.data as { notes?: string[]; imageUrl?: string; provider?: string } | undefined;

  return (
    <form action={action} className="space-y-5">
      <p className="text-sm text-[var(--muted)]">
        Upscale and prepare artwork for apparel print. Creates a new enhanced copy in your library.
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
      <Button type="submit" disabled={pending || designs.length === 0}>
        {pending ? "Enhancing…" : "Enhance with AI"}
      </Button>
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-[var(--accent)]" : "text-[var(--danger)]"}`}>
          {state.message}
        </p>
      ) : null}
      {state.ok && data?.notes ? (
        <ul className="space-y-1 text-sm text-[var(--muted)]">
          {data.notes.map((n) => (
            <li key={n}>· {n}</li>
          ))}
        </ul>
      ) : null}
      {state.designId ? (
        <Link href={`/studio?design=${state.designId}`} className="text-sm underline">
          Open enhanced design in Studio
        </Link>
      ) : null}
    </form>
  );
}
