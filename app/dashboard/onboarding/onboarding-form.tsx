"use client";

import { useActionState } from "react";
import {
  createWorkspaceAction,
  type OnboardingActionState,
} from "./actions";

type OnboardingFormProps = {
  defaultOrganizationName?: string;
};

export function OnboardingForm({
  defaultOrganizationName = "",
}: OnboardingFormProps) {
  const initialState: OnboardingActionState = {
    organizationName: defaultOrganizationName,
  };
  const [state, formAction, pending] = useActionState(
    createWorkspaceAction,
    initialState
  );

  return (
    <form
      action={formAction}
      className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <label
          htmlFor="organizationName"
          className="text-sm font-semibold text-slate-950"
        >
          Organization name
        </label>
        <input
          id="organizationName"
          name="organizationName"
          defaultValue={state.organizationName || defaultOrganizationName}
          placeholder="Acme Services"
          disabled={pending}
          className="mt-2 min-h-12 w-full rounded-md border border-slate-300 px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
          required
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 w-full rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
      >
        {pending ? "Creating workspace..." : "Create workspace"}
      </button>
    </form>
  );
}
