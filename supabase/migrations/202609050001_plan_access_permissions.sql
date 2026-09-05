alter table public.plan_access
  add column if not exists permissions text[] not null
  default array['wishes','people','sendOff','importantStuff','vault']::text[];

alter table public.plan_access
  drop constraint if exists plan_access_permissions_valid;

alter table public.plan_access
  add constraint plan_access_permissions_valid check (
    permissions <@ array['wishes','people','sendOff','importantStuff','vault']::text[]
    and cardinality(permissions) > 0
  );
