import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { permissionsFor } from "@/lib/rbac";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");

  const permissions = permissionsFor(session.user.role);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Account</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
        {session.user.name ?? "Your profile"}
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">{session.user.email}</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-5">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Role</p>
          <p className="mt-2 font-medium">{session.user.role.replaceAll("_", " ")}</p>
        </div>
        <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-5">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Permissions</p>
          <p className="mt-2 font-medium">{permissions.length} active</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
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
        <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
          Your access
        </p>
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
