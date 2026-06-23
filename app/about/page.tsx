import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn why Web Exposure Check exists and how it approaches public security checks.",
};

const principles = [
  "Keep the checks public, narrow, and understandable.",
  "Explain risk without overstating certainty.",
  "Encourage responsible testing only on systems you own or administer.",
];

export default function AboutPage() {
  return (
    <main className="bg-white">
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
              About
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
              A lightweight scanner for first-pass visibility
            </h1>
          </div>

          <div className="space-y-6 text-base leading-8 text-slate-600">
            <p>
              Web Exposure Check helps website owners spot common public
              configuration gaps before they turn into avoidable risk. It
              focuses on visible signals such as HTTPS behavior, email
              authentication records, and browser-facing security headers.
            </p>
            <p>
              The goal is not to replace a professional audit, penetration test,
              or code review. The goal is to make the first conversation clearer:
              what looks healthy, what needs attention, and what should be
              investigated next.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-background px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-slate-950">Operating principles</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {principles.map((principle) => (
              <div
                key={principle}
                className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-medium leading-6 text-slate-700"
              >
                {principle}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
