import { NextResponse, type NextRequest } from "next/server";
import { generateBusinessReport } from "@/lib/report/generateReport";
import {
  reportLanguages,
  type BusinessSecurityReportWithVerifiedFindings,
  type ReportLanguage,
  type ReportScanResult,
} from "@/lib/report/types";
import { readWebsite } from "@/lib/reader/read-website";
import { runExposureScan, ScanInputError } from "@/lib/scan/run-scan";
import {
  createScanReport,
  getScanReportById,
} from "@/lib/scans/history";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { withVerifiedFindings } from "@/lib/findings/compatibility";
import { reconcileVerifiedFindings } from "@/lib/findings/verification";

export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function normalizeLocale(value: string): ReportLanguage {
  return reportLanguages.includes(value as ReportLanguage)
    ? (value as ReportLanguage)
    : "en";
}

async function getUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return error || !user ? null : user;
}

export async function POST(_request: NextRequest, { params }: RouteProps) {
  const user = await getUser();

  if (!user) {
    return jsonError("Authentication is required.", 401);
  }

  const { id } = await params;
  const previousReport = await getScanReportById(user.id, id);

  if (!previousReport) {
    return jsonError("Report not found.", 404);
  }

  try {
    const baseScanResult = await runExposureScan(previousReport.domain);
    let scanResult: ReportScanResult = baseScanResult;

    try {
      scanResult = {
        ...baseScanResult,
        websiteReadResult: await readWebsite(previousReport.domain),
      };
    } catch (error) {
      console.warn(
        "Website evidence could not be refreshed during re-scan:",
        error
      );
    }

    const locale = normalizeLocale(previousReport.locale);
    const generatedReport = generateBusinessReport(scanResult, locale);
    const previousSnapshot = withVerifiedFindings(
      previousReport.scan_result,
      previousReport.generated_report
    ).verifiedFindings;
    const reconciled = reconcileVerifiedFindings(
      previousSnapshot,
      generatedReport.verifiedFindings,
      { previousReportId: previousReport.id }
    );
    const generatedReportWithVerification: BusinessSecurityReportWithVerifiedFindings = {
      ...generatedReport,
      verifiedFindings: reconciled.snapshot,
      verification: reconciled.verification,
    };
    const report = await createScanReport({
      userId: user.id,
      scanResult,
      generatedReport: generatedReportWithVerification,
      locale,
      customerName: previousReport.customer_name || undefined,
      internalNote: previousReport.internal_note || undefined,
    });

    return NextResponse.json({
      report,
      previousReportId: previousReport.id,
    });
  } catch (error) {
    if (error instanceof ScanInputError) {
      return jsonError(error.message, error.status);
    }

    console.error("Unable to re-scan report:", error);
    return jsonError("Unable to complete re-scan.", 500);
  }
}
