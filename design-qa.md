# Good Grief design QA

## Reference

- Selected visual target: `generated_images/exec-f9a395c7-e083-416a-b157-57582e1601a7.png`
- Implementation reviewed at `http://terminal.local:4173/` in the Cloud Browser desktop viewport.
- The reference and implementation were inspected together in one comparison pass.

## Visual comparison

- Typography: Anton reproduces the tall, condensed campaign headline; Inter provides the clean supporting copy. The line breaks and cream/yellow/pink emphasis match the selected target.
- Layout: the hero preserves the left headline/right paper-collage composition, top navigation, strong CTA and angled transition into the cream manifesto section.
- Colour and surfaces: midnight navy, warm cream, acid yellow and hot pink map directly to the target. Hard shadows, paper texture and restrained rotations carry the printed-collage identity without generic rounded cards.
- Imagery: the regenerated My Setlist asset preserves the ticket, round sticker, orange paint and printed-collage texture while replacing warped lettering with crisp, readable copy. Its transparent edge was checked in the browser against the navy hero with no checkerboard halo.
- Wordmark: adjusted to the target's compact horizontal treatment and optical scale.
- Responsive rules: desktop, tablet and mobile layouts have explicit grid collapse, navigation, hero-art repositioning, planner simplification and tap-friendly controls. No horizontal overflow is introduced by the supported breakpoints.

## Functional verification

- Primary and secondary hero CTAs work.
- Pricing selection carries the correct plan and price into account creation.
- Account form validation works; preview and live Supabase modes are explicit.
- Returning-user sign-in opens the planner without checkout.
- Stripe checkout is created server-side and sharing unlocks only after a signed webhook activates membership.
- Planner steps, textarea input, progress, navigation and autosave work.
- Paid-only invitation creation, exact-email account acceptance, one-way read-only viewing, revocation and the access register are implemented.
- Accepted invitees receive one 50%-off first-year Annual entitlement; Lifetime is excluded.
- FAQ accordion works.
- Build and all four Sites packaging tests pass.
- Browser console contains no application errors; extension-only metadata noise was excluded from app results.

## Accessibility

- Semantic buttons, labelled fields, dialog roles, alternative text and visible keyboard focus are present.
- Primary colour combinations retain strong contrast.
- Reduced-motion preference disables animated transitions and smooth scrolling.

## Deployment readiness

- Supabase schema and row-level-security policies are included.
- Stripe price, coupon and signed-webhook variables plus a protected HubSpot lead endpoint are documented.
- Funeral-plan answers, mentioned names, share tokens and PINs are explicitly excluded from HubSpot sync.
- Public credentials are not embedded in source.

## Final result

passed
