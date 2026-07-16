import { confidenceLabels } from "@/lib/findings/presentation";
import { summarizeVerificationTransitions } from "@/lib/findings/verification";
import type {
  FindingEvidence,
  FindingVerificationTransition,
  VerificationReconciliation,
  VerificationTransitionKind,
} from "@/lib/findings/types";
import { getCheckInfo } from "@/lib/scan/checks";

type VerificationLoopProps = {
  verification: VerificationReconciliation;
};

const transitionLabels: Record<VerificationTransitionKind, string> = {
  fixed_and_verified: "Fixed and verified",
  observed_pass: "Observed pass",
  regressed: "Regressed",
  still_needs_work: "Still needs work",
  new_finding: "New finding",
};

const transitionClasses: Record<VerificationTransitionKind, string> = {
  fixed_and_verified: "border-teal-200 bg-teal-50 text-teal-900",
  observed_pass: "border-blue-200 bg-blue-50 text-blue-900",
  regressed: "border-rose-200 bg-rose-50 text-rose-900",
  still_needs_work: "border-amber-200 bg-amber-50 text-amber-900",
  new_finding: "border-slate-200 bg-slate-50 text-slate-700",
};

function formatObservationTime(value: string | null) {
  if (!value) return "No previous observation";

  try {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/Madrid",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function hasMeaningfulChange(transition: FindingVerificationTransition) {
  return (
    transition.previousObservedStatus === null ||
    transition.previousObservedStatus !== transition.currentObservedStatus ||
    transition.previousPassed !== transition.currentPassed ||
    transition.previousConfidence !== transition.currentConfidence ||
    transition.changeType === "fixed_and_verified" ||
    transition.changeType === "regressed"
  );
}

function EvidenceList({
  evidence,
  emptyText,
}: {
  evidence: FindingEvidence[];
  emptyText: string;
}) {
  if (evidence.length === 0) {
    return <p className="mt-3 text-sm leading-6 text-slate-500">{emptyText}</p>;
  }

  return (
    <div className="mt-3 space-y-2">
      {evidence.map((item) => (
        <div
          key={item.id}
          className="min-w-0 rounded-lg border border-slate-200 bg-white p-3"
        >
          <p className="text-sm font-semibold leading-6 text-slate-950">
            {item.summary}
          </p>
          <p className="mt-1 break-words text-xs leading-5 text-slate-600">
            Source: {item.source}
          </p>
          <p className="break-words text-xs leading-5 text-slate-600">
            Value: {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function TransitionCard({
  transition,
}: {
  transition: FindingVerificationTransition;
}) {
  return (
    <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            Verification change
          </p>
          <h3 className="mt-2 text-lg font-bold text-slate-950">
            {getCheckInfo(transition.checkKey).label}
          </h3>
        </div>
        <span
          className={`w-fit rounded-md border px-2.5 py-1 text-xs font-bold ${transitionClasses[transition.changeType]}`}
        >
          {transitionLabels[transition.changeType]}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-700">
        {transition.verificationReason}
      </p>

      <div className="mt-4 grid min-w-0 gap-3 lg:grid-cols-2">
        <section className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            Before
          </p>
          <dl className="mt-3 space-y-1 text-sm leading-6 text-slate-700">
            <div>
              <dt className="inline font-semibold text-slate-950">Status: </dt>
              <dd className="inline">
                {transition.previousObservedStatus || "No matching finding"}
              </dd>
            </div>
            <div>
              <dt className="inline font-semibold text-slate-950">Confidence: </dt>
              <dd className="inline">
                {transition.previousConfidence
                  ? confidenceLabels[transition.previousConfidence]
                  : "Not available"}
              </dd>
            </div>
            <div>
              <dt className="inline font-semibold text-slate-950">Observed: </dt>
              <dd className="inline">
                {formatObservationTime(transition.previousObservationTime)}
              </dd>
            </div>
          </dl>
          <EvidenceList
            evidence={transition.beforeEvidence}
            emptyText="No comparable earlier evidence was stored."
          />
        </section>

        <section className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            After
          </p>
          <dl className="mt-3 space-y-1 text-sm leading-6 text-slate-700">
            <div>
              <dt className="inline font-semibold text-slate-950">Status: </dt>
              <dd className="inline">{transition.currentObservedStatus}</dd>
            </div>
            <div>
              <dt className="inline font-semibold text-slate-950">Confidence: </dt>
              <dd className="inline">
                {confidenceLabels[transition.currentConfidence]}
              </dd>
            </div>
            <div>
              <dt className="inline font-semibold text-slate-950">Observed: </dt>
              <dd className="inline">
                {formatObservationTime(transition.currentObservationTime)}
              </dd>
            </div>
          </dl>
          <EvidenceList
            evidence={transition.afterEvidence}
            emptyText="No current structured evidence was stored."
          />
        </section>
      </div>
    </article>
  );
}

export function VerificationLoop({ verification }: VerificationLoopProps) {
  const summary = summarizeVerificationTransitions(verification.transitions);
  const changedTransitions = verification.transitions.filter(hasMeaningfulChange);
  const summaryItems = [
    ["Fixed and verified", summary.fixedAndVerified, "border-teal-200 bg-teal-50 text-teal-950"],
    ["Observed pass", summary.observedPass, "border-blue-200 bg-blue-50 text-blue-950"],
    ["Regressed", summary.regressed, "border-rose-200 bg-rose-50 text-rose-950"],
    ["Still needs work", summary.stillNeedsWork, "border-amber-200 bg-amber-50 text-amber-950"],
    ["New finding", summary.newFindings, "border-slate-200 bg-slate-50 text-slate-950"],
  ] as const;

  return (
    <div className="mt-6 min-w-0">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-950">
          Evidence verification is separate from workflow status.
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Fixed manually, In progress, and Ignored never change these evidence-based results.
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {summaryItems.map(([label, value, className]) => (
          <article key={label} className={`rounded-xl border p-4 ${className}`}>
            <p className="text-sm font-semibold">{label}</p>
            <p className="mt-2 text-2xl font-black">{value}</p>
          </article>
        ))}
      </div>

      {changedTransitions.length > 0 ? (
        <div className="mt-5 grid min-w-0 gap-4">
          {changedTransitions.map((transition) => (
            <TransitionCard
              key={`${transition.previousReportId}:${transition.checkKey}`}
              transition={transition}
            />
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm leading-6 text-slate-600">
          No finding changed status or evidence confidence in this re-scan.
        </p>
      )}
    </div>
  );
}
