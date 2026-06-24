import Link from "next/link";
import { getCurrentUser } from "@/lib/dashboard/context";
import { compareScanReports } from "@/lib/report/compareReports";
import {
  getAgencyProfile,
  getPreviousScanReport,
  getScanReportById,
} from "@/lib/scans/history";
import { ReportDetailClient } from "./report-detail-client";

type ReportPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    previous?: string;
  }>;
};

export default async function ReportPage({
  params,
  searchParams,
}: ReportPageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const { user } = await getCurrentUser();
  const report = await getScanReportById(user.id, id);

  if (!report) {
    return (
      <main className="bg-background px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-950">Report not found</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            This report may have been removed or belongs to another account.
          </p>
          <Link
            href="/dashboard/history"
            className="mt-5 inline-flex items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            Back to history
          </Link>
        </div>
      </main>
    );
  }

  let previousReport = null;

  if (query.previous) {
    const requestedPrevious = await getScanReportById(user.id, query.previous);
    previousReport =
      requestedPrevious?.domain === report.domain ? requestedPrevious : null;
  }

  if (!previousReport) {
    previousReport = await getPreviousScanReport(
      user.id,
      report.domain,
      report.created_at,
      report.id
    );
  }

  const comparison = previousReport
    ? compareScanReports(previousReport.scan_result, report.scan_result)
    : null;
  const agencyProfile = await getAgencyProfile(user.id);

  return (
    <ReportDetailClient
      report={report}
      previousReport={previousReport}
      comparison={comparison}
      agencyProfile={agencyProfile}
    />
  );
}
