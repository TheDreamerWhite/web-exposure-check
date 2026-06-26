export const READER_USER_AGENT =
  "WebExposureCheck/0.1 (+public evidence fetch)";

export const MAX_REDIRECTS = 5;
export const HOMEPAGE_MAX_BYTES = 1024 * 1024;
export const ROBOTS_MAX_BYTES = 256 * 1024;
export const SITEMAP_MAX_BYTES = 2 * 1024 * 1024;
export const HOMEPAGE_TIMEOUT_MS = 10000;
export const ROBOTS_TIMEOUT_MS = 8000;
export const SITEMAP_TIMEOUT_MS = 10000;
export const MAX_INTERNAL_LINKS = 20;
export const MAX_EXTERNAL_LINKS = 10;
export const MAX_SITEMAP_URLS = 30;

export const SAFE_RESPONSE_HEADER_ALLOWLIST = [
  "content-type",
  "content-length",
  "cache-control",
  "server",
  "x-powered-by",
  "content-security-policy",
  "strict-transport-security",
  "x-frame-options",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
  "x-robots-tag",
] as const;

