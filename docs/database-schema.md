# Database Schema

MVP 2.1 uses Supabase Auth and Supabase Postgres. The SQL migration lives at
`supabase/migrations/001_saas_foundation.sql`.

Run that migration manually in the Supabase SQL editor for now. Generated
Supabase TypeScript types can replace the handwritten types in
`lib/types/database.ts` after the project is linked to a Supabase instance.

For production readiness, apply migrations in order and keep previously applied
migrations immutable. MVP 2.1.2 did not require a schema change, so there is no
`002_production_readiness_fixes.sql` migration.

## Row Level Security

RLS is enabled on all MVP 2.1 tables. Policies allow authenticated users to read
and write only rows belonging to organizations where they are members. The
`public.is_org_member(org_id uuid)` helper supports member-scoped policies.

The organization owner can also read the organization they created before the
owner membership row exists.

Current MVP tables covered by RLS:

- `organizations`
- `organization_members`
- `domains`
- `scan_results`
- `findings`

## users

Required: provided by Supabase Auth in MVP 2.1.

Purpose: authenticated people who can access the SaaS dashboard.

Important fields:

- `id`: Supabase Auth user ID
- `email`: login email
- Auth metadata and timestamps managed by Supabase

Notes: app tables reference `auth.users(id)` instead of creating a duplicate
`public.users` table in this MVP.

## organizations

Required: MVP 2.1.

Purpose: business workspaces that own domains, reports, billing, and team
membership.

Important fields:

- `id`: uuid primary key
- `name`: organization name
- `owner_user_id`: references `auth.users(id)`
- `created_at`: timestamp

Notes: most SaaS data is scoped by `organization_id`.

## organization_members

Required: MVP 2.1.

Purpose: links users to organizations with roles.

Important fields:

- `id`: uuid primary key
- `organization_id`: references `organizations(id)`
- `user_id`: references `auth.users(id)`
- `role`: owner, admin, member
- `created_at`: timestamp

Notes: `organization_id, user_id` is unique. Team invitations and finer role
permissions are future work.

## domains

Required: MVP 2.1.

Purpose: authorized business domains monitored by an organization.

Important fields:

- `id`: uuid primary key
- `organization_id`: references `organizations(id)`
- `domain`: normalized domain, unique per organization
- `monitoring_frequency`: manual, weekly, monthly
- `authorization_confirmed`: boolean
- `status`: active or paused
- `created_at`, `updated_at`: timestamps

Notes: domain verification is not implemented yet. Scheduled scanning should
wait for verification and rate-limit controls.

## scan_results

Required: MVP 2.1.

Purpose: stores each authenticated dashboard scan result.

Important fields:

- `id`: uuid primary key
- `domain_id`: references `domains(id)`
- `organization_id`: references `organizations(id)`
- `domain`: domain snapshot at scan time
- `score`: integer 0-100
- `risk_level`: Low Risk, Medium Risk, High Risk
- `checks`: JSONB copy of the compatible `/api/scan` checks object
- `scanned_at`: timestamp

Notes: public anonymous scans are still local to the browser unless run through
the authenticated dashboard scan route.

## findings

Required: MVP 2.1.

Purpose: normalized non-OK issues derived from saved scan results.

Important fields:

- `id`: uuid primary key
- `scan_result_id`: references `scan_results(id)`
- `domain_id`: references `domains(id)`
- `organization_id`: references `organizations(id)`
- `check_key`: ssl, spf, dmarc, hsts, csp, etc.
- `status`: Missing or Warning
- `severity`: low, medium, high
- `title`: user-facing finding title
- `description`: risk explanation
- `suggested_fix`: remediation suggestion
- `created_at`: timestamp

Notes: findings currently represent saved scan observations. Finding lifecycle,
resolution state, and deduplication are future work.

## domain_verifications

Required: future, MVP 2.2.

Purpose: stores proof that a customer controls or is authorized to monitor a
domain.

Important fields:

- `id`
- `domain_id`
- `method`: dns_txt, file, manual_review
- `token`
- `status`: pending, verified, failed, expired
- `verified_at`
- `created_at`, `updated_at`

Notes: verification should be required before scheduled scans and email reports.

## reports

Required: future, MVP 2.4.

Purpose: stores generated report metadata and summaries.

Important fields:

- `id`
- `organization_id`
- `domain_id`
- `scan_result_id`
- `report_type`
- `status`
- `summary`
- `report_url`
- `created_at`

Notes: reports may summarize one domain or an entire organization.

## report_deliveries

Required: future, MVP 2.4.

Purpose: tracks email or other report delivery attempts.

Important fields:

- `id`
- `report_id`
- `recipient_email`
- `delivery_provider`
- `status`
- `sent_at`
- `error_message`
- `created_at`

Notes: keep delivery history separate from report generation.

## subscriptions

Required: future, MVP 2.6.

Purpose: stores paid plan and billing provider state per organization.

Important fields:

- `id`
- `organization_id`
- `provider`
- `provider_customer_id`
- `provider_subscription_id`
- `plan`
- `status`
- `current_period_end`
- `created_at`, `updated_at`

Notes: plan limits should gate domains, schedules, reports, AI usage, team
seats, and history retention.

## audit_logs

Required: future, MVP 2.2 or MVP 2.7.

Purpose: records security-relevant account, domain, scan, and billing events.

Important fields:

- `id`
- `organization_id`
- `user_id`
- `event_type`
- `metadata_json`
- `created_at`

Notes: audit logs help prove authorized use and support future team management.
