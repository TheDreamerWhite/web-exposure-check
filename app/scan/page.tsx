"use client";

import Link from "next/link";
import { AiWebsiteUnderstandingSection } from "@/components/report/AiWebsiteUnderstandingSection";
import { WebsiteReadingEvidence } from "@/components/report/WebsiteReadingEvidence";
import {
  getCheckInfo,
  getCheckTone,
  orderedCheckEntries,
} from "@/lib/scan/checks";
import { generateBusinessReport } from "@/lib/report/generateReport";
import { downloadReportPdf } from "@/lib/report/pdfExport";
import {
  reportLanguageLabels,
  reportUiCopy,
} from "@/lib/report/reportRules";
import {
  reportLanguages,
  type ReportFinding,
  type ReportLanguage,
} from "@/lib/report/types";
import type { AiWebsiteUnderstanding } from "@/lib/ai/types";
import type { WebsiteReadResult } from "@/lib/reader/types";
import { FormEvent, useEffect, useMemo, useState } from "react";

type ScanResult = {
  domain: string;
  score: number;
  riskLevel: string;
  checks: Record<string, string>;
  websiteReadResult?: WebsiteReadResult;
  aiWebsiteUnderstanding?: AiWebsiteUnderstanding | null;
};

type HistoryItem = ScanResult & {
  scannedAt: string;
};

const HISTORY_KEY = "web_exposure_scan_history_v2";
const LEGACY_HISTORY_KEY = "web_exposure_scan_history_v1";

function normalizeDomain(value: string) {
  const rawValue = value.trim();

  if (!rawValue) return "";

  try {
    const urlValue =
      rawValue.startsWith("http://") || rawValue.startsWith("https://")
        ? rawValue
        : `https://${rawValue}`;
    const url = new URL(urlValue);

    return url.hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return rawValue
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .split("/")[0]
      .split("?")[0]
      .trim()
      .toLowerCase();
  }
}

function getRiskColor(riskLevel: string, score: number) {
  const value = riskLevel.toLowerCase();

  if (value.includes("low") || score >= 80) return "#0f766e";
  if (value.includes("medium") || score >= 55) return "#b45309";
  return "#be123c";
}

function getRiskClasses(riskLevel: string, score: number) {
  const value = riskLevel.toLowerCase();

  if (value.includes("low") || score >= 80) {
    return "border-teal-200 bg-teal-50 text-teal-900";
  }

  if (value.includes("medium") || score >= 55) {
    return "border-amber-200 bg-amber-50 text-amber-950";
  }

  return "border-rose-200 bg-rose-50 text-rose-950";
}

function getStatusClasses(value: string) {
  const tone = getCheckTone(value);

  if (tone === "ok") {
    return "border-teal-200 bg-teal-50 text-teal-800";
  }

  if (tone === "bad") {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }

  return "border-amber-200 bg-amber-50 text-amber-800";
}

function getRiskExplanation(scanResult: ScanResult) {
  const risk = scanResult.riskLevel.toLowerCase();
  const problems = countProblems(scanResult.checks);

  if (risk.includes("low") || scanResult.score >= 80) {
    return problems === 0
      ? "The visible public signals checked here look healthy. Keep monitoring changes to DNS, hosting, and security headers."
      : "The domain has a generally healthy public posture, with a small number of items worth tightening.";
  }

  if (risk.includes("medium") || scanResult.score >= 55) {
    return "The domain has several missing or weak public protections. These are usually configuration issues that can be prioritized and fixed without a full rebuild.";
  }

  return "The domain is missing several important protections in this basic review. Prioritize the failed checks before relying on the site for sensitive traffic or trusted email.";
}

function countProblems(checks: Record<string, string>) {
  return Object.values(checks).filter((value) => getCheckTone(value) !== "ok").length;
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "Recent";
  }
}

function buildTextReport(scanResult: ScanResult, language: ReportLanguage) {
  const report = generateBusinessReport(scanResult, language);
  const uiCopy = reportUiCopy[language];
  const findingText = (report.riskFindings.length > 0
    ? report.riskFindings
    : report.findings
  )
    .map((finding) =>
      [
        `- ${finding.title}: ${finding.statusLabel} (${finding.status})`,
        `  ${uiCopy.businessImpact}: ${finding.businessImpact}`,
        `  ${uiCopy.responsibleOwner}: ${finding.responsibleOwner}`,
        `  ${uiCopy.fixDifficulty}: ${finding.fixDifficulty}`,
        `  ${uiCopy.estimatedFixTime}: ${finding.estimatedFixTime}`,
        `  ${uiCopy.fixSteps}: ${finding.fixSteps.join(" ")}`,
      ].join("\n")
    )
    .join("\n\n");

  const technicalChecks = orderedCheckEntries(scanResult.checks)
    .map(([key, value]) => `- ${getCheckInfo(key).label}: ${value}`)
    .join("\n");

  return `Web Exposure Check Report

Domain: ${scanResult.domain}
Score: ${scanResult.score}/100
Risk level: ${scanResult.riskLevel}
Language: ${language}

Business summary:
${report.summary}

Business-friendly findings:
${findingText}

Original technical results:
${technicalChecks}
`;
}

function parseHistory(value: string | null): HistoryItem[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as Array<Partial<HistoryItem>>;

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => item.domain && typeof item.score === "number" && item.riskLevel)
      .map((item) => ({
        domain: String(item.domain),
        score: Number(item.score),
        riskLevel: String(item.riskLevel),
        websiteReadResult:
          item.websiteReadResult && typeof item.websiteReadResult === "object"
            ? (item.websiteReadResult as WebsiteReadResult)
            : undefined,
        aiWebsiteUnderstanding:
          item.aiWebsiteUnderstanding &&
          typeof item.aiWebsiteUnderstanding === "object"
            ? (item.aiWebsiteUnderstanding as AiWebsiteUnderstanding)
            : undefined,
        scannedAt: item.scannedAt ? String(item.scannedAt) : new Date().toISOString(),
        checks:
          item.checks && typeof item.checks === "object"
            ? (item.checks as Record<string, string>)
            : {},
      }));
  } catch {
    return [];
  }
}

function copyTextWithFallback(text: string) {
  const textarea = document.createElement("textarea");

  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.left = "0";
  textarea.style.opacity = "0";
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  const copied = document.execCommand("copy");
  textarea.remove();

  if (!copied) {
    throw new Error("Legacy copy failed.");
  }
}

export default function ScanPage() {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [findingCopyStatus, setFindingCopyStatus] = useState("");
  const [exportStatus, setExportStatus] = useState("");
  const [scanTakingLonger, setScanTakingLonger] = useState(false);
  const [reportLanguage, setReportLanguage] = useState<ReportLanguage>("en");
  const [customerName, setCustomerName] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [savedReportId, setSavedReportId] = useState("");
  const [saveReportStatus, setSaveReportStatus] = useState("");
  const [showAnonymousConversion, setShowAnonymousConversion] = useState(false);

  useEffect(() => {
    const currentHistory = parseHistory(localStorage.getItem(HISTORY_KEY));
    const savedHistory =
      currentHistory.length > 0
        ? currentHistory
        : parseHistory(localStorage.getItem(LEGACY_HISTORY_KEY));
    const params = new URLSearchParams(window.location.search);
    const incomingDomain = normalizeDomain(params.get("domain") || "");
    const timer = window.setTimeout(() => {
      setHistory(savedHistory);

      if (incomingDomain) {
        setDomain(incomingDomain);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) return;

    const timer = window.setTimeout(() => {
      setScanTakingLonger(true);
    }, 4500);

    return () => window.clearTimeout(timer);
  }, [loading]);

  const problemEntries = useMemo(
    () =>
      result
        ? orderedCheckEntries(result.checks).filter(
            ([, value]) => getCheckTone(value) !== "ok"
          )
        : [],
    [result]
  );
  const businessReport = useMemo(
    () => (result ? generateBusinessReport(result, reportLanguage) : null),
    [result, reportLanguage]
  );
  const uiCopy = reportUiCopy[reportLanguage];

  const healthyCount = result
    ? Object.values(result.checks).filter((value) => getCheckTone(value) === "ok").length
    : 0;

  function saveHistory(scanResult: ScanResult) {
    const newItem: HistoryItem = {
      ...scanResult,
      scannedAt: new Date().toISOString(),
    };

    const updatedHistory = [
      newItem,
      ...history.filter(
        (item) => item.domain.toLowerCase() !== newItem.domain.toLowerCase()
      ),
    ].slice(0, 8);

    setHistory(updatedHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  }

  async function runScan(scanDomain?: string) {
    const cleanDomain = normalizeDomain(scanDomain || domain);

    setError("");
    setCopyStatus("");
    setFindingCopyStatus("");
    setExportStatus("");
    setSavedReportId("");
    setSaveReportStatus("");
    setShowAnonymousConversion(false);
    setResult(null);
    setScanTakingLonger(false);

    if (!cleanDomain) {
      setError("Enter a domain to scan.");
      return;
    }

    try {
      setLoading(true);
      setDomain(cleanDomain);

      const response = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain: cleanDomain,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as
        | ScanResult
        | { error?: string };

      if (!response.ok) {
        throw new Error("error" in data && data.error ? data.error : "Scan failed.");
      }

      const scanResult = data as ScanResult;

      setResult(scanResult);
      setDomain(scanResult.domain);
      saveHistory(scanResult);
      saveAuthenticatedReport(scanResult);
    } catch (scanError) {
      setError(
        scanError instanceof Error
          ? scanError.message
          : "Scan failed. Check the domain and try again in a few seconds."
      );
    } finally {
      setLoading(false);
      setScanTakingLonger(false);
    }
  }

  async function saveAuthenticatedReport(scanResult: ScanResult) {
    setSaveReportStatus("Saving report history...");

    try {
      const response = await fetch("/api/scan-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scanResult,
          locale: reportLanguage,
          customerName,
          internalNote,
        }),
      });

      if (response.status === 401) {
        setSaveReportStatus("");
        setShowAnonymousConversion(true);
        return;
      }

      const data = (await response.json().catch(() => ({}))) as {
        report?: { id?: string };
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Report history save failed.");
      }

      setSavedReportId(data.report?.id || "");
      setSaveReportStatus("Saved to dashboard history.");
      setShowAnonymousConversion(false);
    } catch (saveError) {
      setSaveReportStatus(
        saveError instanceof Error
          ? saveError.message
          : "Report history could not be saved."
      );
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runScan();
  }

  function clearHistory() {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(LEGACY_HISTORY_KEY);
  }

  function loadHistoryItem(item: HistoryItem) {
    setError("");
    setCopyStatus("");
    setFindingCopyStatus("");
    setExportStatus("");
    setSavedReportId("");
    setSaveReportStatus("");
    setShowAnonymousConversion(false);
    setDomain(item.domain);

    if (Object.keys(item.checks).length > 0) {
      setResult(item);
      return;
    }

    runScan(item.domain);
  }

  async function copyReport() {
    if (!result) return;

    const reportText = buildTextReport(result, reportLanguage);

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API unavailable.");
      }

      await navigator.clipboard.writeText(reportText);
      setCopyStatus("Report copied.");
    } catch {
      try {
        copyTextWithFallback(reportText);
        setCopyStatus("Report copied.");
      } catch {
        setCopyStatus("Copy failed. Your browser may block clipboard access.");
      }
    }
  }

  async function copyTechnicianText(finding: ReportFinding) {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API unavailable.");
      }

      await navigator.clipboard.writeText(finding.copyForTechnician);
      setFindingCopyStatus(finding.checkKey);
    } catch {
      try {
        copyTextWithFallback(finding.copyForTechnician);
        setFindingCopyStatus(finding.checkKey);
      } catch {
        setFindingCopyStatus("failed");
      }
    }
  }

  function exportJsonReport() {
    if (!result) return;
    const businessReportExport = generateBusinessReport(result, reportLanguage);

    const report = {
      exportedAt: new Date().toISOString(),
      language: reportLanguage,
      domain: result.domain,
      score: result.score,
      riskLevel: result.riskLevel,
      riskExplanation: getRiskExplanation(result),
      businessReport: businessReportExport,
      websiteReadResult: result.websiteReadResult,
      aiWebsiteUnderstanding: result.aiWebsiteUnderstanding,
      checks: result.checks,
      suggestedFixes: problemEntries.map(([key]) => getCheckInfo(key).fix),
    };

    try {
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(report, null, 2)], {
          type: "application/json",
        })
      );
      const link = document.createElement("a");

      link.href = url;
      link.download = `${result.domain}-web-exposure-report.json`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();

      setExportStatus("JSON export started.");
      window.setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch {
      setExportStatus("JSON export could not start. Try copying the report instead.");
    }
  }

  function downloadPdfReport() {
    if (!businessReport) return;

    try {
      downloadReportPdf({
        report: businessReport,
        scanDate: new Date().toISOString(),
        customerName,
      });
      setExportStatus("PDF download started.");
    } catch {
      setExportStatus("PDF download could not start.");
    }
  }

  return (
    <main className="bg-background">
      <section className="border-b border-slate-200 bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
                Scan dashboard
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
                Check a website exposure profile
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                Enter a domain to review public TLS, email authentication, and
                browser security signals. Results are stored locally in this browser.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-950">Responsible use</p>
              <p className="mt-2 leading-6">
                Scan domains you own, administer, or have permission to review.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8 grid gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto]"
          >
            <label className="sr-only" htmlFor="domain">
              Domain
            </label>
            <input
              id="domain"
              type="text"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              placeholder="example.com"
              autoComplete="url"
              className="min-h-12 w-full rounded-md border border-slate-200 bg-white px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            />
            <button
              type="submit"
              disabled={loading}
              className="min-h-12 rounded-md bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? scanTakingLonger
                  ? "Still checking..."
                  : "Checking..."
                : "Run scan"}
            </button>
          </form>

          <div className="mt-3 grid gap-2 text-sm leading-6 text-slate-600 md:grid-cols-2">
            <p>
              Scans may take a few seconds while DNS, TLS, redirects, and headers
              respond.
            </p>
            <p>
              This is a public exposure review, not a full penetration test.
            </p>
          </div>

          <div className="mt-5 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="customerName"
                className="text-sm font-semibold text-slate-950"
              >
                Customer name optional
              </label>
              <input
                id="customerName"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Restaurante Casa Yong"
                className="mt-2 min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              />
            </div>
            <div>
              <label
                htmlFor="internalNote"
                className="text-sm font-semibold text-slate-950"
              >
                Internal note optional
              </label>
              <input
                id="internalNote"
                value={internalNote}
                onChange={(event) => setInternalNote(event.target.value)}
                placeholder="Client asked for monthly report"
                className="mt-2 min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800"
            >
              {error}
            </p>
          )}
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            {!result && (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                <h2 className="text-2xl font-bold text-slate-950">
                  Your scan report will appear here
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  Run a scan to see score cards, risk details, check-by-check
                  status, suggested fixes, and export options.
                </p>
              </div>
            )}

            {result && (
              <>
                <div className="grid gap-4 md:grid-cols-4">
                  <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
                    <p className="text-sm font-medium text-slate-500">Security score</p>
                    <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-center">
                      <div
                        className="grid size-36 shrink-0 place-items-center rounded-full"
                        style={{
                          background: `conic-gradient(${getRiskColor(
                            result.riskLevel,
                            result.score
                          )} ${Math.max(0, Math.min(result.score, 100))}%, #e2e8f0 0)`,
                        }}
                        aria-label={`Security score ${result.score} out of 100`}
                      >
                        <div className="grid size-28 place-items-center rounded-full bg-white">
                          <div className="text-center">
                            <p className="text-4xl font-black text-slate-950">
                              {result.score}
                            </p>
                            <p className="text-xs font-semibold text-slate-500">
                              out of 100
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-950">
                          {result.domain}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {getRiskExplanation(result)}
                        </p>
                      </div>
                    </div>
                  </section>

                  <section
                    className={`rounded-lg border p-5 shadow-sm ${getRiskClasses(
                      result.riskLevel,
                      result.score
                    )}`}
                  >
                    <p className="text-sm font-medium opacity-80">Risk level</p>
                    <p className="mt-4 text-3xl font-black">{result.riskLevel}</p>
                    <p className="mt-3 text-sm leading-6 opacity-85">
                      Based on the public checks completed by the scanner.
                    </p>
                  </section>

                  <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Checks</p>
                    <p className="mt-4 text-3xl font-black text-slate-950">
                      {healthyCount}/{Object.keys(result.checks).length}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Passing checks in this report.
                    </p>
                  </section>
                </div>

                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Report actions
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-slate-950">
                        Copy or export the current report
                      </h2>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <span>{uiCopy.languageLabel}</span>
                        <select
                          value={reportLanguage}
                          onChange={(event) =>
                            setReportLanguage(event.target.value as ReportLanguage)
                          }
                          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                        >
                          {reportLanguages.map((language) => (
                            <option key={language} value={language}>
                              {reportLanguageLabels[language]}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        onClick={copyReport}
                        className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-teal-700 hover:text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
                      >
                        Copy report
                      </button>
                      <button
                        type="button"
                        onClick={exportJsonReport}
                        className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
                      >
                        Export JSON
                      </button>
                      <button
                        type="button"
                        onClick={downloadPdfReport}
                        className="rounded-md bg-teal-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
                      >
                        Download PDF
                      </button>
                    </div>
                  </div>
                  {copyStatus && (
                    <p className="mt-3 text-sm font-medium text-teal-800" aria-live="polite">
                      {copyStatus}
                    </p>
                  )}
                  {exportStatus && (
                    <p className="mt-2 text-sm font-medium text-teal-800" aria-live="polite">
                      {exportStatus}
                    </p>
                  )}
                  {saveReportStatus && (
                    <p
                      className="mt-2 text-sm font-medium text-slate-600"
                      aria-live="polite"
                    >
                      {saveReportStatus}{" "}
                      {savedReportId && (
                        <a
                          href={`/report/${savedReportId}`}
                          className="font-semibold text-teal-800 hover:text-teal-950"
                        >
                          View saved report
                        </a>
                      )}
                    </p>
                  )}
                </section>

                {showAnonymousConversion && (
                  <section className="rounded-lg border border-teal-200 bg-teal-50 p-5 shadow-sm">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-800">
                          Save and prove improvement
                        </p>
                        <h2 className="mt-2 text-xl font-bold text-slate-950">
                          Create a free account to save this report.
                        </h2>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
                          Create a free account to save this report, re-scan
                          later, compare improvements, and download
                          client-ready PDFs. You can keep using the scan result
                          below without signing up.
                        </p>
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                        <Link
                          href="/signup"
                          className="inline-flex items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
                        >
                          Create free account
                        </Link>
                        <Link
                          href="/login"
                          className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-teal-700 hover:text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
                        >
                          Log in
                        </Link>
                        <button
                          type="button"
                          onClick={() => setShowAnonymousConversion(false)}
                          className="inline-flex items-center justify-center rounded-md border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-900 transition hover:border-teal-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
                        >
                          Continue without saving
                        </button>
                      </div>
                    </div>
                  </section>
                )}

                <WebsiteReadingEvidence
                  websiteReadResult={result.websiteReadResult}
                />

                <AiWebsiteUnderstandingSection
                  aiWebsiteUnderstanding={result.aiWebsiteUnderstanding}
                />

                {businessReport && (
                  <section className="space-y-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-800">
                          {uiCopy.reportTitle}
                        </p>
                        <h2 className="mt-2 text-2xl font-bold text-slate-950">
                          {businessReport.domain}
                        </h2>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                          {uiCopy.reportIntro}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-slate-500">
                        {businessReport.riskFindings.length}{" "}
                        {uiCopy.needsAttention.toLowerCase()}
                      </p>
                    </div>

                    <div className="rounded-lg border border-teal-200 bg-teal-50 p-5 text-sm leading-6 text-teal-950">
                      {businessReport.summary}
                    </div>

                    {businessReport.riskFindings.length === 0 ? (
                      <div className="rounded-lg border border-teal-200 bg-white p-5 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-950">
                          {uiCopy.noRisksTitle}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {uiCopy.noRisksText}
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {businessReport.riskFindings.map((finding) => (
                          <article
                            key={finding.checkKey}
                            className="rounded-lg border border-rose-200 bg-white p-5 shadow-sm"
                          >
                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                              <div>
                                <p className="text-sm font-semibold text-rose-700">
                                  {finding.statusLabel}
                                </p>
                                <h3 className="mt-1 text-xl font-bold text-slate-950">
                                  {finding.title}
                                </h3>
                                <p className="mt-3 text-sm leading-6 text-slate-600">
                                  {finding.explanation}
                                </p>
                              </div>
                              <span
                                className={`w-fit rounded-md border px-3 py-1 text-xs font-bold ${getStatusClasses(
                                  finding.status
                                )}`}
                              >
                                {finding.status}
                              </span>
                            </div>

                            <div className="mt-5 grid gap-3 md:grid-cols-3">
                              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                                  {uiCopy.businessImpact}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-700">
                                  {finding.businessImpact}
                                </p>
                              </div>
                              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                                  {uiCopy.responsibleOwner}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-700">
                                  {finding.responsibleOwner}
                                </p>
                              </div>
                              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                                  {uiCopy.fixDifficulty}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-700">
                                  {finding.fixDifficulty} |{" "}
                                  {finding.estimatedFixTime}
                                </p>
                              </div>
                            </div>

                            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                              <p className="text-sm font-bold text-slate-950">
                                {uiCopy.fixSteps}
                              </p>
                              <ol className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                                {finding.fixSteps.map((step) => (
                                  <li key={step} className="flex gap-2">
                                    <span className="font-semibold text-teal-800">
                                      -
                                    </span>
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>

                            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <button
                                type="button"
                                onClick={() => copyTechnicianText(finding)}
                                className="w-fit rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
                              >
                                {uiCopy.copyForTechnician}
                              </button>
                              {findingCopyStatus === finding.checkKey && (
                                <p
                                  className="text-sm font-medium text-teal-800"
                                  aria-live="polite"
                                >
                                  {uiCopy.copied}
                                </p>
                              )}
                              {findingCopyStatus === "failed" && (
                                <p
                                  className="text-sm font-medium text-rose-700"
                                  aria-live="polite"
                                >
                                  Copy failed. Your browser may block clipboard
                                  access.
                                </p>
                              )}
                            </div>
                          </article>
                        ))}
                      </div>
                    )}

                    {businessReport.passedFindings.length > 0 && (
                      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-950">
                          {uiCopy.passedChecks}
                        </h3>
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          {businessReport.passedFindings.map((finding) => (
                            <article
                              key={finding.checkKey}
                              className="rounded-lg border border-teal-100 bg-teal-50/60 p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-slate-950">
                                    {finding.title}
                                  </p>
                                  <p className="mt-2 text-sm leading-6 text-slate-600">
                                    {finding.explanation}
                                  </p>
                                </div>
                                <span className="rounded-md border border-teal-200 bg-white px-2 py-1 text-xs font-bold text-teal-800">
                                  {finding.statusLabel}
                                </span>
                              </div>
                            </article>
                          ))}
                        </div>
                      </section>
                    )}
                  </section>
                )}

                <section>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-800">
                    {uiCopy.technicalResults}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950">
                    Scanner output
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                    {uiCopy.technicalIntro}
                  </p>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {orderedCheckEntries(result.checks).map(([key, value]) => {
                      const info = getCheckInfo(key);
                      const tone = getCheckTone(value);

                      return (
                        <article
                          key={key}
                          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                        >
                          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                            <div>
                              <h3 className="text-lg font-bold text-slate-950">
                                {info.label}
                              </h3>
                              <p className="mt-2 text-sm leading-6 text-slate-600">
                                {info.description}
                              </p>
                            </div>
                            <span
                              className={`w-fit rounded-md border px-3 py-1 text-xs font-bold ${getStatusClasses(
                                value
                              )}`}
                            >
                              {value}
                            </span>
                          </div>

                          {tone !== "ok" && (
                            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                              <span className="font-semibold text-slate-950">
                                Suggested fix:
                              </span>{" "}
                              {info.fix}
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </section>
              </>
            )}
          </div>

          <aside className="space-y-4">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Local history
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    Recent scans
                  </h2>
                </div>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={clearHistory}
                    className="text-sm font-semibold text-rose-700 transition hover:text-rose-900"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="mt-4 space-y-3">
                {history.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    Scans you run here will be saved on this device.
                  </p>
                ) : (
                  history.map((item) => (
                    <button
                      key={`${item.domain}-${item.scannedAt}`}
                      type="button"
                      onClick={() => loadHistoryItem(item)}
                      disabled={loading}
                      className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-teal-700 hover:bg-teal-50/40 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="block font-semibold text-slate-950">
                        {item.domain}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {formatDate(item.scannedAt)}
                      </span>
                      <span className="mt-3 flex items-center justify-between gap-3">
                        <span className="text-sm font-black text-slate-950">
                          {item.score}/100
                        </span>
                        <span
                          className={`rounded-md border px-2 py-1 text-xs font-bold ${getRiskClasses(
                            item.riskLevel,
                            item.score
                          )}`}
                        >
                          {item.riskLevel}
                        </span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">Report scope</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                The scan checks public configuration signals. It does not log in,
                crawl private pages, exploit vulnerabilities, or replace a full
                security assessment.
              </p>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
