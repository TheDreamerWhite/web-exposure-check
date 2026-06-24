import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAuthCookieCount } from "@/lib/supabase/auth-debug";
import { isSupabaseConfigured, getSupabasePublicConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/types/database";

export const runtime = "nodejs";

type CookieToSet = {
  name: string;
  value: string;
  options: Parameters<NextResponse["cookies"]["set"]>[2];
};

function getRequestHost(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "unknown"
  );
}

function setNoStore(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store");

  return response;
}

export async function GET(request: NextRequest) {
  const requestCookies = request.cookies.getAll();
  const cookieNames = requestCookies.map((cookie) => cookie.name).sort();
  const hasSupabaseCookies = getSupabaseAuthCookieCount(requestCookies) > 0;
  const basePayload = {
    hasSupabaseCookies,
    cookieNames,
    requestHost: getRequestHost(request),
  };

  if (!isSupabaseConfigured()) {
    return setNoStore(
      NextResponse.json({
        ...basePayload,
        hasUser: false,
        supabaseConfigured: false,
      })
    );
  }

  const cookiesToSet: CookieToSet[] = [];
  const headersToSet: Record<string, string> = {};
  const { url, publishableKey } = getSupabasePublicConfig();
  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return requestCookies;
      },
      setAll(nextCookies, headers) {
        cookiesToSet.push(...nextCookies);
        Object.assign(headersToSet, headers);
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const response = NextResponse.json({
    ...basePayload,
    hasUser: Boolean(user),
    supabaseConfigured: true,
  });

  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  Object.entries(headersToSet).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return setNoStore(response);
}
