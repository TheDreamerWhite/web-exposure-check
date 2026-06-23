import Image from "next/image";
import Link from "next/link";

const highlights = [
  "TLS and HTTPS posture",
  "SPF and DMARC email protection",
  "HSTS, CSP, and frame protection headers",
];

const workflow = [
  {
    title: "Enter a domain",
    text: "Run a public check against the domain you own or administer.",
  },
  {
    title: "Review the risk",
    text: "See a simple score, risk level, and plain-language explanation.",
  },
  {
    title: "Act on fixes",
    text: "Use the suggested improvements as a first-pass hardening checklist.",
  },
];

const trustNotes = [
  "No account required",
  "Browser history stays local",
  "Compatible API response for integrations",
];

export default function Home() {
  return (
    <main>
      <section className="relative isolate overflow-hidden bg-white">
        <Image
          src="/scan-dashboard-preview.png"
          alt="Security scan dashboard preview"
          fill
          priority
          className="absolute inset-0 -z-20 object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white via-white/90 to-white/35" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-28 bg-gradient-to-t from-background to-transparent" />

        <div className="mx-auto flex min-h-[74vh] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-800">
              Website security scanner
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-normal text-slate-950 sm:text-6xl">
              Web Exposure Check
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-700">
              Check basic public exposure signals for a website in seconds,
              including TLS, email authentication, HTTPS redirects, and common
              security headers.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/scan"
                className="inline-flex items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
              >
                Start a scan
              </Link>
              <Link
                href="/features"
                className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white/85 px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:border-teal-700 hover:text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
              >
                View checks
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-slate-200 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
              Fast triage
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
              A clear first pass before deeper testing
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {workflow.map((item, index) => (
              <article
                key={item.title}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="grid size-10 place-items-center rounded-md bg-teal-50 text-sm font-black text-teal-800">
                  {index + 1}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-normal text-slate-950 sm:text-3xl">
              Built for responsible visibility
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              Web Exposure Check focuses on public configuration signals that
              website owners routinely need to verify. It is intentionally
              narrow, readable, and designed to support safer follow-up work.
            </p>
          </div>
          <div className="grid gap-3">
            {trustNotes.map((note) => (
              <div
                key={note}
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                {note}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
