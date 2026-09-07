"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { uploadDesign, type ActionResult } from "@/lib/actions/designs";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const initial: ActionResult = { ok: false };

export function DesignUploadForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(uploadDesign, initial);

  useEffect(() => {
    if (state.ok && state.designId) {
      router.push(`/account/designs`);
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={action} className="space-y-5" encType="multipart/form-data">
      <div>
        <Label htmlFor="title">Design title</Label>
        <Input id="title" name="title" required minLength={2} maxLength={80} placeholder="My monogram" />
      </div>
      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Input id="description" name="description" maxLength={400} placeholder="Short note about this artwork" />
      </div>
      <div>
        <Label htmlFor="file">Artwork file</Label>
        <input
          id="file"
          name="file"
          type="file"
          required
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="block w-full text-sm text-[var(--muted)] file:mr-4 file:rounded-md file:border-0 file:bg-[var(--ink)] file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-[var(--paper)] hover:file:bg-[var(--ink-soft)]"
        />
        <p className="mt-2 text-xs text-[var(--muted)]">PNG, JPG, WEBP, or SVG · max 5MB</p>
      </div>
      <label className="flex items-center gap-3 text-sm text-[var(--ink)]">
        <input
          type="checkbox"
          name="enhance"
          defaultChecked
          className="h-4 w-4 rounded border-[var(--ink)]/20 accent-[var(--accent)]"
        />
        AI enhance for print quality
      </label>
      {state.message && !state.ok ? (
        <p className="text-sm text-[var(--danger)]">{state.message}</p>
      ) : null}
      {state.ok ? (
        <p className="text-sm text-[var(--accent)]">{state.message}</p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Uploading…" : "Upload design"}
      </Button>
    </form>
  );
}
