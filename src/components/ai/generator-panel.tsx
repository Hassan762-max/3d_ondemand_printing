"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  generateDesignAction,
  type AiActionResult,
} from "@/lib/actions/ai";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const initial: AiActionResult = { ok: false };

export function GeneratorPanel() {
  const [state, action, pending] = useActionState(generateDesignAction, initial);
  const data = state.data as
    | { imageUrl?: string; promptUsed?: string; provider?: string }
    | undefined;

  return (
    <form action={action} className="space-y-5">
      <p className="text-sm text-[var(--muted)]">
        Describe a print idea. AI generates artwork you can save and apply across products.
      </p>
      <div>
        <Label htmlFor="prompt">Prompt</Label>
        <Input
          id="prompt"
          name="prompt"
          required
          minLength={3}
          placeholder="Minimal Indus river line mark in deep teal"
        />
      </div>
      <label className="block text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
        Style
        <select
          name="style"
          defaultValue="modern"
          className="mt-2 h-11 w-full rounded-md border border-[var(--ink)]/12 bg-white/80 px-3 text-sm normal-case tracking-normal"
        >
          <option value="modern">Modern</option>
          <option value="minimal">Minimal</option>
          <option value="bold">Bold</option>
          <option value="editorial">Editorial</option>
        </select>
      </label>
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="save"
          defaultChecked
          className="h-4 w-4 accent-[var(--accent)]"
        />
        Save to my designs
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Generating…" : "Generate design"}
      </Button>
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-[var(--accent)]" : "text-[var(--danger)]"}`}>
          {state.message}
        </p>
      ) : null}
      {data?.imageUrl ? (
        <div className="overflow-hidden rounded-xl border border-[var(--ink)]/10 bg-[var(--mist)] p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.imageUrl}
            alt={data.promptUsed ?? "Generated design"}
            className="mx-auto max-h-64 object-contain"
          />
          <p className="mt-3 text-xs text-[var(--muted)]">{data.promptUsed}</p>
          {state.designId ? (
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <Link href={`/studio?design=${state.designId}`} className="underline">
                Open in Studio
              </Link>
              <Link href="/account/designs" className="underline">
                View saved
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
