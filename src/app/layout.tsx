import type { Metadata } from "next";
import { headers } from "next/headers";
import { DM_Sans, Syne } from "next/font/google";
import Script from "next/script";
import { SessionLifetimeRoot } from "@/components/auth/session-lifetime-root";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { sessionLifetimeBootstrapScript } from "@/lib/auth/session-lifetime";
import { brand } from "@/lib/brand";
import { isPortalAppPath } from "@/lib/portal-paths";
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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const portal = pathname ? isPortalAppPath(pathname) : false;

  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <Script
          id="nivaro-session-lifetime"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: sessionLifetimeBootstrapScript(),
          }}
        />
        <SessionLifetimeRoot />
        {portal ? (
          <div className="flex min-h-full flex-1 flex-col">{children}</div>
        ) : (
          <>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </>
        )}
      </body>
    </html>
  );
}
