"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  VerifiedFindingDetails,
  VerifiedFindingsOverview,
} from "@/components/report/VerifiedFindings";
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
  type ReportScanResult,
} from "@/lib/report/types";

const demoScanResult: ReportScanResult = {
  domain: "restaurante-demo.com",
  score: 45,
  riskLevel: "Medium Risk",
  checks: {
    ssl: "OK",
    httpsRedirect: "Missing",
    spf: "Missing",
    dmarc: "Missing",
    hsts: "Missing",
    csp: "Missing",
    xFrameOptions: "OK",
  },
  websiteReadResult: {
    domain: "restaurante-demo.com",
    normalizedUrl: "https://restaurante-demo.com/",
    fetchedAt: "2026-06-25T09:30:00.000Z",
    homepage: {
      requestedUrl: "https://restaurante-demo.com/",
      finalUrl: "https://restaurante-demo.com/",
      status: 200,
      ok: true,
      contentType: "text/html",
      headers: {
        "x-frame-options": "SAMEORIGIN",
      },
      title: "Restaurante Demo",
      metaDescription: "Public sample website for the report demo.",
      canonicalUrl: "https://restaurante-demo.com/",
      htmlLang: "es",
      h1: ["Restaurante Demo"],
      internalLinks: [],
      externalLinksSample: [],
    },
    robots: {
      url: "https://restaurante-demo.com/robots.txt",
      status: 200,
      found: true,
      sitemapUrls: [],
      notes: [],
    },
    sitemap: {
      attemptedUrls: ["https://restaurante-demo.com/sitemap.xml"],
      found: false,
      urls: [],
      notes: ["No sitemap was included in this static sample."],
    },
    evidence: {
      pagesRead: ["https://restaurante-demo.com/"],
      pagesDiscovered: [],
      notes: ["Static public sample evidence."],
    },
    errors: [],
  },
};

const businessImpactHighlights = [
  "Customers may see a less trusted version of the website.",
  "Email fraud risk is harder to control without SPF and DMARC.",
  "The technician has a clear fix list instead of vague security labels.",
];

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

function getTechnicianPreview(finding: ReportFinding) {
  return finding.copyForTechnician.split("\n").slice(0, 5).join("\n");
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

export function DemoReportClient() {
  const [language, setLanguage] = useState<ReportLanguage>("en");
  const [copyStatus, setCopyStatus] = useState("");
  const [exportStatus, setExportStatus] = useState("");
  const report = useMemo(
    () => generateBusinessReport(demoScanResult, language),
    [language]
  );
  const uiCopy = reportUiCopy[language];
  const verifiedFindingsByCheckKey = new Map(
    report.verifiedFindings.findings.map((finding) => [
      finding.checkKey,
      finding,
    ])
  );

  async function copyTechnicianText(finding: ReportFinding) {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API unavailable.");
      }

      await navigator.clipboard.writeText(finding.copyForTechnician);
      setCopyStatus(finding.checkKey);
    } catch {
      try {
        copyTextWithFallback(finding.copyForTechnician);
        setCopyStatus(finding.checkKey);
      } catch {
        setCopyStatus("failed");
      }
    }
  }

  function downloadDemoPdf() {
    try {
      downloadReportPdf({
        report,
        scanDate: "2026-06-25T09:30:00.000Z",
        customerName: "Restaurante Demo",
        agencyProfile: {
          agency_name: "Demo Web Agency",
          agency_email: "support@example.com",
          agency_website: "https://example.com",
          logo_url: null,
        },
      });
      setExportStatus("Demo PDF download started.");
    } catch {
      setExportStatus("Demo PDF could not start.");
    }
  }

  return (
    <main className="min-h-screen bg-[#F6F8FB]">
      <section className="border-b border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Sample report
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
                A client-ready report for Restaurante Demo.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                This public sample uses static mock data only. It shows how a
                small business owner can understand the risk and how a technician
                can receive clear fix instructions.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <label
                htmlFor="demoLanguage"
                className="text-sm font-semibold text-slate-950"
              >
                {uiCopy.languageLabel}
              </label>
              <select
                id="demoLanguage"
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value as ReportLanguage)
                }
                className="mt-2 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              >
                {reportLanguages.map((reportLanguage) => (
                  <option key={reportLanguage} value={reportLanguage}>
                    {reportLanguageLabels[reportLanguage]}
                  </option>
                ))}
              </select>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Change the language to preview the existing report translation
                layer.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/scan"
              className="inline-flex items-center justify-center rounded-md bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#115E59]"
            >
              Scan your own website
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:border-slate-400"
            >
              Create free account
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:border-slate-400"
            >
              Open dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_180px_220px]">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-800">
                Client summary
              </p>
              <h2 className="mt-3 text-2xl font-bold text-slate-950">
                Restaurante Demo needs website trust and email protection fixes.
              </h2>
              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-slate-500">Customer</dt>
                  <dd className="mt-1 font-bold text-slate-950">
                    Restaurante Demo
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Domain</dt>
                  <dd className="mt-1 font-bold text-slate-950">
                    {report.domain}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Report type</dt>
                  <dd className="mt-1 font-bold text-slate-950">
                    Public demo data
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Next action</dt>
                  <dd className="mt-1 font-bold text-slate-950">
                    Send fix notes to technician
                  </dd>
                </div>
              </dl>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Score</p>
              <p className="mt-4 text-4xl font-black text-slate-950">
                {report.score}/100
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Current website exposure score.
              </p>
            </article>

            <article
              className={`rounded-2xl border p-6 shadow-sm ${getRiskClasses(
                report.riskLevel,
                report.score
              )}`}
            >
              <p className="text-sm font-medium opacity-80">Risk level</p>
              <p className="mt-4 text-3xl font-black">{report.riskLevel}</p>
              <p className="mt-3 text-sm leading-6 opacity-85">
                Several configuration items should be fixed before relying on
                the website and email domain for customer trust.
              </p>
            </article>
          </section>

          <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
            <article className="rounded-2xl border border-teal-200 bg-teal-50 p-6 text-teal-950 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-800">
                Executive summary
              </p>
              <h2 className="mt-3 text-2xl font-bold">
                What the business owner should know
              </h2>
              <p className="mt-4 text-sm leading-6">{report.summary}</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-800">
                Business impact
              </p>
              <h2 className="mt-3 text-2xl font-bold text-slate-950">
                Why this matters
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                {businessImpactHighlights.map((item) => (
                  <li key={item} className="rounded-md bg-slate-50 p-3">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </section>

          <VerifiedFindingsOverview snapshot={report.verifiedFindings} />

          <section className="space-y-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-800">
                  Findings
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  Clear cards for the owner and technician
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                  Each finding shows the business impact, likely responsible
                  owner, fix effort, steps, and the exact message to copy.
                </p>
              </div>
              <span className="w-fit rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-800">
                {report.riskFindings.length} need attention
              </span>
            </div>

            <div className="grid gap-4">
              {report.riskFindings.map((finding) => (
                <article
                  key={finding.checkKey}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <div>
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div>
                          <p className="text-sm font-semibold text-rose-700">
                            {finding.statusLabel}
                          </p>
                          <h3 className="mt-1 text-xl font-bold text-slate-950">
                            {finding.title}
                          </h3>
                        </div>
                        <span
                          className={`w-fit rounded-md border px-3 py-1 text-xs font-bold ${getStatusClasses(
                            finding.status
                          )}`}
                        >
                          {finding.status}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {finding.explanation}
                      </p>

                      {verifiedFindingsByCheckKey.has(finding.checkKey) && (
                        <VerifiedFindingDetails
                          finding={verifiedFindingsByCheckKey.get(finding.checkKey)!}
                        />
                      )}

                      <div className="mt-5 grid gap-3 md:grid-cols-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                            {uiCopy.businessImpact}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            {finding.businessImpact}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                            {uiCopy.responsibleOwner}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            {finding.responsibleOwner}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                            {uiCopy.fixDifficulty}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            {finding.fixDifficulty} | {finding.estimatedFixTime}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
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
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-bold text-slate-950">
                        Technician message preview
                      </p>
                      <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap text-xs leading-5 text-slate-600">
                        {getTechnicianPreview(finding)}
                      </pre>
                      <button
                        type="button"
                        onClick={() => copyTechnicianText(finding)}
                        className="mt-4 w-full rounded-md bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#115E59] focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
                      >
                        Copy message for technician
                      </button>
                      {copyStatus === finding.checkKey && (
                        <p
                          className="mt-3 text-sm font-medium text-teal-800"
                          aria-live="polite"
                        >
                          Copied technician instructions.
                        </p>
                      )}
                      {copyStatus === "failed" && (
                        <p
                          className="mt-3 text-sm font-medium text-rose-700"
                          aria-live="polite"
                        >
                          Copy failed. Your browser may block clipboard access.
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-900">
                Before
              </p>
              <h2 className="mt-3 text-2xl font-bold text-amber-950">
                Initial report
              </h2>
              <p className="mt-3 text-4xl font-black text-amber-950">45/100</p>
              <p className="mt-3 text-sm leading-6 text-amber-950">
                Missing email protection and browser safety headers created a
                practical trust and reputation risk.
              </p>
            </article>

            <article className="rounded-2xl border border-teal-200 bg-teal-50 p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-900">
                After
              </p>
              <h2 className="mt-3 text-2xl font-bold text-teal-950">
                Re-scan proof
              </h2>
              <p className="mt-3 text-4xl font-black text-teal-950">82/100</p>
              <p className="mt-3 text-sm leading-6 text-teal-950">
                SPF, DMARC, HTTPS redirect, and basic headers were fixed, so the
                follow-up report can show visible progress.
              </p>
            </article>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-800">
                  PDF report preview
                </p>
                <h2 className="mt-3 text-2xl font-bold text-slate-950">
                  Export a client-ready report.
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Download a simple PDF generated from this mock report. Real
                  saved reports can include your agency profile and can be used
                  for client follow-up.
                </p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={downloadDemoPdf}
                  className="w-full rounded-md bg-[#0F766E] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#115E59] focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
                >
                  Download demo PDF
                </button>
                {exportStatus && (
                  <p
                    className="mt-3 text-sm font-medium text-teal-800"
                    aria-live="polite"
                  >
                    {exportStatus}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-800">
              Secondary technical output
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              Original scanner results
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              The raw labels remain available for the technician, but the client
              report above is the primary experience.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {orderedCheckEntries(demoScanResult.checks).map(([key, value]) => (
                <article
                  key={key}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
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
                      className={`w-fit rounded-md border px-2 py-1 text-xs font-bold ${getStatusClasses(
                        value
                      )}`}
                    >
                      {value}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Try it with your website
                </p>
                <h2 className="mt-3 text-2xl font-bold text-slate-950">
                  Turn your next scan into a report a client can use.
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Public scanning remains available without login. Sign in when
                  you want saved history, comparison, and client-ready PDFs.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/scan"
                  className="inline-flex items-center justify-center rounded-md bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#115E59]"
                >
                  Scan your own website
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-400"
                >
                  Create free account
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-400"
                >
                  Open dashboard
                </Link>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
