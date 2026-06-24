import Link from "next/link";
import { requireOrganizationContext } from "@/lib/dashboard/context";
import { getScanReportsForUser } from "@/lib/scans/history";
import type { ScanReportRecord } from "@/lib/scans/types";
import { HistoryActions } from "../history/history-actions";

type ClientGroup = {
  name: string;
  reports: ScanReportRecord[];
  latestByDomain: ScanReportRecord[];
};

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

function groupReportsByClient(reports: ScanReportRecord[]) {
  const groups = new Map<string, ScanReportRecord[]>();

  reports.forEach((report) => {
    const clientName = report.customer_name || "Unassigned client";
    groups.set(clientName, [...(groups.get(clientName) || []), report]);
  });

  return Array.from(groups.entries())
    .map(([name, groupReports]) => {
      const latestByDomain = new Map<string, ScanReportRecord>();

      groupReports.forEach((report) => {
        const current = latestByDomain.get(report.domain);

        if (!current || report.created_at > current.created_at) {
          latestByDomain.set(report.domain, report);
        }
      });

      return {
        name,
        reports: groupReports,
        latestByDomain: Array.from(latestByDomain.values()).sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ),
      } satisfies ClientGroup;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
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

export default async function DashboardClientsPage() {
  const { user } = await requireOrganizationContext();
  const reports = await getScanReportsForUser(user.id, 200);
  const groups = groupReportsByClient(reports);
  const previousIds = getPreviousReportIds(reports);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
          Client workspace
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          Clients and domains
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Group saved reports by customer so an agency or consultant can see
          which client domains need follow-up.
        </p>
      </section>

      {groups.length === 0 ? (
        <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            No client reports yet
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Add a customer name before running a scan to start building the
            client dashboard.
          </p>
          <Link
            href="/scan"
            className="mt-5 inline-flex items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            Run client scan
          </Link>
        </section>
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <section
              key={group.name}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">
                    {group.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {group.latestByDomain.length} domain
                    {group.latestByDomain.length === 1 ? "" : "s"} monitored
                    through saved reports.
                  </p>
                </div>
                <span className="w-fit rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
                  {group.reports.length} total report
                  {group.reports.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {group.latestByDomain.map((report) => (
                  <article
                    key={report.id}
                    className="grid gap-4 rounded-lg border border-slate-200 p-4 lg:grid-cols-[minmax(0,1fr)_120px_140px_minmax(230px,auto)] lg:items-center"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-950">
                        {report.domain}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Last report: {formatReportDate(report.created_at)}
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
                    <span className="w-fit rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                      {report.risk_level}
                    </span>
                    <HistoryActions
                      reportId={report.id}
                      previousReportId={previousIds.get(report.id)}
                    />
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
