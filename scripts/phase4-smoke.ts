import { PrismaClient } from "@prisma/client";
import { runDiagnose, runGenerate, runStyleConsult } from "../src/lib/ai/orchestrator";

const prisma = new PrismaClient();

async function main() {
  const design = await prisma.design.findFirst({ where: { isLibrary: true } });
  if (!design) throw new Error("missing library design");

  const gen = await runGenerate({
    prompt: "Karachi night mark",
    style: "bold",
  });
  const doc = await runDiagnose({
    imageUrl: design.imageUrl,
    productCategory: "T_SHIRT",
  });
  const style = await runStyleConsult({
    question: "What goes with an oversized charcoal tee in Lahore summers?",
  });

  console.log({
    ok: true,
    generate: gen.result.imageUrl,
    doctorScore: doc.result.score,
    styleRecs: style.result.recommendations.length,
    jobs: await prisma.aiJob.count(),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
