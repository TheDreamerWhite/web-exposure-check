import { requireDashboardContext } from "@/lib/dashboard/context";

export default async function SettingsPage() {
  const { organization, user } = await requireDashboardContext();

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
          Settings
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          Organization settings
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Settings are placeholders until editable organization preferences are
          added. Authentication and organization context now come from Supabase.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <form className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <label
              htmlFor="organizationName"
              className="text-sm font-semibold text-slate-950"
            >
              Organization name
            </label>
            <input
              id="organizationName"
              defaultValue={organization?.name || "Monitoring workspace"}
              className="mt-2 min-h-12 w-full rounded-md border border-slate-300 px-4 text-base text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div className="mt-5">
            <label
              htmlFor="notificationEmail"
              className="text-sm font-semibold text-slate-950"
            >
              Notification email
            </label>
            <input
              id="notificationEmail"
              type="email"
              placeholder="security@example.com"
              defaultValue={user.email || ""}
              className="mt-2 min-h-12 w-full rounded-md border border-slate-300 px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div className="mt-5">
            <label
              htmlFor="defaultFrequency"
              className="text-sm font-semibold text-slate-950"
            >
              Default scan frequency
            </label>
            <select
              id="defaultFrequency"
              defaultValue="manual"
              className="mt-2 min-h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            >
              <option value="manual">Manual only</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="mt-5">
            <label
              htmlFor="reportLanguage"
              className="text-sm font-semibold text-slate-950"
            >
              Report language
            </label>
            <select
              id="reportLanguage"
              defaultValue="en"
              className="mt-2 min-h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="zh">Chinese</option>
            </select>
          </div>

          <button
            type="button"
            disabled
            className="mt-6 rounded-md bg-slate-300 px-5 py-3 text-sm font-semibold text-slate-600"
          >
            Save settings
          </button>
        </form>

        <aside className="space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Persistence note</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              These controls do not save yet. Organization settings will become
              editable after the core persistence model settles.
            </p>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Legal boundary</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Automated scanning must be lawful, authorized, rate-limited, and
              scoped to domains the organization owns or is permitted to assess.
            </p>
          </section>
        </aside>
      </section>
    </div>
  );
}
