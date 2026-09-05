# Good Grief Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a preview-ready Good Grief homepage and real five-area planning product while preserving Supabase auth, persistence, payments, PDF and private sharing.

**Architecture:** Retain Vite/React and Vercel serverless APIs. Introduce a focused plan-domain module and composed UI sections around the existing integration layer, then apply a backwards-compatible SQL migration for category permissions.

**Tech Stack:** React 19, Vite 6, Supabase JS 2, Vercel Functions, Stripe, PDFKit, Node test runner.

**Spec:** `docs/superpowers/specs/2026-09-05-good-grief-rebuild-design.md`

## Global Constraints

- Preserve working authentication, local drafting, Stripe, sharing and PDF behavior.
- Use sentence case and gentle, observational copy; no swearing or jokes about death/grief.
- Do not store raw passwords, PINs, card details or authentication secrets.
- Do not make destructive production database changes or deploy to the production domain.
- Keep service-role credentials server-only and enforce explicit sharing permissions.

---

### Task 1: Plan domain and backwards compatibility

**Files:**
- Create: `src/domain/plan.js`
- Create: `tests/plan-domain.test.mjs`

**Interfaces:**
- Produces: `AREA_KEYS`, `createEmptyPlan()`, `normalizePlan(raw)`, `calculateProgress(plan)`, `filterPlanByPermissions(plan, permissions)`, `containsSensitiveSecret(text)`.

- [ ] Write Node tests proving legacy flat answers move into `sendOff`, progress counts completed fields, permission filtering excludes unshared areas, and sensitive-secret detection catches password/PIN/card phrasing.
- [ ] Run `node --test tests/plan-domain.test.mjs` and verify the missing module fails.
- [ ] Implement the pure plan-domain functions with no browser dependencies.
- [ ] Re-run the test and commit the passing domain module.

### Task 2: Public brand and homepage

**Files:**
- Create: `src/components/PublicSite.jsx`
- Create: `src/content/product.js`
- Modify: `src/styles.css`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: callbacks `onStart`, `onSignIn`, `onPickPlan`.
- Produces: responsive homepage with the approved hero, five product areas, three-step explanation, trust, pricing, FAQ and final CTA.

- [ ] Add a source-content test that asserts the approved hero, five area labels, £29 annual and £75 lifetime copy.
- [ ] Run it and verify failure while the new content module is absent.
- [ ] Implement the content module and public composition, preserving existing CTA behavior.
- [ ] Apply the new pink/lime/blue/cream editorial system and responsive states.
- [ ] Run tests and build; commit the public experience.

### Task 3: Five-area dashboard and editors

**Files:**
- Create: `src/components/Dashboard.jsx`
- Create: `src/components/AreaEditor.jsx`
- Create: `src/components/AppHeader.jsx`
- Modify: `src/App.jsx`
- Modify: `src/lib/supabase.js`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: normalized plan object and existing `persistPlan` / `loadCloudPlan` functions.
- Produces: calm dashboard cards with completion, updated status and next action; editable five-area forms with autosave and return navigation.

- [ ] Add tests for the editor field definitions and non-secret vault guidance.
- [ ] Run and verify failure before adding field definitions.
- [ ] Build the dashboard and editors using the domain plan shape.
- [ ] Preserve draft-first access, login reconciliation, autosave and returning-user cloud loading.
- [ ] Run domain/content tests, existing Sites tests and build; commit the working product flow.

### Task 4: Explicit category sharing and account privacy

**Files:**
- Create: `supabase/migrations/202609050001_plan_access_permissions.sql`
- Create: `api/account.js`
- Modify: `api/invites.js`
- Modify: `api/shared-plan.js`
- Modify: `src/lib/supabase.js`
- Modify: `src/components/Dashboard.jsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `AREA_KEYS` validation contract and authenticated bearer tokens.
- Produces: invitation creation/update with `permissions: string[]`; filtered shared-plan payloads; authenticated account deletion.

- [ ] Add API-source tests for permission validation/filtering and authenticated account deletion behavior.
- [ ] Run and verify the new assertions fail.
- [ ] Add the non-destructive permissions migration with all-area defaults for existing invitations.
- [ ] Implement category checkboxes, API validation and response filtering.
- [ ] Implement confirmation-led account deletion through the server-only admin client.
- [ ] Run all tests and build; commit sharing/privacy changes.

### Task 5: PDF adaptation, integration and preview readiness

**Files:**
- Modify: `src/lib/exportPlanPdf.js`
- Modify: `src/lib/planPdfLayout.js`
- Modify: `scripts/generate-sample-plan-pdf.mjs`
- Modify: `README.md`
- Modify: `INTEGRATIONS.md`

**Interfaces:**
- Consumes: normalized five-area plan.
- Produces: category-aware designed PDF and exact setup/migration documentation.

- [ ] Add a PDF layout test that asserts five category sections and omission of empty fields.
- [ ] Run it and verify the old layout fails the new expectation.
- [ ] Adapt the PDF data mapping while preserving the Good Grief visual identity.
- [ ] Document migration order, Vercel variables and placeholder limitations.
- [ ] Run `npm run pdf:sample`, all Node tests, `npm run test:sites` and `npm run build`.
- [ ] Review `git diff --check`, ensure no secrets or generated build files are staged, and commit the integration.

### Task 6: Preview deployment handoff

**Files:**
- No product-source changes expected.

**Interfaces:**
- Produces: a non-production preview URL and a concise list of any service-dependent blockers.

- [ ] Create a preview deployment from the feature branch without promoting the production domain.
- [ ] Confirm the preview deployment reports ready.
- [ ] Return the preview URL, implemented scope, placeholders and pass-two priorities.

