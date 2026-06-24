type CookieLike = {
  name: string;
};

export function getSupabaseAuthCookieCount(cookies: CookieLike[]) {
  return cookies.filter(
    (cookie) =>
      cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token")
  ).length;
}

export function logSupabaseAuthDebug(
  message: string,
  details: Record<string, unknown>
) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  console.debug(`[supabase-auth] ${message}`, details);
}
