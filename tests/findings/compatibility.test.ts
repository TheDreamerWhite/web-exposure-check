import assert from "node:assert/strict";
import test from "node:test";
import type {
  BusinessSecurityReport,
  ReportFinding,
  ReportScanResult,
} from "../../lib/report/types";
import {
  adaptLegacyReportToVerifiedFindings,
  withVerifiedFindings,
} from "../../lib/findings/compatibility";

const observedAt = "2026-07-14T10:00:00.000Z";

function makeFinding(
  overrides: Partial<ReportFinding> & Pick<ReportFinding, "checkKey">
): ReportFinding {
  const { checkKey, ...rest } = overrides;

  return {
    checkKey,
    title: "Test finding",
    explanation: "Test explanation",
    businessImpact: "Test business impact",
    responsibleOwner: "Web developer",
    fixDifficulty: "Low",
    estimatedFixTime: "30 minutes",
    fixSteps: ["Apply the documented configuration change."],
    technicianText: "Update the configuration.",
    status: "Missing",
    statusLabel: "Needs attention",
    tone: "bad",
    passed: false,
    copyForTechnician: "Technician brief",
    ...rest,
  };
}

function makeReport(findings: ReportFinding[]): BusinessSecurityReport {
  return {
    language: "en",
    domain: "example.com",
    score: 60,
    riskLevel: "Medium Risk",
    summary: "Test report",
    findings,
    riskFindings: findings.filter((finding) => !finding.passed),
    passedFindings: findings.filter((finding) => finding.passed),
  };
}

function makeScanResult(
  checks: Record<string, string>,
  includeHomepageEvidence = false
): ReportScanResult {
  return {
    domain: "example.com",
    score: 60,
    riskLevel: "Medium Risk",
    checks,
    ...(includeHomepageEvidence
      ? {
          websiteReadResult: {
            domain: "example.com",
            normalizedUrl: "https://example.com/",
            fetchedAt: observedAt,
            homepage: {
              requestedUrl: "https://example.com/",
              finalUrl: "https://example.com/",
              status: 200,
              ok: true,
              contentType: "text/html",
              headers: {},
              title: "Example",
              metaDescription: null,
              canonicalUrl: null,
              htmlLang: "en",
              h1: ["Example"],
              internalLinks: [],
              externalLinksSample: [],
            },
            robots: {
              url: "https://example.com/robots.txt",
              status: 404,
              found: false,
              sitemapUrls: [],
              notes: [],
            },
            sitemap: {
              attemptedUrls: [],
              found: false,
              urls: [],
              notes: [],
            },
            evidence: {
              pagesRead: ["https://example.com/"],
              pagesDiscovered: [],
              notes: [],
            },
            errors: [],
          },
        }
      : {}),
  };
}

test("uses stored homepage headers to confirm a missing CSP observation", () => {
  const finding = makeFinding({ checkKey: "csp" });
  const snapshot = adaptLegacyReportToVerifiedFindings(
    makeScanResult({ csp: "Missing" }, true),
    makeReport([finding]),
    { observedAt }
  );
  const [converted] = snapshot.findings;

  assert.equal(converted.confidence, "confirmed");
  assert.equal(converted.exposure, "externally_observable");
  assert.equal(converted.priority, "fix_this_week");
  assert.equal(converted.evidence[0].kind, "http_header");
  assert.equal(converted.evidence[0].value, "Not observed");
});

test("confirms a present header only when a successful raw homepage response is stored", () => {
  const finding = makeFinding({
    checkKey: "hsts",
    status: "OK",
    statusLabel: "Passed",
    tone: "ok",
    passed: true,
  });
  const scanResult = makeScanResult({ hsts: "OK" }, true);
  scanResult.websiteReadResult!.homepage.headers["strict-transport-security"] =
    "max-age=31536000";

  const [converted] = adaptLegacyReportToVerifiedFindings(
    scanResult,
    makeReport([finding]),
    { observedAt }
  ).findings;

  assert.equal(converted.confidence, "confirmed");
  assert.equal(converted.verificationStatus, "observed_pass");
  assert.equal(converted.evidence[0].value, "max-age=31536000");
});

test("keeps a header outcome below confirmed when raw homepage headers are unavailable", () => {
  const finding = makeFinding({ checkKey: "csp" });
  const [converted] = adaptLegacyReportToVerifiedFindings(
    makeScanResult({ csp: "Missing" }),
    makeReport([finding]),
    { observedAt }
  ).findings;

  assert.equal(converted.confidence, "likely");
  assert.match(converted.limitations.join(" "), /raw header evidence/i);
});

test("keeps legacy DNS absence below confirmed confidence without raw answers", () => {
  const finding = makeFinding({ checkKey: "dmarc" });
  const snapshot = adaptLegacyReportToVerifiedFindings(
    makeScanResult({ dmarc: "Missing" }),
    makeReport([finding]),
    { observedAt }
  );
  const [converted] = snapshot.findings;

  assert.equal(converted.confidence, "likely");
  assert.equal(converted.priority, "fix_this_week");
  assert.match(converted.limitations.join(" "), /raw DNS answer/i);
});

test("keeps a passing DNS result likely without the raw DNS answer", () => {
  const finding = makeFinding({
    checkKey: "spf",
    status: "OK",
    statusLabel: "Passed",
    tone: "ok",
    passed: true,
  });
  const [converted] = adaptLegacyReportToVerifiedFindings(
    makeScanResult({ spf: "OK" }),
    makeReport([finding]),
    { observedAt }
  ).findings;

  assert.equal(converted.confidence, "likely");
  assert.equal(converted.verificationStatus, "observed_pass");
  assert.match(converted.limitations.join(" "), /raw DNS answer/i);
});

test("keeps a passing TLS observation likely without certificate evidence", () => {
  const finding = makeFinding({
    checkKey: "ssl",
    status: "OK",
    statusLabel: "Passed",
    tone: "ok",
    passed: true,
  });
  const [converted] = adaptLegacyReportToVerifiedFindings(
    makeScanResult({ ssl: "OK" }),
    makeReport([finding]),
    { observedAt }
  ).findings;

  assert.equal(converted.confidence, "likely");
  assert.equal(converted.verificationStatus, "observed_pass");
  assert.match(converted.limitations.join(" "), /certificate chain/i);
});

test("keeps a passing HTTPS redirect likely without the complete redirect chain", () => {
  const finding = makeFinding({
    checkKey: "httpsRedirect",
    status: "OK",
    statusLabel: "Passed",
    tone: "ok",
    passed: true,
  });
  const [converted] = adaptLegacyReportToVerifiedFindings(
    makeScanResult({ httpsRedirect: "OK" }),
    makeReport([finding]),
    { observedAt }
  ).findings;

  assert.equal(converted.confidence, "likely");
  assert.equal(converted.verificationStatus, "observed_pass");
  assert.match(converted.limitations.join(" "), /complete redirect chain/i);
});

test("does not treat an ambiguous warning as a confirmed defect", () => {
  const finding = makeFinding({
    checkKey: "ssl",
    status: "Warning",
    tone: "warning",
  });
  const snapshot = adaptLegacyReportToVerifiedFindings(
    makeScanResult({ ssl: "Warning" }),
    makeReport([finding]),
    { observedAt }
  );
  const [converted] = snapshot.findings;

  assert.equal(converted.confidence, "possible");
  assert.equal(converted.exposure, "unknown");
  assert.equal(converted.priority, "needs_more_evidence");
  assert.equal(converted.verificationStatus, "not_verified");
});

test("marks an initial pass as observed rather than fixed and verified", () => {
  const finding = makeFinding({
    checkKey: "hsts",
    status: "OK",
    statusLabel: "Passed",
    tone: "ok",
    passed: true,
  });
  const snapshot = adaptLegacyReportToVerifiedFindings(
    makeScanResult({ hsts: "OK" }, true),
    makeReport([finding]),
    { observedAt }
  );
  const [converted] = snapshot.findings;

  assert.equal(converted.priority, "monitor");
  assert.equal(converted.decision, "not_required");
  assert.equal(converted.remediationStatus, "not_required");
  assert.equal(converted.verificationStatus, "observed_pass");
});

test("ranks risk findings deterministically and preserves remediation copy", () => {
  const csp = makeFinding({
    checkKey: "csp",
    copyForTechnician: "Apply the CSP header.",
  });
  const frame = makeFinding({ checkKey: "xFrameOptions" });
  const passed = makeFinding({
    checkKey: "hsts",
    status: "OK",
    tone: "ok",
    passed: true,
  });
  const snapshot = adaptLegacyReportToVerifiedFindings(
    makeScanResult(
      { csp: "Missing", xFrameOptions: "Missing", hsts: "OK" },
      true
    ),
    makeReport([frame, passed, csp]),
    { observedAt }
  );

  assert.deepEqual(
    snapshot.findings.map((finding) => finding.checkKey),
    ["csp", "xFrameOptions", "hsts"]
  );
  assert.equal(
    snapshot.findings[0].remediation.technicianText,
    "Apply the CSP header."
  );
});

test("adds a snapshot once and preserves an existing stored snapshot", () => {
  const finding = makeFinding({ checkKey: "csp" });
  const scanResult = makeScanResult({ csp: "Missing" }, true);
  const report = makeReport([finding]);
  const enriched = withVerifiedFindings(scanResult, report, { observedAt });
  const hydratedAgain = withVerifiedFindings(scanResult, enriched, {
    observedAt: "2026-07-15T10:00:00.000Z",
  });

  assert.equal(enriched.verifiedFindings.domain, report.domain);
  assert.equal(enriched.verifiedFindings.language, report.language);
  assert.equal(enriched.verifiedFindings.generatedAt, observedAt);
  assert.strictEqual(hydratedAgain.verifiedFindings, enriched.verifiedFindings);
});
