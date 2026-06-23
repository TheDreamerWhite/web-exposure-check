create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id),
  constraint organization_members_role_check check (
    role in ('owner', 'admin', 'member')
  )
);

create table if not exists public.domains (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  domain text not null,
  monitoring_frequency text not null default 'manual',
  authorization_confirmed boolean not null default false,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, domain),
  constraint domains_frequency_check check (
    monitoring_frequency in ('manual', 'weekly', 'monthly')
  ),
  constraint domains_status_check check (status in ('active', 'paused'))
);

create table if not exists public.scan_results (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid not null references public.domains(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  domain text not null,
  score integer not null,
  risk_level text not null,
  checks jsonb not null,
  scanned_at timestamptz not null default now(),
  constraint scan_results_score_check check (score >= 0 and score <= 100)
);

create table if not exists public.findings (
  id uuid primary key default gen_random_uuid(),
  scan_result_id uuid not null references public.scan_results(id) on delete cascade,
  domain_id uuid not null references public.domains(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  check_key text not null,
  status text not null,
  severity text not null default 'medium',
  title text not null,
  description text,
  suggested_fix text,
  created_at timestamptz not null default now(),
  constraint findings_severity_check check (
    severity in ('low', 'medium', 'high')
  )
);

create index if not exists organization_members_user_id_idx
  on public.organization_members(user_id);

create index if not exists domains_organization_id_idx
  on public.domains(organization_id);

create index if not exists scan_results_domain_id_idx
  on public.scan_results(domain_id);

create index if not exists scan_results_organization_id_idx
  on public.scan_results(organization_id);

create index if not exists findings_domain_id_idx
  on public.findings(domain_id);

create index if not exists findings_organization_id_idx
  on public.findings(organization_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists domains_touch_updated_at on public.domains;

create trigger domains_touch_updated_at
before update on public.domains
for each row
execute function public.touch_updated_at();

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = org_id
      and user_id = auth.uid()
  );
$$;

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.domains enable row level security;
alter table public.scan_results enable row level security;
alter table public.findings enable row level security;

drop policy if exists "Members can view organizations" on public.organizations;
create policy "Members can view organizations"
on public.organizations
for select
to authenticated
using (owner_user_id = auth.uid() or public.is_org_member(id));

drop policy if exists "Users can create owned organizations" on public.organizations;
create policy "Users can create owned organizations"
on public.organizations
for insert
to authenticated
with check (owner_user_id = auth.uid());

drop policy if exists "Owners can update organizations" on public.organizations;
create policy "Owners can update organizations"
on public.organizations
for update
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

drop policy if exists "Members can view organization memberships" on public.organization_members;
create policy "Members can view organization memberships"
on public.organization_members
for select
to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "Owners can create their own membership" on public.organization_members;
create policy "Owners can create their own membership"
on public.organization_members
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.organizations
    where id = organization_id
      and owner_user_id = auth.uid()
  )
);

drop policy if exists "Members can view domains" on public.domains;
create policy "Members can view domains"
on public.domains
for select
to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "Members can create domains" on public.domains;
create policy "Members can create domains"
on public.domains
for insert
to authenticated
with check (
  public.is_org_member(organization_id)
  and authorization_confirmed = true
);

drop policy if exists "Members can update domains" on public.domains;
create policy "Members can update domains"
on public.domains
for update
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

drop policy if exists "Members can view scan results" on public.scan_results;
create policy "Members can view scan results"
on public.scan_results
for select
to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "Members can create scan results" on public.scan_results;
create policy "Members can create scan results"
on public.scan_results
for insert
to authenticated
with check (public.is_org_member(organization_id));

drop policy if exists "Members can view findings" on public.findings;
create policy "Members can view findings"
on public.findings
for select
to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "Members can create findings" on public.findings;
create policy "Members can create findings"
on public.findings
for insert
to authenticated
with check (public.is_org_member(organization_id));
