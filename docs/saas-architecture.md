# SaaS Architecture

Web Exposure Check is organized so the public scanner can keep working while the
paid SaaS platform grows behind authenticated dashboard routes.

## Public Marketing Website

The public routes explain the product and provide an anonymous manual scanner:

- `/`
- `/features`
- `/about`
- `/privacy`
- `/terms`
- `/scan`

The public scanner remains usable without an account and keeps the `/api/scan`
success response shape stable:

```json
{
  "domain": "example.com",
  "score": 80,
  "riskLevel": "Low Risk",
  "checks": {}
}
```

## Supabase Auth

MVP 2.1 adds Supabase Auth through:

- `/login`
- `/signup`
- `/logout`
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `proxy.ts`

`proxy.ts` refreshes sessions and redirects unauthenticated dashboard requests to
`/login`. Dashboard server code still verifies the current user before loading
or mutating organization data.

Supabase Auth redirect settings must match each deployed environment:

- Local Site URL: `http://localhost:3000`
- Local Additional Redirect URLs: `http://localhost:3000/**`
- Vercel Site URL: `https://your-vercel-domain.vercel.app`
- Vercel Additional Redirect URLs: `https://your-vercel-domain.vercel.app/**`
- Future custom domain redirect example: `https://app.webexposurecheck.com/**`

## SaaS Dashboard

The dashboard routes live under `/dashboard`:

- `/dashboard`
- `/dashboard/domains`
- `/dashboard/domains/new`
- `/dashboard/domains/[domainId]`
- `/dashboard/reports`
- `/dashboard/settings`
- `/dashboard/billing`

MVP 2.1 reads organizations, memberships, domains, scan results, and findings
from Supabase. Reports, settings, and billing remain placeholders with current
organization context.

## Scan API

`/api/scan` remains the anonymous public scanner. It calls
`lib/scan/run-scan.ts` and returns the compatible result shape.

Authenticated dashboard scans use:

- `POST /api/dashboard/domains/[domainId]/scan`

That route requires a signed-in user, loads the domain through RLS-protected
Supabase queries, runs the same scan engine, saves a `scan_results` row, and
saves `findings` rows for non-OK checks.

## Supabase Database

The MVP 2.1 database stores:

- organizations
- organization_members
- domains
- scan_results
- findings

The migration at `supabase/migrations/001_saas_foundation.sql` enables RLS on
all tables and adds policies scoped to organization members.

The current production readiness pass does not require a second migration. If a
future Supabase project has already run `001_saas_foundation.sql`, new schema
changes should be added as follow-up numbered migrations rather than rewriting
the existing migration in place.

## Vercel Runtime Configuration

Production deployments should configure these variables in Vercel Project
Settings -> Environment Variables:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`

`NEXT_PUBLIC_*` values are intentionally visible to browser code. The Supabase
secret key is server-only and is used only from files guarded by `server-only` or
from route handlers that never return secret values.

`/api/env-check` can be used as a safe deployment diagnostic. It returns boolean
presence checks for required environment variables and never returns their
contents.

## Future Scheduled Scanner

Scheduled scanning should run as a controlled background job, not from the
browser. Jobs should:

- scan only verified or explicitly authorized domains
- respect plan limits and rate limits
- record scan source as scheduled
- persist failures safely
- avoid repeated aggressive retries

## Future AI Risk Analyst

The AI risk analyst should consume persisted findings and scan history. It
should not replace deterministic scan results. AI output should be stored as a
separate analysis layer with clear timestamps, source scan references, and user
review expectations.

## Future Email Report Service

Email reports should summarize exposure changes, new findings, and recommended
actions. Report delivery should respect notification preferences, unsubscribe
requirements, account permissions, and organization ownership.

## Future Billing System

Billing should be organization-based. Plans can gate:

- domain count
- scheduled scan frequency
- report frequency
- AI analysis volume
- team access
- scan history retention

No real billing provider, API keys, or webhooks are included in MVP 2.1.

## Security And Authorization Boundaries

- Users should only monitor domains they own or are authorized to assess.
- The product performs basic external exposure checks, not intrusive penetration
  testing.
- Automated scanning must be lawful, authorized, rate-limited, and auditable.
- `SUPABASE_SECRET_KEY` must stay server-side only.
- No real secrets should be committed.
- Domain verification should be added before scheduled scanning is enabled.
