import Link from "next/link";
import { requireDashboardContext } from "@/lib/dashboard/context";
import {
  getDomainById,
  getFindingsForDomain,
  getLatestScanForDomain,
  getRecentScansForDomain,
} from "@/lib/dashboard/data";
import {
  formatDomainStatus,
  formatFrequency,
  formatStoredDate,
} from "../../components/domain-storage";
import { RiskPill } from "../../components/risk-pill";
import { StatusPill } from "../../components/status-pill";
import { DashboardScanButton } from "./dashboard-scan-button";

type DomainDetailPageProps = {
  params: Promise<{
    domainId: string;
  }>;
};

export default async function DomainDetailPage({ params }: DomainDetailPageProps) {
  const { domainId } = await params;
  const { organization } = await requireDashboardContext();

  if (!organization) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">
          Organization setup required
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
          No organization record was found for this user.
        </p>
      </div>
    );
  }

  const domain = await getDomainById(domainId, organization.id);

  if (!domain) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">Domain not found</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
          This domain may have been removed or may belong to another
          organization.
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

  const [latestScan, recentScans, findings] = await Promise.all([
    getLatestScanForDomain(domain.id),
    getRecentScansForDomain(domain.id),
    getFindingsForDomain(domain.id),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
              Domain detail
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-950">
              {domain.domain}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Review persisted scan history and saved findings for this
              authorized domain. Scheduled monitoring and domain verification
              remain future phases.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <DashboardScanButton domainId={domain.id} />
            <Link
              href={`/scan?domain=${encodeURIComponent(domain.domain)}`}
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-teal-700 hover:text-teal-800"
            >
              Open public scan
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Latest score</p>
          <p className="mt-4 text-3xl font-black text-slate-950">
            {latestScan ? latestScan.score : "-"}
          </p>
          <p className="mt-2 text-sm text-slate-600">Most recent saved scan.</p>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Risk level</p>
          <div className="mt-4">
            <RiskPill riskLevel={latestScan?.risk_level || null} />
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Updated after saved dashboard scans.
          </p>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Frequency</p>
          <p className="mt-4 text-xl font-black text-slate-950">
            {formatFrequency(domain.monitoring_frequency)}
          </p>
          <p className="mt-2 text-sm text-slate-600">Schedule placeholder.</p>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Latest scan</p>
          <p className="mt-4 text-xl font-black text-slate-950">
            {formatStoredDate(latestScan?.scanned_at || null)}
          </p>
          <p className="mt-2 text-sm text-slate-600">Persisted in Supabase.</p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Scan history</h2>
            <div className="mt-4 space-y-3">
              {recentScans.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                  No saved scans yet. Run a saved scan from this page to create
                  the first persisted scan result.
                </div>
              ) : (
                recentScans.map((scan) => (
                  <article
                    key={scan.id}
                    className="grid gap-3 rounded-lg border border-slate-200 p-4 sm:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <p className="font-semibold text-slate-950">
                        {formatStoredDate(scan.scanned_at)}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {scan.domain} scored {scan.score}/100.
                      </p>
                    </div>
                    <RiskPill riskLevel={scan.risk_level} />
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Findings</h2>
            <div className="mt-4 space-y-3">
              {findings.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                  Findings are created for non-OK checks after saved dashboard
                  scans.
                </div>
              ) : (
                findings.map((finding) => (
                  <article
                    key={finding.id}
                    className="rounded-lg border border-slate-200 p-4"
                  >
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <h3 className="font-semibold text-slate-950">
                        {finding.title}
                      </h3>
                      <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800">
                        {finding.severity}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {finding.description}
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-700">
                      Status: {finding.status}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              Recommended actions
            </h2>
            <div className="mt-4 space-y-3">
              {findings.length === 0 ? (
                <p className="text-sm leading-6 text-slate-600">
                  Recommended actions will appear after findings are saved.
                </p>
              ) : (
                findings.slice(0, 5).map((finding) => (
                  <div
                    key={`${finding.id}-fix`}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700"
                  >
                    {finding.suggested_fix}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Authorization</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Authorization confirmation:{" "}
              <span className="font-semibold text-slate-950">
                {domain.authorization_confirmed ? "Confirmed" : "Not confirmed"}
              </span>
            </p>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Status</h2>
            <div className="mt-3 flex items-center gap-3">
              <StatusPill status={domain.status} />
              <span className="text-sm text-slate-600">
                {formatDomainStatus(domain.status)}
              </span>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Monitoring scope
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Automated scanning must respect lawful and authorized use. This
              product performs external exposure checks, not intrusive
              penetration testing.
            </p>
          </section>
        </aside>
      </section>
    </div>
  );
}
