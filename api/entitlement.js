import { authenticate, getAdmin, isPaidProfile, send } from "../server/services.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return send(res, 405, { error: "Method not allowed" });
  try {
    const user = await authenticate(req);
    if (!user) return send(res, 401, { error: "Please sign in." });
    const { data: profile, error } = await getAdmin().from("profiles").select("membership_type,payment_status,current_period_end,referral_discount_available").eq("user_id", user.id).maybeSingle();
    if (error) throw error;
    return send(res, 200, {
      paid: isPaidProfile(profile),
      membershipType: profile?.membership_type || "none",
      paymentStatus: profile?.payment_status || "unpaid",
      currentPeriodEnd: profile?.current_period_end || null,
      referralDiscountAvailable: Boolean(profile?.referral_discount_available),
    });
  } catch (error) {
    console.error("entitlement", error);
    return send(res, 500, { error: "Unable to check membership." });
  }
}
