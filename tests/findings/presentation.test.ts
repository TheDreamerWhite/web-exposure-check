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
