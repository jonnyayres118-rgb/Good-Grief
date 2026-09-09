# Good Grief rebuild design

## Goal

Turn the existing funeral-planning prototype into a broader, trustworthy family-planning product that helps people organise the wishes, information and decisions their loved ones may one day need.

## Product experience

The intended emotional progression is: “I’ve been meaning to do this.” → “This isn’t nearly as horrible as I expected.” → “I’m glad I’ve sorted that.” The public site is expressive and playful; the signed-in workspace is calmer and highly legible. Humour is gentle and observational. Death and grief are never the joke.

## First-pass scope

- Rebuild the public homepage around “Life is complicated enough. Leaving things behind shouldn’t be.”
- Present five product areas: My wishes, My people, My send-off, My important stuff and My vault.
- Preserve email/password Supabase authentication, confirmation callback and device-local drafting.
- Replace the single ten-step funeral planner with a five-area progress dashboard.
- Make My send-off fully editable and persist it through the existing `funeral_plans.answers` JSONB record.
- Give the other four areas useful first-pass editors and persist their answers through the same extensible record, without adding risky secret/password storage.
- Preserve Stripe annual/lifetime checkout, billing and paid sharing. Keep the living in-app plan as the single source of truth; do not offer PDF export.
- Extend trusted-person sharing with category-level permissions while keeping access explicit and read-only.
- Add clear privacy, account deletion and data deletion paths without exposing service-role credentials.
- Produce a reviewable preview; do not change the production domain.

## Architecture

Keep the current Vite/React/Vercel application and its existing serverless API. Split the large `App.jsx` into focused product data, public-site, dashboard, planner, account and sharing units while preserving the established integration boundaries in `src/lib/supabase.js` and `api/`. Continue storing the plan as JSONB for this pass, namespaced by the five area keys so the product can broaden without a destructive migration.

## Data shape

`funeral_plans.answers` becomes an object with `wishes`, `people`, `sendOff`, `importantStuff`, and `vault`. Existing flat funeral answers are migrated client-side into `sendOff` on load and written back in the new shape. Vault V1 stores only document descriptions, locations and notes; no raw credentials, authentication secrets or uploaded files.

`plan_access` gains a `permissions text[]` column defaulting to all five area keys. The server validates permitted keys. Shared-plan responses filter answers to the accepted invitation’s explicit permissions.

## Security and privacy

- Preserve RLS ownership policies and accepted-viewer checks.
- Validate ownership server-side for invitation updates, revocation and deletion.
- Never expose the Supabase service-role key to browser code.
- Do not place plan contents or sensitive identifiers in analytics.
- Add server-authenticated account deletion that removes the authenticated user through Supabase Admin, allowing cascading deletes.
- Avoid raw passwords, PINs, card details and banking credentials in plan fields and guidance.

## Visual system

Use warm pink, acid lime, clear sky blue, warm cream, black and white with accessible contrast. Public pages use large editorial typography, firm black outlines, paper-like blocks and restrained motion. Product screens keep the same palette but use calmer cream surfaces, clearer hierarchy and fewer decorative collisions. Sentence case is the default; no swearing, gothic imagery, morbid jokes or shouty death-tech language.

## Testing and release

Add behavior tests for legacy-plan normalization, progress calculation, permission filtering and sensitive-input guardrails before implementation. Preserve and run the existing Sites packaging tests. Run the production build and create a preview deployment only; production remains untouched.
