# Good Grief: auth and payment launch checklist

## Fix email confirmation first

In Supabase:

1. Open **Authentication → URL Configuration**.
2. Set **Site URL** to `https://www.getgoodgrief.co.uk`.
3. Add these Redirect URLs:
   - `https://www.getgoodgrief.co.uk/auth/callback`
   - `https://getgoodgrief.co.uk/auth/callback`
   - the same `/auth/callback` path on any Vercel preview domain you use for testing.
4. Open **Authentication → Email Templates → Confirm signup**.
5. Paste the complete contents of `supabase-confirmation-email.html` and save it.
6. Redeploy the updated Good Grief archive in Vercel.

The old localhost email cannot be repaired. After redeploying, request a fresh confirmation email from the new branded recovery page. Use only the newest email.

## Remove the wall before launch

This version deliberately allows anyone to open the planner and create a local draft without registering. An account and payment are requested only when they choose to secure that draft in private cloud storage and unlock trusted-person sharing.

## Stripe can come next

Until Stripe is connected, the pricing and Membership screens display **Stripe isn't connected yet** and no payment attempt is made. This means you can inspect the complete unpaid product now without creating a Stripe account.

When ready:

1. Create a Stripe account or install the Stripe integration from the Vercel Marketplace.
2. Start in Stripe test mode.
3. Create a £29 annual recurring price and a £75 one-time price.
4. Create the 50%-off coupon with duration **once**.
5. Add the keys and IDs listed in `.env.example` to Vercel.
6. Add the webhook URL `https://www.getgoodgrief.co.uk/api/stripe-webhook` and its required events from `INTEGRATIONS.md`.
7. Redeploy, then run a test purchase before switching to live keys.

## Connect invitation email

1. Add Resend through the Vercel Marketplace or create a Resend API key.
2. Verify `getgoodgrief.co.uk` and its SPF/DKIM records in Resend.
3. Add `RESEND_API_KEY` and `GOOD_GRIEF_EMAIL_FROM` to Preview and Production in Vercel.
4. Create a test invitation and confirm both delivery and the private-link fallback.
