import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { TryOnSessionView } from "@/components/try-on/try-on-session-view";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { catalogColorOption } from "@/lib/catalog/display";
import { prisma } from "@/lib/db";
import { parseTryOnMeta } from "@/lib/try-on/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Try-On ${id.slice(0, 8)}` };
}

export default async function TryOnSessionPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in?callbackUrl=/try-on");

  const { id } = await params;
  const tryOn = await prisma.tryOnSession.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!tryOn) notFound();

  const meta = parseTryOnMeta(tryOn.reviewJson);
  if (!meta) notFound();

  const product = await prisma.product.findUnique({
    where: { id: meta.productId },
    include: { variants: true },
  });

  const sizes = product
    ? [...new Set(product.variants.map((v) => v.size))]
    : [meta.size];
  const colors = product
    ? [
        ...new Map(
          product.variants.map((v) => {
            const option = catalogColorOption(v.color, v.colorHex);
            return [option.name, option];
          }),
        ).values(),
      ]
    : [
        catalogColorOption(meta.color, meta.colorHex),
      ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
            Try-On session
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
            {meta.productName}
          </h1>
        </div>
        <Link href="/try-on">
          <Button variant="outline">New try-on</Button>
        </Link>
      </div>

      <div className="mt-10">
        <TryOnSessionView
          sessionId={tryOn.id}
          photoUrl={tryOn.photoUrl}
          resultUrl={tryOn.resultUrl}
          status={tryOn.status}
          meta={meta}
          sizes={sizes}
          colors={colors}
        />
      </div>
    </div>
  );
}
