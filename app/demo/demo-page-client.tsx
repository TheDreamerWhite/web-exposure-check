"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import type { AiWebsiteUnderstanding } from "@/lib/ai/types";
import type { WebsiteReadResult } from "@/lib/reader/types";

type DemoScanResult = {
  domain: string;
  score: number;
  riskLevel: string;
  checks: Record<string, string>;
  websiteReadResult?: WebsiteReadResult;
  aiWebsiteUnderstanding?: AiWebsiteUnderstanding | null;
};

type DemoPageClientProps = {
  canShowAiInsights: boolean;
  isSignedIn: boolean;
};

const checkLabels: Record<string, string> = {
  ssl: "SSL certificate",
  httpsRedirect: "HTTPS redirect",
  spf: "SPF email protection",
  dmarc: "DMARC email protection",
  hsts: "HSTS security header",
  csp: "Content Security Policy",
  xFrameOptions: "Clickjacking protection",
};

function formatCheckLabel(key: string) {
  return (
    checkLabels[key] ||
    key
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}

function getStatusClasses(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "ok") {
    return "border-green-200 bg-green-50 text-[#15803D]";
  }

  if (normalized === "warning") {
    return "border-amber-200 bg-amber-50 text-[#B45309]";
  }

  return "border-rose-200 bg-rose-50 text-[#B42318]";
}

function getRiskClasses(riskLevel: string) {
  const normalized = riskLevel.toLowerCase();

  if (normalized.includes("low")) {
    return "border-green-200 bg-green-50 text-[#15803D]";
  }

  if (normalized.includes("medium")) {
    return "border-amber-200 bg-amber-50 text-[#B45309]";
  }

  return "border-rose-200 bg-rose-50 text-[#B42318]";
}

function readErrorMessage(data: unknown) {
  if (data && typeof data === "object" && "error" in data) {
    const error = (data as { error?: unknown }).error;

    if (typeof error === "string") {
      return error;
    }
  }

  return "The scan could not be completed. Please check the domain and try again.";
}

export function DemoPageClient({
  canShowAiInsights,
  isSignedIn,
}: DemoPageClientProps) {
  const [domain, setDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DemoScanResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedDomain = domain.trim();

    if (!trimmedDomain) {
      setError("Enter a website domain, such as example.com.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain: trimmedDomain }),
      });

      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(readErrorMessage(data));
      }

      setResult(data as DemoScanResult);
    } catch (scanError) {
      setError(
        scanError instanceof Error
          ? scanError.message
          : "The scan could not be completed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  const homepage = result?.websiteReadResult?.homepage;
  const evidence = result?.websiteReadResult?.evidence;
  const ai = canShowAiInsights ? result?.aiWebsiteUnderstanding : null;
  const checks = result ? Object.entries(result.checks) : [];

  return (
    <main className="min-h-screen bg-[#F6F8FB] text-slate-950">
      <section className="border-b border-slate-800 bg-[#111827] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1fr_390px] lg:items-center lg:px-8 lg:py-16">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-slate-300">
              Public beta
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Website security, explained clearly.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Scan public website exposure, understand the business impact, and
              get clear remediation steps.
            </p>
            <p className="mt-4 text-sm font-medium text-slate-400">
              Non-invasive public checks. No exploitation. No credentials
              required.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-[18px] border border-slate-200 bg-white p-5 text-slate-950 shadow-[0_18px_45px_rgba(15,23,42,0.18)]"
          >
            <h2 className="text-lg font-bold">Check a website</h2>

            <label
              htmlFor="demo-domain"
              className="mt-4 block text-sm font-semibold text-slate-800"
            >
              Website domain
            </label>
            <div className="mt-2 flex flex-col gap-3">
              <input
                id="demo-domain"
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
                placeholder="example.com"
                autoCapitalize="none"
                autoComplete="url"
                className="min-h-12 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#0F766E] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#115E59] focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Scanning..." : "Scan website"}
              </button>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">
              Only scan websites you own, manage, or are authorized to assess.
            </p>
            {error ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-800">
                {error}
              </div>
            ) : null}
          </form>
        </div>
      </section>

      {isLoading ? (
        <section className="border-b border-slate-200 bg-[#EEF2F6] py-10 text-slate-950">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">
                Scan in progress
              </p>
              <p className="mt-3 text-lg font-semibold">
                Reading public signals and preparing a business-friendly result.
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This usually takes a few seconds.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {result ? (
        <section className="bg-[#F6F8FB] py-14 text-slate-950">
          <div className="mx-auto grid max-w-7xl gap-6 px-6 lg:px-8">
            <div className="grid gap-4 lg:grid-cols-3">
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">Domain</p>
                <h2 className="mt-2 break-words text-2xl font-bold">
                  {result.domain}
                </h2>
              </article>
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">Score</p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-5xl font-black">{result.score}</span>
                  <span className="pb-2 text-sm font-semibold text-slate-500">
                    / 100
                  </span>
                </div>
              </article>
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">
                  Risk level
                </p>
                <span
                  className={`mt-3 inline-flex rounded-full border px-4 py-2 text-sm font-bold ${getRiskClasses(
                    result.riskLevel
                  )}`}
                >
                  {result.riskLevel}
                </span>
              </article>
            </div>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">
                    Security checks
                  </p>
                  <h2 className="mt-2 text-2xl font-bold">
                    Exposure summary
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    This scan checks security headers, HTTPS behavior, DNS email
                    protection signals, and public website evidence.
                  </p>
                </div>
                <Link
                  href={isSignedIn ? "/dashboard" : "/login"}
                  className="text-sm font-semibold text-teal-700 transition hover:text-teal-900"
                >
                  {isSignedIn ? "Open dashboard" : "Log in to save reports"}
                </Link>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {checks.map(([key, status]) => (
                  <article
                    key={key}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <h3 className="text-sm font-semibold">
                      {formatCheckLabel(key)}
                    </h3>
                    <span
                      className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusClasses(
                        status
                      )}`}
                    >
                      {status}
                    </span>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">
                Website evidence
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                Public information read during this scan
              </h2>
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-500">
                    Homepage title
                  </p>
                  <p className="mt-2 text-base font-semibold">
                    {homepage?.title || "No homepage title was found."}
                  </p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-500">
                    Meta description
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {homepage?.metaDescription ||
                      "No public meta description was found."}
                  </p>
                </article>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-500">
                  Pages read
                </p>
                {evidence?.pagesRead?.length ? (
                  <ul className="mt-3 grid gap-2">
                    {evidence.pagesRead.map((page) => (
                      <li
                        key={page}
                        className="break-all rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                      >
                        {page}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    The scan completed, but no website reading evidence was
                    returned for this result.
                  </p>
                )}
              </div>
            </section>

            {ai ? (
              <section className="rounded-3xl border border-teal-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">
                  AI insight
                </p>
                <h2 className="mt-2 text-2xl font-bold">
                  Business-friendly website understanding
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  This section is visible only for eligible signed-in tester
                  accounts and is based on the public evidence read during this
                  scan.
                </p>

                <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                  <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-500">
                      Business Understanding
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">
                        {ai.websiteType.label}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700">
                        {ai.websiteType.confidence} confidence
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-700">
                      {ai.businessSummary}
                    </p>
                  </article>

                  <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-500">
                      Owner explanation
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      {ai.ownerExplanation}
                    </p>
                  </article>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-500">
                    Security Recommendations
                  </p>
                  {ai.potentialConcerns.length ? (
                    <div className="mt-4 grid gap-3">
                      {ai.potentialConcerns.slice(0, 4).map((concern) => (
                        <article
                          key={`${concern.label}-${concern.evidence}`}
                          className="rounded-2xl border border-slate-200 bg-white p-4"
                        >
                          <h3 className="text-base font-semibold">
                            {concern.label}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {concern.businessImpact}
                          </p>
                          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Suggested owner
                          </p>
                          <p className="mt-1 text-sm text-slate-700">
                            {concern.suggestedOwner}
                          </p>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      The AI section did not identify customer-facing concerns
                      from the observed public evidence.
                    </p>
                  )}
                </div>
              </section>
            ) : result && !canShowAiInsights ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">
                  AI insight locked
                </p>
                <h2 className="mt-2 text-2xl font-bold">
                  AI website understanding is available for approved testers.
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                  {isSignedIn
                    ? "AI insights are currently limited to approved tester accounts. The normal exposure check above remains available for your account."
                    : "Sign in to unlock AI insights when your account has tester access. The normal exposure check above remains available without login."}
                </p>
                <Link
                  href={isSignedIn ? "/dashboard" : "/login"}
                  className="mt-5 inline-flex rounded-lg bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#115E59]"
                >
                  {isSignedIn ? "Open dashboard" : "Sign in to unlock AI insights"}
                </Link>
              </section>
            ) : null}
          </div>
        </section>
      ) : null}
    </main>
  );
}
