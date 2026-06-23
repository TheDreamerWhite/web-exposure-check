import { redirect } from "next/navigation";
import {
  getCurrentOrganization,
  getCurrentUser,
} from "@/lib/dashboard/context";
import { OnboardingForm } from "./onboarding-form";

export default async function DashboardOnboardingPage() {
  const { user } = await getCurrentUser();
  const { organization, membership } = await getCurrentOrganization(user.id);

  if (organization && membership) {
    redirect("/dashboard");
  }

  const metadataName =
    typeof user.user_metadata?.organization_name === "string"
      ? user.user_metadata.organization_name
      : "";

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
          Workspace setup
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          Create your organization workspace
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Your account is signed in, but no organization membership exists yet.
          Create a workspace before adding domains, saving scan results, or
          managing reports.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <OnboardingForm defaultOrganizationName={metadataName} />

        <aside className="space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Why this is needed</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Domains, scan results, findings, and future billing records are
              scoped to an organization so access stays clean and auditable.
            </p>
          </section>

          <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
            Only create a workspace for domains you own or are authorized to
            assess. This product performs basic external exposure checks, not
            intrusive penetration testing.
          </section>
        </aside>
      </section>
    </div>
  );
}
