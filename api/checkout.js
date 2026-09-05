import { authenticate, bodyOf, getAdmin, getStripe, requestOrigin, send } from "../server/services.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });
  try {
    const user = await authenticate(req);
    if (!user) return send(res, 401, { error: "Please sign in before checkout." });
    const { plan } = bodyOf(req);
    if (!['annual', 'lifetime'].includes(plan)) return send(res, 400, { error: "Choose a valid plan." });

    const admin = getAdmin();
    const { data: profile } = await admin.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
    if (["active", "trialing"].includes(profile?.payment_status)) {
      return send(res, 409, { error: "Your membership is already active." });
    }
    const referralDiscount = plan === "annual" && Boolean(profile?.referral_discount_available);
    const price = plan === "annual" ? process.env.STRIPE_ANNUAL_PRICE_ID : process.env.STRIPE_LIFETIME_PRICE_ID;
    if (!price) return send(res, 503, { error: "Payments are being connected. Please try again shortly." });
    if (referralDiscount && !process.env.STRIPE_INVITEE_COUPON_ID) {
      return send(res, 503, { error: "The invitation discount is not configured yet." });
    }

    const origin = requestOrigin(req);
    const metadata = { user_id: user.id, plan, referral_discount: referralDiscount ? "true" : "false" };
    const session = await getStripe().checkout.sessions.create({
      mode: plan === "annual" ? "subscription" : "payment",
      customer: profile?.stripe_customer_id || undefined,
      customer_email: profile?.stripe_customer_id ? undefined : user.email,
      client_reference_id: user.id,
      line_items: [{ price, quantity: 1 }],
      discounts: referralDiscount ? [{ coupon: process.env.STRIPE_INVITEE_COUPON_ID }] : undefined,
      allow_promotion_codes: false,
      metadata,
      subscription_data: plan === "annual" ? { metadata } : undefined,
      success_url: `${origin}/planner?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/planner?checkout=cancelled`,
    });
    return send(res, 200, { url: session.url });
  } catch (error) {
    console.error("checkout", error);
    return send(res, 500, { error: error.message || "Unable to start checkout." });
  }
}
