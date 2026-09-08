import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { permissionsFor } from "@/lib/rbac";

export const dynamic = "force-dynamic";
export const metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");

  const permissions = permissionsFor(session.user.role);

  const [savedCount, wishlistCount, cartCount, uploadCount, unreadCount] =
    await Promise.all([
      prisma.savedDesign.count({ where: { userId: session.user.id } }),
      prisma.wishlistItem.count({ where: { userId: session.user.id } }),
      prisma.cartItem.count({ where: { cart: { userId: session.user.id } } }),
      prisma.design.count({ where: { ownerId: session.user.id, isLibrary: false } }),
      prisma.notification.count({
        where: { userId: session.user.id, read: false },
      }),
    ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Account</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
        {session.user.name ?? "Your profile"}
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">{session.user.email}</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          href="/account/profile"
          className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-5 transition hover:border-[var(--ink)]/25"
        >
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Profile</p>
          <p className="mt-2 font-medium">Contact & style preferences</p>
        </Link>
        <Link
          href="/account/designs"
          className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-5 transition hover:border-[var(--ink)]/25"
        >
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Designs</p>
          <p className="mt-2 font-medium">
            {savedCount} saved · {uploadCount} uploaded
          </p>
        </Link>
        <Link
          href="/account/wishlist"
          className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-5 transition hover:border-[var(--ink)]/25"
        >
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Wishlist</p>
          <p className="mt-2 font-medium">{wishlistCount} products</p>
        </Link>
        <Link
          href="/cart"
          className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-5 transition hover:border-[var(--ink)]/25"
        >
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Cart</p>
          <p className="mt-2 font-medium">{cartCount} items</p>
        </Link>
        <Link
          href="/account/notifications"
          className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-5 transition hover:border-[var(--ink)]/25"
        >
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
            Notifications
          </p>
          <p className="mt-2 font-medium">{unreadCount} unread</p>
        </Link>
        <Link
          href="/creator"
          className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-5 transition hover:border-[var(--ink)]/25"
        >
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
            Creator hub
          </p>
          <p className="mt-2 font-medium">Publish & earnings</p>
        </Link>
        <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-5">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Role</p>
          <p className="mt-2 font-medium">{session.user.role.replaceAll("_", " ")}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/ai">
          <Button>AI Studio</Button>
        </Link>
        <Link href="/designs/upload">
          <Button variant="outline">Upload design</Button>
        </Link>
        <Link href="/orders">
          <Button variant="outline">Orders</Button>
        </Link>
        <Link href="/studio">
          <Button variant="outline">Studio</Button>
        </Link>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <Button type="submit" variant="ghost">
            Sign out
          </Button>
        </form>
      </div>

      <div className="mt-12">
        <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Your access</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {permissions.map((p) => (
            <li
              key={p}
              className="rounded-md bg-[var(--mist)] px-2.5 py-1 font-mono text-[11px] text-[var(--ink-soft)]"
            >
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
