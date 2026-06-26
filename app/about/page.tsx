import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn how Web Exposure Check turns public website checks into client-ready security reports.",
};

const principles = [
  "Translate public checks into business language.",
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
              Client-ready website security reports for small businesses
            </h1>
          </div>

          <div className="space-y-6 text-base leading-8 text-slate-600">
            <p>
              Web Exposure Check helps website owners and small agencies turn
              common public configuration checks into reports that business
              owners can understand and technicians can act on.
            </p>
            <p>
              The goal is not to replace a professional audit, penetration test,
              or code review. The goal is to make the first conversation clearer:
              what affects customer trust, who should fix it, and how to prove
              improvement after a re-scan.
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
