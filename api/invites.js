import { authenticate, bodyOf, getAdmin, hashInviteToken, isPaidProfile, makeInviteToken, requestOrigin, send } from "../server/services.js";
import { sanitizePermissions } from "../server/accessPermissions.js";
import { inviteCapacity } from "../server/commercialRules.js";
import { sendInviteEmail } from "../server/inviteEmail.js";

async function accessSummary(admin, user) {
  const [{ data: outgoing, error: outgoingError }, { data: incoming, error: incomingError }] = await Promise.all([
    admin.from("plan_access").select("id,invited_email,status,permissions,created_at,accepted_at").eq("owner_user_id", user.id).neq("status", "revoked").order("created_at", { ascending: false }),
    admin.from("plan_access").select("id,owner_user_id,status,accepted_at").eq("viewer_user_id", user.id).eq("status", "accepted").order("accepted_at", { ascending: false }),
  ]);
  if (outgoingError) throw outgoingError;
  if (incomingError) throw incomingError;
  const ownerIds = [...new Set((incoming || []).map(item => item.owner_user_id))];
  const { data: owners } = ownerIds.length
    ? await admin.from("profiles").select("user_id,full_name,email").in("user_id", ownerIds)
    : { data: [] };
  const ownerMap = Object.fromEntries((owners || []).map(owner => [owner.user_id, owner]));
  const capacity = inviteCapacity((outgoing || []).length);
  return {
    peopleWithAccess: outgoing || [],
    plansSharedWithMe: (incoming || []).map(item => ({ ...item, owner: ownerMap[item.owner_user_id] || null })),
    inviteLimit: capacity.limit,
    activeInviteCount: capacity.active,
    invitesRemaining: capacity.remaining,
  };
}

export default async function handler(req, res) {
  try {
    const user = await authenticate(req);
    if (!user) return send(res, 401, { error: "Please sign in." });
    const admin = getAdmin();

    if (req.method === "GET") return send(res, 200, await accessSummary(admin, user));

    if (req.method === "DELETE") {
      const { id } = bodyOf(req);
      const { error } = await admin.from("plan_access").update({ status: "revoked", revoked_at: new Date().toISOString() }).eq("id", id).eq("owner_user_id", user.id);
      if (error) throw error;
      return send(res, 200, await accessSummary(admin, user));
    }

    if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });
    const { data: profile } = await admin.from("profiles").select("payment_status").eq("user_id", user.id).maybeSingle();
    if (!isPaidProfile(profile)) return send(res, 402, { error: "Complete payment before sharing your plan." });

    const { email, permissions: requestedPermissions } = bodyOf(req);
    const invitedEmail = String(email || "").trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(invitedEmail)) return send(res, 400, { error: "Enter a valid email address." });
    if (invitedEmail === String(user.email || "").toLowerCase()) return send(res, 400, { error: "Invite someone other than yourself." });
    const permissions = sanitizePermissions(requestedPermissions);
    if (!permissions.length) return send(res, 400, { error: "Choose at least one area to share." });
    const { data: existing } = await admin.from("plan_access").select("id,status").eq("owner_user_id", user.id).eq("invited_email", invitedEmail).maybeSingle();
    if (existing?.status === "accepted") return send(res, 409, { error: "This person already has access." });
    const { count: activeInviteCount, error: countError } = await admin
      .from("plan_access")
      .select("id", { count: "exact", head: true })
      .eq("owner_user_id", user.id)
      .in("status", ["pending", "accepted"]);
    if (countError) throw countError;
    const capacity = inviteCapacity(activeInviteCount || 0);
    if (!capacity.available && existing?.status !== "pending") {
      return send(res, 409, { error: "You already have three trusted people. Revoke one invitation before adding another." });
    }

    const token = makeInviteToken();
    const record = {
      owner_user_id: user.id,
      invited_email: invitedEmail,
      token_hash: hashInviteToken(token),
      status: "pending",
      viewer_user_id: null,
      accepted_at: null,
      revoked_at: null,
      permissions,
    };
    const query = existing
      ? admin.from("plan_access").update(record).eq("id", existing.id).select("id,status,invited_email,permissions,created_at").single()
      : admin.from("plan_access").insert(record).select("id,status,invited_email,permissions,created_at").single();
    const { data: invite, error } = await query;
    if (error) throw error;
    const inviteUrl = `${requestOrigin(req)}/shared/${token}`;
    const { data: owner } = await admin.from("profiles").select("full_name").eq("user_id", user.id).maybeSingle();
    const delivery = await sendInviteEmail({
      to: invitedEmail,
      ownerName: owner?.full_name || user.user_metadata?.full_name || "Someone you trust",
      inviteUrl,
      inviteId: invite.id,
    });
    if (delivery.sent) {
      await admin.from("plan_access").update({
        invitation_sent_at: new Date().toISOString(),
        email_message_id: delivery.messageId,
      }).eq("id", invite.id);
    }
    return send(res, 200, { invite, inviteUrl, delivery });
  } catch (error) {
    console.error("invites", error);
    return send(res, 500, { error: error.message || "Unable to manage access." });
  }
}
