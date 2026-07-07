import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Production Check",
  description:
    "Review public website exposure signals before sharing a report with a client or technician.",
};

const readinessItems = [
  {
    title: "Run a public exposure scan",
    text: "Check HTTPS, DNS exposure, and security headers without requiring a login for the first result.",
  },
  {
    title: "Review visible evidence",
    text: "Confirm the report is based on public homepage signals, headers, robots.txt, sitemap data, and discovered links.",
  },
  {
    title: "Share clear next steps",
    text: "Use business-friendly explanations and technician-ready instructions before re-scanning to show improvement.",
  },
];

export default function ProductionCheckPage() {
  return (
    <main className="min-h-screen bg-[#F6F8FB]">
      <section className="border-b border-slate-800 bg-[#111827] px-6 py-16 text-white lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-slate-300">
            Product readiness
          </p>
          <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl">
            Production-ready website exposure reports.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Use Web Exposure Check to scan a website, review public evidence,
            and prepare a client-friendly report before handing fixes to a
            technician.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/demo"
              className="inline-flex items-center justify-center rounded-lg bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#115E59]"
            >
              Try the demo
            </Link>
            <Link
              href="/scan"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Start a scan
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-14 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {readinessItems.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-bold text-slate-950">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
