import { LegalPage } from "@/components/legal/legal-page";
import { brand } from "@/lib/brand";
import { formatPkr } from "@/lib/utils";

export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="September 2026"
      sections={[
        {
          heading: "Service",
          body: `${brand.name} provides AI-assisted design tools, 3D customization, virtual try-on, and print-on-demand ordering fulfilled through Pakistan production partners.`,
        },
        {
          heading: "Orders & payment",
          body: `Orders are confirmed at checkout and the full total (items + flat ${formatPkr(brand.deliveryFee)} delivery) is collected via COD where available. Print charges are ${formatPkr(brand.designSidePrice)} per printed side (Front and/or Back); there is no separate sticker fee. Customized goods follow our returns policy for defects and fulfillment issues.`,
        },
        {
          heading: "Your content",
          body: "You must own or have rights to artwork you upload. You grant us a limited license to process, print, and fulfill orders. Marketplace creators retain ownership of listed designs subject to buyer licenses.",
        },
        {
          heading: "AI tools",
          body: "AI enhancement, generation, and try-on outputs are assistive. Final print quality depends on artwork, garment, and vendor production. Review previews before confirming.",
        },
        {
          heading: "Acceptable use",
          body: "Do not upload unlawful, infringing, or abusive content. We may remove listings or suspend accounts that violate these terms.",
        },
      ]}
    />
  );
}
