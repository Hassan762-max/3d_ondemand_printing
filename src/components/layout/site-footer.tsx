import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--ink)]/8 bg-[var(--ink)] text-[var(--paper)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
            Printora
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/65">
            AI-powered custom clothing for Pakistan. Design, try on, and order —
            fulfilled by trusted vendors nationwide.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-white/45">Create</p>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            <li><Link href="/studio" className="hover:text-white">3D Studio</Link></li>
            <li><Link href="/designs" className="hover:text-white">Design library</Link></li>
            <li><Link href="/try-on" className="hover:text-white">AI Try-On</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-white/45">Company</p>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            <li><Link href="/how-it-works" className="hover:text-white">How it works</Link></li>
            <li><Link href="/products" className="hover:text-white">Products</Link></li>
            <li><span className="text-white/40">Support — soon</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 text-xs text-white/40 sm:px-6">
          <span>© {new Date().getFullYear()} Printora · Pakistan</span>
          <span>Rs. 500 advance · remaining on COD</span>
        </div>
      </div>
    </footer>
  );
}
