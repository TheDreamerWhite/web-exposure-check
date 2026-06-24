# Production Readiness

MVP 2.1.2 prepares Web Exposure Check for a future Vercel deployment with
Supabase Auth and Supabase Postgres. This document is a pre-deployment checklist;
it is not a deployment instruction to run from this branch.

## Current Status

- Public marketing pages and `/scan` are available without authentication.
- `/api/scan` remains the anonymous scan API with the compatible response shape.
- Supabase Auth protects `/dashboard` and nested dashboard routes.
- Authenticated users without an organization are routed to
  `/dashboard/onboarding`.
- Domains, dashboard scan results, and findings persist to Supabase.
- No email, AI, scheduled scan, or billing providers are connected yet.

## Local Supabase Setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local`.
3. Fill only local development values:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

Never commit `.env.local` or real secret values.

## Supabase Migration Checklist

Run migrations manually in the Supabase SQL editor until a migration tool is
introduced:

1. Open `supabase/migrations/001_saas_foundation.sql`.
2. Run the migration in the target Supabase project.
3. Confirm these tables exist:
   - `organizations`
   - `organization_members`
   - `domains`
   - `scan_results`
   - `findings`
4. Confirm Row Level Security is enabled on all five tables.
5. Confirm policies scope reads and writes to organization members.

MVP 2.1.2 does not require an additional SQL migration.

## Supabase Auth Redirect Checklist

Local development:

- Site URL: `http://localhost:3000`
- Additional Redirect URLs: `http://localhost:3000/**`

Vercel production:

- Site URL: `https://your-vercel-domain.vercel.app`
- Additional Redirect URLs: `https://your-vercel-domain.vercel.app/**`
- `NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app`

Future custom domain example:

- Additional Redirect URLs: `https://app.webexposurecheck.com/**`
- `NEXT_PUBLIC_APP_URL=https://production-domain.example`

## Vercel Environment Variable Checklist

Configure variables in Vercel Project Settings -> Environment Variables.

Production variables:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`

Future variables:

- `RESEND_API_KEY`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `CRON_SECRET`

`NEXT_PUBLIC_*` values are safe for browser exposure. `SUPABASE_SECRET_KEY` must
stay server-side and must not be imported by client components.

Optional diagnostic:

```text
GET /api/env-check
```

The diagnostic returns boolean presence checks only and does not return actual
environment variable values.

## Pre-Deployment Commands

Run these locally before any future deployment:

```bash
npm.cmd run lint
npm.cmd run build
```

## Post-Deployment Smoke Test Checklist

After a future deployment, check:

- `/`
- `/scan`
- `/login`
- `/signup`
- `/dashboard`
- `/dashboard/domains`
- `/api/health`
- `/api/scan`

Also verify:

- `/scan?domain=github.com` pre-fills the scanner input.
- Unauthenticated `/dashboard` requests redirect to `/login`.
- Authenticated users without an organization reach `/dashboard/onboarding`.
- New domains save only after authorization confirmation.
- Dashboard scans save `scan_results` and non-OK `findings`.
- `/api/env-check` returns booleans only.

## Known Limitations

- No domain verification yet.
- No scheduled scanning yet.
- No email reports yet.
- No AI analysis yet.
- No billing yet.
- Dashboard settings are still placeholders.
- Public scan results are not persisted unless run through an authenticated
  dashboard scan.
