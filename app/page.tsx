"use client";

import { useState } from "react";

type CheckStatus = "OK" | "Missing" | "Warning";

type ScanResult = {
  domain: string;
  score: number;
  riskLevel: string;
  checks: {
    ssl: CheckStatus;
    spf: CheckStatus;
    dmarc: CheckStatus;
    hsts: CheckStatus;
    csp: CheckStatus;
    xFrameOptions: CheckStatus;
  };
};

function getStatusColor(status: CheckStatus) {
  if (status === "OK") return "text-green-400";
  if (status === "Missing") return "text-red-400";
  return "text-yellow-400";
}

export default function Home() {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setResult(data);
    } catch {
      setError("Unable to connect to the scanner API");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 rounded-full border border-slate-700 px-4 py-1 text-sm text-slate-300">
          Web Exposure & Security Check
        </p>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
          Check your website exposure in seconds
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-300">
          Analyze basic SSL, email security and public website risks before they become real problems.
        </p>

        <div className="mt-10 flex w-full max-w-xl flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-2xl sm:flex-row">
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
          />

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {error && (
          <p className="mt-4 max-w-xl rounded-xl border border-red-900 bg-red-950/50 px-4 py-3 text-red-300">
            {error}
          </p>
        )}

        {result && (
          <div className="mt-8 w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 text-left">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Analyzed domain</p>
                <p className="text-lg font-semibold">{result.domain}</p>

                <p className="mt-4 text-sm text-slate-400">Security Score</p>
                <p className="text-4xl font-bold">{result.score}/100</p>
              </div>

              <p className="rounded-full bg-blue-500/20 px-4 py-2 text-sm text-blue-300">
                {result.riskLevel}
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span>SSL Certificate</span>
                <span className={getStatusColor(result.checks.ssl)}>
                  {result.checks.ssl}
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span>SPF Record</span>
                <span className={getStatusColor(result.checks.spf)}>
                  {result.checks.spf}
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span>DMARC Record</span>
                <span className={getStatusColor(result.checks.dmarc)}>
                  {result.checks.dmarc}
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span>HSTS Header</span>
                <span className={getStatusColor(result.checks.hsts)}>
                  {result.checks.hsts}
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span>Content Security Policy</span>
                <span className={getStatusColor(result.checks.csp)}>
                  {result.checks.csp}
                </span>
              </div>

              <div className="flex justify-between">
                <span>X-Frame-Options</span>
                <span className={getStatusColor(result.checks.xFrameOptions)}>
                  {result.checks.xFrameOptions}
                </span>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}