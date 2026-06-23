"use client";

import Link from "next/link";
import type { MonitoredDomain } from "./components/domain-storage";
import {
  formatFrequency,
  formatStoredDate,
} from "./components/domain-storage";
import { RiskPill } from "./components/risk-pill";
import { useStoredDomains } from "./components/use-stored-domains";

function countRisk(domains: MonitoredDomain[], risk: string) {
  return domains.filter((domain) =>
    domain.latestRiskLevel?.toLowerCase().includes(risk)
  ).length;
}

export default function DashboardPage() {
  const { domains, loaded } = useStoredDomains();
  const scannedDomains = domains.filter((domain) => domain.latestScore !== null);
  const latestDomains = [...domains]
    .sort(
      (a, b) =>
        new Date(b.lastScannedAt || b.createdAt).getTime() -
        new Date(a.lastScannedAt || a.createdAt).getTime()
    )
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
              Dashboard
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
              Security Monitoring Dashboard
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
              Monitor your authorized domains, review exposure trends, and
              prepare automated security reports.
            </p>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-500">
              MVP 2.0 uses local browser data only. Authentication, persistence,
              scheduled scans, reports, and billing are planned future phases.
            </p>
          </div>
          <Link
            href="/dashboard/domains/new"
            className="inline-flex items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
          >
            Add your first domain
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Monitored domains</p>
          <p className="mt-4 text-3xl font-black text-slate-950">
            {loaded ? domains.length : "-"}
          </p>
          <p className="mt-2 text-sm text-slate-600">Authorized domains tracked.</p>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Latest scans</p>
          <p className="mt-4 text-3xl font-black text-slate-950">
            {loaded ? scannedDomains.length : "-"}
          </p>
          <p className="mt-2 text-sm text-slate-600">Database-backed history is next.</p>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Open findings</p>
          <p className="mt-4 text-3xl font-black text-slate-950">
            0
          </p>
          <p className="mt-2 text-sm text-slate-600">Finding storage arrives later.</p>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Report status</p>
          <p className="mt-4 text-lg font-black text-slate-950">Not connected</p>
          <p className="mt-2 text-sm text-slate-600">Email reports arrive later.</p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-950">Domain monitoring overview</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Manual scans are available today. Scheduled monitoring, reports,
                and alerts are planned for the next SaaS milestones.
              </p>
            </div>
            <Link
              href="/dashboard/domains"
              className="text-sm font-semibold text-teal-800 transition hover:text-teal-950"
            >
              Manage domains
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {domains.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
                No domains yet. Add an authorized domain to start building your
                monitoring workspace.
              </div>
            ) : (
              latestDomains.map((domain) => (
                <Link
                  key={domain.id}
                  href={`/dashboard/domains/${domain.id}`}
                  className="grid gap-3 rounded-lg border border-slate-200 p-4 transition hover:border-teal-700 hover:bg-teal-50/40 sm:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="font-semibold text-slate-950">{domain.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Frequency: {formatFrequency(domain.frequency)} | Added{" "}
                      {formatStoredDate(domain.createdAt)} | Last scan:{" "}
                      {formatStoredDate(domain.lastScannedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 sm:justify-end">
                    <span className="text-sm font-black text-slate-950">
                      {domain.latestScore === null ? "-" : `${domain.latestScore}/100`}
                    </span>
                    <RiskPill riskLevel={domain.latestRiskLevel} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Risk summary</h2>
            <div className="mt-4 grid gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Low risk</span>
                <span className="font-bold text-teal-800">{countRisk(domains, "low")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Medium risk</span>
                <span className="font-bold text-amber-800">
                  {countRisk(domains, "medium")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">High risk</span>
                <span className="font-bold text-rose-800">{countRisk(domains, "high")}</span>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Recent activity</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Recent activity will show saved scans, report deliveries, finding
              changes, and subscription events after database persistence is
              added.
            </p>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Authorized use</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Users should only monitor domains they own or are authorized to
              assess. Automated scanning must be lawful, authorized, and
              rate-limited.
            </p>
          </section>
        </aside>
      </section>
    </div>
  );
}
