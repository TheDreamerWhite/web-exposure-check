import { requireOrganizationContext } from "@/lib/dashboard/context";
import Link from "next/link";

const reportCards = [
  {
    title: "Weekly Security Summary",
    cadence: "Weekly placeholder",
    description:
      "A concise rollup of domain exposure changes, new findings, and risk movement.",
  },
  {
    title: "Monthly Executive Report",
    cadence: "Monthly placeholder",
    description:
      "A business-friendly summary for owners, operators, and leadership teams.",
  },
  {
    title: "Technical Remediation Report",
    cadence: "On demand placeholder",
    description:
      "A more detailed report for developers, agencies, and IT service providers.",
  },
];

export default async function ReportsPage() {
  const { organization } = await requireOrganizationContext();

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
          Report center
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">Reports</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Automated reports will summarize domain exposure, risk changes, and
          recommended actions.
        </p>
        {organization && (
          <p className="mt-2 text-xs font-medium text-slate-500">
            Workspace: {organization.name}
          </p>
        )}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard/history"
            className="inline-flex items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            Open saved reports
          </Link>
          <Link
            href="/dashboard/clients"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-teal-700 hover:text-teal-800"
          >
            View clients
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {reportCards.map((report) => (
          <article
            key={report.title}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              {report.cadence}
            </p>
            <h2 className="mt-3 text-xl font-bold text-slate-950">
              {report.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {report.description}
            </p>
            <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              Email reporting will be connected in a future phase.
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
        Reports will be generated only for authorized domains. Future email
        delivery must respect account permissions, unsubscribe preferences, and
        lawful monitoring boundaries.
      </section>
    </div>
  );
}
