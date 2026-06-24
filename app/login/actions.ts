"use server";

import { redirect } from "next/navigation";
import { getSafeRedirectPath } from "@/lib/auth/redirects";
import { logSupabaseAuthDebug } from "@/lib/supabase/auth-debug";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error?: string;
  message?: string;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Missing Supabase config: add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    };
  }

  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const redirectTo = getSafeRedirectPath(getString(formData, "redirectTo"));

  if (!email || !password) {
    return {
      error: "Email and password are required.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    logSupabaseAuthDebug("server action signInWithPassword failed", {
      errorMessage: error.message,
    });

    return {
      error: `signInWithPassword error: ${error.message}`,
    };
  }

  if (!data.session) {
    logSupabaseAuthDebug("server action signInWithPassword returned no session", {
      hasUser: Boolean(data.user),
    });

    return {
      error:
        "signInWithPassword completed, but no session was returned. Check Supabase Auth settings and cookie handling.",
    };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    logSupabaseAuthDebug("server action getUser failed after sign-in", {
      hasSession: Boolean(data.session),
      hasError: Boolean(userError),
      errorMessage: userError?.message,
    });

    return {
      error:
        userError?.message ||
        "A session was returned, but the signed-in user could not be verified.",
    };
  }

  logSupabaseAuthDebug("server action login succeeded", {
    userId: user.id,
    redirectTo,
  });

  redirect(redirectTo);
}
