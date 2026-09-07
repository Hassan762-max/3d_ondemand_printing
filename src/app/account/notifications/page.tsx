import Link from "next/link";
import { redirect } from "next/navigation";
import {
  MarkAllReadButton,
  MarkReadButton,
} from "@/components/notifications/notification-actions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in?callbackUrl=/account/notifications");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            Account
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
            Notifications
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {unread} unread · last {notifications.length} events
          </p>
        </div>
        {unread > 0 ? <MarkAllReadButton /> : null}
      </div>

      {notifications.length === 0 ? (
        <p className="mt-12 text-sm text-[var(--muted)]">No notifications yet.</p>
      ) : (
        <ul className="mt-10 divide-y divide-[var(--ink)]/8 rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)]">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`flex flex-wrap items-start justify-between gap-3 px-4 py-4 ${
                n.read ? "opacity-70" : ""
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium tracking-tight">{n.title}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{n.body}</p>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  {n.createdAt.toLocaleString("en-PK")}
                </p>
                {n.href ? (
                  <Link href={n.href} className="mt-2 inline-block text-sm underline">
                    Open
                  </Link>
                ) : null}
              </div>
              {!n.read ? <MarkReadButton id={n.id} /> : null}
            </li>
          ))}
        </ul>
      )}

      <Link href="/account" className="mt-8 inline-block text-sm underline">
        Back to account
      </Link>
    </div>
  );
}
