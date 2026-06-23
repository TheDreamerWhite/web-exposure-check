"use client";

import Link from "next/link";
import { useActionState } from "react";
import { addDomainAction, type NewDomainActionState } from "../actions";

const initialState: NewDomainActionState = {
  frequency: "manual",
};

export function NewDomainForm() {
  const [state, formAction, pending] = useActionState(
    addDomainAction,
    initialState
  );

  return (
    <form
      action={formAction}
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
          name="domainName"
          defaultValue={state.domainName || ""}
          placeholder="example.com"
          disabled={pending}
          className="mt-2 min-h-12 w-full rounded-md border border-slate-300 px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
          required
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
          name="frequency"
          defaultValue={state.frequency || "manual"}
          disabled={pending}
          className="mt-2 min-h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
        >
          <option value="manual">Manual only</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Scheduled scans are not active yet. Frequency is stored so the domain
          is ready for MVP 2.3.
        </p>
      </div>

      <label className="mt-6 flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
        <input
          type="checkbox"
          name="authorizationConfirmed"
          defaultChecked={state.authorizationConfirmed || false}
          disabled={pending}
          className="mt-1 size-4 accent-teal-700"
        />
        <span>
          I confirm that I own this domain or am authorized to monitor it.
        </span>
      </label>

      {state.error && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800"
        >
          {state.error}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
        >
          {pending ? "Adding domain..." : "Add Domain"}
        </button>
        <Link
          href="/dashboard/domains"
          className="rounded-md border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:border-teal-700 hover:text-teal-800"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
