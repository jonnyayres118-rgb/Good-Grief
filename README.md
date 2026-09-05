# Good Grief

A responsive family-planning product for organising the wishes, information and decisions loved ones may one day need.

## Included

- New consumer homepage and simple pricing
- Account creation and returning-user sign-in
- Server-created Stripe Checkout for £29/year and £75 lifetime memberships
- Five planning areas with twenty useful prompts, progress and autosave
- Backwards-compatible migration of existing funeral answers into My send-off
- Paid-only invitations with explicit category permissions, account-protected read-only access and revocation
- 50% first-year Annual referral discount for invited viewers
- A clear access register for outgoing and incoming plan access
- Supabase client integration and row-level-security schema
- Server-authenticated account deletion endpoint
- Protected HubSpot lead-capture endpoint integration
- Responsive desktop, tablet and mobile layouts
- Vercel and Sites deployment configuration

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The standard production frontend is written to `dist/client`. Vercel also deploys the functions in `api/` for checkout, webhooks and protected sharing.

## Production services

Copy `.env.example` to `.env.local` and add Supabase, Stripe and the protected HubSpot lead-capture endpoint. See `INTEGRATIONS.md` and `supabase-schema.sql`.

Apply `supabase/migrations/202609050001_plan_access_permissions.sql` before enabling category-controlled invitations in a hosted environment.
