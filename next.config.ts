import type { NextConfig } from "next";
import { createSecurityHeaders } from "./lib/security/content-security-policy";

const securityHeaders = createSecurityHeaders({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  environment: process.env.NODE_ENV,
});

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
