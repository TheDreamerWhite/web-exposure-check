"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signupAction, type SignupActionState } from "./actions";

type SignupFormProps = {
  configured: boolean;
};

const initialState: SignupActionState = {};

export function SignupForm({ configured }: SignupFormProps) {
  const [state, formAction, pending] = useActionState(signupAction, initialState);

  return (
    <form action={formAction} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
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
          autoComplete="organization"
          disabled={!configured || pending}
          className="mt-2 min-h-12 w-full rounded-md border border-slate-300 px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
          placeholder="Acme Services"
          required
        />
      </div>

      <div className="mt-5">
        <label htmlFor="email" className="text-sm font-semibold text-slate-950">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          disabled={!configured || pending}
          className="mt-2 min-h-12 w-full rounded-md border border-slate-300 px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
          placeholder="you@example.com"
          required
        />
      </div>

      <div className="mt-5">
        <label htmlFor="password" className="text-sm font-semibold text-slate-950">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          disabled={!configured || pending}
          className="mt-2 min-h-12 w-full rounded-md border border-slate-300 px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
          minLength={8}
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

      {state.message && (
        <p className="mt-4 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-900">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={!configured || pending}
        className="mt-6 w-full rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
      >
        {pending ? "Creating account..." : "Create account"}
      </button>

      <p className="mt-5 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-teal-800 hover:text-teal-950">
          Sign in
        </Link>
      </p>
    </form>
  );
}
