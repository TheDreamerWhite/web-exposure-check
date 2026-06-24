import { NextResponse, type NextRequest } from "next/server";
import { generateBusinessReport } from "@/lib/report/generateReport";
import { reportLanguages, type ReportLanguage } from "@/lib/report/types";
import { runExposureScan, ScanInputError } from "@/lib/scan/run-scan";
import {
  createScanReport,
  getScanReportById,
} from "@/lib/scans/history";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
    const scanResult = await runExposureScan(previousReport.domain);
    const locale = normalizeLocale(previousReport.locale);
    const generatedReport = generateBusinessReport(scanResult, locale);
    const report = await createScanReport({
      userId: user.id,
      scanResult,
      generatedReport,
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
