import { NextResponse, type NextRequest } from "next/server";
import { getAbsoluteAppUrl } from "@/lib/auth/redirects";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { logSupabaseAuthDebug } from "@/lib/supabase/auth-debug";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(
    getAbsoluteAppUrl("/login?loggedOut=true", request.nextUrl.origin)
  );

  if (isSupabaseConfigured()) {
    const supabase = createSupabaseRouteHandlerClient(request, response);
    const { error } = await supabase.auth.signOut();

    logSupabaseAuthDebug("logout signOut completed", {
      hasError: Boolean(error),
      errorMessage: error?.message,
    });
  }

  return response;
}

export async function POST(request: NextRequest) {
  return GET(request);
}
