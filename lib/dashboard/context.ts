import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  getSupabaseAuthCookieCount,
  logSupabaseAuthDebug,
} from "@/lib/supabase/auth-debug";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Organization,
  OrganizationMember,
} from "@/lib/types/database";

export type DashboardContext = {
  organization: Organization | null;
  membership: OrganizationMember | null;
  user: {
    id: string;
    email?: string;
  };
};

export type OrganizationDashboardContext = DashboardContext & {
  organization: Organization;
  membership: OrganizationMember;
};

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) {
    redirect("/login?message=supabase-config-required");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    const cookieStore = await cookies();

    logSupabaseAuthDebug("dashboard server auth check failed", {
      authCookieCount: getSupabaseAuthCookieCount(cookieStore.getAll()),
      hasError: Boolean(error),
      errorMessage: error?.message,
    });

    redirect("/login");
  }

  return {
    supabase,
    user,
  };
}

export async function getCurrentOrganization(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: membership } = await supabase
    .from("organization_members")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!membership) {
    const { data: ownedOrganization } = await supabase
      .from("organizations")
      .select("*")
      .eq("owner_user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!ownedOrganization) {
      return {
        membership: null,
        organization: null,
      };
    }

    const { data: repairedMembership } = await supabase
      .from("organization_members")
      .insert({
        organization_id: ownedOrganization.id,
        user_id: userId,
        role: "owner",
      })
      .select("*")
      .single();

    return {
      membership: repairedMembership,
      organization: repairedMembership ? ownedOrganization : null,
    };
  }

  const { data: organization } = membership
    ? await supabase
        .from("organizations")
        .select("*")
        .eq("id", membership.organization_id)
        .maybeSingle()
    : { data: null };

  return {
    membership,
    organization,
  };
}

export async function requireDashboardContext(): Promise<DashboardContext> {
  const { user } = await getCurrentUser();
  const { membership, organization } = await getCurrentOrganization(user.id);

  return {
    organization,
    membership,
    user: {
      id: user.id,
      email: user.email,
    },
  };
}

export async function requireOrganizationContext(): Promise<OrganizationDashboardContext> {
  const context = await requireDashboardContext();

  if (!context.organization || !context.membership) {
    redirect("/dashboard/onboarding");
  }

  return {
    ...context,
    organization: context.organization,
    membership: context.membership,
  };
}
