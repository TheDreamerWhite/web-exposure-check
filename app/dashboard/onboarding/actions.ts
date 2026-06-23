"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getCurrentOrganization,
  getCurrentUser,
} from "@/lib/dashboard/context";

export type OnboardingActionState = {
  error?: string;
  organizationName?: string;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export async function createWorkspaceAction(
  _previousState: OnboardingActionState,
  formData: FormData
): Promise<OnboardingActionState> {
  const organizationName = getString(formData, "organizationName");

  if (!organizationName) {
    return {
      organizationName,
      error: "Organization name is required.",
    };
  }

  if (organizationName.length > 120) {
    return {
      organizationName,
      error: "Organization name must be 120 characters or fewer.",
    };
  }

  const { supabase, user } = await getCurrentUser();
  const existing = await getCurrentOrganization(user.id);

  if (existing.organization && existing.membership) {
    redirect("/dashboard");
  }

  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .insert({
      name: organizationName,
      owner_user_id: user.id,
    })
    .select("id")
    .single();

  if (organizationError || !organization) {
    return {
      organizationName,
      error:
        organizationError?.message || "Unable to create the organization.",
    };
  }

  const { error: membershipError } = await supabase
    .from("organization_members")
    .insert({
      organization_id: organization.id,
      user_id: user.id,
      role: "owner",
    });

  if (membershipError) {
    return {
      organizationName,
      error:
        membershipError.message ||
        "Workspace created, but membership could not be saved.",
    };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
