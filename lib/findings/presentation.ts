import type {
  FindingConfidence,
  FindingExposure,
  FindingPriority,
  VerificationStatus,
  VerifiedFinding,
  VerifiedFindingsSnapshot,
} from "./types";

export const confidenceLabels: Record<FindingConfidence, string> = {
  confirmed: "Confirmed",
  likely: "Likely",
  possible: "Possible",
};

export const exposureLabels: Record<FindingExposure, string> = {
  externally_observable: "Externally observable",
  not_externally_observable: "Not externally observable",
  unknown: "External exposure unknown",
};

export const priorityLabels: Record<FindingPriority, string> = {
  fix_today: "Fix today",
  fix_this_week: "Fix this week",
  schedule_later: "Schedule later",
  needs_more_evidence: "Collect more evidence",
  monitor: "Monitor",
};

export const verificationLabels: Record<VerificationStatus, string> = {
  not_verified: "Not verified",
  observed_pass: "Observed pass",
  fixed_and_verified: "Fixed and verified",
  regressed: "Regressed",
};

export function getVerifiedFinding(
  snapshot: VerifiedFindingsSnapshot,
  checkKey: string
) {
  return snapshot.findings.find((finding) => finding.checkKey === checkKey);
}

export function summarizeVerifiedFindings(snapshot: VerifiedFindingsSnapshot) {
  const openFindings = snapshot.findings.filter((finding) => !finding.passed);

  return {
    total: snapshot.findings.length,
    confirmedIssues: openFindings.filter(
      (finding) => finding.confidence === "confirmed"
    ).length,
    needsValidation: openFindings.filter(
      (finding) => finding.confidence !== "confirmed"
    ).length,
    externallyObservable: openFindings.filter(
      (finding) => finding.exposure === "externally_observable"
    ).length,
    fixedAndVerified: snapshot.findings.filter(
      (finding) => finding.verificationStatus === "fixed_and_verified"
    ).length,
    priorities: {
      fixToday: countPriority(openFindings, "fix_today"),
      fixThisWeek: countPriority(openFindings, "fix_this_week"),
      needsMoreEvidence: countPriority(openFindings, "needs_more_evidence"),
      scheduleLater: countPriority(openFindings, "schedule_later"),
    },
  };
}

function countPriority(findings: VerifiedFinding[], priority: FindingPriority) {
  return findings.filter((finding) => finding.priority === priority).length;
}
