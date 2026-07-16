import assert from "node:assert/strict";
import test from "node:test";
import {
  confidenceLabels,
  exposureLabels,
  priorityLabels,
  summarizeVerifiedFindings,
  verificationLabels,
} from "../../lib/findings/presentation";
import {
  buildReportPdf,
  makeReportPdfTextLines,
  type PdfExportInput,
} from "../../lib/report/pdfExport";
import type {
  FindingVerificationTransition,
  VerifiedFinding,
  VerifiedFindingsSnapshot,
} from "../../lib/findings/types";

function makeFinding(overrides: Partial<VerifiedFinding>): VerifiedFinding {
  return {
    schemaVersion: 1,
    id: "example.com:csp",
    checkKey: "csp",
    title: "Content Security Policy",
    explanation: "Test explanation",
    observedStatus: "Missing",
    tone: "bad",
    passed: false,
    confidence: "confirmed",
    exposure: "externally_observable",
    priority: "fix_this_week",
    priorityScore: 65,
    priorityReasons: ["Test reason"],
    businessImpact: "Test impact",
    responsibleOwner: "Web developer",
    remediation: {
      difficulty: "Medium",
      estimatedTime: "One hour",
      steps: ["Apply the change"],
      technicianText: "Apply the change",
    },
    decision: "open",
    remediationStatus: "proposed",
    verificationStatus: "not_verified",
    evidence: [],
    limitations: [],
    ...overrides,
  };
}

function makeSnapshot(findings: VerifiedFinding[]): VerifiedFindingsSnapshot {
  return {
    schemaVersion: 1,
    domain: "example.com",
    language: "en",
    generatedAt: "2026-07-15T10:00:00.000Z",
    findings,
  };
}

test("summarizes confidence, exposure, verification, and priority buckets", () => {
  const snapshot = makeSnapshot([
    makeFinding({ id: "confirmed", checkKey: "csp" }),
    makeFinding({
      id: "likely",
      checkKey: "dmarc",
      confidence: "likely",
      priority: "fix_this_week",
    }),
    makeFinding({
      id: "possible",
      checkKey: "ssl",
      confidence: "possible",
      exposure: "unknown",
      priority: "needs_more_evidence",
    }),
    makeFinding({
      id: "passed",
      checkKey: "hsts",
      passed: true,
      tone: "ok",
      priority: "monitor",
      verificationStatus: "fixed_and_verified",
    }),
  ]);

  assert.deepEqual(summarizeVerifiedFindings(snapshot), {
    total: 4,
    confirmedIssues: 1,
    needsValidation: 2,
    externallyObservable: 2,
    fixedAndVerified: 1,
    priorities: {
      fixToday: 0,
      fixThisWeek: 2,
      needsMoreEvidence: 1,
      scheduleLater: 0,
    },
  });
});

test("uses cautious customer-facing labels", () => {
  assert.equal(confidenceLabels.possible, "Possible");
  assert.equal(exposureLabels.unknown, "External exposure unknown");
  assert.equal(priorityLabels.needs_more_evidence, "Collect more evidence");
  assert.equal(verificationLabels.observed_pass, "Observed pass");
});

test("includes evidence status and limitations in the client PDF text", () => {
  const verifiedFinding = makeFinding({
    evidence: [
      {
        id: "csp:evidence",
        kind: "http_header",
        source: "https://example.com/",
        observedAt: "2026-07-15T10:00:00.000Z",
        summary: "The CSP header was not observed.",
        value: "Not observed",
        url: "https://example.com/",
      },
    ],
    limitations: ["Only the public homepage response was checked."],
  });
  const input: PdfExportInput = {
    scanDate: "2026-07-15T10:00:00.000Z",
    report: {
      language: "en" as const,
      domain: "example.com",
      score: 60,
      riskLevel: "Medium Risk",
      summary: "Test summary",
      findings: [
        {
          checkKey: "csp",
          title: "Content Security Policy",
          explanation: "Test explanation",
          businessImpact: "Test impact",
          responsibleOwner: "Web developer",
          fixDifficulty: "Medium",
          estimatedFixTime: "One hour",
          fixSteps: ["Apply the header"],
          technicianText: "Apply the header",
          status: "Missing",
          statusLabel: "Needs attention",
          tone: "bad",
          passed: false,
          copyForTechnician: "Apply the header",
        },
      ],
      riskFindings: [],
      passedFindings: [],
      verifiedFindings: makeSnapshot([verifiedFinding]),
    },
  };
  const lines = makeReportPdfTextLines(input);
  const text = lines.join(" ");

  assert.match(text, /Evidence confidence: Confirmed/);
  assert.match(text, /Verification status: Not verified/);
  assert.match(text, /The CSP header was not observed/);
  assert.match(text, /Only the public homepage response was checked/);
  assert.match(text, /not a CVSS rating/i);

  const pdfText = new TextDecoder().decode(buildReportPdf(input));
  assert.match(pdfText, /^%PDF-1\.4/);
  assert.match(pdfText, /CLIENT SECURITY REPORT/);
  assert.match(pdfText, /Page 1 of/);
  assert.match(pdfText, /Authorized non-invasive public checks only/);
  assert.doesNotMatch(pdfText, /legacy scan|legacy report/i);
});

test("includes evidence-based verification transitions in the client PDF", () => {
  const beforeTime = "2026-07-15T10:00:00.000Z";
  const afterTime = "2026-07-15T11:00:00.000Z";
  const makeEvidence = (
    checkKey: string,
    observedAt: string,
    value: string,
    kind: "http_header" | "dns_observation" = "http_header"
  ) => ({
    id: `${checkKey}:${observedAt}`,
    kind,
    source: kind === "http_header" ? "https://example.com/" : "example.com",
    observedAt,
    summary: `${checkKey} returned ${value}.`,
    value,
  });
  const transitions: FindingVerificationTransition[] = [
    {
      previousReportId: "previous-report",
      checkKey: "csp",
      previousObservedStatus: "Missing",
      currentObservedStatus: "OK",
      previousPassed: false,
      currentPassed: true,
      previousConfidence: "confirmed",
      currentConfidence: "confirmed",
      previousObservationTime: beforeTime,
      currentObservationTime: afterTime,
      beforeEvidence: [makeEvidence("csp", beforeTime, "Not observed")],
      afterEvidence: [makeEvidence("csp", afterTime, "default-src 'self'")],
      changeType: "fixed_and_verified",
      resultingVerificationStatus: "fixed_and_verified",
      verificationReason: "A later confirmed header response proves the change.",
    },
    {
      previousReportId: "previous-report",
      checkKey: "spf",
      previousObservedStatus: "Missing",
      currentObservedStatus: "OK",
      previousPassed: false,
      currentPassed: true,
      previousConfidence: "likely",
      currentConfidence: "likely",
      previousObservationTime: beforeTime,
      currentObservationTime: afterTime,
      beforeEvidence: [
        makeEvidence("spf", beforeTime, "Missing", "dns_observation"),
      ],
      afterEvidence: [
        makeEvidence("spf", afterTime, "OK", "dns_observation"),
      ],
      changeType: "observed_pass",
      resultingVerificationStatus: "observed_pass",
      verificationReason: "The result improved, but the raw DNS answer was not stored.",
    },
    {
      previousReportId: "previous-report",
      checkKey: "hsts",
      previousObservedStatus: "OK",
      currentObservedStatus: "Missing",
      previousPassed: true,
      currentPassed: false,
      previousConfidence: "confirmed",
      currentConfidence: "confirmed",
      previousObservationTime: beforeTime,
      currentObservationTime: afterTime,
      beforeEvidence: [makeEvidence("hsts", beforeTime, "max-age=31536000")],
      afterEvidence: [makeEvidence("hsts", afterTime, "Not observed")],
      changeType: "regressed",
      resultingVerificationStatus: "regressed",
      verificationReason: "A later confirmed header response no longer contains HSTS.",
    },
  ];
  const reportFindings = transitions.map((transition) => {
    const passed = transition.currentPassed;

    return {
      checkKey: transition.checkKey,
      title: transition.checkKey.toUpperCase(),
      explanation: "Test explanation",
      businessImpact: "Test impact",
      responsibleOwner: "Web developer",
      fixDifficulty: "Medium",
      estimatedFixTime: "One hour",
      fixSteps: ["Apply the required configuration."],
      technicianText: "Apply the required configuration.",
      status: transition.currentObservedStatus,
      statusLabel: passed ? "Passed" : "Needs attention",
      tone: passed ? ("ok" as const) : ("bad" as const),
      passed,
      copyForTechnician: "Apply the required configuration.",
    };
  });
  const verifiedFindings = transitions.map((transition) =>
    makeFinding({
      id: `example.com:${transition.checkKey}`,
      checkKey: transition.checkKey,
      title: transition.checkKey.toUpperCase(),
      observedStatus: transition.currentObservedStatus,
      passed: transition.currentPassed,
      tone: transition.currentPassed ? "ok" : "bad",
      confidence: transition.currentConfidence,
      priority: transition.currentPassed ? "monitor" : "fix_this_week",
      priorityScore: transition.currentPassed ? 0 : 65,
      verificationStatus: transition.resultingVerificationStatus,
      evidence: transition.afterEvidence,
    })
  );
  const input: PdfExportInput = {
    scanDate: afterTime,
    report: {
      language: "en",
      domain: "example.com",
      score: 70,
      riskLevel: "Medium Risk",
      summary: "Verification loop test summary.",
      findings: reportFindings,
      riskFindings: reportFindings.filter((finding) => !finding.passed),
      passedFindings: reportFindings.filter((finding) => finding.passed),
      verifiedFindings: makeSnapshot(verifiedFindings),
      verification: {
        schemaVersion: 1,
        previousReportId: "previous-report",
        domain: "example.com",
        reconciledAt: afterTime,
        transitions,
      },
    },
  };
  const text = makeReportPdfTextLines(input).join(" ");
  const pdfText = new TextDecoder().decode(buildReportPdf(input));

  assert.match(text, /Fixed and verified: csp/);
  assert.match(text, /Observed pass: spf/);
  assert.match(text, /Regressed: hsts/);
  assert.match(text, /Before evidence: csp returned Not observed/);
  assert.match(text, /After evidence: csp returned default-src/);
  assert.match(text, /raw DNS answer was not stored/);
  assert.match(pdfText, /VERIFICATION LOOP - Fixed and verified/);
  assert.match(pdfText, /VERIFICATION LOOP - Regressed/);
  assert.doesNotMatch(pdfText, /legacy scan|legacy report|schemaVersion/i);
});
