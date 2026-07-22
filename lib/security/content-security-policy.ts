export type SecurityHeader = {
  key: string;
  value: string;
};

export function createSecurityHeaders(input: {
  supabaseUrl?: string;
  environment?: string;
}): SecurityHeader[] {
  return [
    {
      key: "Content-Security-Policy",
      value: buildContentSecurityPolicy(input),
    },
    {
      key: "X-Frame-Options",
      value: "SAMEORIGIN",
    },
  ];
}

export function buildContentSecurityPolicy(input: {
  supabaseUrl?: string;
  environment?: string;
}): string {
  const scriptSources = ["'self'", "'unsafe-inline'"];
  if (input.environment === "development") {
    scriptSources.push("'unsafe-eval'");
  }

  const connectSources = ["'self'", ...getSupabaseConnectSources(input.supabaseUrl)];
  const directives = [
    ["default-src", "'self'"],
    ["base-uri", "'self'"],
    ["object-src", "'none'"],
    ["frame-ancestors", "'self'"],
    ["frame-src", "'none'"],
    ["form-action", "'self'"],
    ["script-src", ...scriptSources],
    ["style-src", "'self'", "'unsafe-inline'"],
    ["font-src", "'self'", "data:"],
    ["img-src", "'self'", "data:", "blob:", "https:"],
    ["connect-src", ...connectSources],
    ["media-src", "'self'"],
    ["manifest-src", "'self'"],
    ["worker-src", "'self'", "blob:"],
  ];

  return `${directives.map((directive) => directive.join(" ")).join("; ")};`;
}

export function getSupabaseConnectSources(value: string | undefined): string[] {
  if (!value?.trim()) return [];

  try {
    const url = new URL(value.trim());
    if (
      url.protocol !== "https:" ||
      !url.hostname ||
      url.username ||
      url.password
    ) {
      return [];
    }
    return [url.origin];
  } catch {
    return [];
  }
}
