import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Monitor authorized domains and prepare continuous web exposure scans.",
};

const dashboardNav = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/domains", label: "Domains" },
  { href: "/dashboard/domains/new", label: "Add domain" },
];

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="bg-slate-100">
      <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8">
        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24">
          <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-800">
              Workspace
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              SaaS foundation preview
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              Authentication and organization access controls will gate this
              area in a later MVP.
            </p>
          </div>

          <nav aria-label="Dashboard navigation" className="mt-4 grid gap-2">
            {dashboardNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">Safety boundary</p>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              Add only domains you own or are authorized to monitor. Automated
              scanning must remain lawful and authorized.
            </p>
          </div>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
