"use client";

import Link from "next/link";
import {
  formatFrequency,
  formatStoredDate,
} from "../../components/domain-storage";
import { RiskPill } from "../../components/risk-pill";
import { useStoredDomains } from "../../components/use-stored-domains";

type DomainDetailClientProps = {
  domainId: string;
};

export function DomainDetailClient({ domainId }: DomainDetailClientProps) {
  const { domains, loaded } = useStoredDomains();
  const domain = domains.find((item) => item.id === domainId);

  if (!loaded) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        Loading domain...
      </div>
    );
  }

  if (!domain) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">Domain not found</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
          This domain may have been removed from local storage or created in a
          different browser.
        </p>
        <Link
          href="/dashboard/domains"
          className="mt-5 inline-flex items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
        >
          Back to domains
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
              Domain detail
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-950">
              {domain.name}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              This placeholder detail view is ready for database-backed scan
              history, findings, reports, and AI-assisted remediation guidance.
            </p>
          </div>
          <Link
            href={`/scan?domain=${encodeURIComponent(domain.name)}`}
            className="inline-flex items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
          >
            Run scan
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Latest score</p>
          <p className="mt-4 text-3xl font-black text-slate-950">
            {domain.latestScore === null ? "-" : domain.latestScore}
          </p>
          <p className="mt-2 text-sm text-slate-600">Score placeholder.</p>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Risk level</p>
          <div className="mt-4">
            <RiskPill riskLevel={domain.latestRiskLevel} />
          </div>
          <p className="mt-3 text-sm text-slate-600">Updated after future saved scans.</p>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Frequency</p>
          <p className="mt-4 text-xl font-black text-slate-950">
            {formatFrequency(domain.frequency)}
          </p>
          <p className="mt-2 text-sm text-slate-600">Schedule placeholder.</p>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Added</p>
          <p className="mt-4 text-xl font-black text-slate-950">
            {formatStoredDate(domain.createdAt)}
          </p>
          <p className="mt-2 text-sm text-slate-600">Stored in this browser.</p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Scan integration path</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            The Run Scan button currently opens the existing public scanner with
            this domain prefilled. In MVP 2.1, the scan result should be persisted
            to `scan_results` and linked to this domain record.
          </p>

          <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
            <h3 className="font-semibold text-slate-950">Future report history</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Saved scans, findings, report exports, and AI-assisted risk
              analysis will appear here after database persistence is added.
            </p>
          </div>
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Authorization</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Authorization confirmation:{" "}
              <span className="font-semibold text-slate-950">
                {domain.authorizationConfirmed ? "Confirmed" : "Not confirmed"}
              </span>
            </p>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Monitoring scope</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Automated scanning must respect lawful and authorized use. This
              product performs external exposure checks, not intrusive penetration
              testing.
            </p>
          </section>
        </aside>
      </section>
    </div>
  );
}
