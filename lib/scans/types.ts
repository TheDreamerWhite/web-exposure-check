import type { BusinessSecurityReport, ReportLanguage, ReportScanResult } from "@/lib/report/types";
import type { AgencyProfile, ScanReport } from "@/lib/types/database";

export type FindingWorkflowStatus = "open" | "in_progress" | "fixed" | "ignored";

export type FindingStatuses = Record<string, FindingWorkflowStatus>;

export type ScanReportRecord = Omit<
  ScanReport,
  "scan_result" | "generated_report" | "finding_statuses"
> & {
  scan_result: ReportScanResult;
  generated_report: BusinessSecurityReport;
  finding_statuses: FindingStatuses;
};

export type CreateScanReportInput = {
  userId: string;
  scanResult: ReportScanResult;
  generatedReport: BusinessSecurityReport;
  locale: ReportLanguage;
  customerName?: string;
  internalNote?: string;
  findingStatuses?: FindingStatuses;
};

export type AgencyProfileForm = Pick<
  AgencyProfile,
  "agency_name" | "agency_email" | "agency_website" | "logo_url"
>;
