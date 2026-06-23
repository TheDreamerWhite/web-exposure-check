import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for Web Exposure Check.",
};

const terms = [
  {
    title: "Authorized use",
    text: "Use this tool only for domains you own, administer, or have explicit permission to test.",
  },
  {
    title: "Basic checks only",
    text: "Results are informational and limited to public configuration signals. They do not prove that a website is secure or insecure.",
  },
  {
    title: "No harmful activity",
    text: "Do not use the scanner to harass services, bypass controls, exploit systems, or perform unauthorized reconnaissance.",
  },
  {
    title: "No warranty",
    text: "The app is provided as-is. You are responsible for validating results and deciding which actions are appropriate for your environment.",
  },
];

export default function TermsPage() {
  return (
    <main className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
          Terms
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
          Terms of use
        </h1>
        <p className="mt-5 text-base leading-7 text-slate-600">
          These terms are written for responsible use of a lightweight public
          exposure checker. They are not legal advice.
        </p>

        <div className="mt-10 space-y-4">
          {terms.map((term) => (
            <section
              key={term.title}
              className="rounded-lg border border-slate-200 bg-slate-50 p-6"
            >
              <h2 className="text-lg font-semibold text-slate-950">
                {term.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{term.text}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
