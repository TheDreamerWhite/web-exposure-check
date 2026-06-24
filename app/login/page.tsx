import type { Metadata } from "next";
import { getSafeRedirectPath } from "@/lib/auth/redirects";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to the Web Exposure Check monitoring dashboard.",
};

type LoginPageProps = {
  searchParams: Promise<{
    redirectTo?: string;
    message?: string;
    loggedOut?: string;
  }>;
};

function getPageMessage(message?: string, loggedOut?: string) {
  if (loggedOut) {
    return "You have been signed out.";
  }

  if (message === "supabase-config-required") {
    return "Supabase is not configured yet. Add the required variables to .env.local before using the dashboard.";
  }

  if (message === "auth-code-missing") {
    return "The auth callback was missing a confirmation code. Try signing in again.";
  }

  if (message === "auth-callback-error") {
    return "Supabase could not complete the auth callback. Check your Auth redirect URL settings and try again.";
  }

  return "";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const configured = isSupabaseConfigured();
  const pageMessage = getPageMessage(params.message, params.loggedOut);

  return (
    <main className="bg-slate-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
            Secure workspace
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950">
            Sign in to your monitoring dashboard
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Dashboard access is now backed by Supabase Auth. Public scanning
            remains available without an account.
          </p>
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            Only monitor domains you own or are authorized to assess. This tool
            performs basic external exposure checks, not intrusive penetration
            testing.
          </div>
          {!configured && (
            <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-900">
              Add NEXT_PUBLIC_SUPABASE_URL and
              NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local to enable
              authentication locally.
            </div>
          )}
          {pageMessage && (
            <div className="mt-5 rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm leading-6 text-teal-900">
              {pageMessage}
            </div>
          )}
        </section>

        <LoginForm
          configured={configured}
          redirectTo={getSafeRedirectPath(params.redirectTo)}
        />
      </div>
    </main>
  );
}
