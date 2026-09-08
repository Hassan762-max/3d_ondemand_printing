import Link from "next/link";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
        {brand.name}
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-6xl tracking-tight">
        404
      </h1>
      <p className="mt-4 text-lg font-medium tracking-tight">Page not found</p>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)]">
        {brand.tagline} We couldn&apos;t find what you were looking for — but your next custom
        piece is still a click away.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/">
          <Button>Back to home</Button>
        </Link>
        <Link href="/products">
          <Button variant="outline">Browse products</Button>
        </Link>
      </div>
    </div>
  );
}
