import { NewDomainForm } from "./new-domain-form";

export default function NewDomainPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
          Add domain
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          Add an authorized domain
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Domain records now save to Supabase and are scoped to your
          organization. Scheduled scans and verification workflows remain future
          phases.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <NewDomainForm />

        <aside className="space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Safety boundary</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Users should only add domains they own or are authorized to
              monitor. Automated scanning must respect lawful and authorized use.
            </p>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Scan scope</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Web Exposure Check performs basic external exposure checks, not
              intrusive penetration testing.
            </p>
          </section>
        </aside>
      </section>
    </div>
  );
}
