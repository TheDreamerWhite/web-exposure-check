"use client";

import Link from "next/link";
import {
  formatDomainStatus,
  formatFrequency,
  formatStoredDate,
} from "../components/domain-storage";
import { RiskPill } from "../components/risk-pill";
import { StatusPill } from "../components/status-pill";
import { useStoredDomains } from "../components/use-stored-domains";

export default function DomainsPage() {
  const { domains, loaded } = useStoredDomains();

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
              Domains
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-950">
              Authorized domain inventory
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Keep a list of domains your business owns or has permission to
              monitor. Local storage is temporary until database persistence is
              added in MVP 2.1.
            </p>
          </div>
          <Link
            href="/dashboard/domains/new"
            className="inline-flex items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
          >
            Add domain
          </Link>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          Automated scanning must respect lawful and authorized use. This tool
          performs basic external exposure checks and does not attempt intrusive
          exploitation.
        </div>

        <div className="mt-5 space-y-3">
          {!loaded ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              Loading domains...
            </div>
          ) : domains.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <h2 className="text-xl font-bold text-slate-950">No domains yet</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                Add an authorized domain to prepare manual scans and future
                scheduled monitoring.
              </p>
              <Link
                href="/dashboard/domains/new"
                className="mt-5 inline-flex items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
              >
                Add first domain
              </Link>
            </div>
          ) : (
            domains.map((domain) => (
              <article
                key={domain.id}
                className="grid gap-4 rounded-lg border border-slate-200 p-4 md:grid-cols-[minmax(0,1fr)_auto]"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Domain name
                  </p>
                  <Link
                    href={`/dashboard/domains/${domain.id}`}
                    className="text-lg font-bold text-slate-950 transition hover:text-teal-800"
                  >
                    {domain.name}
                  </Link>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Monitoring frequency: {formatFrequency(domain.frequency)} |
                    Last scanned date: {formatStoredDate(domain.lastScannedAt)}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Authorization confirmed:{" "}
                    {domain.authorizationConfirmed ? "Yes" : "No"} | Status:{" "}
                    {formatDomainStatus(domain.status)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 md:justify-end">
                  <span className="text-sm font-black text-slate-950">
                    Latest score:{" "}
                    {domain.latestScore === null ? "No score" : `${domain.latestScore}/100`}
                  </span>
                  <RiskPill riskLevel={domain.latestRiskLevel} />
                  <StatusPill status={domain.status} />
                  <Link
                    href={`/dashboard/domains/${domain.id}`}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-950 transition hover:border-teal-700 hover:text-teal-800"
                  >
                    Details
                  </Link>
                  <Link
                    href={`/scan?domain=${encodeURIComponent(domain.name)}`}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-950 transition hover:border-teal-700 hover:text-teal-800"
                  >
                    Run scan
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
