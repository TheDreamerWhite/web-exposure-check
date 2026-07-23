import assert from "node:assert/strict";
import test from "node:test";
import {
  buildContentSecurityPolicy,
  createSecurityHeaders,
  getSupabaseConnectSources,
} from "../../lib/security/content-security-policy";

const SUPABASE_URL = "https://project-ref.supabase.co";

test("security headers include CSP and preserve SAMEORIGIN", () => {
  const headers = createSecurityHeaders({
    supabaseUrl: SUPABASE_URL,
    environment: "production",
  });

  assert.equal(
    headers.find((header) => header.key === "X-Frame-Options")?.value,
    "SAMEORIGIN",
  );
  assert.ok(headers.some((header) => header.key === "Content-Security-Policy"));
});

test("production CSP includes required directives and excludes broad defaults", () => {
  const policy = buildContentSecurityPolicy({
    supabaseUrl: SUPABASE_URL,
    environment: "production",
  });

  for (const directive of [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "frame-src 'none'",
    "form-action 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data: blob: https:",
    `connect-src 'self' ${SUPABASE_URL}`,
    "media-src 'self'",
    "manifest-src 'self'",
    "worker-src 'self' blob:",
  ]) {
    assert.match(policy, new RegExp(escapeRegExp(directive)));
  }

  assert.doesNotMatch(policy, /default-src\s+\*/);
  assert.doesNotMatch(policy, /'unsafe-eval'/);
  assert.doesNotMatch(policy, /upgrade-insecure-requests/);
});

test("development CSP limits unsafe-eval to development", () => {
  const development = buildContentSecurityPolicy({ environment: "development" });
  const production = buildContentSecurityPolicy({ environment: "production" });

  assert.match(development, /script-src[^;]*'unsafe-eval'/);
  assert.doesNotMatch(production, /'unsafe-eval'/);
});

test("Supabase CSP source accepts only a safe HTTPS origin", () => {
  assert.deepEqual(
    getSupabaseConnectSources(`${SUPABASE_URL}/auth/v1?ignored=true`),
    [SUPABASE_URL],
  );
  assert.deepEqual(getSupabaseConnectSources(undefined), []);
  assert.deepEqual(getSupabaseConnectSources(""), []);

  for (const invalid of [
    "not-a-url",
    "http://project-ref.supabase.co",
    "javascript:alert(1)",
    "ftp://project-ref.supabase.co",
    "https://user:password@project-ref.supabase.co",
    "https://project-ref.supabase.co; connect-src *",
  ]) {
    assert.deepEqual(getSupabaseConnectSources(invalid), []);
  }
});

test("missing or invalid Supabase URL produces a valid self-only connect directive", () => {
  for (const supabaseUrl of [undefined, "invalid", "http://localhost:54321"]) {
    const policy = buildContentSecurityPolicy({
      supabaseUrl,
      environment: "production",
    });
    assert.match(policy, /connect-src 'self';/);
    assert.doesNotMatch(policy, /undefined|null|localhost:54321/);
  }
});

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
