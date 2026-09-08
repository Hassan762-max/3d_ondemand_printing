import { LegalPage } from "@/components/legal/legal-page";
import { brand } from "@/lib/brand";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="September 2026"
      sections={[
        {
          heading: "What we collect",
          body: `${brand.name} collects account details (name, email), order and shipping information, uploaded design files, and product preferences needed to fulfill custom clothing orders across Pakistan.`,
        },
        {
          heading: "How we use it",
          body: "We use your data to operate the studio, AI tools, try-on sessions, payments (advance + COD), vendor fulfillment, returns, and customer support. We do not sell personal data.",
        },
        {
          heading: "Designs & media",
          body: "Uploads and AI-generated assets are stored to produce your order and for your library. Marketplace listings you publish may be visible to other customers.",
        },
        {
          heading: "Vendors & partners",
          body: "Production partners receive the print package and shipping details required to manufacture and deliver your order. Payment processors may receive advance/COD references when configured.",
        },
        {
          heading: "Contact",
          body: `Questions about privacy: use the Contact page under Support, or email the address listed on your order confirmation once live messaging is enabled.`,
        },
      ]}
    />
  );
}
