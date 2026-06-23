# Database Schema Plan

This project does not use a database or ORM yet. MVP 2.0 stores temporary
dashboard domain data in browser localStorage so the app structure can evolve
without introducing persistence too early.

When persistence is added, the schema should support multi-tenant SaaS use:
users, organizations, authorized domains, scan results, findings, reports, and
subscriptions.

## Immediate Tables

These tables are needed for MVP 2.1 database persistence.

### users

Stores authenticated people who can access the SaaS dashboard.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| email | text | Unique, required |
| name | text | Optional display name |
| created_at | timestamp | Required |
| updated_at | timestamp | Required |

### organizations

Stores business workspaces. A user can later belong to one or more
organizations through a membership table if role-based access is added.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| name | text | Required |
| owner_user_id | uuid | References users.id |
| created_at | timestamp | Required |
| updated_at | timestamp | Required |

### domains

Stores authorized domains for monitoring.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| organization_id | uuid | References organizations.id |
| domain_name | text | Required, normalized, unique per organization |
| monitoring_frequency | text | manual, weekly, monthly |
| authorization_confirmed | boolean | Required |
| status | text | active, paused, archived |
| created_at | timestamp | Required |
| updated_at | timestamp | Required |

### scan_results

Stores one saved scan for a domain.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| domain_id | uuid | References domains.id |
| score | integer | 0-100 |
| risk_level | text | Low Risk, Medium Risk, High Risk |
| checks_json | json | Compatible with current /api/scan checks shape |
| scan_source | text | manual, scheduled |
| started_at | timestamp | Required |
| completed_at | timestamp | Required |
| created_at | timestamp | Required |

### findings

Stores normalized issues derived from each scan result.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| scan_result_id | uuid | References scan_results.id |
| finding_key | text | ssl, spf, dmarc, hsts, csp, etc. |
| status | text | OK, Missing, Warning |
| severity | text | low, medium, high |
| explanation | text | User-facing risk explanation |
| remediation | text | Suggested fix |
| created_at | timestamp | Required |

## Future Tables

These tables can wait until reports, AI analysis, scheduling, and paid billing
are implemented.

### reports

Stores generated report artifacts or metadata.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| organization_id | uuid | References organizations.id |
| domain_id | uuid | References domains.id |
| scan_result_id | uuid | References scan_results.id |
| report_type | text | json, email, pdf |
| report_url | text | Optional storage location |
| summary | text | Human-readable summary |
| created_at | timestamp | Required |

### subscriptions

Stores billing state for paid SaaS plans.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| organization_id | uuid | References organizations.id |
| provider | text | stripe or future billing provider |
| provider_customer_id | text | Optional |
| provider_subscription_id | text | Optional |
| plan | text | free, starter, business |
| status | text | trialing, active, past_due, canceled |
| current_period_end | timestamp | Optional |
| created_at | timestamp | Required |
| updated_at | timestamp | Required |

## Later Additions

- organization_memberships for multi-user teams and roles
- scheduled_jobs for scan scheduling and retry state
- notification_preferences for email reports and alerts
- ai_analyses for AI-generated risk summaries and remediation plans
- audit_logs for compliance and account activity

## Current API Compatibility

The existing `/api/scan` success response should remain compatible:

```json
{
  "domain": "example.com",
  "score": 80,
  "riskLevel": "Low Risk",
  "checks": {}
}
```

When database persistence is added, `scan_results.checks_json` should preserve
the `checks` object from this response so the public scanner and SaaS dashboard
can share the same scan contract.
