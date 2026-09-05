import { authenticate, bodyOf, getAdmin, hashInviteToken, send } from "../server/services.js";
import { filterSharedAnswers } from "../server/accessPermissions.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });
  try {
    const user = await authenticate(req);
    if (!user) return send(res, 401, { error: "Please sign in to view this plan." });
    const { token } = bodyOf(req);
    const admin = getAdmin();
    const { data: invite, error } = await admin.from("plan_access").select("owner_user_id,status,viewer_user_id,permissions").eq("token_hash", hashInviteToken(token)).maybeSingle();
    if (error) throw error;
    if (!invite || invite.status !== "accepted" || invite.viewer_user_id !== user.id) return send(res, 403, { error: "You do not have access to this plan." });
    const [{ data: plan, error: planError }, { data: owner }, { data: ownerProfile, error: ownerError }] = await Promise.all([
      admin.from("funeral_plans").select("answers,updated_at").eq("user_id", invite.owner_user_id).maybeSingle(),
      admin.from("profiles").select("full_name").eq("user_id", invite.owner_user_id).maybeSingle(),
      admin.from("profiles").select("payment_status").eq("user_id", invite.owner_user_id).maybeSingle(),
    ]);
    if (planError) throw planError;
    if (ownerError) throw ownerError;
    if (!["active", "trialing"].includes(ownerProfile?.payment_status)) return send(res, 403, { error: "This plan is not currently available to share." });
    return send(res, 200, { answers: filterSharedAnswers(plan?.answers || {}, invite.permissions), permissions: invite.permissions, updatedAt: plan?.updated_at || null, ownerName: owner?.full_name || "Someone you trust" });
  } catch (error) {
    console.error("shared plan", error);
    return send(res, 500, { error: error.message || "Unable to load this plan." });
  }
}
