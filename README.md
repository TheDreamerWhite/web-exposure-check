# Web Exposure Check

Web Exposure Check is evolving into a continuous web exposure monitoring SaaS
for small and medium-sized businesses. The product goal is to help SMEs create
an account, add authorized business domains, run manual and scheduled scans,
store historical results, receive automated reports, get AI-assisted risk
analysis, and pay for monitoring plans based on domain count and scan/report
frequency.

The public scanner checks a domain for HTTPS behavior, TLS certificate health,
email authentication records, and common browser security headers, then returns a
simple score, risk level, and suggested fixes.

This is a first-pass visibility tool. It is not a vulnerability scanner,
intrusive penetration test, or replacement for a professional security
assessment.

## Current Features

- Public website and anonymous scanner at `/scan`
- JSON scan API at `/api/scan`
- Health endpoint at `/api/health`
- Supabase Auth login and signup pages
- Protected SaaS dashboard under `/dashboard`
- Supabase-backed organizations, memberships, domains, scan results, and findings
- Domain management with authorization confirmation
- Authenticated dashboard scan route that persists scan results and findings
- Reports, settings, and billing placeholder pages
- Documentation for schema, architecture, roadmap, and Supabase setup

## MVP 2.1 Supabase Persistence

MVP 2.1 replaces the dashboard's localStorage-only data model with Supabase:

- `@supabase/supabase-js` and `@supabase/ssr`
- Supabase Auth for account creation and sign-in
- Supabase Postgres tables for organizations, members, domains, scan results,
  and findings
- Row Level Security policies that scope dashboard data to organization members
- Shared scan engine used by public `/api/scan` and dashboard scan persistence
- Protected dashboard routes using Next.js App Router and `proxy.ts`

## Supabase Setup

1. Create a Supabase project.
2. In the Supabase SQL editor, run:

```sql
-- paste the contents of supabase/migrations/001_saas_foundation.sql
```

3. Copy `.env.example` to `.env.local`.
4. Fill in the Supabase values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` may be used by browser/client code.
`SUPABASE_SECRET_KEY` must stay server-side only. Do not commit `.env.local`.

If email confirmation is enabled in Supabase Auth, signup may show a confirmation
message instead of immediately creating the organization. Confirm the email, sign
in, and repair/create the organization manually if needed during this MVP.

## Environment Variables

Placeholders are listed in `.env.example`:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `RESEND_API_KEY`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `CRON_SECRET`

Only the Supabase public URL/key are intended for client-side use. All service
keys must remain server-only.

## Local Development

Install dependencies:

```bash
npm install
```

Run the local development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

On Windows PowerShell, if script execution policy blocks `npm`, use the command
shim instead:

```bash
npm.cmd run dev
```

Create a production build:

```bash
npm.cmd run build
```

Run the production server after building:

```bash
npm.cmd run start
```

## API Usage

Endpoint:

```text
POST /api/scan
Content-Type: application/json
```

Request body:

```json
{
  "domain": "example.com"
}
```

Successful response shape remains compatible:

```json
{
  "domain": "example.com",
  "score": 80,
  "riskLevel": "Low Risk",
  "checks": {
    "ssl": "OK",
    "httpsRedirect": "OK",
    "spf": "Missing",
    "dmarc": "OK",
    "hsts": "OK",
    "csp": "Missing",
    "xFrameOptions": "OK"
  }
}
```

Invalid requests return JSON errors:

```json
{
  "error": "Please enter a valid public domain, such as example.com."
}
```

Authenticated dashboard scans use:

```text
POST /api/dashboard/domains/[domainId]/scan
```

That route requires a signed-in user who is a member of the domain's
organization. It persists `scan_results` and non-OK `findings`.

## Deployment Notes

Vercel can deploy this project from a connected GitHub repository. Before a
future deployment, verify locally with:

```bash
npm.cmd run lint
npm.cmd run build
```

Set Supabase environment variables in Vercel project settings. Do not expose
`SUPABASE_SECRET_KEY` to browser code.

## Roadmap

- MVP 2.2: domain verification
- MVP 2.3: scheduled scanning
- MVP 2.4: email reports
- MVP 2.5: AI risk analyst
- MVP 2.6: subscription billing
- MVP 2.7: team and organization management

See [docs/roadmap.md](docs/roadmap.md),
[docs/database-schema.md](docs/database-schema.md), and
[docs/saas-architecture.md](docs/saas-architecture.md).

## Limitations

- Supabase must be configured before auth and protected dashboard workflows work.
- Signup organization creation depends on immediate Supabase session availability.
- Domain verification is not implemented yet.
- Scheduled scanning, email reports, AI analysis, and Stripe billing are not
  implemented yet.
- Checks are limited to public DNS, TLS, redirect, and HTTP header signals.
- Results can be affected by DNS propagation, CDN behavior, redirects, bot
  blocking, and temporary network failures.
- A healthy score does not prove that a website is secure.

## Ethical Usage Warning

Use this project only on domains you own, administer, or have explicit
permission to test. Automated scanning must be lawful, authorized, rate-limited,
and scoped to approved assets. Do not use it for harassment, unauthorized
reconnaissance, abuse of third-party services, or attempts to bypass controls.

For production security decisions, validate findings with qualified security
professionals and the owners of the systems being reviewed.
