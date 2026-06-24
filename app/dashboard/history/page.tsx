import Link from "next/link";
import { requireOrganizationContext } from "@/lib/dashboard/context";
import { getScanReportsForUser } from "@/lib/scans/history";
import type { ScanReportRecord } from "@/lib/scans/types";
import { HistoryActions } from "./history-actions";

function formatReportDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/Madrid",
    }).format(new Date(value));
  } catch {
    return "Not yet";
  }
}

function getRiskClasses(riskLevel: string, score: number) {
  const value = riskLevel.toLowerCase();

  if (value.includes("low") || score >= 80) {
    return "border-teal-200 bg-teal-50 text-teal-800";
  }

  if (value.includes("medium") || score >= 55) {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-rose-200 bg-rose-50 text-rose-800";
}

function getPreviousReportIds(reports: ScanReportRecord[]) {
  const previousByDomain = new Map<string, string>();
  const previousIds = new Map<string, string | null>();

  [...reports]
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    .forEach((report) => {
      previousIds.set(report.id, previousByDomain.get(report.domain) || null);
      previousByDomain.set(report.domain, report.id);
    });

  return previousIds;
}

export default async function DashboardHistoryPage() {
  const { user } = await requireOrganizationContext();
  const reports = await getScanReportsForUser(user.id, 200);
  const previousIds = getPreviousReportIds(reports);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
          Report history
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          Saved scan reports
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Review saved business-friendly reports, compare changes between scans,
          and re-scan a client domain when work has been completed.
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        {reports.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <h2 className="text-xl font-bold text-slate-950">
              No saved reports yet
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Run a scan from the public scan page while signed in, or run a
              saved domain scan from the dashboard, to create the first report.
            </p>
            <Link
              href="/scan"
              className="mt-5 inline-flex items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
            >
              Run scan
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <article
                key={report.id}
                className="grid gap-4 rounded-lg border border-slate-200 p-4 lg:grid-cols-[minmax(0,1.2fr)_120px_140px_minmax(230px,auto)] lg:items-center"
              >
                <div>
                  <h2 className="font-semibold text-slate-950">
                    {report.customer_name || report.domain}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">{report.domain}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatReportDate(report.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    Score
                  </p>
                  <p className="mt-1 text-lg font-black text-slate-950">
                    {report.score}/100
                  </p>
                </div>
                <span
                  className={`w-fit rounded-md border px-3 py-1 text-xs font-bold ${getRiskClasses(
                    report.risk_level,
                    report.score
                  )}`}
                >
                  {report.risk_level}
                </span>
                <HistoryActions
                  reportId={report.id}
                  previousReportId={previousIds.get(report.id)}
                />
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
