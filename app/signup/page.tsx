import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a Web Exposure Check monitoring workspace.",
};

export default function SignupPage() {
  const configured = isSupabaseConfigured();

  return (
    <main className="bg-slate-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
            SaaS foundation
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950">
            Create your monitoring workspace
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            MVP 2.1 adds Supabase Auth, organizations, and database-backed
            domain records. Scheduled scans, email reports, AI analysis, and
            billing remain future phases.
          </p>
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            Add only domains you own or are authorized to monitor. Automated
            scanning must remain lawful, authorized, and rate-limited.
          </div>
          {!configured && (
            <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-900">
              Supabase environment variables are missing. Add them to .env.local
              before creating local accounts.
            </div>
          )}
        </section>

        <SignupForm configured={configured} />
      </div>
    </main>
  );
}
