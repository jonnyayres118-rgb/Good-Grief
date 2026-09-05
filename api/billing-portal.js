import { authenticate, getAdmin, getStripe, requestOrigin, send } from "../server/services.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });
  try {
    const user = await authenticate(req);
    if (!user) return send(res, 401, { error: "Please sign in." });
    const { data: profile, error } = await getAdmin().from("profiles").select("stripe_customer_id,membership_type").eq("user_id", user.id).maybeSingle();
    if (error) throw error;
    if (!profile?.stripe_customer_id) return send(res, 404, { error: "No Stripe billing account was found." });
    const session = await getStripe().billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${requestOrigin(req)}/planner?view=membership`,
    });
    return send(res, 200, { url: session.url, membershipType: profile.membership_type });
  } catch (error) {
    console.error("billing portal", error);
    return send(res, 500, { error: error.message || "Unable to open billing settings." });
  }
}
