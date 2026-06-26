import Link from "next/link";

const navItems = [
  { href: "/scan", label: "Scan" },
  { href: "/demo-report", label: "Demo Report" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/features", label: "Features" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 font-semibold text-slate-950">
          <span className="grid size-9 place-items-center rounded-md bg-teal-700 text-sm font-black text-white">
            WE
          </span>
          <span className="text-sm sm:text-base">Web Exposure Check</span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/scan"
          className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
        >
          Start scan
        </Link>
      </div>
    </header>
  );
}
