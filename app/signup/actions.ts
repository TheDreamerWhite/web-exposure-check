"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SignupActionState = {
  error?: string;
  message?: string;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export async function signupAction(
  _previousState: SignupActionState,
  formData: FormData
): Promise<SignupActionState> {
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Supabase is not configured yet. Add your Supabase URL and publishable key to .env.local.",
    };
  }

  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const organizationName = getString(formData, "organizationName");

  if (!email || !password || !organizationName) {
    return {
      error: "Email, password, and organization name are required.",
    };
  }

  if (password.length < 8) {
    return {
      error: "Use a password with at least 8 characters.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        organization_name: organizationName,
      },
    },
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  if (!data.user || !data.session) {
    return {
      message:
        "Please confirm your email. Your workspace will be created when you first sign in.",
    };
  }

  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .insert({
      name: organizationName,
      owner_user_id: data.user.id,
    })
    .select("id")
    .single();

  if (organizationError || !organization) {
    return {
      error:
        organizationError?.message ||
        "Account created, but the organization could not be created.",
    };
  }

  const { error: memberError } = await supabase
    .from("organization_members")
    .insert({
      organization_id: organization.id,
      user_id: data.user.id,
      role: "owner",
    });

  if (memberError) {
    return {
      error:
        memberError.message ||
        "Account created, but organization membership could not be created.",
    };
  }

  redirect("/dashboard");
}
