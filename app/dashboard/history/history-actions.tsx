"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type HistoryActionsProps = {
  reportId: string;
  previousReportId?: string | null;
};

export function HistoryActions({
  reportId,
  previousReportId,
}: HistoryActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function runRescan() {
    setLoading(true);
    setStatus("Running re-scan...");

    try {
      const response = await fetch(`/api/scan-reports/${reportId}/rescan`, {
        method: "POST",
      });
      const data = (await response.json().catch(() => ({}))) as {
        report?: { id?: string };
        error?: string;
      };

      if (!response.ok || !data.report?.id) {
        throw new Error(data.error || "Re-scan failed.");
      }

      router.push(`/report/${data.report.id}?previous=${reportId}`);
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Re-scan failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
      <Link
        href={`/report/${reportId}`}
        className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-950 transition hover:border-teal-700 hover:text-teal-800"
      >
        View
      </Link>
      {previousReportId ? (
        <Link
          href={`/report/${reportId}?previous=${previousReportId}`}
          className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-950 transition hover:border-teal-700 hover:text-teal-800"
        >
          Compare
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-400">
          Compare
        </span>
      )}
      <button
        type="button"
        onClick={runRescan}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
      >
        {loading ? "Scanning..." : "Re-scan"}
      </button>
      {status && (
        <span className="text-xs font-medium text-slate-600" aria-live="polite">
          {status}
        </span>
      )}
    </div>
  );
}
