import type { WebsiteReadResult } from "@/lib/reader/types";

type WebsiteReadingEvidenceProps = {
  websiteReadResult?: WebsiteReadResult | null;
  className?: string;
};

function compactUrl(value: string) {
  if (!value) {
    return "Not available";
  }

  try {
    const url = new URL(value);

    return `${url.hostname}${url.pathname === "/" ? "" : url.pathname}`;
  } catch {
    return value;
  }
}

function EvidenceList({
  items,
  emptyText,
}: {
  items: string[];
  emptyText: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm leading-6 text-slate-500">{emptyText}</p>;
  }

  return (
    <ul className="space-y-2 text-sm leading-6 text-slate-700">
      {items.map((item) => (
        <li key={item} className="break-words rounded-lg bg-white px-3 py-2">
          {item}
        </li>
      ))}
    </ul>
  );
}

function statusLabel(status: number | null, ok: boolean) {
  if (status === null) {
    return "Not read";
  }

  return ok ? `${status} read successfully` : `${status} returned`;
}

export function WebsiteReadingEvidence({
  websiteReadResult,
  className = "",
}: WebsiteReadingEvidenceProps) {
  if (!websiteReadResult) {
    return null;
  }

  const homepage = websiteReadResult.homepage;
  const headerEntries = Object.entries(homepage.headers);
  const h1Headings = homepage.h1.length > 0 ? homepage.h1 : ["No H1 heading found."];
  const notes = [
    ...websiteReadResult.evidence.notes,
    ...websiteReadResult.errors.map((error) => `Reader note: ${error}`),
  ];

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-800">
            Website reading evidence
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">
            Public evidence read for this report
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            These are the public pages and signals read during this scan, so the
            report is based on visible evidence rather than a blind guess.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-950">Homepage read</p>
          <p className="mt-2 text-2xl font-black text-slate-950">
            {statusLabel(homepage.status, homepage.ok)}
          </p>
          <p className="mt-2 break-words text-sm leading-6 text-slate-600">
            {compactUrl(homepage.finalUrl || homepage.requestedUrl)}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-950">Page summary</p>
          <dl className="mt-4 space-y-3 text-sm leading-6">
            <div>
              <dt className="font-semibold text-slate-500">Final URL</dt>
              <dd className="break-words text-slate-800">
                {homepage.finalUrl || "Not available"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Content type</dt>
              <dd className="text-slate-800">
                {homepage.contentType || "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Page title</dt>
              <dd className="text-slate-800">
                {homepage.title || "No title found"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Meta description</dt>
              <dd className="text-slate-800">
                {homepage.metaDescription || "No meta description found"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Canonical URL</dt>
              <dd className="break-words text-slate-800">
                {homepage.canonicalUrl || "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">HTML language</dt>
              <dd className="text-slate-800">
                {homepage.htmlLang || "Not declared"}
              </dd>
            </div>
          </dl>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-950">
            Site files checked
          </p>
          <dl className="mt-4 space-y-3 text-sm leading-6">
            <div>
              <dt className="font-semibold text-slate-500">robots.txt</dt>
              <dd className="text-slate-800">
                {websiteReadResult.robots.found
                  ? `Found (${websiteReadResult.robots.status})`
                  : `Not found or unavailable (${websiteReadResult.robots.status ?? "no response"})`}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Sitemap</dt>
              <dd className="text-slate-800">
                {websiteReadResult.sitemap.found
                  ? `${websiteReadResult.sitemap.urls.length} URLs discovered`
                  : "No readable sitemap found"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Headers collected</dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {headerEntries.length === 0 ? (
                  <span className="text-slate-500">No public headers collected.</span>
                ) : (
                  headerEntries.map(([name]) => (
                    <span
                      key={name}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      {name}
                    </span>
                  ))
                )}
              </dd>
            </div>
          </dl>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-950">H1 headings</p>
          <div className="mt-4">
            <EvidenceList items={h1Headings} emptyText="No H1 heading found." />
          </div>
        </article>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-950">
            Internal links found
          </p>
          <div className="mt-4">
            <EvidenceList
              items={homepage.internalLinks}
              emptyText="No internal links were collected from the homepage."
            />
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-950">
            External links sample
          </p>
          <div className="mt-4">
            <EvidenceList
              items={homepage.externalLinksSample}
              emptyText="No external links were sampled from the homepage."
            />
          </div>
        </article>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-950">Pages read</p>
          <div className="mt-4">
            <EvidenceList
              items={websiteReadResult.evidence.pagesRead}
              emptyText="No pages were read."
            />
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-950">
            Pages discovered
          </p>
          <div className="mt-4">
            <EvidenceList
              items={websiteReadResult.evidence.pagesDiscovered}
              emptyText="No additional public pages were discovered."
            />
          </div>
        </article>
      </div>

      {notes.length > 0 && (
        <article className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-950">Notes</p>
          <div className="mt-4">
            <EvidenceList items={notes} emptyText="No reader notes." />
          </div>
        </article>
      )}
    </section>
  );
}

