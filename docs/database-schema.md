# Database Schema Plan

MVP 2.0 does not connect to a real database. The dashboard uses localStorage only
for UI demonstration. This schema plan describes the future database needed for
authentication, organizations, domain monitoring, historical scan results,
reporting, billing, and auditability.

## users

Required: future, MVP 2.1.

Purpose: authenticated people who can access the SaaS dashboard.

Important fields:

- `id`: primary key
- `email`: unique login email
- `name`: display name
- `email_verified_at`: optional verification timestamp
- `created_at`, `updated_at`: timestamps

Notes: keep user identity separate from organization membership so one user can
eventually belong to multiple workspaces.

## organizations

Required: future, MVP 2.1.

Purpose: business workspaces that own domains, reports, billing, and team
membership.

Important fields:

- `id`: primary key
- `name`: organization name
- `owner_user_id`: initial owner reference
- `created_at`, `updated_at`: timestamps

Notes: most SaaS data should be scoped by `organization_id`.

## organization_members

Required: future, MVP 2.1 or MVP 2.7.

Purpose: links users to organizations with roles.

Important fields:

- `id`: primary key
- `organization_id`: references organizations
- `user_id`: references users
- `role`: owner, admin, viewer
- `invited_at`, `joined_at`: timestamps
- `created_at`, `updated_at`: timestamps

Notes: use this for dashboard authorization and team management.

## domains

Required: future, MVP 2.1.

Purpose: authorized business domains monitored by an organization.

Important fields:

- `id`: primary key
- `organization_id`: references organizations
- `domain_name`: normalized domain, unique per organization
- `monitoring_frequency`: manual, weekly, monthly
- `status`: active, paused, archived
- `authorization_confirmed`: boolean
- `created_by_user_id`: references users
- `created_at`, `updated_at`: timestamps

Notes: do not enable scheduled scanning until authorization and verification
rules are in place.

## domain_verifications

Required: future, MVP 2.2.

Purpose: stores proof that a customer controls or is authorized to monitor a
domain.

Important fields:

- `id`: primary key
- `domain_id`: references domains
- `method`: dns_txt, file, manual_review
- `token`: verification token
- `status`: pending, verified, failed, expired
- `verified_at`: optional timestamp
- `created_at`, `updated_at`: timestamps

Notes: verification should be required before scheduled scans and email reports.

## scan_results

Required: future, MVP 2.1.

Purpose: stores each manual or scheduled scan result.

Important fields:

- `id`: primary key
- `domain_id`: references domains
- `score`: integer 0-100
- `risk_level`: Low Risk, Medium Risk, High Risk
- `checks_json`: JSON copy of the `/api/scan` checks object
- `scan_source`: manual or scheduled
- `started_at`, `completed_at`: timestamps
- `created_at`: timestamp

Notes: preserve the current `/api/scan` shape so the public scanner and SaaS
dashboard can share the same scan contract.

## findings

Required: future, MVP 2.1.

Purpose: normalized issues derived from scan results.

Important fields:

- `id`: primary key
- `scan_result_id`: references scan_results
- `domain_id`: references domains
- `finding_key`: ssl, spf, dmarc, hsts, csp, etc.
- `status`: OK, Missing, Warning
- `severity`: low, medium, high
- `explanation`: user-facing risk explanation
- `remediation`: suggested fix
- `created_at`: timestamp

Notes: findings power dashboards, reports, and AI risk summaries.

## reports

Required: future, MVP 2.4.

Purpose: stores generated report metadata and summaries.

Important fields:

- `id`: primary key
- `organization_id`: references organizations
- `domain_id`: optional domain reference
- `scan_result_id`: optional scan result reference
- `report_type`: weekly_summary, monthly_executive, technical_remediation
- `status`: draft, generated, delivered, failed
- `summary`: human-readable summary
- `report_url`: optional storage URL
- `created_at`: timestamp

Notes: reports may summarize one domain or an entire organization.

## report_deliveries

Required: future, MVP 2.4.

Purpose: tracks email or other report delivery attempts.

Important fields:

- `id`: primary key
- `report_id`: references reports
- `recipient_email`: delivery target
- `delivery_provider`: email provider name
- `status`: queued, sent, failed
- `sent_at`: optional timestamp
- `error_message`: optional failure detail
- `created_at`: timestamp

Notes: keep delivery history separate from report generation.

## subscriptions

Required: future, MVP 2.6.

Purpose: stores paid plan and billing provider state per organization.

Important fields:

- `id`: primary key
- `organization_id`: references organizations
- `provider`: stripe or future provider
- `provider_customer_id`: billing customer ID
- `provider_subscription_id`: subscription ID
- `plan`: trial, pro, business
- `status`: trialing, active, past_due, canceled
- `current_period_end`: optional timestamp
- `created_at`, `updated_at`: timestamps

Notes: plan limits should gate domains, schedules, reports, AI usage, and
retention.

## audit_logs

Required: future, MVP 2.2 or MVP 2.7.

Purpose: records security-relevant account, domain, scan, and billing events.

Important fields:

- `id`: primary key
- `organization_id`: references organizations
- `user_id`: optional actor reference
- `event_type`: domain_added, scan_started, report_sent, billing_updated, etc.
- `metadata_json`: event details
- `created_at`: timestamp

Notes: audit logs help prove authorized use and support future team management.
