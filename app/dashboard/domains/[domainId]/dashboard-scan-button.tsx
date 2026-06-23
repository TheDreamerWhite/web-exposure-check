"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DashboardScanButtonProps = {
  domainId: string;
};

export function DashboardScanButton({ domainId }: DashboardScanButtonProps) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function runDashboardScan() {
    setLoading(true);
    setStatus("Running scan. This may take a few seconds.");

    try {
      const response = await fetch(`/api/dashboard/domains/${domainId}/scan`, {
        method: "POST",
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        score?: number;
        riskLevel?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Dashboard scan failed.");
      }

      setStatus(
        `Saved scan result: ${data.score ?? "-"} / 100, ${data.riskLevel || "risk pending"}.`
      );
      router.refresh();
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Dashboard scan failed. Try again in a few seconds."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={runDashboardScan}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
      >
        {loading ? "Running scan..." : "Run saved scan"}
      </button>
      {status && (
        <p className="mt-3 text-sm font-medium text-slate-700" aria-live="polite">
          {status}
        </p>
      )}
    </div>
  );
}
