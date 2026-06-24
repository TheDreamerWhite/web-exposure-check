import { NextResponse } from "next/server";
import { generateBusinessReport } from "@/lib/report/generateReport";
import {
  reportLanguages,
  type ReportLanguage,
  type ReportScanResult,
} from "@/lib/report/types";
import { createScanReport, getScanReportsForUser } from "@/lib/scans/history";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function normalizeOptionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeLocale(value: unknown): ReportLanguage {
  return reportLanguages.includes(value as ReportLanguage)
    ? (value as ReportLanguage)
    : "zh";
}

function isScanResult(value: unknown): value is ReportScanResult {
  const result = value as Partial<ReportScanResult>;

  return Boolean(
    result &&
      typeof result === "object" &&
      typeof result.domain === "string" &&
      typeof result.score === "number" &&
      typeof result.riskLevel === "string" &&
      result.checks &&
      typeof result.checks === "object"
  );
}

async function getUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return error || !user ? null : user;
}

export async function GET() {
  const user = await getUser();

  if (!user) {
    return jsonError("Authentication is required.", 401);
  }

  return NextResponse.json({
    reports: await getScanReportsForUser(user.id),
  });
}

export async function POST(request: Request) {
  const user = await getUser();

  if (!user) {
    return jsonError("Authentication is required.", 401);
  }

  const body = (await request.json().catch(() => null)) as {
    scanResult?: unknown;
    locale?: unknown;
    customerName?: unknown;
    internalNote?: unknown;
  } | null;

  if (!body || !isScanResult(body.scanResult)) {
    return jsonError("A valid scan result is required.", 400);
  }

  const locale = normalizeLocale(body.locale);
  const generatedReport = generateBusinessReport(body.scanResult, locale);
  const report = await createScanReport({
    userId: user.id,
    scanResult: body.scanResult,
    generatedReport,
    locale,
    customerName: normalizeOptionalText(body.customerName),
    internalNote: normalizeOptionalText(body.internalNote),
  });

  return NextResponse.json({
    report,
  });
}
