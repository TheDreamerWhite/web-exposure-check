import "server-only";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
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

export async function requireDashboardContext(): Promise<DashboardContext> {
  if (!isSupabaseConfigured()) {
    redirect("/login?message=supabase-config-required");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("organization_members")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: organization } = membership
    ? await supabase
        .from("organizations")
        .select("*")
        .eq("id", membership.organization_id)
        .maybeSingle()
    : { data: null };

  return {
    organization,
    membership,
    user: {
      id: user.id,
      email: user.email,
    },
  };
}
