import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migrationUrl = new URL("../supabase/migrations/202609090001_secure_plan_launch.sql", import.meta.url);

test("the launch migration creates the paid membership and referral data contract", async () => {
  const sql = await readFile(migrationUrl, "utf8");

  assert.match(sql, /create table if not exists public\.profiles/i);
  assert.match(sql, /create table if not exists public\.plan_access/i);
  assert.match(sql, /create table if not exists public\.billing_events/i);
  assert.match(sql, /stripe_event_id text primary key/i);
  assert.match(sql, /No client access to billing events/i);
  assert.match(sql, /profiles_referral_invite_idx/i);
  assert.match(sql, /create table if not exists public\.email_preferences/i);
  assert.match(sql, /permissions text\[\]/i);
});

test("the launch migration makes paid membership a database storage boundary", async () => {
  const sql = await readFile(migrationUrl, "utf8");

  assert.match(sql, /Paid people can view their own plan/i);
  assert.match(sql, /Paid people can create their own plan/i);
  assert.match(sql, /Paid people can update their own plan/i);
  assert.match(sql, /payment_status in \('active', 'trialing'\)/i);
  assert.match(sql, /enable row level security/gi);
});

test("the launch migration restricts the auth trigger function", async () => {
  const sql = await readFile(migrationUrl, "utf8");

  assert.match(sql, /security definer set search_path = ''/i);
  assert.match(sql, /revoke execute on function public\.handle_new_user\(\) from public/i);
  assert.match(sql, /revoke execute on function public\.handle_new_user\(\) from anon, authenticated/i);
});
