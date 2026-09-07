import Link from "next/link";
import { redirect } from "next/navigation";
import { DesignUploadForm } from "@/components/designs/design-upload-form";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export const metadata = { title: "Upload design" };

export default async function DesignUploadPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/designs/upload");
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">Custom upload</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
        Upload your design
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
        We validate file type and size, optionally run AI enhancement, and save it to your collection.
      </p>
      <div className="mt-10 rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-6 sm:p-8">
        <DesignUploadForm />
      </div>
      <Link href="/designs" className="mt-6 inline-block">
        <Button variant="ghost">Back to library</Button>
      </Link>
    </div>
  );
}
