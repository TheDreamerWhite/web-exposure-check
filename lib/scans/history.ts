import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json, AgencyProfile } from "@/lib/types/database";
import type {
  AgencyProfileForm,
  CreateScanReportInput,
  FindingStatuses,
  ScanReportRecord,
} from "./types";
import { withVerifiedFindings } from "@/lib/findings/compatibility";

function normalizeOptionalText(value?: string | null) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

export function coerceScanReportRecord(row: unknown): ScanReportRecord {
  const report = row as ScanReportRecord;
  let generatedReport = report.generated_report;

  if (
    generatedReport &&
    !generatedReport.verifiedFindings &&
    report.scan_result &&
    Array.isArray(generatedReport.findings)
  ) {
    try {
      generatedReport = withVerifiedFindings(
        report.scan_result,
        generatedReport
      );
    } catch (error) {
      console.warn("Unable to hydrate verified findings for stored report:", error);
    }
  }

  return {
    ...report,
    generated_report: generatedReport,
    finding_statuses:
      report.finding_statuses && typeof report.finding_statuses === "object"
        ? report.finding_statuses
        : {},
  };
}

export async function createScanReport(input: CreateScanReportInput) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("scan_reports")
    .insert({
      user_id: input.userId,
      domain: input.scanResult.domain,
      customer_name: normalizeOptionalText(input.customerName),
      internal_note: normalizeOptionalText(input.internalNote),
      locale: input.locale,
      score: input.scanResult.score,
      risk_level: input.scanResult.riskLevel,
      scan_result: input.scanResult as unknown as Json,
      generated_report: input.generatedReport as unknown as Json,
      finding_statuses: (input.findingStatuses || {}) as Json,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return coerceScanReportRecord(data);
}

export async function getScanReportsForUser(userId: string, limit = 100) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("scan_reports")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Unable to load scan reports:", error);
    return [];
  }

  return (data || []).map(coerceScanReportRecord);
}

export async function getScanReportById(userId: string, reportId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("scan_reports")
    .select("*")
    .eq("id", reportId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Unable to load scan report:", error);
    return null;
  }

  return data ? coerceScanReportRecord(data) : null;
}

export async function getPreviousScanReport(
  userId: string,
  domain: string,
  beforeCreatedAt: string,
  excludeId?: string
) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("scan_reports")
    .select("*")
    .eq("user_id", userId)
    .eq("domain", domain)
    .lt("created_at", beforeCreatedAt)
    .order("created_at", { ascending: false })
    .limit(1);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("Unable to load previous scan report:", error);
    return null;
  }

  return data ? coerceScanReportRecord(data) : null;
}

export async function updateFindingStatuses(
  userId: string,
  reportId: string,
  findingStatuses: FindingStatuses
) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("scan_reports")
    .update({
      finding_statuses: findingStatuses as Json,
    })
    .eq("id", reportId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return coerceScanReportRecord(data);
}

export async function getAgencyProfile(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("agency_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Unable to load agency profile:", error);
    return null;
  }

  return data;
}

export async function upsertAgencyProfile(
  userId: string,
  values: AgencyProfileForm
): Promise<AgencyProfile> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("agency_profiles")
    .upsert(
      {
        user_id: userId,
        agency_name: normalizeOptionalText(values.agency_name),
        agency_email: normalizeOptionalText(values.agency_email),
        agency_website: normalizeOptionalText(values.agency_website),
        logo_url: normalizeOptionalText(values.logo_url),
      },
      { onConflict: "user_id" }
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export function getLatestReportByDomain(reports: ScanReportRecord[]) {
  const latestByDomain = new Map<string, ScanReportRecord>();

  reports.forEach((report) => {
    const current = latestByDomain.get(report.domain);

    if (!current || report.created_at > current.created_at) {
      latestByDomain.set(report.domain, report);
    }
  });

  return latestByDomain;
}
