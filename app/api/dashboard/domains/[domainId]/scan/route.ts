import { NextResponse, type NextRequest } from "next/server";
import { generateBusinessReport } from "@/lib/report/generateReport";
import { orderedCheckEntries, getCheckInfo, getCheckTone } from "@/lib/scan/checks";
import { runExposureScan, ScanInputError } from "@/lib/scan/run-scan";
import { createScanReport } from "@/lib/scans/history";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/types/database";

export const runtime = "nodejs";

type ScanRouteProps = {
  params: Promise<{
    domainId: string;
  }>;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function getSeverity(checkKey: string, status: string) {
  const tone = getCheckTone(status);

  if (tone === "warning") return "medium";

  if (["ssl", "dmarc", "spf"].includes(checkKey)) {
    return "high";
  }

  return "medium";
}

export async function POST(_request: NextRequest, { params }: ScanRouteProps) {
  if (!isSupabaseConfigured()) {
    return jsonError("Supabase is not configured.", 503);
  }

  const { domainId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return jsonError("Authentication is required.", 401);
  }

  const { data: domain, error: domainError } = await supabase
    .from("domains")
    .select("*")
    .eq("id", domainId)
    .maybeSingle();

  if (domainError) {
    return jsonError("Unable to load this domain.", 500);
  }

  if (!domain) {
    return jsonError("Domain not found or not available to this user.", 404);
  }

  if (!domain.authorization_confirmed) {
    return jsonError("Domain authorization must be confirmed before scanning.", 400);
  }

  try {
    const scanResult = await runExposureScan(domain.domain);
    const { data: savedScan, error: scanError } = await supabase
      .from("scan_results")
      .insert({
        domain_id: domain.id,
        organization_id: domain.organization_id,
        domain: scanResult.domain,
        score: scanResult.score,
        risk_level: scanResult.riskLevel,
        checks: scanResult.checks as unknown as Json,
      })
      .select("id")
      .single();

    if (scanError || !savedScan) {
      return jsonError(scanError?.message || "Unable to save scan result.", 500);
    }

    const findingRows = orderedCheckEntries(scanResult.checks)
      .filter(([, status]) => getCheckTone(status) !== "ok")
      .map(([checkKey, status]) => {
        const info = getCheckInfo(checkKey);

        return {
          scan_result_id: savedScan.id,
          domain_id: domain.id,
          organization_id: domain.organization_id,
          check_key: checkKey,
          status,
          severity: getSeverity(checkKey, status),
          title: info.label,
          description: info.description,
          suggested_fix: info.fix,
        };
      });

    let findingIds: string[] = [];
    let scanReportId: string | null = null;

    if (findingRows.length > 0) {
      const { data: savedFindings, error: findingsError } = await supabase
        .from("findings")
        .insert(findingRows)
        .select("id");

      if (findingsError) {
        return jsonError(findingsError.message, 500);
      }

      findingIds = (savedFindings || []).map((finding) => finding.id);
    }

    try {
      const generatedReport = generateBusinessReport(scanResult, "en");
      const savedReport = await createScanReport({
        userId: user.id,
        scanResult,
        generatedReport,
        locale: "en",
      });

      scanReportId = savedReport.id;
    } catch (reportError) {
      console.error("Dashboard scan report history save failed:", reportError);
    }

    return NextResponse.json({
      ...scanResult,
      scanResultId: savedScan.id,
      findingIds,
      scanReportId,
    });
  } catch (error) {
    if (error instanceof ScanInputError) {
      return jsonError(error.message, error.status);
    }

    console.error("Dashboard scan failed:", error);

    return jsonError("Unable to complete dashboard scan.", 500);
  }
}
