create table if not exists public.scan_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  domain text not null,
  customer_name text,
  internal_note text,
  locale text not null default 'zh',
  score integer not null,
  risk_level text not null,
  scan_result jsonb not null,
  generated_report jsonb not null,
  finding_statuses jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scan_reports_score_check check (score >= 0 and score <= 100),
  constraint scan_reports_locale_check check (locale in ('zh', 'es', 'en'))
);

create table if not exists public.agency_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agency_name text,
  agency_email text,
  agency_website text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists scan_reports_user_id_idx
  on public.scan_reports(user_id);

create index if not exists scan_reports_user_domain_created_idx
  on public.scan_reports(user_id, domain, created_at desc);

create index if not exists scan_reports_user_customer_idx
  on public.scan_reports(user_id, customer_name);

create index if not exists agency_profiles_user_id_idx
  on public.agency_profiles(user_id);

drop trigger if exists scan_reports_touch_updated_at on public.scan_reports;

create trigger scan_reports_touch_updated_at
before update on public.scan_reports
for each row
execute function public.touch_updated_at();

drop trigger if exists agency_profiles_touch_updated_at on public.agency_profiles;

create trigger agency_profiles_touch_updated_at
before update on public.agency_profiles
for each row
execute function public.touch_updated_at();

alter table public.scan_reports enable row level security;
alter table public.agency_profiles enable row level security;

drop policy if exists "Users can view their own scan reports" on public.scan_reports;
create policy "Users can view their own scan reports"
on public.scan_reports
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can create their own scan reports" on public.scan_reports;
create policy "Users can create their own scan reports"
on public.scan_reports
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update their own scan reports" on public.scan_reports;
create policy "Users can update their own scan reports"
on public.scan_reports
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can view their own agency profile" on public.agency_profiles;
create policy "Users can view their own agency profile"
on public.agency_profiles
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can create their own agency profile" on public.agency_profiles;
create policy "Users can create their own agency profile"
on public.agency_profiles
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update their own agency profile" on public.agency_profiles;
create policy "Users can update their own agency profile"
on public.agency_profiles
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
