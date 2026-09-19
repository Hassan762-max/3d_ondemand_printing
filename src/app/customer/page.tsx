import Link from "next/link";
import { redirect } from "next/navigation";
import { PortalSection } from "@/components/portal/portal-section";
import { PortalStat } from "@/components/portal/portal-stat";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { brand } from "@/lib/brand";
import { prisma } from "@/lib/db";
import { statusLabel } from "@/lib/orders/tracking";
import { formatPkr } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Customer portal" };

export default async function CustomerDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in?callbackUrl=/customer");

  const userId = session.user.id;

  const [
    openOrders,
    cartCount,
    savedCount,
    unreadCount,
    recentOrders,
    savedDesigns,
  ] = await Promise.all([
    prisma.order.count({
      where: {
        userId,
        status: {
          notIn: ["DELIVERED", "CANCELLED", "REFUNDED"],
        },
      },
    }),
    prisma.cartItem.count({ where: { cart: { userId } } }),
    prisma.savedDesign.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, read: false } }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        subtotal: true,
        createdAt: true,
      },
    }),
    prisma.savedDesign.findMany({
      where: { userId },
      take: 4,
      orderBy: { createdAt: "desc" },
      include: {
        design: { select: { id: true, title: true, imageUrl: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
          Welcome back
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
          {session.user.name?.split(" ")[0] ?? "Your"} dashboard
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
          Track orders, jump back into designs, and keep creating with {brand.name}.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PortalStat label="Open orders" value={String(openOrders)} />
        <PortalStat label="Cart items" value={String(cartCount)} />
        <PortalStat label="Saved designs" value={String(savedCount)} />
        <PortalStat label="Unread alerts" value={String(unreadCount)} />
      </div>

      <PortalSection
        title="Quick Actions"
        description="Pick up where you left off."
      >
        <div className="flex flex-wrap gap-3">
          <Button href="/products">Products</Button>
          <Button href="/designs" variant="outline">
            Designs
          </Button>
        </div>
      </PortalSection>

      <div className="grid gap-10 lg:grid-cols-2">
        <PortalSection
          title="Recent Orders"
          action={
            <Link href="/orders" className="text-sm underline">
              View all
            </Link>
          }
        >
          {recentOrders.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[var(--ink)]/15 bg-[var(--paper-elevated)] px-4 py-8 text-sm text-[var(--muted)]">
              No orders yet. Start with a blank and a design.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--ink)]/8 overflow-hidden rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)]">
              {recentOrders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/orders/${order.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 transition hover:bg-[var(--ink)]/[0.02]"
                  >
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="mt-0.5 text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                        {statusLabel(order.status)} ·{" "}
                        {order.createdAt.toLocaleDateString("en-PK")}
                      </p>
                    </div>
                    <p className="text-sm">{formatPkr(order.subtotal)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </PortalSection>

        <PortalSection
          title="Saved Designs"
          action={
            <Link href="/account/designs" className="text-sm underline">
              Library
            </Link>
          }
        >
          {savedDesigns.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[var(--ink)]/15 bg-[var(--paper-elevated)] px-4 py-8 text-sm text-[var(--muted)]">
              Heart designs from the library to keep them here.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {savedDesigns.map((row) => (
                <Link
                  key={row.id}
                  href={`/products?design=${row.design.id}`}
                  className="overflow-hidden rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] transition hover:border-[var(--ink)]/25"
                >
                  <div className="aspect-square bg-[#F5F5F5] p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={row.design.imageUrl}
                      alt={row.design.title}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <p className="truncate px-3 py-2 text-sm font-medium">
                    {row.design.title}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </PortalSection>
      </div>
    </div>
  );
}
