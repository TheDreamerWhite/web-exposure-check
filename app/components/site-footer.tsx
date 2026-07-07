import Link from "next/link";

const footerLinks = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/demo-report", label: "Sample report" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/features", label: "Features" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <Link href="/" className="text-base font-semibold text-slate-950">
            Web Exposure Check
          </Link>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
            Website security reports that translate public technical checks into
            business impact and fix instructions for technicians.
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

      <div className="border-t border-slate-100 px-4 py-5 text-center text-sm leading-6 text-slate-500">
        This tool performs public, non-invasive checks and is not a replacement
        for a full security audit, penetration test, or code review.
      </div>
    </footer>
  );
}
