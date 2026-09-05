create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  membership_type text not null default 'none' check (membership_type in ('none', 'annual', 'lifetime')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'active', 'trialing', 'past_due', 'cancelled')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  referral_discount_available boolean not null default false,
  referral_invite_id uuid,
  referral_discount_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.funeral_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.plan_access (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  viewer_user_id uuid references auth.users(id) on delete cascade,
  invited_email text not null,
  token_hash text unique not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  role text not null default 'read_only' check (role = 'read_only'),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  revoked_at timestamptz,
  unique(owner_user_id, invited_email)
);

do $$ begin
  alter table public.profiles
    add constraint profiles_referral_invite_fk
    foreign key (referral_invite_id) references public.plan_access(id) on delete set null;
exception when duplicate_object then null;
end $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, full_name)
  values (new.id, lower(new.email), new.raw_user_meta_data ->> 'full_name')
  on conflict (user_id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update of email, raw_user_meta_data on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.funeral_plans enable row level security;
alter table public.profiles enable row level security;
alter table public.plan_access enable row level security;

drop policy if exists "People can view their own plan" on public.funeral_plans;
drop policy if exists "People can create their own plan" on public.funeral_plans;
drop policy if exists "People can update their own plan" on public.funeral_plans;
drop policy if exists "Accepted viewers can view a shared plan" on public.funeral_plans;
drop policy if exists "People can view their own profile" on public.profiles;
drop policy if exists "Owners can view their invitations" on public.plan_access;

create policy "People can view their own plan" on public.funeral_plans
for select using (auth.uid() = user_id);
create policy "People can create their own plan" on public.funeral_plans
for insert with check (auth.uid() = user_id);
create policy "People can update their own plan" on public.funeral_plans
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Accepted viewers can view a shared plan" on public.funeral_plans
for select using (
  exists (
    select 1 from public.plan_access access
    where access.owner_user_id = funeral_plans.user_id
      and access.viewer_user_id = auth.uid()
      and access.status = 'accepted'
  )
);

create policy "People can view their own profile" on public.profiles
for select using (auth.uid() = user_id);

create policy "Owners can view their invitations" on public.plan_access
for select using (auth.uid() = owner_user_id or auth.uid() = viewer_user_id);

-- Invitations, payment status and access changes are written only by server-side
-- functions using the service role. Share tokens are stored only as SHA-256 hashes.
-- Never sync plan answers, recipient names, tokens or PINs to HubSpot.
