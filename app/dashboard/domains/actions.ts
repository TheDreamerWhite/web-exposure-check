"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireDashboardContext } from "@/lib/dashboard/context";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MonitoringFrequency } from "@/lib/types/database";
import {
  isValidDomainName,
  normalizeDomainName,
} from "../components/domain-storage";

export type NewDomainActionState = {
  error?: string;
  domainName?: string;
  frequency?: MonitoringFrequency;
  authorizationConfirmed?: boolean;
};

const validFrequencies = new Set<MonitoringFrequency>([
  "manual",
  "weekly",
  "monthly",
]);

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export async function addDomainAction(
  _previousState: NewDomainActionState,
  formData: FormData
): Promise<NewDomainActionState> {
  const frequencyValue = getString(formData, "frequency");
  const frequency = validFrequencies.has(frequencyValue as MonitoringFrequency)
    ? (frequencyValue as MonitoringFrequency)
    : "manual";
  const authorizationConfirmed = formData.get("authorizationConfirmed") === "on";
  const domainName = getString(formData, "domainName");
  const normalizedDomain = normalizeDomainName(domainName);

  const nextState = {
    domainName,
    frequency,
    authorizationConfirmed,
  };

  if (!normalizedDomain) {
    return {
      ...nextState,
      error: "Domain cannot be empty.",
    };
  }

  if (!isValidDomainName(normalizedDomain)) {
    return {
      ...nextState,
      error: "Enter a valid public domain, such as example.com.",
    };
  }

  if (!authorizationConfirmed) {
    return {
      ...nextState,
      error: "Confirm that you own or are authorized to monitor this domain.",
    };
  }

  const { organization } = await requireDashboardContext();

  if (!organization) {
    return {
      ...nextState,
      error: "Create or repair your organization before adding domains.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("domains").insert({
    organization_id: organization.id,
    domain: normalizedDomain,
    monitoring_frequency: frequency,
    authorization_confirmed: true,
    status: "active",
  });

  if (error) {
    return {
      ...nextState,
      error: error.code === "23505"
        ? "This domain is already in your monitoring list."
        : error.message,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/domains");
  redirect("/dashboard/domains");
}
