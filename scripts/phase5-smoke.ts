import { copyFile, mkdir } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { runTryOnReview, runVirtualTryOn } from "../src/lib/ai/orchestrator";

const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.findFirst({
    where: { slug: "essential-tee" },
    include: { variants: true },
  });
  const design = await prisma.design.findFirst({ where: { isLibrary: true } });
  if (!product || !design) throw new Error("missing seed");

  const photosDir = path.join(process.cwd(), "public", "uploads", "photos");
  await mkdir(photosDir, { recursive: true });
  const photoPath = path.join(photosDir, "smoke-photo.svg");
  await copyFile(
    path.join(process.cwd(), "public", "designs", "indus-line.svg"),
    photoPath,
  );
  const photoUrl = "/uploads/photos/smoke-photo.svg";

  const tryOn = await runVirtualTryOn({
    photoUrl,
    garmentPreviewUrl: product.imageUrl ?? "/products/tee.svg",
    productName: product.name,
    garmentColor: product.variants[0]?.colorHex ?? "#12141A",
    designUrl: design.imageUrl,
    size: "L",
  });
  const review = await runTryOnReview({
    resultUrl: tryOn.result.resultUrl,
    productName: product.name,
    size: "L",
  });

  console.log({
    ok: true,
    preview: tryOn.result.resultUrl,
    overall: review.result.overall,
    suggestions: review.result.suggestions.length,
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
