import Link from "next/link";
import { brand } from "@/lib/brand";
import { formatPkr } from "@/lib/utils";

const create = [
  { href: "/studio", label: "3D Studio" },
  { href: "/ai", label: "AI Studio" },
  { href: "/designs", label: "Design Library" },
  { href: "/try-on", label: "Try-On" },
];

const explore = [
  { href: "/products", label: "Products" },
  { href: "/designs", label: "Designs" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/how-it-works", label: "How It Works" },
];

const support = [
  { href: "/how-it-works", label: "Help" },
  { href: "/how-it-works", label: "Contact" },
  { href: "/how-it-works", label: "Shipping" },
  { href: "/how-it-works", label: "Returns" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--ink)]/8 bg-[var(--ink)] text-[var(--paper)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <p className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
            {brand.name}
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/65">
            {brand.tagline}
          </p>
          <p className="mt-4 text-xs leading-relaxed text-white/40">
            {brand.description}
          </p>
        </div>
        <FooterCol title="Create" links={create} />
        <FooterCol title="Explore" links={explore} />
        <div>
          <FooterCol title="Support" links={support} />
          <p className="mt-8 text-xs uppercase tracking-[0.14em] text-white/45">Legal</p>
          <ul className="mt-3 space-y-2 text-sm text-white/45">
            <li>Privacy — coming soon</li>
            <li>Terms — coming soon</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs text-white/40 sm:px-6">
          <span>
            © {new Date().getFullYear()} {brand.name} · {brand.region}
          </span>
          <span>
            {formatPkr(brand.advanceAmount)} advance · remaining on COD
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.14em] text-white/45">{title}</p>
      <ul className="mt-4 space-y-2 text-sm text-white/75">
        {links.map((l) => (
          <li key={`${title}-${l.label}`}>
            <Link href={l.href} className="hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
