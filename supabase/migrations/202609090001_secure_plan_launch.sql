create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  membership_type text not null default 'none'
    check (membership_type in ('none', 'annual', 'lifetime')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'active', 'trialing', 'past_due', 'cancelled')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  referral_discount_available boolean not null default false,
  referral_invite_id uuid,
  referral_discount_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.plan_access (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  viewer_user_id uuid references auth.users(id) on delete cascade,
  invited_email text not null,
  token_hash text unique not null,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'revoked')),
  role text not null default 'read_only' check (role = 'read_only'),
  permissions text[] not null
    default array['wishes','people','sendOff','importantStuff','vault']::text[],
  invitation_sent_at timestamptz,
  email_message_id text,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  revoked_at timestamptz,
  unique(owner_user_id, invited_email)
);

alter table public.plan_access
  add column if not exists permissions text[] not null
  default array['wishes','people','sendOff','importantStuff','vault']::text[];
alter table public.plan_access add column if not exists invitation_sent_at timestamptz;
alter table public.plan_access add column if not exists email_message_id text;

alter table public.plan_access drop constraint if exists plan_access_permissions_valid;
alter table public.plan_access add constraint plan_access_permissions_valid check (
  permissions <@ array['wishes','people','sendOff','importantStuff','vault']::text[]
  and cardinality(permissions) > 0
);

do $$ begin
  alter table public.profiles
    add constraint profiles_referral_invite_fk
    foreign key (referral_invite_id) references public.plan_access(id) on delete set null;
exception when duplicate_object then null;
end $$;

create table if not exists public.billing_events (
  stripe_event_id text primary key,
  event_type text not null,
  status text not null default 'processing'
    check (status in ('processing', 'completed', 'failed')),
  attempts integer not null default 1 check (attempts > 0),
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  processed_at timestamptz
);

create table if not exists public.email_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  marketing_email boolean not null default false,
  consented_at timestamptz,
  consent_source text,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists plan_access_owner_status_idx
  on public.plan_access(owner_user_id, status);
create index if not exists plan_access_viewer_status_idx
  on public.plan_access(viewer_user_id, status);
create index if not exists plan_access_token_hash_idx
  on public.plan_access(token_hash);
create index if not exists profiles_stripe_customer_idx
  on public.profiles(stripe_customer_id);
create index if not exists profiles_stripe_subscription_idx
  on public.profiles(stripe_subscription_id);
create index if not exists profiles_referral_invite_idx
  on public.profiles(referral_invite_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  wants_marketing boolean := coalesce(new.raw_user_meta_data ->> 'marketing_email_consent', 'false') = 'true';
begin
  insert into public.profiles (user_id, email, full_name)
  values (new.id, lower(new.email), new.raw_user_meta_data ->> 'full_name')
  on conflict (user_id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    updated_at = now();

  insert into public.email_preferences (
    user_id,
    marketing_email,
    consented_at,
    consent_source,
    updated_at
  ) values (
    new.id,
    wants_marketing,
    case when wants_marketing then now() else null end,
    case when wants_marketing then coalesce(new.raw_user_meta_data ->> 'marketing_consent_source', 'signup') else null end,
    now()
  ) on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update of email, raw_user_meta_data on auth.users
  for each row execute procedure public.handle_new_user();

insert into public.profiles (user_id, email, full_name)
select id, lower(email), raw_user_meta_data ->> 'full_name'
from auth.users
on conflict (user_id) do update set
  email = excluded.email,
  full_name = coalesce(excluded.full_name, public.profiles.full_name),
  updated_at = now();

insert into public.email_preferences (user_id)
select id from auth.users
on conflict (user_id) do nothing;

alter table public.funeral_plans enable row level security;
alter table public.profiles enable row level security;
alter table public.plan_access enable row level security;
alter table public.billing_events enable row level security;
alter table public.email_preferences enable row level security;

drop policy if exists "People can view their own plan" on public.funeral_plans;
drop policy if exists "People can create their own plan" on public.funeral_plans;
drop policy if exists "People can update their own plan" on public.funeral_plans;
drop policy if exists "Accepted viewers can view a shared plan" on public.funeral_plans;
drop policy if exists "Paid people can view their own plan" on public.funeral_plans;
drop policy if exists "Paid people can create their own plan" on public.funeral_plans;
drop policy if exists "Paid people can update their own plan" on public.funeral_plans;

create policy "Paid people can view their own plan" on public.funeral_plans
for select to authenticated using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.profiles
    where profiles.user_id = (select auth.uid())
      and profiles.payment_status in ('active', 'trialing')
  )
);

create policy "Paid people can create their own plan" on public.funeral_plans
for insert to authenticated with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.profiles
    where profiles.user_id = (select auth.uid())
      and profiles.payment_status in ('active', 'trialing')
  )
);

create policy "Paid people can update their own plan" on public.funeral_plans
for update to authenticated using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.profiles
    where profiles.user_id = (select auth.uid())
      and profiles.payment_status in ('active', 'trialing')
  )
) with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.profiles
    where profiles.user_id = (select auth.uid())
      and profiles.payment_status in ('active', 'trialing')
  )
);

drop policy if exists "People can view their own profile" on public.profiles;
create policy "People can view their own profile" on public.profiles
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Owners can view their invitations" on public.plan_access;
create policy "Owners and viewers can view their invitations" on public.plan_access
for select to authenticated using (
  (select auth.uid()) = owner_user_id or (select auth.uid()) = viewer_user_id
);

drop policy if exists "People can view their email preferences" on public.email_preferences;
drop policy if exists "People can update their email preferences" on public.email_preferences;
create policy "People can view their email preferences" on public.email_preferences
for select to authenticated using ((select auth.uid()) = user_id);
create policy "People can update their email preferences" on public.email_preferences
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "No client access to billing events" on public.billing_events;
create policy "No client access to billing events" on public.billing_events
as restrictive for all to anon, authenticated using (false) with check (false);

grant select, insert, update on public.funeral_plans to authenticated;
grant select on public.profiles to authenticated;
grant select on public.plan_access to authenticated;
grant select, update on public.email_preferences to authenticated;

-- The billing ledger's explicit deny policy documents that only the
-- RLS-bypassing service role may record Stripe processing state.
