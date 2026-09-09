# Good Grief production connections

## 2026 family-planning migration

Run `supabase/migrations/202609050001_plan_access_permissions.sql` in Supabase before deploying this rebuild. It adds a non-destructive `permissions` array to existing invitations; existing rows retain access to all five areas until the owner changes them.

Connect all production services before taking real payments or storing customer plans. The local development fallback is deliberately unable to bypass payment in a production build.

## Supabase

1. Create a Supabase project and run `supabase-schema.sql` in its SQL editor.
2. Enable email/password authentication.
3. In **Authentication → URL Configuration**, set **Site URL** to `https://www.getgoodgrief.co.uk`—never localhost.
4. Add `https://www.getgoodgrief.co.uk/auth/callback`, `https://getgoodgrief.co.uk/auth/callback` and your Vercel preview callback URL to the allowed redirect URLs.
5. In **Authentication → Email Templates → Confirm signup**, paste the contents of `supabase-confirmation-email.html`. Keep the `{{ .ConfirmationURL }}` variable unchanged.
6. Add the URL, anon key and service-role key from `.env.example` to Vercel.

New visitors can explore and draft locally without an account. The draft remains on that browser until Stripe confirms payment; only then is it uploaded for cross-device access and sharing. Expired confirmation links land on a branded recovery page where the customer can request a fresh email or continue drafting.

For production email branding, configure **Authentication → SMTP Settings** with a transactional email provider and a verified sender such as `hello@getgoodgrief.co.uk`. The supplied HTML controls the design; custom SMTP removes the generic Supabase sender and improves delivery. Supabase's default sender is acceptable only for testing.

The anon key is public by design. The service-role key is server-only and must never be prefixed with `VITE_`. Row-level security protects plans, while server functions manage payments, invitations and access changes.

## Stripe

Create these Stripe objects in the same mode (test first, then live):

- Annual product and recurring price: **£29 GBP every year**.
- Lifetime product and one-time price: **£75 GBP**.
- Invitee coupon: **50% off, duration once**. “Once” discounts the first annual invoice only.

Add the two `price_...` IDs and the `coupon_...` ID to Vercel using the names in `.env.example`. Add `STRIPE_SECRET_KEY` as a server-only variable.

Create a Stripe webhook endpoint at:

`https://www.getgoodgrief.co.uk/api/stripe-webhook`

Subscribe it to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.deleted`

Copy its signing secret into `STRIPE_WEBHOOK_SECRET`, then redeploy. Stripe is the only source of payment entitlement: returning from Checkout does not unlock sharing; the signed webhook does.

### Stripe Customer Portal

In Stripe, open **Settings → Billing → Customer portal** and activate the portal. Configure it to let Annual members:

- update their card and billing details;
- view and download invoices;
- cancel at the end of the current billing period.

The app's **Membership & billing** screen opens this hosted portal through `/api/billing-portal`. Good Grief never stores card numbers: Stripe securely collects and manages payment details. Lifetime members see their permanent access status but do not need recurring billing controls.

### What customers see

- Annual: **£29 billed yearly**, active status, renewal date, plan benefits and a **Manage billing in Stripe** button.
- Lifetime: **£75 once**, permanent access and no renewal date.
- Draft: pricing choices and a clear explanation that payment unlocks private cloud storage, cross-device access and trusted-person sharing.

No publishable Stripe key is needed because payment and billing are handled with Stripe-hosted Checkout and Customer Portal pages.

## Sharing and referral rules

- Anyone can draft a plan after creating an account.
- Only an active Annual or Lifetime member can create an invitation, with no more than three pending or accepted invitations at once.
- The invitation is tied to the invited email and stores only a hash of the secret token.
- The recipient must create an account or sign in with that exact email before any plan data is returned.
- Access is one-way and read-only. It can be revoked by the plan owner.
- The 50% benefit applies once, to the invited person’s first £29 Annual invoice. It never discounts Lifetime and is not reissued after use.
- If the plan owner’s membership is no longer active, their shared plan is no longer returned.

## Resend

Verify `getgoodgrief.co.uk` in Resend, then set `RESEND_API_KEY` and `GOOD_GRIEF_EMAIL_FROM` in Vercel. Invitation delivery is transactional and uses an idempotency key based on the invitation ID. If delivery is unavailable, the private invitation is still created and the owner receives a copyable link.

Marketing permission is a separate optional signup choice recorded in `email_preferences`. Do not start product-suite campaigns or transfer partner leads until the specific offer, consent wording and regulated-partner arrangement have been approved. Never send plan answers or invitation tokens to a marketing audience.

## HubSpot

Connect HubSpot through a protected server-side endpoint. Sync only account date, membership, payment status, completion percentage, milestones, last-active date, renewal date and marketing consent. Never sync plan answers, people named in a plan, recipient emails, invitation URLs or invitation tokens.

## Vercel checklist

Add every environment variable to **Production** and **Preview** separately, then redeploy. A successful frontend deployment alone is not enough; confirm the Stripe webhook shows a successful `200`, then verify that `/api/entitlement` reports the paid membership before testing sharing. Run one complete purchase with a Stripe test card before switching the variables to live mode.
