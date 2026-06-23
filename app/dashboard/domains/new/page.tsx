"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  createStoredDomain,
  type MonitoringFrequency,
} from "../../components/domain-storage";

export default function NewDomainPage() {
  const router = useRouter();
  const [domainName, setDomainName] = useState("");
  const [frequency, setFrequency] = useState<MonitoringFrequency>("manual");
  const [authorizationConfirmed, setAuthorizationConfirmed] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      createStoredDomain({
        name: domainName,
        frequency,
        authorizationConfirmed,
      });

      router.push("/dashboard/domains");
    } catch (domainError) {
      setError(
        domainError instanceof Error
          ? domainError.message
          : "Unable to add this domain."
      );
    }
  }

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
          This creates a temporary local record for MVP 2.0. Database-backed
          organizations, user ownership, and scheduled scans are planned next.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label
              htmlFor="domainName"
              className="text-sm font-semibold text-slate-950"
            >
              Domain name
            </label>
            <input
              id="domainName"
              value={domainName}
              onChange={(event) => setDomainName(event.target.value)}
              placeholder="example.com"
              className="mt-2 min-h-12 w-full rounded-md border border-slate-300 px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div className="mt-5">
            <label
              htmlFor="frequency"
              className="text-sm font-semibold text-slate-950"
            >
              Monitoring frequency
            </label>
            <select
              id="frequency"
              value={frequency}
              onChange={(event) =>
                setFrequency(event.target.value as MonitoringFrequency)
              }
              className="mt-2 min-h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            >
              <option value="manual">Manual only</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Scheduled scans are not active yet. Frequency is stored so the
              domain is ready for MVP 2.2.
            </p>
          </div>

          <label className="mt-6 flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            <input
              type="checkbox"
              checked={authorizationConfirmed}
              onChange={(event) => setAuthorizationConfirmed(event.target.checked)}
              className="mt-1 size-4 accent-teal-700"
            />
            <span>
              I confirm that I own this domain or am authorized to monitor it.
            </span>
          </label>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800"
            >
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
            >
              Add Domain
            </button>
            <Link
              href="/dashboard/domains"
              className="rounded-md border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:border-teal-700 hover:text-teal-800"
            >
              Cancel
            </Link>
          </div>
        </form>

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
