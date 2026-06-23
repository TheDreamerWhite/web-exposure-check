import Link from "next/link";
import { requireDashboardContext } from "@/lib/dashboard/context";
import {
  countRisk,
  getDashboardSummary,
} from "@/lib/dashboard/data";
import {
  formatFrequency,
  formatStoredDate,
} from "./components/domain-storage";
import { RiskPill } from "./components/risk-pill";

export default async function DashboardPage() {
  const { organization } = await requireDashboardContext();

  if (!organization) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">
          Organization setup required
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
          Your account is authenticated, but no organization record was found.
          This can happen when email confirmation delayed the initial workspace
          setup. Create or repair the organization in Supabase before adding
          domains.
        </p>
      </div>
    );
  }

  const summary = await getDashboardSummary(organization.id);
  const latestDomains = [...summary.domains]
    .sort(
      (a, b) =>
        new Date(b.latestScan?.scanned_at || b.created_at).getTime() -
        new Date(a.latestScan?.scanned_at || a.created_at).getTime()
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
              MVP 2.1 stores domains, scan results, and findings in Supabase.
              Scheduled scans, reports, AI analysis, and billing remain future
              phases.
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
            {summary.domains.length}
          </p>
          <p className="mt-2 text-sm text-slate-600">Authorized domains tracked.</p>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Latest scans</p>
          <p className="mt-4 text-3xl font-black text-slate-950">
            {summary.latestScansCount}
          </p>
          <p className="mt-2 text-sm text-slate-600">Persisted scan records.</p>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Open findings</p>
          <p className="mt-4 text-3xl font-black text-slate-950">
            {summary.openFindingsCount}
          </p>
          <p className="mt-2 text-sm text-slate-600">Saved non-OK findings.</p>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Report status</p>
          <p className="mt-4 text-lg font-black text-slate-950">Planned</p>
          <p className="mt-2 text-sm text-slate-600">Email reports arrive later.</p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Domain monitoring overview
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Manual authenticated scans can now be saved to Supabase.
                Scheduled monitoring, reports, and alerts are planned for later
                SaaS milestones.
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
            {summary.domains.length === 0 ? (
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
                    <p className="font-semibold text-slate-950">{domain.domain}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Frequency: {formatFrequency(domain.monitoring_frequency)} |
                      Added {formatStoredDate(domain.created_at)} | Last scan:{" "}
                      {formatStoredDate(domain.latestScan?.scanned_at || null)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 sm:justify-end">
                    <span className="text-sm font-black text-slate-950">
                      {domain.latestScan ? `${domain.latestScan.score}/100` : "-"}
                    </span>
                    <RiskPill riskLevel={domain.latestScan?.risk_level || null} />
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
                <span className="font-bold text-teal-800">
                  {countRisk(summary.domains, "low")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Medium risk</span>
                <span className="font-bold text-amber-800">
                  {countRisk(summary.domains, "medium")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">High risk</span>
                <span className="font-bold text-rose-800">
                  {countRisk(summary.domains, "high")}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Recent activity</h2>
            <div className="mt-3 space-y-3">
              {summary.recentScans.length === 0 ? (
                <p className="text-sm leading-6 text-slate-600">
                  Saved scan activity will appear here after the first
                  authenticated dashboard scan.
                </p>
              ) : (
                summary.recentScans.map((scan) => (
                  <div key={scan.id} className="text-sm leading-6 text-slate-600">
                    <span className="font-semibold text-slate-950">
                      {scan.domain}
                    </span>{" "}
                    scored {scan.score}/100 on {formatStoredDate(scan.scanned_at)}.
                  </div>
                ))
              )}
            </div>
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
