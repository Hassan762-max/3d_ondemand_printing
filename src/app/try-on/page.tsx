import Link from "next/link";
import { redirect } from "next/navigation";
import { TryOnCreateForm } from "@/components/try-on/try-on-create-form";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { designsAvailableToUser } from "@/lib/designs/access";
import { catalogColorOption, catalogProductWhere } from "@/lib/catalog/display";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "AI Try-On" };

export default async function TryOnPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/try-on");
  }

  const productsRaw = await prisma.product.findMany({
    where: catalogProductWhere(),
    include: { variants: true },
    orderBy: { name: "asc" },
  });

  const products = productsRaw.map((p) => ({
    id: p.id,
    name: p.name,
    sizes: [...new Set(p.variants.map((v) => v.size))],
    colors: [
      ...new Map(
        p.variants.map((v) => {
          const option = catalogColorOption(v.color, v.colorHex);
          return [option.name, option];
        }),
      ).values(),
    ],
  }));

  const designs = await prisma.design.findMany({
    where: designsAvailableToUser(session.user.id),
    orderBy: { title: "asc" },
    select: { id: true, title: true },
    take: 80,
  });

  const recent = await prisma.tryOnSession.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
          AI Try-On
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
          See it on you before you order
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Upload a photo, choose your customized garment, generate an AI preview,
          review suggestions, iterate, compare looks, then finalize.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper)] p-5 sm:p-6">
          <TryOnCreateForm products={products} designs={designs} />
        </div>
        <aside className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper)] p-5 sm:p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--accent)]">
            Loop
          </p>
          <ol className="mt-5 space-y-3 text-sm text-[var(--muted)]">
            <li>01 · Upload photo</li>
            <li>02 · Select product + design</li>
            <li>03 · Generate try-on</li>
            <li>04 · Read AI review</li>
            <li>05 · Apply changes & regenerate</li>
            <li>06 · Compare · finalize</li>
          </ol>
          <Link href="/products" className="mt-8 inline-block">
            <Button variant="outline">Choose a product first</Button>
          </Link>
        </aside>
      </div>

      {recent.length > 0 ? (
        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight">
            Recent Try-Ons
          </h2>
          <ul className="mt-4 divide-y divide-[var(--ink)]/8 rounded-xl border border-[var(--ink)]/10 bg-[var(--paper)]">
            {recent.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <span className="text-[var(--muted)]">
                  {item.status} · {item.createdAt.toLocaleString("en-PK")}
                </span>
                <Link href={`/try-on/${item.id}`} className="underline">
                  Open
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
