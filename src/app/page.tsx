import { AiHighlight } from "@/components/home/ai-highlight";
import { AiReviewDemo } from "@/components/home/ai-review-demo";
import { DesignShowcase } from "@/components/home/design-showcase";
import { FinalCta } from "@/components/home/final-cta";
import { Fulfillment } from "@/components/home/fulfillment";
import { Hero } from "@/components/home/hero";
import { HowNivaroWorks } from "@/components/home/how-nivaro-works";
import { MultiProduct } from "@/components/home/multi-product";
import { PaymentTrust } from "@/components/home/payment-trust";
import { ProductShowcase } from "@/components/home/product-showcase";
import { QuickCreate } from "@/components/home/quick-create";
import { ReviewsDemo } from "@/components/home/reviews-demo";
import { StudioHighlight } from "@/components/home/studio-highlight";
import { TryOnHighlight } from "@/components/home/try-on-highlight";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();

  const [productsRaw, designs, saved] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      take: 9,
      orderBy: { basePrice: "asc" },
      include: { variants: { select: { color: true, colorHex: true } } },
    }),
    prisma.design.findMany({
      where: { isLibrary: true },
      take: 8,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, imageUrl: true, tags: true },
    }),
    session?.user?.id
      ? prisma.savedDesign.findMany({
          where: { userId: session.user.id },
          select: { designId: true },
        })
      : Promise.resolve([] as { designId: string }[]),
  ]);

  const products = productsRaw.map((p) => {
    const colorMap = new Map(
      p.variants.map((v) => [v.color, { name: v.color, hex: v.colorHex }]),
    );
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      basePrice: p.basePrice,
      imageUrl: p.imageUrl,
      colors: [...colorMap.values()],
    };
  });

  const savedIds = new Set(saved.map((s) => s.designId));

  return (
    <>
      <Hero />
      <QuickCreate />
      <HowNivaroWorks />
      <DesignShowcase designs={designs} savedIds={savedIds} />
      <ProductShowcase products={products} />
      <StudioHighlight />
      <AiHighlight />
      <TryOnHighlight />
      <AiReviewDemo />
      <MultiProduct designImage={designs[0]?.imageUrl} />
      <Fulfillment />
      <PaymentTrust />
      <ReviewsDemo />
      <FinalCta />
    </>
  );
}
