import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { statusLabel } from "@/lib/orders/tracking";
import { formatPkr } from "@/lib/utils";

type QueueOrder = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  shippingCity: string;
  subtotal: number;
  vendorCost: number;
  items: { id: string }[];
  assignments: { score: number }[];
};

export function VendorQueueList({ orders }: { orders: QueueOrder[] }) {
  if (orders.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-[var(--ink)]/15 bg-[var(--paper-elevated)] px-4 py-8 text-sm text-[var(--muted)]">
        No open production orders.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={`/vendor/orders/${order.id}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] px-4 py-4 transition hover:border-[var(--ink)]/25"
          >
            <div>
              <p className="font-medium">{order.orderNumber}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                {statusLabel(order.status)} · {order.shippingCity} ·{" "}
                {order.items.length} item
                {order.items.length === 1 ? "" : "s"}
                {order.assignments[0]
                  ? ` · score ${order.assignments[0].score.toFixed(2)}`
                  : ""}
              </p>
            </div>
            <div className="text-right text-sm">
              <p>{formatPkr(order.subtotal)}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                vendor cost {formatPkr(order.vendorCost)}
              </p>
              <span className="mt-2 inline-block text-xs font-medium text-[var(--accent)]">
                Open →
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
