import type {
  BusinessSecurityReport,
  BusinessSecurityReportWithVerifiedFindings,
  ReportFinding,
  ReportScanResult,
} from "../report/types";
import {
  verifiedFindingSchemaVersion,
  type FindingConfidence,
  type FindingEvidence,
  type FindingEvidenceKind,
  type FindingExposure,
  type FindingPriority,
  type VerifiedFinding,
  type VerifiedFindingsSnapshot,
} from "./types";

type CompatibilityOptions = {
  observedAt?: string;
};

const headerNames: Record<string, string> = {
  hsts: "strict-transport-security",
  csp: "content-security-policy",
  xFrameOptions: "x-frame-options",
};

const priorityWeights: Record<string, number> = {
  ssl: 85,
  httpsRedirect: 80,
  dmarc: 80,
  csp: 65,
  hsts: 55,
  spf: 50,
  xFrameOptions: 45,
};

const priorityRationales: Record<string, string> = {
  ssl: "TLS failures can prevent users from establishing a trusted connection.",
  httpsRedirect:
    "Visitors may reach an unencrypted entry point before the secure site loads.",
  dmarc:
    "Missing DMARC policy weakens the domain owner's control over email impersonation.",
  csp: "A missing CSP removes a browser-side control that can reduce script injection impact.",
  hsts: "Missing HSTS leaves repeat visits without a browser-enforced HTTPS policy.",
  spf: "Missing SPF weakens sender authorization for the domain's email.",
  xFrameOptions:
    "Missing frame restrictions can leave eligible pages exposed to framing attacks.",
};

function getObservedAt(scanResult: ReportScanResult, override?: string) {
  return override || scanResult.websiteReadResult?.fetchedAt || new Date().toISOString();
}

function getEvidenceKind(checkKey: string): FindingEvidenceKind {
  if (checkKey === "spf" || checkKey === "dmarc") return "dns_observation";
  if (checkKey === "ssl") return "tls_observation";
  if (checkKey === "httpsRedirect") return "http_observation";
  if (checkKey in headerNames) return "http_header";
  return "scan_result";
}

function getSource(scanResult: ReportScanResult, checkKey: string) {
  const homepage = scanResult.websiteReadResult?.homepage;

  if (checkKey in headerNames) {
    return homepage?.finalUrl || homepage?.requestedUrl || `https://${scanResult.domain}`;
  }

  if (checkKey === "httpsRedirect") return `http://${scanResult.domain}`;
  if (checkKey === "spf") return scanResult.domain;
  if (checkKey === "dmarc") return `_dmarc.${scanResult.domain}`;
  if (checkKey === "ssl") return `${scanResult.domain}:443`;
  return scanResult.domain;
}

function buildEvidence(
  scanResult: ReportScanResult,
  finding: ReportFinding,
  observedAt: string
): FindingEvidence {
  const homepage = scanResult.websiteReadResult?.homepage;
  const headerName = headerNames[finding.checkKey];
  const headerValue = headerName ? homepage?.headers[headerName] : undefined;
  const source = getSource(scanResult, finding.checkKey);

  if (headerName && homepage?.ok) {
    return {
      id: `${finding.checkKey}:${observedAt}`,
      kind: "http_header",
      source,
      observedAt,
      summary: headerValue
        ? `${headerName} was observed in the homepage response.`
        : `${headerName} was not observed in the homepage response.`,
      value: headerValue || "Not observed",
      url: source,
    };
  }

  return {
    id: `${finding.checkKey}:${observedAt}`,
    kind: getEvidenceKind(finding.checkKey),
    source,
    observedAt,
    summary: `The public scan observation returned ${finding.status}.`,
    value: finding.status,
    ...(source.startsWith("http") ? { url: source } : {}),
  };
}

function inferConfidence(
  scanResult: ReportScanResult,
  finding: ReportFinding
): FindingConfidence {
  if (finding.tone === "warning") return "possible";

  if (finding.checkKey in headerNames && scanResult.websiteReadResult?.homepage.ok) {
    return "confirmed";
  }

  // DNS answers, redirect hops, and certificate details are not stored yet.
  // Their outcome can support a likely observation, but not confirmed evidence.
  return "likely";
}

function inferExposure(finding: ReportFinding): FindingExposure {
  return finding.tone === "warning" ? "unknown" : "externally_observable";
}

function calculatePriorityScore(
  finding: ReportFinding,
  confidence: FindingConfidence,
  exposure: FindingExposure
) {
  if (finding.passed) return 0;

  const confidenceFactor = {
    confirmed: 1,
    likely: 0.75,
    possible: 0.35,
  }[confidence];
  const exposureFactor = exposure === "externally_observable" ? 1 : 0.7;
  const baseWeight = priorityWeights[finding.checkKey] || 40;

  return Math.round(baseWeight * confidenceFactor * exposureFactor);
}

function getPriority(
  finding: ReportFinding,
  confidence: FindingConfidence,
  score: number
): FindingPriority {
  if (finding.passed) return "monitor";
  if (finding.tone === "warning" || confidence === "possible") {
    return "needs_more_evidence";
  }
  if (score >= 80) return "fix_today";
  if (score >= 60) return "fix_this_week";
  return "schedule_later";
}

function buildPriorityReasons(
  finding: ReportFinding,
  confidence: FindingConfidence,
  exposure: FindingExposure,
  priority: FindingPriority
) {
  if (finding.passed) {
    return ["The current public observation passed this check; continue monitoring."];
  }

  const reasons = [
    priorityRationales[finding.checkKey] ||
      "This public signal contributes to the site's external security posture.",
    `Evidence confidence is ${confidence}.`,
    exposure === "externally_observable"
      ? "The signal was observable from the public scan path."
      : "External reachability could not be confirmed from the stored evidence.",
  ];

  if (priority === "needs_more_evidence") {
    reasons.push("Collect a fresh deterministic observation before proposing a fix.");
  }

  return reasons;
}

function buildLimitations(scanResult: ReportScanResult, finding: ReportFinding) {
  const limitations: string[] = [];

  if (finding.tone === "warning") {
    limitations.push(
      "This result is inconclusive and does not contain enough evidence to confirm a pass or a defect."
    );
  }

  if (finding.checkKey === "spf" || finding.checkKey === "dmarc") {
    limitations.push(
      "The stored scan record contains the DNS outcome but not the raw DNS answer used to produce it."
    );
  }

  if (
    finding.checkKey in headerNames &&
    !scanResult.websiteReadResult?.homepage.ok
  ) {
    limitations.push(
      "The stored report does not contain a successful homepage response with raw header evidence."
    );
  }

  if (finding.checkKey === "httpsRedirect") {
    limitations.push(
      "The stored scan record contains the redirect outcome but not the complete redirect chain."
    );
  }

  if (finding.checkKey === "ssl") {
    limitations.push(
      "The stored scan record does not include the certificate chain, hostname match, issuer, or expiry evidence."
    );
  }

  return limitations;
}

export function rankVerifiedFindings(findings: VerifiedFinding[]) {
  return [...findings].sort(
    (left, right) =>
      right.priorityScore - left.priorityScore ||
      left.checkKey.localeCompare(right.checkKey)
  );
}

export function adaptLegacyReportToVerifiedFindings(
  scanResult: ReportScanResult,
  report: BusinessSecurityReport,
  options: CompatibilityOptions = {}
): VerifiedFindingsSnapshot {
  const observedAt = getObservedAt(scanResult, options.observedAt);
  const findings = report.findings.map((finding): VerifiedFinding => {
    const confidence = inferConfidence(scanResult, finding);
    const exposure = inferExposure(finding);
    const priorityScore = calculatePriorityScore(finding, confidence, exposure);
    const priority = getPriority(finding, confidence, priorityScore);

    return {
      schemaVersion: verifiedFindingSchemaVersion,
      id: `${scanResult.domain}:${finding.checkKey}`,
      checkKey: finding.checkKey,
      title: finding.title,
      explanation: finding.explanation,
      observedStatus: finding.status,
      tone: finding.tone,
      passed: finding.passed,
      confidence,
      exposure,
      priority,
      priorityScore,
      priorityReasons: buildPriorityReasons(
        finding,
        confidence,
        exposure,
        priority
      ),
      businessImpact: finding.businessImpact,
      responsibleOwner: finding.responsibleOwner,
      remediation: {
        difficulty: finding.fixDifficulty,
        estimatedTime: finding.estimatedFixTime,
        steps: finding.fixSteps,
        technicianText: finding.copyForTechnician,
      },
      decision: finding.passed ? "not_required" : "open",
      remediationStatus: finding.passed ? "not_required" : "proposed",
      verificationStatus: finding.passed ? "observed_pass" : "not_verified",
      evidence: [buildEvidence(scanResult, finding, observedAt)],
      limitations: buildLimitations(scanResult, finding),
    };
  });

  return {
    schemaVersion: verifiedFindingSchemaVersion,
    domain: scanResult.domain,
    language: report.language,
    generatedAt: observedAt,
    findings: rankVerifiedFindings(findings),
  };
}

export function withVerifiedFindings(
  scanResult: ReportScanResult,
  report: BusinessSecurityReport,
  options: CompatibilityOptions = {}
): BusinessSecurityReportWithVerifiedFindings {
  if (report.verifiedFindings) {
    return report as BusinessSecurityReportWithVerifiedFindings;
  }

  return {
    ...report,
    verifiedFindings: adaptLegacyReportToVerifiedFindings(
      scanResult,
      report,
      options
    ),
  };
}
