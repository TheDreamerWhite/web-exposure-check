import { getCheckTone } from "@/lib/scan/checks";
import type { ReportScanResult } from "./types";

export type CheckComparisonStatus =
  | "Fixed"
  | "Still needs work"
  | "New issue"
  | "No change";

export type CheckComparison = {
  checkKey: string;
  previousStatus: string;
  currentStatus: string;
  status: CheckComparisonStatus;
};

export type ReportComparison = {
  previousScore: number;
  currentScore: number;
  scoreDelta: number;
  previousRiskLevel: string;
  currentRiskLevel: string;
  checks: CheckComparison[];
  fixed: CheckComparison[];
  stillNeedsWork: CheckComparison[];
  newIssues: CheckComparison[];
  noChange: CheckComparison[];
};

function isProblem(status: string) {
  return getCheckTone(status) !== "ok";
}

export function compareScanReports(
  previous: ReportScanResult,
  current: ReportScanResult
): ReportComparison {
  const keys = Array.from(
    new Set([...Object.keys(previous.checks), ...Object.keys(current.checks)])
  );

  const checks = keys.map((checkKey) => {
    const previousStatus = previous.checks[checkKey] || "Missing";
    const currentStatus = current.checks[checkKey] || "Missing";
    const previousProblem = isProblem(previousStatus);
    const currentProblem = isProblem(currentStatus);
    let status: CheckComparisonStatus = "No change";

    if (previousProblem && !currentProblem) {
      status = "Fixed";
    } else if (previousProblem && currentProblem) {
      status = "Still needs work";
    } else if (!previousProblem && currentProblem) {
      status = "New issue";
    }

    return {
      checkKey,
      previousStatus,
      currentStatus,
      status,
    };
  });

  return {
    previousScore: previous.score,
    currentScore: current.score,
    scoreDelta: current.score - previous.score,
    previousRiskLevel: previous.riskLevel,
    currentRiskLevel: current.riskLevel,
    checks,
    fixed: checks.filter((check) => check.status === "Fixed"),
    stillNeedsWork: checks.filter((check) => check.status === "Still needs work"),
    newIssues: checks.filter((check) => check.status === "New issue"),
    noChange: checks.filter((check) => check.status === "No change"),
  };
}
