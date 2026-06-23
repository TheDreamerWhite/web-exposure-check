# SaaS Architecture

Web Exposure Check is organized so the public scanner can keep working while the
paid SaaS platform is added gradually.

## Public Marketing Website

The public routes explain the product and provide a manual scanner:

- `/`
- `/features`
- `/about`
- `/privacy`
- `/terms`
- `/scan`

The public scanner should remain usable without an account. It is the top of the
funnel for future SaaS customers and should keep the `/api/scan` response shape
stable.

## SaaS Dashboard

The dashboard routes live under `/dashboard`:

- `/dashboard`
- `/dashboard/domains`
- `/dashboard/domains/new`
- `/dashboard/domains/[domainId]`
- `/dashboard/reports`
- `/dashboard/settings`
- `/dashboard/billing`

MVP 2.0 uses localStorage to demonstrate domain inventory and workflow shape.
Authentication, organization membership, and database-backed authorization are
future phases.

## Scan API

`/api/scan` is the current scanner API. Its compatible success shape is:

```json
{
  "domain": "example.com",
  "score": 80,
  "riskLevel": "Low Risk",
  "checks": {}
}
```

Future SaaS features should call this scanner or an extracted scan service, then
persist the same normalized scan result to the database.

## Future Database

The database will store users, organizations, domain inventory, verification
state, scan results, findings, reports, subscriptions, and audit logs. See
`docs/database-schema.md` for the proposed schema.

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

No real billing provider, API keys, or webhooks are included in MVP 2.0.

## Security And Authorization Boundaries

- Users should only monitor domains they own or are authorized to assess.
- The product performs basic external exposure checks, not intrusive penetration
  testing.
- Automated scanning must be lawful, authorized, rate-limited, and auditable.
- Secrets must remain server-side and should never be committed.
- Domain verification should be added before scheduled scanning is enabled.
