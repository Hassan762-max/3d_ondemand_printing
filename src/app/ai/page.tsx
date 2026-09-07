import Link from "next/link";
import { redirect } from "next/navigation";
import { AiStudio } from "@/components/ai/ai-studio";
import { Button } from "@/components/ui/button";
import { getAiProvider } from "@/lib/ai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "AI Studio" };

export default async function AiPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/ai");
  }

  const designs = await prisma.design.findMany({
    where: {
      OR: [{ isLibrary: true }, { ownerId: session.user.id }],
    },
    orderBy: [{ isLibrary: "desc" }, { createdAt: "desc" }],
    select: { id: true, title: true, imageUrl: true },
    take: 80,
  });

  const categories = [
    "T_SHIRT",
    "OVERSIZED_T_SHIRT",
    "POLO",
    "HOODIE",
    "SWEATSHIRT",
    "CAP",
  ];

  const recentJobs = await prisma.aiJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
    select: { id: true, type: true, status: true, provider: true, createdAt: true },
  });

  const provider = getAiProvider().name;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">AI Studio</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight sm:text-5xl">
            Create with intelligence
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
            Enhance prints, diagnose readiness, generate new artwork, and get style or design
            guidance — before you customize in 3D.
          </p>
        </div>
        <Link href="/studio">
          <Button variant="outline">Open 3D Studio</Button>
        </Link>
      </div>

      <div className="mt-10">
        <AiStudio designs={designs} categories={categories} provider={provider} />
      </div>

      <section className="mt-14">
        <h2 className="text-lg font-medium tracking-tight">Recent AI jobs</h2>
        {recentJobs.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">No jobs yet — run a tool above.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--ink)]/8 rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)]">
            {recentJobs.map((job) => (
              <li
                key={job.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <span className="font-medium">{job.type.replaceAll("_", " ")}</span>
                <span className="text-[var(--muted)]">
                  {job.status} · {job.provider} ·{" "}
                  {job.createdAt.toLocaleString("en-PK")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
