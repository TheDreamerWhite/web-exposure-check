# Product Roadmap

Web Exposure Check is evolving from a public one-time scanner into a paid SaaS
platform for small and medium-sized businesses that need continuous web exposure
monitoring.

## MVP 1.x: Public Scanner

Status: complete.

- Public marketing website
- Manual scanner at `/scan`
- Scanner API at `/api/scan`
- SSL/TLS, HTTPS redirect, SPF, DMARC, HSTS, CSP, and frame-protection checks
- Score, risk level, result cards, suggested fixes, local history, copy report,
  and JSON export
- Health endpoint at `/api/health`

## MVP 2.0: SaaS Architecture Foundation

Status: complete.

- Dashboard shell at `/dashboard`
- Domain management UI
- Add-domain form with authorization confirmation
- Domain detail placeholder with scan integration path
- Reports, settings, and billing placeholder pages
- LocalStorage-only domain records for UI demonstration
- Documentation for database schema, roadmap, and SaaS architecture
- Environment variable placeholders only, with no real secrets

## MVP 2.1: Authentication And Database Persistence

Status: current.

- Add account creation and sign-in
- Add organizations and organization members
- Persist domain inventory
- Persist manual scan results and findings
- Replace localStorage with server-backed data
- Add basic role and ownership checks for dashboard data
- Add Supabase RLS policies so organization data is member-scoped
- Keep the public scanner available without an account

## MVP 2.2: Domain Verification

- Add DNS TXT or file-based domain verification
- Require verification before scheduled scans
- Track verification status and timestamps
- Add clear instructions for non-technical business users
- Keep authorization confirmations in audit history

## MVP 2.3: Scheduled Scanning

- Add weekly and monthly scheduled scans
- Add rate limits and retry controls
- Store scan source as manual or scheduled
- Pause or resume monitoring per domain
- Record failures without crashing dashboards or report jobs

## MVP 2.4: Email Reports

- Send weekly and monthly report emails
- Add report delivery history
- Add notification preferences
- Include risk changes, new findings, and recommended actions
- Respect unsubscribe and account access boundaries

## MVP 2.5: AI Risk Analyst

- Generate plain-language risk summaries
- Prioritize findings by likely business impact
- Produce remediation guidance for SMB operators
- Store AI output separately from deterministic scan data
- Add human-review language and safety boundaries

## MVP 2.6: Subscription Billing

- Integrate a billing provider
- Add trial, pro, and business plans
- Gate domain count, scheduled scan frequency, report volume, AI usage, and
  retention history
- Add billing portal access
- Track subscription state per organization

## MVP 2.7: Team And Organization Management

- Invite team members
- Add owner, admin, and viewer roles
- Add organization audit logs
- Add team-level notification preferences
- Prepare agency-style multi-client workflows

## Product Principles

- Users should only monitor domains they own or are authorized to assess.
- Automated scanning must be lawful, authorized, rate-limited, and auditable.
- The scan API response contract should remain stable while SaaS features grow.
- Deterministic scan data should stay separate from AI-generated analysis.
- Findings should be understandable to small business owners and operators.
