"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { getSafeRedirectPath } from "@/lib/auth/redirects";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type LoginFormProps = {
  configured: boolean;
  redirectTo: string;
};

export function LoginForm({ configured, redirectTo }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!configured || pending) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const nextPath = getSafeRedirectPath(
      String(formData.get("redirectTo") || redirectTo)
    );

    setError("");
    setMessage("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setPending(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (process.env.NODE_ENV === "development") {
        console.debug("[supabase-auth] browser sign-in completed", {
          hasSession: Boolean(data.session),
          hasUser: Boolean(data.user),
        });
      }

      setMessage("Signed in. Opening your dashboard...");
      router.replace(nextPath);
      router.refresh();
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
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

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800"
        >
          {error}
        </p>
      )}

      {message && (
        <p className="mt-4 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-900">
          {message}
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
