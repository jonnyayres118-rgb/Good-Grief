create index if not exists profiles_referral_invite_idx
  on public.profiles(referral_invite_id);

drop policy if exists "No client access to billing events" on public.billing_events;
create policy "No client access to billing events" on public.billing_events
as restrictive for all to anon, authenticated using (false) with check (false);
