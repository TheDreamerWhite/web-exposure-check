import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { logSupabaseAuthDebug } from "./auth-debug";
import { getSupabasePublicConfig } from "./config";
import type { Database } from "@/lib/types/database";

export async function createSupabaseServerClient() {
  const { url, publishableKey } = getSupabasePublicConfig();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          logSupabaseAuthDebug("server client could not set auth cookies", {
            cookieCount: cookiesToSet.length,
            errorMessage:
              error instanceof Error ? error.message : "Unknown cookie error",
          });

          // Server Components cannot set cookies during render. Proxy refreshes
          // sessions before protected dashboard pages render.
        }
      },
    },
  });
}
