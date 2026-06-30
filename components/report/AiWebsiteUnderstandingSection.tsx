import type { AiWebsiteUnderstanding } from "@/lib/ai/types";

type AiWebsiteUnderstandingSectionProps = {
  aiWebsiteUnderstanding?: AiWebsiteUnderstanding | null;
  className?: string;
};

function FieldList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-950">{title}</p>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function confidenceClasses(confidence: string) {
  if (confidence === "high") {
    return "border-teal-200 bg-teal-50 text-teal-900";
  }

  if (confidence === "medium") {
    return "border-amber-200 bg-amber-50 text-amber-950";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function AiWebsiteUnderstandingSection({
  aiWebsiteUnderstanding,
  className = "",
}: AiWebsiteUnderstandingSectionProps) {
  if (!aiWebsiteUnderstanding) {
    return null;
  }

  const evidenceUsed = aiWebsiteUnderstanding.evidenceUsed;

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-800">
            AI website understanding
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">
            Evidence-based business context
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            This summary is generated from the public pages, headers, links, and
            security checks shown in the evidence section.
          </p>
        </div>

        <div
          className={`rounded-2xl border p-4 ${confidenceClasses(
            aiWebsiteUnderstanding.websiteType.confidence
          )}`}
        >
          <p className="text-sm font-semibold opacity-80">Website type</p>
          <p className="mt-2 text-2xl font-black">
            {aiWebsiteUnderstanding.websiteType.label}
          </p>
          <p className="mt-2 text-sm font-semibold">
            {aiWebsiteUnderstanding.websiteType.confidence} confidence
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-lg font-bold text-slate-950">Business summary</h3>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {aiWebsiteUnderstanding.businessSummary}
          </p>
          <p className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
            {aiWebsiteUnderstanding.websiteType.reasoning}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-lg font-bold text-slate-950">Owner explanation</h3>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {aiWebsiteUnderstanding.ownerExplanation}
          </p>
        </article>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-lg font-bold text-slate-950">Trust signals</h3>
          {aiWebsiteUnderstanding.trustSignals.length === 0 ? (
            <p className="mt-3 text-sm leading-6 text-slate-500">
              No additional trust signals were generated from the observed
              evidence.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {aiWebsiteUnderstanding.trustSignals.map((signal) => (
                <div
                  key={`${signal.label}-${signal.evidence}`}
                  className="rounded-xl border border-teal-100 bg-white p-4"
                >
                  <p className="font-semibold text-slate-950">{signal.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {signal.evidence}
                  </p>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-lg font-bold text-slate-950">
            Potential concerns
          </h3>
          {aiWebsiteUnderstanding.potentialConcerns.length === 0 ? (
            <p className="mt-3 text-sm leading-6 text-slate-500">
              No additional concerns were generated from the observed evidence.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {aiWebsiteUnderstanding.potentialConcerns.map((concern) => (
                <div
                  key={`${concern.label}-${concern.evidence}`}
                  className="rounded-xl border border-amber-100 bg-white p-4"
                >
                  <p className="font-semibold text-slate-950">{concern.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {concern.businessImpact}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Evidence
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {concern.evidence}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    Suggested owner: {concern.suggestedOwner}
                  </p>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>

      <article className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-lg font-bold text-slate-950">Technician brief</h3>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
          {aiWebsiteUnderstanding.technicianBrief}
        </p>
      </article>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <FieldList title="Checks used" items={evidenceUsed.checks} />
        <FieldList title="Homepage fields used" items={evidenceUsed.homepage} />
        <FieldList title="Headers used" items={evidenceUsed.headers} />
        <FieldList title="Robots signals used" items={evidenceUsed.robots} />
        <FieldList title="Sitemap signals used" items={evidenceUsed.sitemap} />
        <FieldList title="Links used" items={evidenceUsed.links} />
      </div>

      {aiWebsiteUnderstanding.limitations.length > 0 && (
        <article className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-lg font-bold text-slate-950">Limitations</h3>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
            {aiWebsiteUnderstanding.limitations.map((limitation) => (
              <li key={limitation}>{limitation}</li>
            ))}
          </ul>
        </article>
      )}
    </section>
  );
}

