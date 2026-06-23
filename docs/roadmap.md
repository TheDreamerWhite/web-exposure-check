# Product Roadmap

Web Exposure Check is moving from a public scanner into a paid SaaS platform for
small and medium-sized businesses that need continuous web exposure monitoring.

## MVP 1.x: Public Scanner

Status: complete.

- Public website pages
- Manual scanner at `/scan`
- API route at `/api/scan`
- SSL/TLS, HTTPS redirect, SPF, DMARC, HSTS, CSP, and frame-protection checks
- Result cards, score, risk level, suggested fixes, local history, copy report,
  and JSON export
- Health endpoint at `/api/health`

## MVP 2.0: SaaS Foundation

Status: current.

- Dashboard route at `/dashboard`
- Domain management UI
- Add domain form with authorization confirmation
- Domain detail placeholder
- LocalStorage-backed temporary domain records
- Future integration path from domain detail to `/scan?domain=example.com`
- Documentation for schema and product roadmap

## MVP 2.1: Database Persistence

- Add database and ORM or hosted database SDK
- Persist users, organizations, domains, scan results, findings, and reports
- Save manual scan results from domain detail pages
- Replace localStorage domain records with server-backed data
- Add basic access boundaries around organization data

## MVP 2.2: Scheduled Scanning

- Add weekly and monthly scheduled scans
- Create job records and retry behavior
- Store scan source as manual or scheduled
- Add pause/resume monitoring controls
- Add rate limiting and safe scanning boundaries

## MVP 2.3: Email Reporting

- Send scan summaries by email
- Add report frequency preferences
- Include critical findings and remediation links
- Add unsubscribe and notification controls
- Store generated report metadata

## MVP 2.4: AI Risk Analyst

- Generate plain-language risk summaries
- Prioritize findings by likely business impact
- Produce remediation guidance for non-specialist operators
- Preserve deterministic scan data separately from AI analysis
- Add review and safety boundaries for generated guidance

## MVP 2.5: Paid Subscriptions

- Add subscription billing provider integration
- Create free, starter, and business tiers
- Gate domain counts, scheduled scan frequency, report volume, and AI usage
- Add billing portal access
- Track subscription status per organization

## Product Principles

- Only scan domains the user owns or is authorized to assess.
- Keep scanning external and non-intrusive unless a future feature explicitly
  expands scope with clear consent and safeguards.
- Preserve the public `/api/scan` response contract while adding SaaS features.
- Make technical findings understandable to small business owners and operators.
