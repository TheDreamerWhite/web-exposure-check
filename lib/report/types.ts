import type { CheckTone } from "@/lib/scan/checks";
import type { WebsiteReadResult } from "@/lib/reader/types";

export const reportLanguages = ["en", "es", "zh"] as const;

export type ReportLanguage = (typeof reportLanguages)[number];

export type ReportScanResult = {
  domain: string;
  score: number;
  riskLevel: string;
  checks: Record<string, string>;
  websiteReadResult?: WebsiteReadResult;
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
};
