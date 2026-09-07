"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useTransition } from "react";
import {
  finalizeTryOnSession,
  iterateTryOnSession,
  setTryOnCompare,
  type TryOnActionResult,
} from "@/lib/actions/try-on";
import type { TryOnMeta } from "@/lib/try-on/types";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const initial: TryOnActionResult = { ok: false };

export function TryOnSessionView({
  sessionId,
  photoUrl,
  resultUrl,
  status,
  meta,
  sizes,
  colors,
}: {
  sessionId: string;
  photoUrl: string;
  resultUrl: string | null;
  status: string;
  meta: TryOnMeta;
  sizes: string[];
  colors: { name: string; hex: string }[];
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(iterateTryOnSession, initial);
  const [finishing, startFinish] = useTransition();
  const [comparing, startCompare] = useTransition();

  const compareItems = meta.history.filter((h) =>
    (meta.compareIds ?? []).includes(h.id),
  );
  const review = meta.latestReview;

  return (
    <div className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-[var(--ink)]/10 bg-[var(--mist)]">
          <p className="px-4 pt-4 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            Your photo
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoUrl} alt="Uploaded photo" className="mt-2 aspect-[4/5] w-full object-cover" />
        </div>
        <div className="overflow-hidden rounded-2xl bg-[var(--ink)]">
          <p className="px-4 pt-4 text-xs uppercase tracking-[0.14em] text-white/45">
            AI try-on · {status}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resultUrl ?? "/designs/generated-placeholder.svg"}
            alt="Try-on result"
            className="mt-2 aspect-[4/5] w-full object-contain p-4"
          />
        </div>
      </div>

      {review ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-6">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              AI review · {review.provider}
            </p>
            <p className="mt-3 font-[family-name:var(--font-display)] text-3xl capitalize">
              {review.overall.replace("_", " ")}
            </p>
            <ul className="mt-5 space-y-2 text-sm text-[var(--muted)]">
              {review.feedback.map((f) => (
                <li key={f}>· {f}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-[var(--ink)] p-6 text-[var(--paper)]">
            <p className="text-xs uppercase tracking-[0.14em] text-white/45">Suggestions</p>
            <ul className="mt-5 space-y-2 text-sm text-white/75">
              {review.suggestions.map((s) => (
                <li key={s}>· {s}</li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-white/45">
              Confidence {Math.round((meta.confidence ?? 0.8) * 100)}% · {meta.productName} ·{" "}
              {meta.size} · {meta.color}
              {meta.designTitle ? ` · ${meta.designTitle}` : ""}
            </p>
          </div>
        </div>
      ) : null}

      {!meta.finalized ? (
        <div className="rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-6">
          <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
            Apply changes & try again
          </h2>
          <form action={action} className="mt-6 space-y-4">
            <input type="hidden" name="sessionId" value={sessionId} />
            <div>
              <Label htmlFor="note">What will you change?</Label>
              <Input
                id="note"
                name="note"
                placeholder="e.g. one size up, darker color, shift print higher"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                Size
                <select
                  name="size"
                  defaultValue={meta.size}
                  className="mt-2 h-11 w-full rounded-md border border-[var(--ink)]/12 bg-white/80 px-3 text-sm normal-case tracking-normal"
                >
                  {sizes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                Color
                <select
                  name="color"
                  defaultValue={meta.color}
                  className="mt-2 h-11 w-full rounded-md border border-[var(--ink)]/12 bg-white/80 px-3 text-sm normal-case tracking-normal"
                >
                  {colors.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {state.message ? (
              <p className={`text-sm ${state.ok ? "text-[var(--accent)]" : "text-[var(--danger)]"}`}>
                {state.message}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={pending}>
                {pending ? "Generating…" : "Generate another preview"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={finishing}
                onClick={() => {
                  startFinish(async () => {
                    await finalizeTryOnSession(sessionId);
                    router.refresh();
                  });
                }}
              >
                {finishing ? "Finalizing…" : "Finalize this look"}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-6">
          <p className="font-medium text-[var(--accent)]">Look finalized</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Continue in Studio to fine-tune placement, then add to cart.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={`/studio?product=${meta.productSlug}${meta.designId ? `&design=${meta.designId}` : ""}`}>
              <Button>Open in Studio</Button>
            </Link>
            <Link href={`/products/${meta.productSlug}`}>
              <Button variant="outline">View product</Button>
            </Link>
          </div>
        </div>
      )}

      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
          History & compare
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Select up to two previews to compare side by side.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {meta.history.map((item, index) => {
            const selected = (meta.compareIds ?? []).includes(item.id);
            return (
              <li
                key={item.id}
                className={`overflow-hidden rounded-xl border ${
                  selected ? "border-[var(--accent)]" : "border-[var(--ink)]/10"
                } bg-[var(--paper-elevated)]`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.resultUrl} alt={`Preview ${index + 1}`} className="aspect-[4/5] w-full object-contain bg-[var(--ink)] p-3" />
                <div className="space-y-2 p-3">
                  <p className="text-sm font-medium">Look {index + 1}</p>
                  <p className="text-xs capitalize text-[var(--muted)]">
                    {item.review.overall.replace("_", " ")}
                    {item.note ? ` · ${item.note}` : ""}
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant={selected ? "secondary" : "outline"}
                    disabled={comparing}
                    onClick={() => {
                      startCompare(async () => {
                        await setTryOnCompare(sessionId, item.id);
                        router.refresh();
                      });
                    }}
                  >
                    {selected ? "Selected" : "Compare"}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>

        {compareItems.length === 2 ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {compareItems.map((item, i) => (
              <div key={item.id} className="rounded-xl border border-[var(--ink)]/10 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                  Compare {i + 1}
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.resultUrl} alt={`Compare ${i + 1}`} className="mt-3 aspect-[4/5] w-full rounded-lg object-contain bg-[var(--ink)] p-3" />
                <ul className="mt-3 space-y-1 text-xs text-[var(--muted)]">
                  {item.review.suggestions.slice(0, 2).map((s) => (
                    <li key={s}>· {s}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
