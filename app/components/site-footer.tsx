import Link from "next/link";

const footerLinks = [
  { href: "/features", label: "Features" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/scan", label: "Scan" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <Link href="/" className="text-base font-semibold text-slate-950">
            Web Exposure Check
          </Link>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
            A lightweight public exposure scanner for quick checks of web, email,
            and browser-facing security signals.
          </p>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-3 md:justify-end">
          {footerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-slate-100 px-4 py-5 text-center text-xs text-slate-500">
        This tool performs basic public checks only and is not a substitute for a
        professional security audit.
      </div>
    </footer>
  );
}
