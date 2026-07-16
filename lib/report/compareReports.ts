import { getCheckTone } from "../scan/checks";
import type {
  FindingVerificationTransition,
  VerificationTransitionKind,
} from "@/lib/findings/types";
import type { ReportScanResult } from "./types";

export type CheckComparisonStatus =
  | "Fixed and verified"
  | "Observed pass"
  | "Regressed"
  | "Still needs work"
  | "New finding"
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
  fixedAndVerified: CheckComparison[];
  observedPass: CheckComparison[];
  regressed: CheckComparison[];
  stillNeedsWork: CheckComparison[];
  newFindings: CheckComparison[];
  noChange: CheckComparison[];
};

function isProblem(status: string) {
  return getCheckTone(status) !== "ok";
}

function getTransitionStatus(
  changeType: VerificationTransitionKind
): CheckComparisonStatus {
  if (changeType === "fixed_and_verified") return "Fixed and verified";
  if (changeType === "observed_pass") return "Observed pass";
  if (changeType === "regressed") return "Regressed";
  if (changeType === "new_finding") return "New finding";
  return "Still needs work";
}

export function compareScanReports(
  previous: ReportScanResult,
  current: ReportScanResult,
  transitions: FindingVerificationTransition[] = []
): ReportComparison {
  const transitionsByCheckKey = new Map(
    transitions.map((transition) => [transition.checkKey, transition])
  );
  const keys = Array.from(
    new Set([...Object.keys(previous.checks), ...Object.keys(current.checks)])
  );

  const checks = keys.map((checkKey) => {
    const previousStatus = previous.checks[checkKey] || "Missing";
    const currentStatus = current.checks[checkKey] || "Missing";
    const previousProblem = isProblem(previousStatus);
    const currentProblem = isProblem(currentStatus);
    const transition = transitionsByCheckKey.get(checkKey);
    let status: CheckComparisonStatus = "No change";

    if (transition) {
      status = getTransitionStatus(transition.changeType);
    } else if (previousProblem && !currentProblem) {
      status = "Observed pass";
    } else if (previousProblem && currentProblem) {
      status = "Still needs work";
    } else if (!previousProblem && currentProblem) {
      status = "New finding";
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
    fixedAndVerified: checks.filter(
      (check) => check.status === "Fixed and verified"
    ),
    observedPass: checks.filter((check) => check.status === "Observed pass"),
    regressed: checks.filter((check) => check.status === "Regressed"),
    stillNeedsWork: checks.filter((check) => check.status === "Still needs work"),
    newFindings: checks.filter((check) => check.status === "New finding"),
    noChange: checks.filter((check) => check.status === "No change"),
  };
}
