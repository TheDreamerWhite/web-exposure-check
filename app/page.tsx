"use client";

import { useState } from "react";

type CheckStatus = "OK" | "Missing" | "Warning";

type CheckKey =
  | "ssl"
  | "httpsRedirect"
  | "spf"
  | "dmarc"
  | "hsts"
  | "csp"
  | "xFrameOptions";

type ScanResult = {
  domain: string;
  score: number;
  riskLevel: string;
  checks: {
    ssl: CheckStatus;
    httpsRedirect: CheckStatus;
    spf: CheckStatus;
    dmarc: CheckStatus;
    hsts: CheckStatus;
    csp: CheckStatus;
    xFrameOptions: CheckStatus;
  };
};

const checkLabels: Record<CheckKey, string> = {
  ssl: "SSL Certificate",
  httpsRedirect: "HTTPS Redirect",
  spf: "SPF Record",
  dmarc: "DMARC Record",
  hsts: "HSTS Header",
  csp: "Content Security Policy",
  xFrameOptions: "X-Frame-Options",
};

const explanations: Record<
  CheckKey,
  {
    risk: string;
    recommendation: string;
  }

> = {
  ssl: {
    risk: "The SSL certificate protects data between the visitor and the website. If it is invalid or close to expiration, users may see browser warnings or lose trust in the website.",
    recommendation:
      "Use a valid TLS certificate and renew it before expiration. Services such as Let's Encrypt can automate this process.",
  },
  httpsRedirect: {
    risk: "HTTPS redirect ensures visitors are automatically moved from the insecure HTTP version of the website to the encrypted HTTPS version. Without it, users may access the site through an unencrypted connection.",
    recommendation:
      "Configure your web server or hosting provider to redirect all HTTP traffic to HTTPS using a permanent 301 redirect.",
  },
  spf: {
    risk: "SPF helps prevent attackers from sending fake emails using your domain. Without SPF, your domain can be easier to abuse in phishing campaigns.",
    recommendation:
      "Add an SPF TXT record to your DNS zone and include the mail services allowed to send emails for your domain.",
  },
  dmarc: {
    risk: "DMARC tells mail servers how to handle emails that fail authentication. Without DMARC, spoofed emails using your domain may be more likely to reach victims.",
    recommendation:
      "Start with a DMARC policy such as p=none, monitor reports, and later move to quarantine or reject.",
  },
  hsts: {
    risk: "HSTS forces browsers to use HTTPS only. Without it, visitors may be exposed to downgrade or man-in-the-middle risks in some situations.",
    recommendation:
      "Enable the Strict-Transport-Security header on your web server after confirming HTTPS works correctly across the whole site.",
  },
  csp: {
    risk: "Content Security Policy helps reduce the impact of cross-site scripting and content injection attacks. Without it, browsers have fewer restrictions on loaded scripts and resources.",
    recommendation:
      "Define a Content-Security-Policy header that limits trusted script, style, image and connection sources.",
  },
  xFrameOptions: {
    risk: "X-Frame-Options helps prevent clickjacking attacks by controlling whether your website can be embedded inside another page.",
    recommendation:
      "Set X-Frame-Options to DENY or SAMEORIGIN, or use the frame-ancestors directive in Content Security Policy.",
  },
};

function getStatusColor(status: CheckStatus) {
  if (status === "OK") return "text-green-400";
  if (status === "Missing") return "text-red-400";
  return "text-yellow-400";
}

function getStatusBadgeColor(status: CheckStatus) {
  if (status === "OK") return "bg-green-500/15 text-green-300";
  if (status === "Missing") return "bg-red-500/15 text-red-300";
  return "bg-yellow-500/15 text-yellow-300";
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
      setDomain(data.domain);
    } catch {
      setError("Unable to connect to the scanner API");
    } finally {
      setLoading(false);
    }
  }

  const issueEntries = result
    ? (Object.entries(result.checks) as [CheckKey, CheckStatus][]).filter(
      ([, status]) => status !== "OK"
    )
    : [];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
        <p className="mb-4 rounded-full border border-slate-700 px-4 py-1 text-sm text-slate-300">
          Web Exposure & Security Check
        </p>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
          Check your website exposure in seconds
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-300">
          Analyze basic SSL, email security and public website risks before they
          become real problems.
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
          <div className="mt-8 grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-left">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">Analyzed domain</p>
                  <p className="text-lg font-semibold">{result.domain}</p>

                  <p className="mt-4 text-sm text-slate-400">
                    Security Score
                  </p>
                  <p className="text-4xl font-bold">{result.score}/100</p>
                </div>

                <p className="rounded-full bg-blue-500/20 px-4 py-2 text-sm text-blue-300">
                  {result.riskLevel}
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {(Object.entries(result.checks) as [
                  CheckKey,
                  CheckStatus
                ][]).map(([key, status]) => (
                  <div
                    key={key}
                    className="flex justify-between border-b border-slate-800 pb-2 last:border-b-0"
                  >
                    <span>{checkLabels[key]}</span>
                    <span className={getStatusColor(status)}>{status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-left">
              <p className="text-sm text-slate-400">Risk explanation</p>
              <h2 className="mt-1 text-2xl font-bold">What this means</h2>

              {issueEntries.length === 0 ? (
                <p className="mt-6 rounded-xl border border-green-900 bg-green-950/30 p-4 text-green-300">
                  No basic issues were found in the current checks. This does
                  not mean the website is fully secure, but the visible
                  exposure indicators look healthy.
                </p>
              ) : (
                <div className="mt-6 space-y-4">
                  {issueEntries.map(([key, status]) => (
                    <div
                      key={key}
                      className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="font-semibold">{checkLabels[key]}</h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${getStatusBadgeColor(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      </div>

                      <p className="mt-3 text-sm text-slate-300">
                        {explanations[key].risk}
                      </p>

                      <p className="mt-3 text-sm text-slate-400">
                        <span className="font-semibold text-slate-200">
                          Recommendation:
                        </span>{" "}
                        {explanations[key].recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <p className="mt-10 max-w-3xl text-xs text-slate-500">
          This tool performs basic public checks only. It does not replace a
          professional penetration test or a full security audit.
        </p>
      </section>
    </main>
  );
}