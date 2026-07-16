"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AiWebsiteUnderstandingSection } from "@/components/report/AiWebsiteUnderstandingSection";
import {
  VerifiedFindingDetails,
  VerifiedFindingsOverview,
} from "@/components/report/VerifiedFindings";
import { WebsiteReadingEvidence } from "@/components/report/WebsiteReadingEvidence";
import { VerificationLoop } from "@/components/report/VerificationLoop";
import {
  getCheckInfo,
  getCheckTone,
  orderedCheckEntries,
} from "@/lib/scan/checks";
import { downloadReportPdf } from "@/lib/report/pdfExport";
import { reportUiCopy } from "@/lib/report/reportRules";
import type { ReportComparison } from "@/lib/report/compareReports";
import type { AgencyProfile } from "@/lib/types/database";
import type {
  FindingStatuses,
  FindingWorkflowStatus,
  ScanReportRecord,
} from "@/lib/scans/types";

type ReportDetailClientProps = {
  report: ScanReportRecord;
  previousReport: ScanReportRecord | null;
  comparison: ReportComparison | null;
  agencyProfile: AgencyProfile | null;
};

const statusOptions: Array<{
  value: FindingWorkflowStatus;
  label: string;
}> = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "fixed", label: "Fixed manually" },
  { value: "ignored", label: "Ignored" },
];

function formatReportDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/Madrid",
    }).format(new Date(value));
  } catch {
    return "Not yet";
  }
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

function getStatusClasses(status: FindingWorkflowStatus) {
  if (status === "fixed") return "border-teal-200 bg-teal-50 text-teal-800";
  if (status === "ignored") return "border-slate-200 bg-slate-50 text-slate-600";
  if (status === "in_progress") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-rose-200 bg-rose-50 text-rose-800";
}

async function copyTextWithFallback(text: string) {
  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error("Clipboard API unavailable.");
    }

    await navigator.clipboard.writeText(text);
  } catch {
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
    document.execCommand("copy");
    textarea.remove();
  }
}

export function ReportDetailClient({
  report,
  previousReport,
  comparison,
  agencyProfile,
}: ReportDetailClientProps) {
  const router = useRouter();
  const [findingStatuses, setFindingStatuses] = useState<FindingStatuses>(
    report.finding_statuses || {}
  );
  const [savingStatus, setSavingStatus] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [exportStatus, setExportStatus] = useState("");
  const [rescanning, setRescanning] = useState(false);
  const uiCopy = reportUiCopy[report.generated_report.language];
  const riskFindings = report.generated_report.riskFindings;
  const passedFindings = report.generated_report.passedFindings;
  const verifiedSnapshot = report.generated_report.verifiedFindings;
  const verification = report.generated_report.verification;
  const verifiedFindingsByCheckKey = new Map(
    verifiedSnapshot?.findings.map((finding) => [finding.checkKey, finding]) || []
  );

  async function updateFindingStatus(
    checkKey: string,
    status: FindingWorkflowStatus
  ) {
    const nextStatuses = {
      ...findingStatuses,
      [checkKey]: status,
    };

    setFindingStatuses(nextStatuses);
    setSavingStatus("Saving finding status...");

    try {
      const response = await fetch(`/api/scan-reports/${report.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          findingStatuses: nextStatuses,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Could not save finding status.");
      }

      setSavingStatus("Finding status saved.");
    } catch (error) {
      setSavingStatus(
        error instanceof Error
          ? error.message
          : "Could not save finding status."
      );
    }
  }

  async function copyTechnicianText(checkKey: string, text: string) {
    try {
      await copyTextWithFallback(text);
      setCopyStatus(checkKey);
    } catch {
      setCopyStatus("failed");
    }
  }

  function downloadPdf() {
    try {
      downloadReportPdf({
        report: report.generated_report,
        scanDate: report.created_at,
        customerName: report.customer_name || undefined,
        agencyProfile,
      });
      setExportStatus("PDF download started.");
    } catch {
      setExportStatus("PDF download could not start.");
    }
  }

  async function runRescan() {
    setRescanning(true);
    setSavingStatus("Running re-scan. This may take a few seconds.");

    try {
      const response = await fetch(`/api/scan-reports/${report.id}/rescan`, {
        method: "POST",
      });
      const data = (await response.json().catch(() => ({}))) as {
        report?: { id?: string };
        previousReportId?: string;
        error?: string;
      };

      if (!response.ok || !data.report?.id) {
        throw new Error(data.error || "Re-scan failed.");
      }

      router.push(`/report/${data.report.id}?previous=${report.id}`);
      router.refresh();
    } catch (error) {
      setSavingStatus(
        error instanceof Error ? error.message : "Re-scan failed."
      );
    } finally {
      setRescanning(false);
    }
  }

  return (
    <main className="bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
                Saved client report
              </p>
              <h1 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
                {report.customer_name || report.domain}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                A business-friendly website exposure report that can be shared
                with a site technician. Technical scan output stays available
                below for context.
              </p>
              <p className="mt-2 text-sm font-medium text-slate-500">
                {report.domain} | {formatReportDate(report.created_at)}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <button
                type="button"
                onClick={runRescan}
                disabled={rescanning}
                className="inline-flex items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
              >
                {rescanning ? "Re-scanning..." : "Re-scan and compare"}
              </button>
              <button
                type="button"
                onClick={downloadPdf}
                className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-teal-700 hover:text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
              >
                Download PDF
              </button>
              <Link
                href="/dashboard/history"
                className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-teal-700 hover:text-teal-800"
              >
                Back to history
              </Link>
            </div>
          </div>
          {(savingStatus || exportStatus) && (
            <p className="mt-4 text-sm font-medium text-slate-700" aria-live="polite">
              {savingStatus || exportStatus}
            </p>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Score</p>
            <p className="mt-4 text-3xl font-black text-slate-950">
              {report.score}/100
            </p>
          </article>
          <article
            className={`rounded-lg border p-5 shadow-sm ${getRiskClasses(
              report.risk_level,
              report.score
            )}`}
          >
            <p className="text-sm font-medium opacity-80">Risk level</p>
            <p className="mt-4 text-2xl font-black">{report.risk_level}</p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Needs attention</p>
            <p className="mt-4 text-3xl font-black text-slate-950">
              {riskFindings.length}
            </p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Passed checks</p>
            <p className="mt-4 text-3xl font-black text-slate-950">
              {passedFindings.length}
            </p>
          </article>
        </section>

        {comparison && previousReport && (
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-800">
                  Scan comparison
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  What changed since {formatReportDate(previousReport.created_at)}
                </h2>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <span className="font-semibold text-slate-950">Score change: </span>
                <span
                  className={
                    comparison.scoreDelta >= 0 ? "text-teal-800" : "text-rose-700"
                  }
                >
                  {comparison.scoreDelta >= 0 ? "+" : ""}
                  {comparison.scoreDelta}
                </span>
              </div>
            </div>

            {verification ? (
              <VerificationLoop verification={verification} />
            ) : (
              <>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
                    <p className="text-sm font-semibold text-teal-900">Fixed and verified</p>
                    <p className="mt-2 text-2xl font-black text-teal-950">
                      {comparison.fixedAndVerified.length}
                    </p>
                  </div>
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm font-semibold text-blue-900">Observed pass</p>
                    <p className="mt-2 text-2xl font-black text-blue-950">
                      {comparison.observedPass.length}
                    </p>
                  </div>
                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
                    <p className="text-sm font-semibold text-rose-900">Regressed</p>
                    <p className="mt-2 text-2xl font-black text-rose-950">
                      {comparison.regressed.length}
                    </p>
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-semibold text-amber-900">Still needs work</p>
                    <p className="mt-2 text-2xl font-black text-amber-950">
                      {comparison.stillNeedsWork.length}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-700">New finding</p>
                    <p className="mt-2 text-2xl font-black text-slate-950">
                      {comparison.newFindings.length}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  This older comparison has no stored verification transition. Improvements are shown as observed passes, not verified fixes.
                </p>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {comparison.checks.map((check) => (
                    <article
                      key={check.checkKey}
                      className="min-w-0 rounded-lg border border-slate-200 bg-white p-4"
                    >
                      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                        <h3 className="font-semibold text-slate-950">
                          {getCheckInfo(check.checkKey).label}
                        </h3>
                        <span className="w-fit rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-700">
                          {check.status}
                        </span>
                      </div>
                      <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                        Previous: {check.previousStatus} | Current:{" "}
                        {check.currentStatus}
                      </p>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        <section className="rounded-lg border border-teal-200 bg-teal-50 p-5 text-sm leading-6 text-teal-950">
          {report.generated_report.summary}
        </section>

        {verifiedSnapshot && (
          <VerifiedFindingsOverview snapshot={verifiedSnapshot} />
        )}

        <section className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-800">
              {uiCopy.reportTitle}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              Prioritized findings
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Review the highest-value actions first. Findings that still need
              evidence are clearly separated from confirmed observations.
            </p>
          </div>

          {riskFindings.length === 0 ? (
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
              {riskFindings.map((finding) => {
                const workflowStatus =
                  findingStatuses[finding.checkKey] || "open";
                const verifiedFinding = verifiedFindingsByCheckKey.get(
                  finding.checkKey
                );

                return (
                  <article
                    key={finding.checkKey}
                    className="rounded-lg border border-rose-200 bg-white p-5 shadow-sm"
                  >
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
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
                      <div>
                        <label className="text-sm font-semibold text-slate-950">
                          Workflow status
                        </label>
                        <select
                          value={workflowStatus}
                          onChange={(event) =>
                            updateFindingStatus(
                              finding.checkKey,
                              event.target.value as FindingWorkflowStatus
                            )
                          }
                          className={`mt-2 min-h-11 w-full rounded-md border px-3 text-sm font-semibold outline-none transition focus:ring-2 focus:ring-teal-100 ${getStatusClasses(
                            workflowStatus
                          )}`}
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {verifiedFinding && (
                      <VerifiedFindingDetails finding={verifiedFinding} />
                    )}

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
                          {finding.fixDifficulty} | {finding.estimatedFixTime}
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
                            <span className="font-semibold text-teal-800">-</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={() =>
                          copyTechnicianText(
                            finding.checkKey,
                            finding.copyForTechnician
                          )
                        }
                        className="w-fit rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
                      >
                        {uiCopy.copyForTechnician}
                      </button>
                      {copyStatus === finding.checkKey && (
                        <p
                          className="text-sm font-medium text-teal-800"
                          aria-live="polite"
                        >
                          {uiCopy.copied}
                        </p>
                      )}
                      {copyStatus === "failed" && (
                        <p
                          className="text-sm font-medium text-rose-700"
                          aria-live="polite"
                        >
                          Copy failed. Your browser may block clipboard access.
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {passedFindings.length > 0 && (
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              {uiCopy.passedChecks}
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {passedFindings.map((finding) => (
                <article
                  key={finding.checkKey}
                  className="rounded-lg border border-teal-100 bg-teal-50/60 p-4"
                >
                  <p className="font-semibold text-slate-950">{finding.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {finding.explanation}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        <WebsiteReadingEvidence
          websiteReadResult={report.scan_result.websiteReadResult}
        />

        <AiWebsiteUnderstandingSection
          aiWebsiteUnderstanding={report.scan_result.aiWebsiteUnderstanding}
        />

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-800">
            {uiCopy.technicalResults}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">
            Original scan result
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            {uiCopy.technicalIntro}
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {orderedCheckEntries(report.scan_result.checks).map(([key, value]) => {
              const tone = getCheckTone(value);

              return (
                <article
                  key={key}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-950">
                        {getCheckInfo(key).label}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {getCheckInfo(key).description}
                      </p>
                    </div>
                    <span
                      className={
                        tone === "ok"
                          ? "rounded-md border border-teal-200 bg-white px-2 py-1 text-xs font-bold text-teal-800"
                          : "rounded-md border border-amber-200 bg-white px-2 py-1 text-xs font-bold text-amber-800"
                      }
                    >
                      {value}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
