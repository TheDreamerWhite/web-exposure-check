import assert from "node:assert/strict";
import test from "node:test";
import { reconcileVerifiedFindings } from "../../lib/findings/verification";
import { compareScanReports } from "../../lib/report/compareReports";
import type {
  FindingConfidence,
  FindingEvidenceKind,
  VerifiedFinding,
  VerifiedFindingsSnapshot,
} from "../../lib/findings/types";

const previousTime = "2026-07-15T10:00:00.000Z";
const currentTime = "2026-07-15T11:00:00.000Z";

function makeFinding({
  checkKey,
  passed,
  confidence,
  observedAt,
  status,
  kind,
  source,
  verificationStatus,
}: {
  checkKey: string;
  passed: boolean;
  confidence: FindingConfidence;
  observedAt: string;
  status?: string;
  kind?: FindingEvidenceKind;
  source?: string;
  verificationStatus?: VerifiedFinding["verificationStatus"];
}): VerifiedFinding {
  const resolvedStatus = status || (passed ? "OK" : "Missing");

  return {
    schemaVersion: 1,
    id: `example.com:${checkKey}`,
    checkKey,
    title: checkKey,
    explanation: "Test explanation",
    observedStatus: resolvedStatus,
    tone: passed ? "ok" : confidence === "possible" ? "warning" : "bad",
    passed,
    confidence,
    exposure: confidence === "possible" ? "unknown" : "externally_observable",
    priority: passed ? "monitor" : "fix_this_week",
    priorityScore: passed ? 0 : 65,
    priorityReasons: ["Test reason"],
    businessImpact: "Test impact",
    responsibleOwner: "Web developer",
    remediation: {
      difficulty: "Medium",
      estimatedTime: "One hour",
      steps: ["Apply the change"],
      technicianText: "Apply the change",
    },
    decision: passed ? "not_required" : "open",
    remediationStatus: passed ? "not_required" : "proposed",
    verificationStatus:
      verificationStatus || (passed ? "observed_pass" : "not_verified"),
    evidence: [
      {
        id: `${checkKey}:${observedAt}`,
        kind: kind || "http_header",
        source: source || "https://example.com/",
        observedAt,
        summary: `${checkKey} returned ${resolvedStatus}.`,
        value: resolvedStatus,
        url: source || "https://example.com/",
      },
    ],
    limitations: confidence === "confirmed" ? [] : ["Raw evidence is limited."],
  };
}

function makeSnapshot(
  generatedAt: string,
  findings: VerifiedFinding[],
  domain = "example.com"
): VerifiedFindingsSnapshot {
  return {
    schemaVersion: 1,
    domain,
    language: "en",
    generatedAt,
    findings,
  };
}

function reconcile(previous: VerifiedFinding[], current: VerifiedFinding[]) {
  return reconcileVerifiedFindings(
    makeSnapshot(previousTime, previous),
    makeSnapshot(currentTime, current),
    { previousReportId: "previous-report" }
  );
}

test("verifies a confirmed missing header followed by a confirmed present header", () => {
  const result = reconcile(
    [makeFinding({ checkKey: "hsts", passed: false, confidence: "confirmed", observedAt: previousTime })],
    [makeFinding({ checkKey: "hsts", passed: true, confidence: "confirmed", observedAt: currentTime })]
  );
  const [transition] = result.verification.transitions;

  assert.equal(transition.changeType, "fixed_and_verified");
  assert.equal(transition.resultingVerificationStatus, "fixed_and_verified");
  assert.equal(result.snapshot.findings[0].verificationStatus, "fixed_and_verified");
});

test("keeps a DNS improvement as observed pass without a raw DNS answer", () => {
  const result = reconcile(
    [makeFinding({ checkKey: "spf", passed: false, confidence: "likely", observedAt: previousTime, kind: "dns_observation", source: "example.com" })],
    [makeFinding({ checkKey: "spf", passed: true, confidence: "likely", observedAt: currentTime, kind: "dns_observation", source: "example.com" })]
  );

  assert.equal(result.verification.transitions[0].changeType, "observed_pass");
  assert.equal(result.snapshot.findings[0].verificationStatus, "observed_pass");
});

test("keeps an HTTPS redirect improvement as observed pass without a redirect chain", () => {
  const result = reconcile(
    [makeFinding({ checkKey: "httpsRedirect", passed: false, confidence: "likely", observedAt: previousTime, kind: "http_observation", source: "http://example.com" })],
    [makeFinding({ checkKey: "httpsRedirect", passed: true, confidence: "likely", observedAt: currentTime, kind: "http_observation", source: "http://example.com" })]
  );

  assert.equal(result.verification.transitions[0].changeType, "observed_pass");
});

test("keeps a TLS improvement as observed pass without certificate details", () => {
  const result = reconcile(
    [makeFinding({ checkKey: "ssl", passed: false, confidence: "likely", observedAt: previousTime, kind: "tls_observation", source: "example.com:443" })],
    [makeFinding({ checkKey: "ssl", passed: true, confidence: "likely", observedAt: currentTime, kind: "tls_observation", source: "example.com:443" })]
  );

  assert.equal(result.verification.transitions[0].changeType, "observed_pass");
});

test("keeps a first observed pass as observed rather than verified", () => {
  const result = reconcile([], [
    makeFinding({ checkKey: "csp", passed: true, confidence: "confirmed", observedAt: currentTime }),
  ]);
  const [transition] = result.verification.transitions;

  assert.equal(transition.changeType, "new_finding");
  assert.equal(transition.resultingVerificationStatus, "observed_pass");
});

test("marks a later confirmed failure as regressed after an observed pass", () => {
  const result = reconcile(
    [makeFinding({ checkKey: "csp", passed: true, confidence: "confirmed", observedAt: previousTime, verificationStatus: "observed_pass" })],
    [makeFinding({ checkKey: "csp", passed: false, confidence: "confirmed", observedAt: currentTime })]
  );

  assert.equal(result.verification.transitions[0].changeType, "regressed");
  assert.equal(result.snapshot.findings[0].verificationStatus, "regressed");
});

test("does not mark a possible current failure as regressed", () => {
  const result = reconcile(
    [makeFinding({ checkKey: "csp", passed: true, confidence: "confirmed", observedAt: previousTime, verificationStatus: "observed_pass" })],
    [makeFinding({ checkKey: "csp", passed: false, confidence: "possible", observedAt: currentTime, status: "Warning" })]
  );

  assert.equal(result.verification.transitions[0].changeType, "still_needs_work");
  assert.equal(result.snapshot.findings[0].verificationStatus, "not_verified");
});

test("does not verify a fix when the current evidence is not later", () => {
  const previous = makeSnapshot(currentTime, [
    makeFinding({ checkKey: "csp", passed: false, confidence: "confirmed", observedAt: currentTime }),
  ]);
  const current = makeSnapshot(previousTime, [
    makeFinding({ checkKey: "csp", passed: true, confidence: "confirmed", observedAt: previousTime }),
  ]);
  const result = reconcileVerifiedFindings(previous, current, {
    previousReportId: "previous-report",
  });

  assert.equal(result.verification.transitions[0].changeType, "observed_pass");
  assert.equal(result.snapshot.findings[0].verificationStatus, "observed_pass");
});

test("ignores a manual fixed workflow property when the current finding still fails", () => {
  const current = Object.assign(
    makeFinding({ checkKey: "hsts", passed: false, confidence: "confirmed", observedAt: currentTime }),
    { workflowStatus: "fixed" }
  );
  const result = reconcile(
    [makeFinding({ checkKey: "hsts", passed: false, confidence: "confirmed", observedAt: previousTime })],
    [current]
  );

  assert.notEqual(result.snapshot.findings[0].verificationStatus, "fixed_and_verified");
  assert.equal(result.snapshot.findings[0].verificationStatus, "not_verified");
});

test("does not associate findings across domains or different check keys", () => {
  const previous = makeSnapshot(previousTime, [
    makeFinding({ checkKey: "csp", passed: false, confidence: "confirmed", observedAt: previousTime }),
  ], "other.example");
  const current = makeSnapshot(currentTime, [
    makeFinding({ checkKey: "hsts", passed: true, confidence: "confirmed", observedAt: currentTime }),
  ]);
  const result = reconcileVerifiedFindings(previous, current, {
    previousReportId: "previous-report",
  });

  assert.equal(result.verification.transitions[0].changeType, "new_finding");
  assert.equal(result.verification.transitions[0].previousObservedStatus, null);
});

test("clones before and after evidence without mutating either input snapshot", () => {
  const previous = makeSnapshot(previousTime, [
    makeFinding({ checkKey: "csp", passed: false, confidence: "confirmed", observedAt: previousTime }),
  ]);
  const current = makeSnapshot(currentTime, [
    makeFinding({ checkKey: "csp", passed: true, confidence: "confirmed", observedAt: currentTime }),
  ]);
  const previousCopy = JSON.parse(JSON.stringify(previous));
  const currentCopy = JSON.parse(JSON.stringify(current));
  const result = reconcileVerifiedFindings(previous, current, {
    previousReportId: "previous-report",
  });
  const [transition] = result.verification.transitions;

  assert.deepEqual(previous, previousCopy);
  assert.deepEqual(current, currentCopy);
  assert.notStrictEqual(transition.beforeEvidence, previous.findings[0].evidence);
  assert.notStrictEqual(transition.afterEvidence, current.findings[0].evidence);
  transition.beforeEvidence[0].value = "Changed in transition only";
  assert.equal(previous.findings[0].evidence[0].value, "Missing");
});

test("uses stored verification transitions when comparing the same finding", () => {
  const result = reconcile(
    [makeFinding({ checkKey: "csp", passed: false, confidence: "confirmed", observedAt: previousTime })],
    [makeFinding({ checkKey: "csp", passed: true, confidence: "confirmed", observedAt: currentTime })]
  );
  const comparison = compareScanReports(
    {
      domain: "example.com",
      score: 50,
      riskLevel: "High Risk",
      checks: { csp: "Missing" },
    },
    {
      domain: "example.com",
      score: 70,
      riskLevel: "Medium Risk",
      checks: { csp: "OK" },
    },
    result.verification.transitions
  );

  assert.equal(comparison.checks[0].status, "Fixed and verified");
  assert.equal(comparison.fixedAndVerified.length, 1);
  assert.equal(comparison.observedPass.length, 0);
});

test("keeps an older comparison without transitions backward compatible and cautious", () => {
  const comparison = compareScanReports(
    {
      domain: "example.com",
      score: 50,
      riskLevel: "High Risk",
      checks: { spf: "Missing" },
    },
    {
      domain: "example.com",
      score: 60,
      riskLevel: "Medium Risk",
      checks: { spf: "OK" },
    }
  );

  assert.equal(comparison.checks[0].status, "Observed pass");
  assert.equal(comparison.fixedAndVerified.length, 0);
});
