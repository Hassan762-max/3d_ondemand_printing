import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CancelOrderButton } from "@/components/orders/cancel-order-button";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { statusLabel, trackingProgress } from "@/lib/orders/tracking";
import { formatPkr } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  return { title: order?.orderNumber ?? "Order" };
}

export default async function OrderDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in?callbackUrl=/orders");

  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: {
      items: {
        include: {
          product: { select: { slug: true, imageUrl: true } },
          design: { select: { title: true, imageUrl: true } },
        },
      },
      payments: { orderBy: { createdAt: "asc" } },
      shipments: { orderBy: { id: "asc" } },
    },
  });
  if (!order) notFound();

  const steps = trackingProgress(order.status);
  const canCancel = ["PENDING_PAYMENT", "ADVANCE_PAID"].includes(order.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            {statusLabel(order.status)}
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight">
            {order.orderNumber}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Placed {order.createdAt.toLocaleString("en-PK")} · {order.shippingCity}
          </p>
        </div>
        <Link href="/orders">
          <Button variant="outline">All orders</Button>
        </Link>
      </div>

      <section className="mt-10 rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-6">
        <h2 className="text-lg font-medium tracking-tight">Tracking</h2>
        {order.status === "CANCELLED" ? (
          <p className="mt-4 text-sm text-[var(--danger)]">This order was cancelled.</p>
        ) : (
          <ol className="mt-6 space-y-4">
            {steps.map((step) => (
              <li key={step.key} className="flex gap-4">
                <span
                  className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                    step.state === "done" ? "bg-[var(--accent)]" : "bg-[var(--mist)]"
                  }`}
                />
                <div>
                  <p
                    className={`text-sm font-medium ${
                      step.state === "done" ? "text-[var(--ink)]" : "text-[var(--muted)]"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
        {order.shipments[0]?.trackingNumber ? (
          <p className="mt-6 text-sm">
            Tracking: <span className="font-mono">{order.shipments[0].trackingNumber}</span> (
            {order.shipments[0].carrier})
          </p>
        ) : (
          <p className="mt-6 text-xs text-[var(--muted)]">
            Courier details appear after vendor assignment (Phase 7).
          </p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-medium tracking-tight">Items</h2>
        <ul className="mt-4 space-y-3">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex gap-4 rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-3"
            >
              <div className="h-16 w-16 overflow-hidden rounded-lg bg-[var(--mist)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    item.design?.imageUrl ??
                    item.product.imageUrl ??
                    "/products/tee.svg"
                  }
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {item.size} · {item.color} · qty {item.quantity}
                </p>
              </div>
              <p className="text-sm">{formatPkr(item.unitPrice * item.quantity)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-5">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Ship to</p>
          <p className="mt-2 text-sm font-medium">{order.shippingName}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{order.shippingPhone}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {order.shippingAddress}, {order.shippingCity}
            {order.shippingProvince ? `, ${order.shippingProvince}` : ""}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-5">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Payment</p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--muted)]">Subtotal</dt>
              <dd>{formatPkr(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--muted)]">Delivery</dt>
              <dd>{formatPkr(order.deliveryFee)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--muted)]">Advance paid</dt>
              <dd>{formatPkr(order.advanceAmount)}</dd>
            </div>
            <div className="flex justify-between gap-3 font-medium">
              <dt>Remaining COD</dt>
              <dd>{formatPkr(order.remainingAmount)}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-medium tracking-tight">Ledger</h2>
        <ul className="mt-4 divide-y divide-[var(--ink)]/8 rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)]">
          {order.payments.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
            >
              <span>
                {p.kind.replaceAll("_", " ")} · {p.method}
                {p.reference ? ` · ${p.reference}` : ""}
              </span>
              <span className="text-[var(--muted)]">
                {formatPkr(p.amount)} · {p.status}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {canCancel ? (
        <div className="mt-8">
          <CancelOrderButton orderId={order.id} />
        </div>
      ) : null}
    </div>
  );
}
