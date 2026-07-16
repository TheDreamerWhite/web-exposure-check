import type { CheckTone } from "@/lib/scan/checks";
import type { AiWebsiteUnderstanding } from "@/lib/ai/types";
import type { WebsiteReadResult } from "@/lib/reader/types";
import type {
  VerificationReconciliation,
  VerifiedFindingsSnapshot,
} from "@/lib/findings/types";

export const reportLanguages = ["en", "es", "zh"] as const;

export type ReportLanguage = (typeof reportLanguages)[number];

export type ReportScanResult = {
  domain: string;
  score: number;
  riskLevel: string;
  checks: Record<string, string>;
  websiteReadResult?: WebsiteReadResult;
  aiWebsiteUnderstanding?: AiWebsiteUnderstanding | null;
};

export type ReportRule = {
  title: string;
  explanation: string;
  businessImpact: string;
  responsibleOwner: string;
  fixDifficulty: string;
  estimatedFixTime: string;
  fixSteps: string[];
  technicianText: string;
};

export type ReportFinding = ReportRule & {
  checkKey: string;
  status: string;
  statusLabel: string;
  tone: CheckTone;
  passed: boolean;
  copyForTechnician: string;
};

export type BusinessSecurityReport = {
  language: ReportLanguage;
  domain: string;
  score: number;
  riskLevel: string;
  summary: string;
  findings: ReportFinding[];
  riskFindings: ReportFinding[];
  passedFindings: ReportFinding[];
  verifiedFindings?: VerifiedFindingsSnapshot;
  verification?: VerificationReconciliation;
};

export type BusinessSecurityReportWithVerifiedFindings =
  BusinessSecurityReport & {
    verifiedFindings: VerifiedFindingsSnapshot;
  };
