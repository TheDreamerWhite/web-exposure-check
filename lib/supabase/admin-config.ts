import "server-only";

import { getSupabasePublicConfig, isSupabaseConfigured } from "./config";

export type SupabaseAdminConfig = {
  url: string;
  secretKey: string;
};

export function isSupabaseAdminConfigured() {
  return Boolean(isSupabaseConfigured() && process.env.SUPABASE_SECRET_KEY);
}

export function getSupabaseAdminConfig(): SupabaseAdminConfig {
  const { url } = getSupabasePublicConfig();
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "Supabase admin access is not configured. Add SUPABASE_SECRET_KEY to .env.local for server-only admin tasks."
    );
  }

  return {
    url,
    secretKey,
  };
}
