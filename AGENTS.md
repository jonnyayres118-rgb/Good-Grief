# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Locked product direction

- The broader approved proposition is: “Life is complicated enough. Leaving things behind shouldn’t be.” Good Grief organises the wishes, information and decisions loved ones may one day need.
- Use five product areas: My wishes, My people, My send-off, My important stuff and My vault.
- Public pages may be bright and expressive; authenticated product screens must be calmer and exceptionally easy to use.
- Humour is gentle and observational. Death and grief are never the joke. Use sentence case by default and do not use swearing.
- Do not store raw passwords, PINs, card details or authentication secrets. Vault V1 records what exists and where it can safely be found.

- Use the selected option-one identity: midnight navy, warm cream, acid yellow, hot pink and collage-like paper ephemera.
- Lead with the exact campaign line: “Plan the send-off. Get back to living.”
- The experience should feel fresh, candid and life-affirming, never clinical, sombre or euphemistic.
- Build beyond the landing page: pricing, account creation, payment handoff, a useful funeral planner, autosave and private sharing are part of the prototype.
- Sharing is a paid entitlement. People may draft a plan before payment, but cannot invite anyone until Stripe confirms an active annual or lifetime purchase.
- Shared plans require an authenticated Good Grief account. Access is read-only and one-way by default; reciprocal access requires a separate explicit invitation.
- Someone who accepts a plan invitation receives 50% off the first year of the £29 annual plan. The £75 lifetime plan is not discounted.
- The planner must include an access area showing who can view the user's plan and whose plans the user can view, with clear pending/accepted/revoked states.
- The paid experience must feel like a member product, not a long form: include a progress-led home, review-before-sharing view, visible membership/billing controls and a designed PDF that carries the campaign identity throughout.
- The PDF is a core paid deliverable. It must use the same navy, cream, acid yellow, hot pink, Anton/Inter hierarchy and candid language as the website; never fall back to a plain browser-print document.
- New visitors must be able to open and draft in the planner before creating an account. Require authentication only for cross-device saving, payment, PDF download and sharing; never put the product itself behind an email-confirmation wall.
- Supabase confirmation must always return to `/auth/callback` on the current Good Grief origin. The callback, expired-link recovery and confirmation email must use the Good Grief visual identity and provide resend plus continue-drafting routes.
- Until Stripe is connected, pricing actions must disclose that checkout is unavailable before asking someone to create an account.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
