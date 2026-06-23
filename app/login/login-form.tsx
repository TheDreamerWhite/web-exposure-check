"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type AuthActionState } from "./actions";

type LoginFormProps = {
  configured: boolean;
  redirectTo: string;
};

const initialState: AuthActionState = {};

export function LoginForm({ configured, redirectTo }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <div>
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
          autoComplete="current-password"
          disabled={!configured || pending}
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
        {pending ? "Signing in..." : "Sign in"}
      </button>

      <p className="mt-5 text-center text-sm text-slate-600">
        New to Web Exposure Check?{" "}
        <Link href="/signup" className="font-semibold text-teal-800 hover:text-teal-950">
          Create an account
        </Link>
      </p>
    </form>
  );
}
