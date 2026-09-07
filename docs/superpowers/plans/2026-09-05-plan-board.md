# Good Grief Plan Board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Good Grief planner into a block-building Plan Board with intentional sorted badges and an in-app living plan, while removing PDF functionality completely.

**Architecture:** Keep the existing React/Vite application and JSONB plan payload. Store each field's confirmation state inside its existing area object under `_sorted`, allowing the current persistence and permission model to continue without a new database column; legacy non-empty answers migrate to sorted on normalization. Drive the board, editor, summary, and progress from small tested domain functions.

**Tech Stack:** React 19, Vite 6, Node test runner, Supabase JSONB persistence, Phosphor icons, CSS.

**Spec:** `docs/superpowers/specs/2026-09-05-plan-board.md`

## Global Constraints

- Preserve the five existing product areas and twenty prompts.
- Keep autosave, Supabase persistence, membership, billing, and permission-controlled sharing working.
- Use explicit `Mark this sorted`; saving text alone creates a Draft.
- Remove PDF UI, copy, code, scripts, generated artifacts, and dependencies.
- Keep Montserrat and the approved Good Grief palette.
- Do not store raw passwords, PINs, card details, or authentication secrets.

---

### Task 1: Block status domain

**Files:**
- Modify: `src/domain/plan.js`
- Test: `tests/plan-domain.test.mjs`

**Interfaces:**
- Consumes: existing plan objects grouped by area and field.
- Produces: `getBlockStatus(plan, areaKey, field)`, `updateBlockAnswer(plan, areaKey, field, value)`, `markBlockSorted(plan, areaKey, field)`, and progress with `drafted`.

- [ ] **Step 1: Write failing tests** for legacy migration, draft-on-edit, intentional confirmation, blank-block rejection, and progress counts.
- [ ] **Step 2: Run `node --test tests/plan-domain.test.mjs`** and verify the new imports or assertions fail because the status behavior does not exist.
- [ ] **Step 3: Implement the minimal domain functions** using per-area `_sorted` metadata and legacy migration during normalization.
- [ ] **Step 4: Run `node --test tests/plan-domain.test.mjs`** and verify all domain tests pass.

### Task 2: Guided content and Plan Board UI

**Files:**
- Modify: `src/content/product.js`
- Modify: `src/App.jsx`
- Modify: `src/styles.css`
- Test: `tests/product-content.test.mjs`

**Interfaces:**
- Consumes: domain block status functions and existing product areas.
- Produces: `starterPrompts` on each plan step, a five-stack Plan Board, the guided block editor, and sorted confirmation feedback.

- [ ] **Step 1: Write a failing content test** requiring three useful starter prompts for every block.
- [ ] **Step 2: Run `node --test tests/product-content.test.mjs`** and verify it fails because starter prompts are absent.
- [ ] **Step 3: Add starter prompts** to the product content and flatten them into `planSteps`.
- [ ] **Step 4: Rebuild the planner home and editor** around block states, explicit confirmation, area badges, and prompt chips.
- [ ] **Step 5: Add responsive, focus-visible, and reduced-motion styles** for the board and editor.
- [ ] **Step 6: Run the domain and content tests** and verify both pass.

### Task 3: Living My Plan and PDF removal

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/styles.css`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `AGENTS.md`
- Delete: `src/lib/exportPlanPdf.js`
- Delete: `src/lib/planPdfLayout.js`
- Delete: `scripts/generate-sample-plan-pdf.mjs`
- Delete: `output/pdf/good-grief-sample-plan.pdf`

**Interfaces:**
- Consumes: block status helpers and product areas.
- Produces: the grouped, editable `My plan` view and PDF-free product/membership language.

- [ ] **Step 1: Replace the PDF review screen** with a grouped living summary that exposes each block's status and edit action.
- [ ] **Step 2: Replace every user-facing PDF promise** with living-plan, trusted-sharing, or cross-device value.
- [ ] **Step 3: Remove PDF imports, implementation files, sample generator, generated artifact, npm script, and `pdfkit` dependency.**
- [ ] **Step 4: Update durable prototype direction** in `AGENTS.md` to record the approved Plan Board and no-export decision.
- [ ] **Step 5: Run `rg -n \"PDF|Pdf|pdf\" src package.json scripts AGENTS.md README.md`** and verify no product PDF references remain.

### Task 4: Verification and delivery

**Files:**
- Verify: entire worktree

**Interfaces:**
- Consumes: completed Plan Board implementation.
- Produces: tested build, browser-verified interaction, and pushed feature branch.

- [ ] **Step 1: Run all Node tests** with `node --test tests/*.test.mjs`.
- [ ] **Step 2: Run `npm run build` and `npm run test:sites`.**
- [ ] **Step 3: Browser-test desktop and mobile**: open the board, create a draft, mark it sorted, see the badge, open My plan, and confirm no PDF control remains.
- [ ] **Step 4: Review `git diff --check` and `git status --short`.**
- [ ] **Step 5: Commit the implementation and push `feat/good-grief-rebuild`.**

