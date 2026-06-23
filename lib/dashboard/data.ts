import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Domain, Finding, ScanResult } from "@/lib/types/database";

export type DomainWithLatestScan = Domain & {
  latestScan: ScanResult | null;
};

export type DashboardSummary = {
  domains: DomainWithLatestScan[];
  latestScansCount: number;
  openFindingsCount: number;
  recentScans: ScanResult[];
};

export async function getOrganizationDomains(organizationId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("domains")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Unable to load domains:", error);
    return [];
  }

  return data;
}

export async function getDomainById(domainId: string, organizationId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("domains")
    .select("*")
    .eq("id", domainId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) {
    console.error("Unable to load domain:", error);
    return null;
  }

  return data;
}

export async function getLatestScanForDomain(domainId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("scan_results")
    .select("*")
    .eq("domain_id", domainId)
    .order("scanned_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Unable to load latest scan:", error);
    return null;
  }

  return data;
}

export async function getRecentScansForDomain(domainId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("scan_results")
    .select("*")
    .eq("domain_id", domainId)
    .order("scanned_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Unable to load domain scans:", error);
    return [];
  }

  return data;
}

export async function getFindingsForDomain(domainId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("findings")
    .select("*")
    .eq("domain_id", domainId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Unable to load findings:", error);
    return [];
  }

  return data;
}

export async function getDashboardSummary(
  organizationId: string
): Promise<DashboardSummary> {
  const supabase = await createSupabaseServerClient();
  const domains = await getOrganizationDomains(organizationId);
  const domainIds = domains.map((domain) => domain.id);

  let scanRows: ScanResult[] = [];

  if (domainIds.length > 0) {
    const { data, error } = await supabase
      .from("scan_results")
      .select("*")
      .eq("organization_id", organizationId)
      .in("domain_id", domainIds)
      .order("scanned_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Unable to load scan summary:", error);
    } else {
      scanRows = data;
    }
  }

  const latestScanByDomain = new Map<string, ScanResult>();

  scanRows.forEach((scan) => {
    if (!latestScanByDomain.has(scan.domain_id)) {
      latestScanByDomain.set(scan.domain_id, scan);
    }
  });

  const { count: latestScansCount } = await supabase
    .from("scan_results")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  const { count: openFindingsCount } = await supabase
    .from("findings")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  return {
    domains: domains.map((domain) => ({
      ...domain,
      latestScan: latestScanByDomain.get(domain.id) || null,
    })),
    latestScansCount: latestScansCount || 0,
    openFindingsCount: openFindingsCount || 0,
    recentScans: scanRows.slice(0, 5),
  };
}

export function countRisk(domains: DomainWithLatestScan[], risk: string) {
  return domains.filter((domain) =>
    domain.latestScan?.risk_level.toLowerCase().includes(risk)
  ).length;
}

export function getFindingSeverityCount(findings: Finding[], severity: string) {
  return findings.filter((finding) => finding.severity === severity).length;
}
