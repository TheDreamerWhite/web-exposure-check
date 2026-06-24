import { NextResponse, type NextRequest } from "next/server";
import { getAbsoluteAppUrl, getSafeRedirectPath } from "@/lib/auth/redirects";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { logSupabaseAuthDebug } from "@/lib/supabase/auth-debug";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = getSafeRedirectPath(request.nextUrl.searchParams.get("next"));

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(
      getAbsoluteAppUrl(
        "/login?message=supabase-config-required",
        request.nextUrl.origin
      )
    );
  }

  if (!code) {
    logSupabaseAuthDebug("auth callback missing code", {
      pathname: request.nextUrl.pathname,
    });

    return NextResponse.redirect(
      getAbsoluteAppUrl("/login?message=auth-code-missing", request.nextUrl.origin)
    );
  }

  const response = NextResponse.redirect(
    getAbsoluteAppUrl(next, request.nextUrl.origin)
  );
  const supabase = createSupabaseRouteHandlerClient(request, response);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    logSupabaseAuthDebug("auth callback exchange failed", {
      errorMessage: error.message,
    });

    return NextResponse.redirect(
      getAbsoluteAppUrl(
        "/login?message=auth-callback-error",
        request.nextUrl.origin
      )
    );
  }

  logSupabaseAuthDebug("auth callback exchange completed", {
    next,
  });

  return response;
}
