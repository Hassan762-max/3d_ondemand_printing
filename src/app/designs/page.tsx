import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Design library" };

export default async function DesignsPage() {
  const designs = await prisma.design.findMany({
    where: { isLibrary: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            Ready-made
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
            Design library
          </h1>
          <p className="mt-3 max-w-xl text-sm text-[var(--muted)]">
            Start with a curated print, enhance with AI, then apply to any product.
          </p>
        </div>
        <Link href="/studio">
          <Button variant="outline">Upload your own in Studio</Button>
        </Link>
      </div>

      {designs.length === 0 ? (
        <div className="mt-16 rounded-xl border border-dashed border-[var(--ink)]/15 px-6 py-16 text-center">
          <p className="text-sm text-[var(--muted)]">No library designs yet. Run the seed script.</p>
        </div>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {designs.map((design) => {
            const tags = JSON.parse(design.tags || "[]") as string[];
            return (
              <Link
                key={design.id}
                href={`/studio?design=${design.id}`}
                className="group overflow-hidden rounded-xl border border-[var(--ink)]/8 bg-[var(--paper-elevated)] transition hover:border-[var(--ink)]/20"
              >
                <div className="aspect-square bg-[var(--mist)] p-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={design.imageUrl}
                    alt={design.title}
                    className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="p-4">
                  <h2 className="font-medium tracking-tight">{design.title}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                    {design.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-[var(--mist)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--muted)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
