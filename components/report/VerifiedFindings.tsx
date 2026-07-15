import {
  confidenceLabels,
  exposureLabels,
  priorityLabels,
  summarizeVerifiedFindings,
  verificationLabels,
} from "@/lib/findings/presentation";
import type {
  FindingConfidence,
  FindingExposure,
  FindingPriority,
  VerificationStatus,
  VerifiedFinding,
  VerifiedFindingsSnapshot,
} from "@/lib/findings/types";

type VerifiedFindingsOverviewProps = {
  snapshot: VerifiedFindingsSnapshot;
};

type VerifiedFindingDetailsProps = {
  finding: VerifiedFinding;
};

const confidenceClasses: Record<FindingConfidence, string> = {
  confirmed: "border-teal-200 bg-teal-50 text-teal-900",
  likely: "border-amber-200 bg-amber-50 text-amber-900",
  possible: "border-slate-200 bg-slate-50 text-slate-700",
};

const exposureClasses: Record<FindingExposure, string> = {
  externally_observable: "border-rose-200 bg-rose-50 text-rose-900",
  not_externally_observable: "border-teal-200 bg-teal-50 text-teal-900",
  unknown: "border-slate-200 bg-slate-50 text-slate-700",
};

const priorityClasses: Record<FindingPriority, string> = {
  fix_today: "border-rose-200 bg-rose-50 text-rose-900",
  fix_this_week: "border-amber-200 bg-amber-50 text-amber-900",
  schedule_later: "border-slate-200 bg-slate-50 text-slate-700",
  needs_more_evidence: "border-blue-200 bg-blue-50 text-blue-900",
  monitor: "border-teal-200 bg-teal-50 text-teal-900",
};

const verificationClasses: Record<VerificationStatus, string> = {
  not_verified: "border-slate-200 bg-white text-slate-700",
  observed_pass: "border-teal-200 bg-white text-teal-900",
  fixed_and_verified: "border-teal-200 bg-teal-50 text-teal-900",
  regressed: "border-rose-200 bg-rose-50 text-rose-900",
};

function formatObservedAt(value: string) {
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

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`w-fit rounded-md border px-2.5 py-1 text-xs font-bold ${className}`}>
      {label}
    </span>
  );
}

export function VerifiedFindingsOverview({
  snapshot,
}: VerifiedFindingsOverviewProps) {
  const summary = summarizeVerifiedFindings(snapshot);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-800">
            Evidence confidence
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">
            What is verified and what still needs proof
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Every scanner result is separated into evidence confidence, public
            exposure, action priority, and verification status. Confidence
            describes evidence quality, not vulnerability severity.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          A manual workflow status does not prove a fix. Only a successful
          follow-up observation can become <strong className="text-slate-950">Fixed and verified</strong>.
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-teal-200 bg-teal-50 p-4">
          <p className="text-sm font-semibold text-teal-900">Confirmed issues</p>
          <p className="mt-2 text-3xl font-black text-teal-950">
            {summary.confirmedIssues}
          </p>
        </article>
        <article className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">Need validation</p>
          <p className="mt-2 text-3xl font-black text-amber-950">
            {summary.needsValidation}
          </p>
        </article>
        <article className="rounded-xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm font-semibold text-rose-900">Publicly observable</p>
          <p className="mt-2 text-3xl font-black text-rose-950">
            {summary.externallyObservable}
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-700">Fixed and verified</p>
          <p className="mt-2 text-3xl font-black text-slate-950">
            {summary.fixedAndVerified}
          </p>
        </article>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
        <span className="rounded-md border border-rose-200 bg-white px-3 py-2">
          Fix today: {summary.priorities.fixToday}
        </span>
        <span className="rounded-md border border-amber-200 bg-white px-3 py-2">
          Fix this week: {summary.priorities.fixThisWeek}
        </span>
        <span className="rounded-md border border-blue-200 bg-white px-3 py-2">
          More evidence: {summary.priorities.needsMoreEvidence}
        </span>
        <span className="rounded-md border border-slate-200 bg-white px-3 py-2">
          Schedule later: {summary.priorities.scheduleLater}
        </span>
      </div>
    </section>
  );
}

export function VerifiedFindingDetails({ finding }: VerifiedFindingDetailsProps) {
  return (
    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap gap-2">
        <Badge
          label={confidenceLabels[finding.confidence]}
          className={confidenceClasses[finding.confidence]}
        />
        <Badge
          label={exposureLabels[finding.exposure]}
          className={exposureClasses[finding.exposure]}
        />
        <Badge
          label={priorityLabels[finding.priority]}
          className={priorityClasses[finding.priority]}
        />
        <Badge
          label={verificationLabels[finding.verificationStatus]}
          className={verificationClasses[finding.verificationStatus]}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            Why this priority
          </p>
          <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
            {finding.priorityReasons.map((reason) => (
              <li key={reason} className="flex gap-2">
                <span aria-hidden="true" className="font-bold text-teal-800">
                  -
                </span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            Priority score: {finding.priorityScore}/100. This is a workflow score,
            not a CVSS rating.
          </p>
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            Stored evidence
          </p>
          <div className="mt-2 space-y-2">
            {finding.evidence.map((evidence) => (
              <article key={evidence.id} className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-sm font-semibold text-slate-950">
                  {evidence.summary}
                </p>
                <dl className="mt-2 space-y-1 text-xs leading-5 text-slate-600">
                  <div>
                    <dt className="inline font-semibold text-slate-700">Source: </dt>
                    <dd className="inline break-all">
                      {evidence.url ? (
                        <a
                          href={evidence.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-teal-800 underline decoration-teal-300 underline-offset-2"
                        >
                          {evidence.source}
                        </a>
                      ) : (
                        evidence.source
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-slate-700">Value: </dt>
                    <dd className="inline break-all">{evidence.value}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-slate-700">Observed: </dt>
                    <dd className="inline">{formatObservedAt(evidence.observedAt)}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      </div>

      {finding.limitations.length > 0 && (
        <details className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <summary className="cursor-pointer font-semibold">
            Evidence limitations ({finding.limitations.length})
          </summary>
          <ul className="mt-3 space-y-2 leading-6">
            {finding.limitations.map((limitation) => (
              <li key={limitation}>{limitation}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
