import { getAdmin, getStripe, rawBody, send } from "../server/services.js";
import { beginStripeEvent, completeStripeEvent, failStripeEvent, periodEndFromInvoice } from "../server/stripeEvents.js";

export const config = { api: { bodyParser: false } };

async function activateCheckout(session) {
  const userId = session.client_reference_id || session.metadata?.user_id;
  if (!userId) return;
  if (session.payment_status && !["paid", "no_payment_required"].includes(session.payment_status)) return;
  const plan = session.metadata?.plan || (session.mode === "subscription" ? "annual" : "lifetime");
  const admin = getAdmin();
  const profileUpdate = {
    user_id: userId,
    membership_type: plan,
    payment_status: "active",
    stripe_customer_id: typeof session.customer === "string" ? session.customer : session.customer?.id,
    stripe_subscription_id: typeof session.subscription === "string" ? session.subscription : session.subscription?.id || null,
    updated_at: new Date().toISOString(),
  };
  if (session.metadata?.referral_discount === "true") {
    profileUpdate.referral_discount_available = false;
    profileUpdate.referral_discount_used_at = new Date().toISOString();
  }
  const { error } = await admin.from("profiles").upsert(profileUpdate, { onConflict: "user_id" });
  if (error) throw error;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });
  let event;
  let admin;
  try {
    const payload = await rawBody(req);
    const signature = req.headers["stripe-signature"];
    event = getStripe().webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
    admin = getAdmin();
    if (!await beginStripeEvent(admin, event)) return send(res, 200, { received: true, duplicate: true });
    if (["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)) {
      await activateCheckout(event.data.object);
    }
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object;
      const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
      if (customerId) {
        const update = { payment_status: "active", updated_at: new Date().toISOString() };
        const periodEnd = periodEndFromInvoice(invoice);
        if (periodEnd) update.current_period_end = periodEnd;
        const { error } = await admin.from("profiles").update(update).eq("stripe_customer_id", customerId);
        if (error) throw error;
      }
    }
    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object;
      const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
      if (customerId) {
        const { error } = await admin.from("profiles").update({ payment_status: "past_due", updated_at: new Date().toISOString() }).eq("stripe_customer_id", customerId);
        if (error) throw error;
      }
    }
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const { error } = await admin.from("profiles").update({ payment_status: "cancelled", updated_at: new Date().toISOString() }).eq("stripe_subscription_id", subscription.id);
      if (error) throw error;
    }
    await completeStripeEvent(admin, event.id);
    return send(res, 200, { received: true });
  } catch (error) {
    if (admin && event?.id) await failStripeEvent(admin, event.id, error).catch(() => {});
    console.error("stripe webhook", error);
    return send(res, 400, { error: `Webhook error: ${error.message}` });
  }
}
