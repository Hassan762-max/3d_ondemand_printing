import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { VendorStatusForm } from "@/components/vendor/vendor-status-form";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { statusLabel } from "@/lib/orders/tracking";
import { formatPkr } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function VendorOrderPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in?callbackUrl=/vendor");

  const vendor = await prisma.vendor.findUnique({
    where: { userId: session.user.id },
  });
  if (!vendor) redirect("/vendor");

  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, vendorId: vendor.id },
    include: {
      items: {
        include: {
          product: true,
          design: true,
        },
      },
      assignments: { orderBy: { assignedAt: "desc" }, take: 1 },
      shipments: true,
    },
  });
  if (!order) notFound();

  const reason = order.assignments[0]
    ? (JSON.parse(order.assignments[0].reasonJson || "{}") as {
        best?: { reasons?: string[]; score?: number };
      })
    : null;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            {statusLabel(order.status)}
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
            {order.orderNumber}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Ship to {order.shippingName} · {order.shippingCity} · {order.shippingPhone}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/vendor/queue">
            <Button variant="outline">Queue</Button>
          </Link>
          <Link href="/vendor/jobs">
            <Button variant="outline">All jobs</Button>
          </Link>
        </div>
      </div>

      <section className="rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-6">
        <h2 className="text-lg font-medium tracking-tight">Production package</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Print-ready artwork, placement, size, color, and shipping label data.
        </p>
        <a href={`/api/vendor/orders/${order.id}/package`} className="mt-4 inline-block">
          <Button variant="outline" size="sm">
            Download print package JSON
          </Button>
        </a>
        <ul className="mt-6 space-y-4">
          {order.items.map((item) => {
            const placement = JSON.parse(item.placementJson || "{}") as Record<
              string,
              unknown
            >;
            return (
              <li
                key={item.id}
                className="grid gap-4 rounded-xl border border-[var(--ink)]/10 p-4 sm:grid-cols-[96px_1fr]"
              >
                <div className="h-24 w-24 overflow-hidden rounded-lg bg-[var(--mist)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      item.design?.imageUrl ??
                      item.product.imageUrl ??
                      "/products/tee.svg"
                    }
                    alt={item.title}
                    className="h-full w-full object-contain p-2"
                  />
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {item.product.category.replaceAll("_", " ")} · {item.size} ·{" "}
                    {item.color} · qty {item.quantity}
                  </p>
                  <p className="mt-2 font-mono text-xs text-[var(--muted)]">
                    placement {JSON.stringify(placement)}
                  </p>
                  <p className="mt-1 text-sm">{formatPkr(item.unitPrice * item.quantity)}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 rounded-xl bg-[var(--ink)] p-4 text-sm text-[var(--paper)]">
          <p className="text-xs uppercase tracking-[0.14em] text-white/45">Shipping label</p>
          <p className="mt-2 font-medium">{order.shippingName}</p>
          <p className="text-white/70">{order.shippingPhone}</p>
          <p className="mt-1 text-white/70">
            {order.shippingAddress}, {order.shippingCity}
            {order.shippingProvince ? `, ${order.shippingProvince}` : ""}
          </p>
          <p className="mt-3 text-white/55">
            COD collect {formatPkr(order.remainingAmount)} · vendor settlement{" "}
            {formatPkr(order.vendorCost)}
          </p>
        </div>
      </section>

      {reason?.best?.reasons ? (
        <section className="mt-8 rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-5">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
            Why you were selected · score {order.assignments[0]?.score.toFixed(2)}
          </p>
          <ul className="mt-3 space-y-1 text-sm text-[var(--muted)]">
            {reason.best.reasons.map((r) => (
              <li key={r}>· {r}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-8 rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-6">
        <h2 className="text-lg font-medium tracking-tight">Update status</h2>
        <div className="mt-4">
          <VendorStatusForm orderId={order.id} currentStatus={order.status} />
        </div>
      </section>
    </div>
  );
}
