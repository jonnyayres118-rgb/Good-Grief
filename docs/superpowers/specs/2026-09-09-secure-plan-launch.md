# Good Grief secure-plan launch specification

## Goal

Make Good Grief purchasable without putting planning behind a paywall. A visitor can build a complete draft for free on one device. Payment converts that draft into a private, account-backed living plan and unlocks controlled sharing with up to three trusted people.

## Approved journey

1. A visitor opens the Plan Board without registering and drafts any of the twenty blocks.
2. The unpaid draft autosaves only in that browser's local storage.
3. Selecting `Secure my plan` asks the visitor to create or sign into a Good Grief account, then sends them to Stripe Checkout for either £29/year or £75 lifetime.
4. A return from Checkout does not grant access. Only a verified Stripe webhook can activate membership.
5. Once membership is active, the browser draft is uploaded to Supabase and subsequent edits sync across devices.
6. A paid member can invite at most three trusted people. Each invitation is tied to one email address and explicit plan areas.
7. A recipient creates a free account or signs in with the invited address before seeing the shared, read-only plan.
8. The recipient can create a local draft of their own. Payment is required only to secure it to their account and unlock their own invitations.

## Storage and permission boundary

- Local drafting is available without an account and without payment.
- Unpaid authenticated users must not be able to insert, update or read an owner plan through the Supabase Data API.
- Paid owners may read and update their own plan.
- Accepted recipients may see only explicitly shared areas, through authenticated server endpoints.
- Payment, invitation and shared-plan checks are server-side; interface state is never treated as authorization.
- Stripe is the source of truth for paid entitlement.
- Stripe webhook events are recorded idempotently before membership is changed.

## Invitation delivery

- Creating an invitation stores only a SHA-256 hash of its secret token.
- Good Grief sends a branded transactional invitation through Resend when configured.
- The response still provides the private link so the owner can copy it if email delivery is unavailable.
- Pending and accepted invitations count toward the limit of three; revoked invitations do not.
- Re-inviting a revoked address is allowed only when a slot is available.

## Email and referrals

- Invitation and account-security messages are transactional.
- Marketing consent is optional, unticked and stored separately with its timestamp and source.
- No plan answers, named recipients, invitation tokens or private plan content enter marketing systems.
- Product-suite campaigns and partner lead transfer remain disabled until specific offers, consent wording and regulated-partner arrangements are approved.

## Customer language

- The primary unpaid call to action is `Secure my plan`.
- Unpaid state says `Saved on this device` and explains that payment adds private cloud storage and sharing.
- Paid state says `Saved securely` only after a successful server write.
- Membership copy describes secure storage, cross-device access and three trusted-person invitations.

## Release requirements

- Apply the production migration to the active Good Grief Supabase project.
- Configure Supabase Auth URLs and the Good Grief confirmation template.
- Configure Stripe prices, coupon, webhook and customer portal in test mode before live mode.
- Configure a verified Resend sender for invitation delivery.
- Run unit tests, Sites packaging tests, a production build and an authenticated browser journey.
- Do not switch Stripe to live mode until a complete test purchase activates membership, uploads the local draft and sends a working invitation.
