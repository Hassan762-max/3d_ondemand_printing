import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileForms } from "@/components/account/profile-forms";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseStylePreferences, parseStyleSizes } from "@/lib/style-profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profile" };

export default async function AccountProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in?callbackUrl=/account/profile");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { styleProfile: true },
  });
  if (!user) redirect("/auth/sign-in");

  const prefs = parseStylePreferences(user.styleProfile?.preferences);
  const sizes = parseStyleSizes(user.styleProfile?.sizes);

  return (
    <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Account</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
        Profile & style
      </h1>
      <p className="mt-3 text-sm text-[var(--muted)]">
        Keep delivery details and fit preferences current for checkout and AI consults.
      </p>

      <ProfileForms
        profile={{
          name: user.name ?? "",
          email: user.email,
          phone: user.phone ?? "",
          city: user.city ?? "",
          province: user.province ?? "",
        }}
        style={{
          defaultSize: sizes.default ?? "",
          fit: prefs.fit ?? "",
          styles: (prefs.styles ?? []).join(", "),
        }}
      />

      <div className="mt-10">
        <Link href="/account">
          <Button variant="ghost">Back to account</Button>
        </Link>
      </div>
    </div>
  );
}
