import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getAbsoluteAppUrl } from "@/lib/auth/redirects";
import {
  getSupabaseAuthCookieCount,
  logSupabaseAuthDebug,
} from "./auth-debug";
import { isSupabaseConfigured, getSupabasePublicConfig } from "./config";
import type { Database } from "@/lib/types/database";

const protectedPathPrefixes = ["/dashboard"];
const authPaths = new Set(["/login", "/signup"]);

function isProtectedPath(pathname: string) {
  return protectedPathPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function redirectToLogin(request: NextRequest) {
  const redirectUrl = getAbsoluteAppUrl("/login", request.nextUrl.origin);
  redirectUrl.searchParams.set(
    "redirectTo",
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  );

  return NextResponse.redirect(redirectUrl);
}

function markAuthResponse(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store");

  return response;
}

function copyCookieResponse(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });

  ["Cache-Control", "Expires", "Pragma"].forEach((header) => {
    const value = from.headers.get(header);

    if (value) {
      to.headers.set(header, value);
    }
  });

  return to;
}

export async function updateSupabaseSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!isSupabaseConfigured()) {
    if (isProtectedPath(pathname)) {
      const redirectUrl = getAbsoluteAppUrl("/login", request.nextUrl.origin);
      redirectUrl.searchParams.set("message", "supabase-config-required");

      return markAuthResponse(NextResponse.redirect(redirectUrl));
    }

    return NextResponse.next({
      request,
    });
  }

  const { url, publishableKey } = getSupabasePublicConfig();
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user && isProtectedPath(pathname)) {
    logSupabaseAuthDebug("proxy blocked unauthenticated dashboard request", {
      pathname,
      authCookieCount: getSupabaseAuthCookieCount(request.cookies.getAll()),
      hasError: Boolean(userError),
      errorMessage: userError?.message,
    });

    return markAuthResponse(copyCookieResponse(response, redirectToLogin(request)));
  }

  if (user && authPaths.has(pathname)) {
    logSupabaseAuthDebug("proxy redirected signed-in user away from auth page", {
      pathname,
      userId: user.id,
    });

    return markAuthResponse(
      copyCookieResponse(
        response,
        NextResponse.redirect(
          getAbsoluteAppUrl("/dashboard", request.nextUrl.origin)
        )
      )
    );
  }

  if (isProtectedPath(pathname) || authPaths.has(pathname)) {
    logSupabaseAuthDebug("proxy session check completed", {
      pathname,
      hasUser: Boolean(user),
      authCookieCount: getSupabaseAuthCookieCount(request.cookies.getAll()),
    });

    return markAuthResponse(response);
  }

  return response;
}
