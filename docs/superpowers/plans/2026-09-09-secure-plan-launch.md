# Good Grief Secure Plan Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let anyone draft locally for free, then use verified payment to unlock private cloud storage and a three-person invitation loop.

**Architecture:** Keep the Vite client and Vercel API routes. Move owner-plan persistence behind a paid server endpoint, reinforce the same rule with Supabase RLS, treat Stripe webhooks as the entitlement authority, and send invitations through a small Resend service. Local storage remains the unpaid source of truth and is uploaded when entitlement changes to paid.

**Tech Stack:** React 19, Vite 6, Vercel Functions, Supabase Auth/Postgres/RLS, Stripe Checkout/Webhooks, Resend HTTP API, Node test runner.

**Spec:** `docs/superpowers/specs/2026-09-09-secure-plan-launch.md`

## Global Constraints

- Twenty planning blocks remain freely usable before registration or payment.
- Unpaid drafts stay in browser local storage and are not written to Supabase.
- Only a verified Stripe webhook activates Annual or Lifetime membership.
- Paid members may have at most three pending or accepted invitations.
- Shared access is authenticated, email-bound, explicit, read-only and category-filtered.
- Never store or transmit passwords, PINs, card details or plan answers to email/marketing services.
- Preserve the Sites worker and packaging contract.

---

### Task 1: Codify commercial rules

**Files:**
- Create: `server/commercialRules.js`
- Create: `tests/commercial-rules.test.mjs`

**Interfaces:**
- Produces: `MAX_TRUSTED_PEOPLE`, `storageMode({ backendConnected, paid })`, `inviteCapacity(activeCount)`.

- [ ] Write tests proving unpaid storage is device-only, paid connected storage is secure, and invitation capacity stops at three.
- [ ] Run `node --test tests/commercial-rules.test.mjs` and confirm it fails because the module does not exist.
- [ ] Implement the three pure rules with no network dependencies.
- [ ] Re-run the test and confirm it passes.

### Task 2: Add the production data contract

**Files:**
- Create: `supabase/migrations/202609090001_secure_plan_launch.sql`
- Modify: `supabase-schema.sql`
- Create: `tests/schema-contract.test.mjs`

**Interfaces:**
- Produces: `profiles`, `plan_access`, `billing_events`, and `email_preferences`; paid-owner RLS for `funeral_plans`; restricted trigger-function execution.

- [ ] Write a schema-contract test for paid-owner policies, RLS on every public table, Stripe event uniqueness, invitation permissions and revoked function execution.
- [ ] Run the test and confirm it fails because the launch migration is absent.
- [ ] Add an idempotent migration that upgrades the existing single-table production database without deleting plan data.
- [ ] Re-run the schema-contract test.

### Task 3: Put cloud plan storage behind entitlement

**Files:**
- Create: `api/plan.js`
- Modify: `src/lib/supabase.js`
- Modify: `src/App.jsx`
- Create: `tests/plan-storage.test.mjs`

**Interfaces:**
- `GET /api/plan` returns a paid owner's plan.
- `PUT /api/plan` upserts a paid owner's plan.
- `persistPlan(plan, { paid })` always writes locally and calls `/api/plan` only when paid.
- `loadCloudPlan({ paid })` returns local data unless paid, then requests `/api/plan`.

- [ ] Write tests for the server-side paid check and the local/secure storage decision.
- [ ] Run the tests and confirm the unpaid cloud-write case fails.
- [ ] Implement the paid plan API and client storage boundary.
- [ ] Change Planner hydration to resolve entitlement before requesting cloud data.
- [ ] Make a paid entitlement transition upload the current browser draft automatically.
- [ ] Re-run focused and full tests.

### Task 4: Make payment fulfillment idempotent

**Files:**
- Modify: `api/stripe-webhook.js`
- Create: `server/stripeEvents.js`
- Create: `tests/stripe-events.test.mjs`

**Interfaces:**
- Produces: `periodEndFromInvoice(invoice)` and event processing states `processing`, `completed`, `failed`.

- [ ] Write tests for extracting renewal dates and recognizing completed duplicate events.
- [ ] Run the tests and confirm the helper module is missing.
- [ ] Record each Stripe event ID in `billing_events`, skip completed duplicates and mark failures for safe retry.
- [ ] Update annual renewal dates from invoice line periods.
- [ ] Re-run focused and full tests.

### Task 5: Enforce and deliver the three-person loop

**Files:**
- Modify: `api/invites.js`
- Create: `server/inviteEmail.js`
- Create: `tests/invite-email.test.mjs`
- Modify: `src/App.jsx`

**Interfaces:**
- `buildInviteEmail({ ownerName, inviteUrl })` returns escaped branded HTML.
- `sendInviteEmail({ to, ownerName, inviteUrl, inviteId })` returns delivery status without exposing tokens to logs.
- Access summary adds `inviteLimit`, `activeInviteCount`, and `invitesRemaining`.

- [ ] Write tests for HTML escaping, private-link rendering and the three-person capacity rule.
- [ ] Run tests and confirm email functionality is missing.
- [ ] Reject a fourth pending/accepted invitation with a clear 409 response.
- [ ] Send the transactional email using Resend's API and an idempotency key.
- [ ] Show the three-person limit and delivery/copy-link state in the sharing interface.
- [ ] Re-run focused and full tests.

### Task 6: Align account consent and customer language

**Files:**
- Modify: `src/lib/supabase.js`
- Modify: `src/App.jsx`
- Modify: `.env.example`
- Modify: `AUTH_AND_PAYMENT_SETUP.md`
- Modify: `INTEGRATIONS.md`
- Modify: `AGENTS.md`
- Modify: `tests/app-render.test.mjs`

**Interfaces:**
- Signup metadata carries optional `marketing_email_consent`, timestamp and source for the database trigger.
- No browser-facing lead-capture endpoint remains.

- [ ] Add render/content assertions for `Secure my plan`, device-only drafts and three trusted people.
- [ ] Run them and confirm they fail against the old copy.
- [ ] Remove direct client lead capture and add explicit consent metadata.
- [ ] Update unpaid, paid, pricing and invitation copy to describe the approved boundary.
- [ ] Document `RESEND_API_KEY` and `GOOD_GRIEF_EMAIL_FROM` plus the production test sequence.
- [ ] Re-run all tests.

### Task 7: Apply, verify and release

**Files:**
- No new production files.

**Interfaces:**
- Consumes the migration and all application changes from Tasks 1–6.

- [ ] Apply `202609090001_secure_plan_launch.sql` to Supabase project `fzroiphleyipfsobrhnu`.
- [ ] Query table and policy metadata to verify the paid-storage boundary and run Supabase security/performance advisors.
- [ ] Run `node --test tests/*.test.mjs`, `npm run test:sites`, and `npm run build`.
- [ ] Start the local server and verify the free draft plus `Secure my plan` journey in a browser.
- [ ] Commit and push the feature branch so Vercel can build the connected GitHub project.
- [ ] Inspect the resulting deployment and report any external configuration still required before real money can be accepted.
