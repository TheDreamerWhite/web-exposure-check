import Link from "next/link";

const problemCards = [
  {
    title: "Owners see labels, not meaning",
    text: "Most scanners show SPF, DMARC, HSTS, and CSP as technical labels. A restaurant owner or local shop needs to know what those labels mean for trust and reputation.",
  },
  {
    title: "Technicians need a clean handoff",
    text: "The person fixing the website needs specific instructions, not a screenshot of confusing scanner output.",
  },
  {
    title: "Agencies need proof of work",
    text: "After fixes are made, agencies and freelancers need a clear before-and-after report their clients can understand.",
  },
];

const solutionCards = [
  {
    title: "Plain-language explanations",
    text: "Explain what each public check means without asking the client to learn security terminology.",
  },
  {
    title: "Business impact and owner",
    text: "Show customer trust, website reputation, email fraud risk, responsible owner, fix difficulty, and estimated time.",
  },
  {
    title: "Technician instructions",
    text: "Generate copy-ready fix messages for the website host, developer, DNS administrator, or email provider.",
  },
  {
    title: "Before and after proof",
    text: "Re-scan after fixes, compare improvements, and export a client-ready PDF report.",
  },
];

const steps = [
  {
    title: "Scan a domain",
    text: "Run a first public check for a website you own, manage, or are authorized to assess.",
  },
  {
    title: "Read the business report",
    text: "See the score, risk level, customer impact, and a practical fix list written for non-technical owners.",
  },
  {
    title: "Send instructions",
    text: "Copy a clear message for the technician so the fix request is specific and actionable.",
  },
  {
    title: "Re-scan and export proof",
    text: "Save the report, re-scan later, compare what improved, and export a client-ready PDF.",
  },
];

const features = [
  "Business impact explanations",
  "Responsible owner guidance",
  "Fix difficulty and time estimates",
  "Copy-ready technician messages",
  "Saved report history",
  "Before and after comparisons",
  "Client-ready PDF downloads",
  "Agency dashboard foundation",
];

const solutionBullets = [
  "plain-language explanations",
  "business impact",
  "responsible owner",
  "fix steps",
  "copy-ready technician instructions",
  "before and after proof after re-scan",
  "PDF reports",
];

export default function Home() {
  return (
    <main className="dark-product-page min-h-screen">
      <section className="border-b border-slate-800 bg-[#111827]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:py-18 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-center lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-slate-300">
              Public beta
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Website security, explained clearly.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Scan public website exposure, understand the business impact, and
              get clear remediation steps.
            </p>
            <p className="mt-4 text-sm font-medium text-slate-400">
              Non-invasive public checks. No exploitation. No credentials
              required.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/demo"
                className="inline-flex items-center justify-center rounded-lg bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#115E59] focus:outline-none focus:ring-2 focus:ring-teal-200 focus:ring-offset-2 focus:ring-offset-[#111827]"
              >
                Scan website
              </Link>
              <Link
                href="/demo-report"
                className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View sample report
              </Link>
            </div>
          </div>

          <div className="rounded-[18px] border border-slate-200 bg-white p-5 text-slate-950 shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
            <h2 className="text-lg font-bold">Check a website</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Start with a clean public scan and readable report.
            </p>
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500">
              example.com
            </div>
            <Link
              href="/demo"
              className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#115E59]"
            >
              Scan website
            </Link>
            <p className="mt-4 text-xs leading-5 text-slate-500">
              Only scan websites you own, manage, or are authorized to assess.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-slate-500">
              The problem
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Small businesses need action, not jargon.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              A restaurant owner, local shop, freelancer, or agency client does
              not need a lecture on headers. They need to know what affects
              trust, who can fix it, and what to send next.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {problemCards.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:px-8">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-slate-500">
              The solution
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Turn technical checks into a report people can use.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Web Exposure Check is not a replacement for deeper security tools.
              It is the translation layer between small business owners and the
              people who maintain their websites.
            </p>
            <div className="mt-6 grid gap-2 text-sm leading-6 text-slate-700 sm:grid-cols-2">
              {solutionBullets.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold shadow-sm"
                >
                  {item}
                </div>
              ))}
            </div>
            <Link
              href="/demo-report"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#115E59] focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
            >
              See the report format
            </Link>
          </div>

          <div className="grid gap-4">
            {solutionCards.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-b border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-slate-500">
              How it works
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              From scan to client-ready proof in four steps.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((item, index) => (
              <article
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-b border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-slate-500">
              Pricing
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Start with a public scan, then save reports when you need history.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              The public beta supports first-pass checks without credentials.
              Account-based report history, comparison, and client-ready PDFs
              are available through the dashboard.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Public scan",
                text: "Run a non-invasive website exposure check without creating an account.",
              },
              {
                title: "Saved reports",
                text: "Sign in to keep scan history, compare improvements, and export reports.",
              },
              {
                title: "Agency workflow",
                text: "Prepare client-ready reports and technician handoffs for authorized domains.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-slate-500">
                Features
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Built for owners, agencies, and technicians.
              </h2>
            </div>
            <Link
              href="/features"
              className="text-sm font-semibold text-teal-800 transition hover:text-teal-950"
            >
              View scanner details
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature}
                className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-semibold leading-6 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_16px_50px_rgba(15,23,42,0.08)] lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
              <div>
                <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-slate-500">
                  Agency use case
                </p>
                <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  A reporting layer for web agencies and IT freelancers.
                </h2>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  Run a check before starting maintenance work, send the
                  technician notes, and re-scan after fixes to show the client
                  what changed. It is designed to support the conversation, not
                  scare the client.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  "Manage multiple client domains",
                  "Generate client-ready reports",
                  "Explain email fraud risk without deep DNS language",
                  "Track improvements after fixes",
                  "Export PDFs for follow-up",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-semibold leading-6 text-slate-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-slate-500">
              Responsible scope
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Public checks, clear reports, careful claims.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Web Exposure Check performs public, non-invasive checks for
              websites you own, manage, or are authorized to assess. It does not
              guarantee security and is not a replacement for a full security
              audit, penetration test, or code review.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center shadow-[0_16px_50px_rgba(15,23,42,0.08)] lg:p-12">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-slate-500">
              Start with one report
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Turn your next scan into something a client can understand.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Run a public scan, review the business report, send the technician
              message, and come back later to prove what improved.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/demo"
                className="inline-flex items-center justify-center rounded-lg bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#115E59] focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
              >
                Scan website
              </Link>
              <Link
                href="/demo-report"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
              >
                View sample report
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
