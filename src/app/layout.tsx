import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { brand } from "@/lib/brand";
import "./globals.css";

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.AUTH_URL?.startsWith("http")
      ? process.env.AUTH_URL
      : "http://localhost:3000",
  ),
  title: {
    default: `${brand.name} — AI Custom Clothing for Pakistan`,
    template: `%s · ${brand.name}`,
  },
  description: brand.description,
  openGraph: {
    title: `${brand.name} — AI Custom Clothing for Pakistan`,
    description: brand.description,
    siteName: brand.name,
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: brand.name,
    description: brand.tagline,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
