import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { statusLabel } from "@/lib/orders/tracking";
import { formatPkr } from "@/lib/utils";

type JobOrder = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  shippingCity: string;
  subtotal: number;
};

export function VendorJobsTable({
  orders,
  emptyMessage = "No assigned orders yet.",
}: {
  orders: JobOrder[];
  emptyMessage?: string;
}) {
  if (orders.length === 0) {
    return <p className="text-sm text-[var(--muted)]">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)]">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-[var(--mist)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
          <tr>
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">City</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t border-[var(--ink)]/8">
              <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
              <td className="px-4 py-3 text-[var(--muted)]">
                {statusLabel(order.status)}
              </td>
              <td className="px-4 py-3">{order.shippingCity}</td>
              <td className="px-4 py-3">{formatPkr(order.subtotal)}</td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/vendor/orders/${order.id}`}
                  className="text-xs font-medium underline"
                >
                  Open
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
