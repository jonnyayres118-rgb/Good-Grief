-- Good Grief MVP schema
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  completion integer not null default 0 check (completion between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  funeral_type text,
  location_notes text,
  music_notes text,
  people_notes text,
  wake_notes text,
  final_notes text,
  estimated_cost integer not null default 0,
  funds_set_aside integer not null default 0,
  funding_method text,
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create table if not exists public.trusted_people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text,
  relationship text,
  share_funeral boolean not null default true,
  share_contacts boolean not null default true,
  share_funding boolean not null default false,
  share_vault_index boolean not null default false,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists public.vault_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  label text not null,
  provider text,
  reference text,
  location_note text,
  shared boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.trusted_people enable row level security;
alter table public.vault_items enable row level security;

grant select, insert, update, delete on public.profiles, public.plans, public.trusted_people, public.vault_items to authenticated;

create policy "profiles_owner_all" on public.profiles for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "plans_owner_all" on public.plans for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "trusted_people_owner_all" on public.trusted_people for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "vault_items_owner_all" on public.vault_items for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

-- Trusted-person release is deliberately NOT represented as a permissive RLS policy.
-- V1 activation should remain human-reviewed until identity/death verification is designed and audited.
