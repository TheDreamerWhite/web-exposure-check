import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Explore the public exposure checks included in Web Exposure Check.",
};

const checks = [
  {
    title: "TLS certificate",
    text: "Detects whether the website can be reached securely over HTTPS with a valid certificate.",
  },
  {
    title: "HTTPS redirect",
    text: "Checks whether visitors using HTTP are sent to the encrypted version of the site.",
  },
  {
    title: "SPF record",
    text: "Looks for DNS authorization that helps prevent spoofed email using your domain.",
  },
  {
    title: "DMARC record",
    text: "Checks whether the domain publishes a policy for failed email authentication.",
  },
  {
    title: "HSTS header",
    text: "Reviews whether browsers are instructed to keep using HTTPS on future visits.",
  },
  {
    title: "CSP and framing headers",
    text: "Highlights common browser protections that reduce injection and clickjacking risk.",
  },
];

export default function FeaturesPage() {
  return (
    <main>
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
              Features
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
              Public checks with practical explanations
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              The scanner turns common public security signals into a score, a
              risk level, and suggested fixes that are easy to hand to a site
              owner, host, or developer.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {checks.map((check) => (
              <article
                key={check.title}
                className="rounded-lg border border-slate-200 bg-slate-50 p-6"
              >
                <h2 className="text-lg font-semibold text-slate-950">
                  {check.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{check.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-background px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">
              Ready to review a domain?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Start with a public scan, then prioritize the fixes that matter.
            </p>
          </div>
          <Link
            href="/scan"
            className="inline-flex items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
          >
            Start scan
          </Link>
        </div>
      </section>
    </main>
  );
}
