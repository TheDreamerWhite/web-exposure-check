# Web Exposure Check

Web Exposure Check is evolving into a continuous web exposure monitoring SaaS
for small and medium-sized businesses. The long-term product goal is to help
SMEs create an account, add authorized business domains, run manual and
scheduled scans, store historical results, receive reports, get AI-assisted risk
analysis, and pay for monitoring plans based on domain count and scan/report
frequency.

The current public scanner checks a domain for HTTPS behavior, TLS certificate
health, email authentication records, and common browser security headers, then
returns a simple score, risk level, and suggested fixes.

This is a first-pass visibility tool. It is not a vulnerability scanner,
intrusive penetration test, or replacement for a professional security
assessment.

## Current Features

- Public website and scanner routes
- Manual scan dashboard at `/scan`
- Score display, risk explanation, check cards, and suggested fixes
- Local browser scan history with copy report and JSON export
- Checks for SSL/TLS, HTTPS redirect, SPF, DMARC, HSTS, CSP, and frame protection
- JSON API at `/api/scan`
- Health endpoint at `/api/health`
- SaaS dashboard shell at `/dashboard`
- LocalStorage-backed domain inventory for MVP 2.0 demonstration
- Reports, settings, and billing placeholder pages

## MVP 2.0 SaaS Architecture Foundation

MVP 2.0 adds the application structure for a future paid platform without
connecting real external services yet.

- Dashboard overview with monitored-domain, latest-scan, open-finding, and
  report-status cards
- Domain management routes:
  - `/dashboard/domains`
  - `/dashboard/domains/new`
  - `/dashboard/domains/[domainId]`
- Reports route at `/dashboard/reports`
- Settings route at `/dashboard/settings`
- Billing route at `/dashboard/billing`
- Authorization confirmation before adding a monitored domain
- Safety copy for lawful, authorized, rate-limited use
- Domain detail Run Scan link to `/scan?domain=example.com`
- Documentation for database schema, SaaS architecture, and roadmap

## Future SaaS Roadmap

- MVP 2.1: authentication and database persistence
- MVP 2.2: domain verification
- MVP 2.3: scheduled scanning
- MVP 2.4: email reports
- MVP 2.5: AI risk analyst
- MVP 2.6: subscription billing
- MVP 2.7: team and organization management

See [docs/roadmap.md](docs/roadmap.md),
[docs/database-schema.md](docs/database-schema.md), and
[docs/saas-architecture.md](docs/saas-architecture.md).

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
npm run build
```

Windows PowerShell equivalent:

```bash
npm.cmd run build
```

Run the production server after building:

```bash
npm run start
```

## Environment Variables

MVP 2.0 does not require real external service keys. Placeholder names are listed
in `.env.example` for future phases:

- `NEXT_PUBLIC_APP_URL`
- `DATABASE_URL`
- `AUTH_SECRET`
- `RESEND_API_KEY`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `CRON_SECRET`

Do not commit real secrets.

## Deployment Notes

Vercel can deploy this project from a connected GitHub repository. Before a
future deployment, verify the project locally with:

```bash
npm.cmd run build
```

Use `npm.cmd` on Windows if PowerShell blocks `npm.ps1`. The app uses Next.js
App Router routes, including the serverless-compatible scan handler at
`app/api/scan/route.ts`.

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

Successful response:

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

## Limitations

- MVP 2.0 dashboard domain data is stored in localStorage.
- Real authentication, database persistence, email, AI, cron, and billing are
  not implemented yet.
- Checks are limited to public DNS, TLS, redirect, and HTTP header signals.
- Results can be affected by DNS propagation, CDN behavior, redirects, bot
  blocking, and temporary network failures.
- A healthy score does not prove that a website is secure.
- A poor score does not prove active compromise.

## Ethical Usage Warning

Use this project only on domains you own, administer, or have explicit
permission to test. Automated scanning must be lawful, authorized, rate-limited,
and scoped to approved assets. Do not use it for harassment, unauthorized
reconnaissance, abuse of third-party services, or attempts to bypass controls.

For production security decisions, validate findings with qualified security
professionals and the owners of the systems being reviewed.
