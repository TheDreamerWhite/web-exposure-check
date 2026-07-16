import {
  verificationLoopSchemaVersion,
  type FindingEvidence,
  type FindingVerificationTransition,
  type VerificationReconciliation,
  type VerificationStatus,
  type VerificationTransitionKind,
  type VerifiedFinding,
  type VerifiedFindingsSnapshot,
} from "./types";

export type ReconcileVerifiedFindingsContext = {
  previousReportId: string;
  reconciledAt?: string;
};

export type ReconciledVerifiedFindings = {
  snapshot: VerifiedFindingsSnapshot;
  verification: VerificationReconciliation;
};

export function summarizeVerificationTransitions(
  transitions: FindingVerificationTransition[]
) {
  return {
    fixedAndVerified: transitions.filter(
      (transition) => transition.changeType === "fixed_and_verified"
    ).length,
    observedPass: transitions.filter(
      (transition) => transition.changeType === "observed_pass"
    ).length,
    regressed: transitions.filter(
      (transition) => transition.changeType === "regressed"
    ).length,
    stillNeedsWork: transitions.filter(
      (transition) => transition.changeType === "still_needs_work"
    ).length,
    newFindings: transitions.filter(
      (transition) => transition.changeType === "new_finding"
    ).length,
  };
}

function normalizeDomain(value: string) {
  return value.trim().toLowerCase().replace(/\.$/, "");
}

function normalizeSource(value: string) {
  return value.trim().toLowerCase().replace(/\/$/, "");
}

function cloneEvidence(evidence: FindingEvidence[]) {
  return evidence.map((item) => ({ ...item }));
}

function cloneFinding(finding: VerifiedFinding): VerifiedFinding {
  return {
    ...finding,
    priorityReasons: [...finding.priorityReasons],
    remediation: {
      ...finding.remediation,
      steps: [...finding.remediation.steps],
    },
    evidence: cloneEvidence(finding.evidence),
    limitations: [...finding.limitations],
  };
}

function getObservationTime(finding: VerifiedFinding, fallback: string) {
  const validEvidenceTimes = finding.evidence
    .map((item) => item.observedAt)
    .filter((value) => Number.isFinite(Date.parse(value)))
    .sort((left, right) => Date.parse(right) - Date.parse(left));

  return validEvidenceTimes[0] || fallback;
}

function isLaterObservation(previousTime: string, currentTime: string) {
  const previousTimestamp = Date.parse(previousTime);
  const currentTimestamp = Date.parse(currentTime);

  return (
    Number.isFinite(previousTimestamp) &&
    Number.isFinite(currentTimestamp) &&
    currentTimestamp > previousTimestamp
  );
}

function hasIndependentEvidence(
  previous: VerifiedFinding,
  current: VerifiedFinding
) {
  if (previous.evidence.length === 0 || current.evidence.length === 0) {
    return false;
  }

  const previousIds = new Set(previous.evidence.map((item) => item.id));

  return current.evidence.some((item) => !previousIds.has(item.id));
}

function hasComparableEvidence(
  previous: VerifiedFinding,
  current: VerifiedFinding
) {
  return previous.evidence.some((before) =>
    current.evidence.some(
      (after) =>
        before.kind === after.kind &&
        normalizeSource(before.source) === normalizeSource(after.source)
    )
  );
}

function explainObservedPass(
  previous: VerifiedFinding,
  current: VerifiedFinding,
  laterIndependentObservation: boolean,
  comparableEvidence: boolean
) {
  if (current.confidence !== "confirmed") {
    return "The latest scan passed, but the stored evidence is not confirmed enough to prove a completed fix.";
  }

  if (previous.confidence !== "confirmed") {
    return "The latest scan passed with confirmed evidence, but the previous failed observation was not confirmed enough for a verified before-and-after claim.";
  }

  if (!laterIndependentObservation) {
    return "The latest scan passed, but it is not a later independent observation with distinct stored evidence.";
  }

  if (!comparableEvidence) {
    return "The latest scan passed, but the stored before-and-after evidence is not directly comparable.";
  }

  return "The latest scan passed, but the evidence does not satisfy every requirement for a verified fix.";
}

function reconcileFinding(
  previous: VerifiedFinding | undefined,
  current: VerifiedFinding,
  previousSnapshot: VerifiedFindingsSnapshot,
  currentSnapshot: VerifiedFindingsSnapshot,
  previousReportId: string,
  sameDomain: boolean
) {
  const currentObservationTime = getObservationTime(
    current,
    currentSnapshot.generatedAt
  );

  if (!previous) {
    const resultingVerificationStatus: VerificationStatus = current.passed
      ? "observed_pass"
      : "not_verified";
    const reason = sameDomain
      ? "No earlier finding with the same check key was available, so this is a new observation rather than a verified change."
      : "The earlier report belongs to a different domain, so its evidence cannot be used to verify this finding.";

    return {
      finding: {
        ...cloneFinding(current),
        verificationStatus: resultingVerificationStatus,
      },
      transition: {
        previousReportId,
        checkKey: current.checkKey,
        previousObservedStatus: null,
        currentObservedStatus: current.observedStatus,
        previousPassed: null,
        currentPassed: current.passed,
        previousConfidence: null,
        currentConfidence: current.confidence,
        previousObservationTime: null,
        currentObservationTime,
        beforeEvidence: [],
        afterEvidence: cloneEvidence(current.evidence),
        changeType: "new_finding" as VerificationTransitionKind,
        resultingVerificationStatus,
        verificationReason: reason,
      },
    };
  }

  const previousObservationTime = getObservationTime(
    previous,
    previousSnapshot.generatedAt
  );
  const laterIndependentObservation =
    isLaterObservation(previousObservationTime, currentObservationTime) &&
    hasIndependentEvidence(previous, current);
  const comparableEvidence = hasComparableEvidence(previous, current);
  let changeType: VerificationTransitionKind;
  let resultingVerificationStatus: VerificationStatus;
  let verificationReason: string;

  if (current.passed) {
    const canVerifyFix =
      !previous.passed &&
      previous.confidence === "confirmed" &&
      current.confidence === "confirmed" &&
      laterIndependentObservation &&
      comparableEvidence;

    if (canVerifyFix) {
      changeType = "fixed_and_verified";
      resultingVerificationStatus = "fixed_and_verified";
      verificationReason =
        "A previous confirmed failure is followed by a later independent confirmed pass with comparable stored before-and-after evidence.";
    } else {
      changeType = "observed_pass";
      resultingVerificationStatus = "observed_pass";
      verificationReason = previous.passed
        ? "The check passed again in the current scan. This remains an observed pass because there is no earlier failed finding to verify as fixed."
        : explainObservedPass(
            previous,
            current,
            laterIndependentObservation,
            comparableEvidence
          );
    }
  } else {
    const canVerifyRegression =
      previous.passed &&
      (previous.verificationStatus === "observed_pass" ||
        previous.verificationStatus === "fixed_and_verified") &&
      current.confidence === "confirmed" &&
      laterIndependentObservation &&
      comparableEvidence;

    if (canVerifyRegression) {
      changeType = "regressed";
      resultingVerificationStatus = "regressed";
      verificationReason =
        "A later independent confirmed observation now fails after the same finding previously passed, with comparable stored evidence.";
    } else {
      changeType = "still_needs_work";
      resultingVerificationStatus = "not_verified";
      verificationReason =
        current.confidence === "possible"
          ? "The current result is inconclusive, so more evidence is required before declaring a regression or a verified change."
          : previous.passed
            ? "The current check does not pass, but the stored evidence is not strong or comparable enough to confirm a regression."
            : "The finding still does not pass in the latest scan and has not been verified as fixed.";
    }
  }

  return {
    finding: {
      ...cloneFinding(current),
      verificationStatus: resultingVerificationStatus,
    },
    transition: {
      previousReportId,
      checkKey: current.checkKey,
      previousObservedStatus: previous.observedStatus,
      currentObservedStatus: current.observedStatus,
      previousPassed: previous.passed,
      currentPassed: current.passed,
      previousConfidence: previous.confidence,
      currentConfidence: current.confidence,
      previousObservationTime,
      currentObservationTime,
      beforeEvidence: cloneEvidence(previous.evidence),
      afterEvidence: cloneEvidence(current.evidence),
      changeType,
      resultingVerificationStatus,
      verificationReason,
    } satisfies FindingVerificationTransition,
  };
}

export function reconcileVerifiedFindings(
  previousSnapshot: VerifiedFindingsSnapshot,
  currentSnapshot: VerifiedFindingsSnapshot,
  context: ReconcileVerifiedFindingsContext
): ReconciledVerifiedFindings {
  const sameDomain =
    normalizeDomain(previousSnapshot.domain) ===
    normalizeDomain(currentSnapshot.domain);
  const previousByCheckKey = new Map(
    sameDomain
      ? previousSnapshot.findings.map((finding) => [finding.checkKey, finding])
      : []
  );
  const reconciled = currentSnapshot.findings.map((current) =>
    reconcileFinding(
      previousByCheckKey.get(current.checkKey),
      current,
      previousSnapshot,
      currentSnapshot,
      context.previousReportId,
      sameDomain
    )
  );
  const reconciledAt = context.reconciledAt || currentSnapshot.generatedAt;

  return {
    snapshot: {
      ...currentSnapshot,
      findings: reconciled.map((item) => item.finding),
    },
    verification: {
      schemaVersion: verificationLoopSchemaVersion,
      previousReportId: context.previousReportId,
      domain: currentSnapshot.domain,
      reconciledAt,
      transitions: reconciled.map((item) => item.transition),
    },
  };
}
