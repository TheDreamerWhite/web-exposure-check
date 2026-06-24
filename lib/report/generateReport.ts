import {
  getCheckTone,
  orderedCheckEntries,
  type CheckTone,
} from "@/lib/scan/checks";
import {
  getReportRule,
  reportSummaries,
  statusLabels,
} from "./reportRules";
import type {
  BusinessSecurityReport,
  ReportFinding,
  ReportLanguage,
  ReportScanResult,
} from "./types";

function getSummaryKey(scanResult: ReportScanResult) {
  const risk = scanResult.riskLevel.toLowerCase();

  if (risk.includes("low") || scanResult.score >= 85) {
    return "low";
  }

  if (risk.includes("medium") || scanResult.score >= 60) {
    return "medium";
  }

  return "high";
}

function buildTechnicianText(
  scanResult: ReportScanResult,
  finding: Omit<ReportFinding, "copyForTechnician">
) {
  return [
    `Domain: ${scanResult.domain}`,
    `Check: ${finding.title}`,
    `Observed status: ${finding.status}`,
    "",
    finding.technicianText,
    "",
    "Requested outcome: please update the website, DNS, email, or header configuration so this check passes on the next scan.",
  ].join("\n");
}

function getStatusLabel(language: ReportLanguage, tone: CheckTone) {
  return statusLabels[language][tone];
}

export function generateBusinessReport(
  scanResult: ReportScanResult,
  language: ReportLanguage
): BusinessSecurityReport {
  const findings = orderedCheckEntries(scanResult.checks).map(([checkKey, status]) => {
    const tone = getCheckTone(status);
    const rule = getReportRule(checkKey, language);
    const baseFinding: Omit<ReportFinding, "copyForTechnician"> = {
      ...rule,
      checkKey,
      status,
      statusLabel: getStatusLabel(language, tone),
      tone,
      passed: tone === "ok",
    };

    return {
      ...baseFinding,
      copyForTechnician: buildTechnicianText(scanResult, baseFinding),
    };
  });

  return {
    language,
    domain: scanResult.domain,
    score: scanResult.score,
    riskLevel: scanResult.riskLevel,
    summary: reportSummaries[language][getSummaryKey(scanResult)],
    findings,
    riskFindings: findings.filter((finding) => !finding.passed),
    passedFindings: findings.filter((finding) => finding.passed),
  };
}
