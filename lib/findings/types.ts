export const verifiedFindingSchemaVersion = 1 as const;

export type FindingConfidence = "confirmed" | "likely" | "possible";

export type FindingExposure =
  | "externally_observable"
  | "not_externally_observable"
  | "unknown";

export type FindingPriority =
  | "fix_today"
  | "fix_this_week"
  | "schedule_later"
  | "needs_more_evidence"
  | "monitor";

export type FindingDecision =
  | "open"
  | "accepted_risk"
  | "deferred"
  | "false_positive"
  | "not_required";

export type RemediationStatus =
  | "proposed"
  | "in_progress"
  | "applied"
  | "not_required";

export type VerificationStatus =
  | "not_verified"
  | "observed_pass"
  | "fixed_and_verified"
  | "regressed";

export type FindingEvidenceKind =
  | "scan_result"
  | "dns_observation"
  | "tls_observation"
  | "http_observation"
  | "http_header"
  | "website_reader";

export type FindingEvidence = {
  id: string;
  kind: FindingEvidenceKind;
  source: string;
  observedAt: string;
  summary: string;
  value: string;
  url?: string;
};

export type FindingRemediation = {
  difficulty: string;
  estimatedTime: string;
  steps: string[];
  technicianText: string;
};

export type VerifiedFinding = {
  schemaVersion: typeof verifiedFindingSchemaVersion;
  id: string;
  checkKey: string;
  title: string;
  explanation: string;
  observedStatus: string;
  tone: "ok" | "warning" | "bad";
  passed: boolean;
  confidence: FindingConfidence;
  exposure: FindingExposure;
  priority: FindingPriority;
  priorityScore: number;
  priorityReasons: string[];
  businessImpact: string;
  responsibleOwner: string;
  remediation: FindingRemediation;
  decision: FindingDecision;
  remediationStatus: RemediationStatus;
  verificationStatus: VerificationStatus;
  evidence: FindingEvidence[];
  limitations: string[];
};

export type VerifiedFindingsSnapshot = {
  schemaVersion: typeof verifiedFindingSchemaVersion;
  domain: string;
  language: string;
  generatedAt: string;
  findings: VerifiedFinding[];
};
