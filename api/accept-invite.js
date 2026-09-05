import { authenticate, bodyOf, getAdmin, hashInviteToken, send } from "../server/services.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });
  try {
    const user = await authenticate(req);
    if (!user) return send(res, 401, { error: "Create an account or sign in to accept this invitation." });
    const { token } = bodyOf(req);
    const admin = getAdmin();
    const { data: invite, error } = await admin.from("plan_access").select("id,owner_user_id,invited_email,status").eq("token_hash", hashInviteToken(token)).maybeSingle();
    if (error) throw error;
    if (!invite || invite.status === "revoked") return send(res, 404, { error: "This invitation is no longer available." });
    if (invite.invited_email !== String(user.email || "").toLowerCase()) {
      return send(res, 403, { error: `Sign in using ${invite.invited_email} to view this plan.` });
    }
    const { data: ownerProfile, error: ownerError } = await admin.from("profiles").select("payment_status").eq("user_id", invite.owner_user_id).maybeSingle();
    if (ownerError) throw ownerError;
    if (!["active", "trialing"].includes(ownerProfile?.payment_status)) {
      return send(res, 403, { error: "This plan is not currently available to share." });
    }
    const acceptedAt = new Date().toISOString();
    const { error: updateError } = await admin.from("plan_access").update({ viewer_user_id: user.id, status: "accepted", accepted_at: acceptedAt }).eq("id", invite.id);
    if (updateError) throw updateError;
    const { data: viewerProfile } = await admin.from("profiles").select("payment_status,referral_discount_used_at").eq("user_id", user.id).maybeSingle();
    const canReceiveDiscount = !["active", "trialing"].includes(viewerProfile?.payment_status) && !viewerProfile?.referral_discount_used_at;
    await admin.from("profiles").upsert({
      user_id: user.id,
      email: String(user.email || "").toLowerCase(),
      full_name: user.user_metadata?.full_name || null,
      referral_discount_available: canReceiveDiscount,
      referral_invite_id: invite.id,
    }, { onConflict: "user_id" });
    return send(res, 200, { accepted: true, discount: canReceiveDiscount ? { plan: "annual", percentOff: 50, firstYearOnly: true } : null });
  } catch (error) {
    console.error("accept invite", error);
    return send(res, 500, { error: error.message || "Unable to accept this invitation." });
  }
}
