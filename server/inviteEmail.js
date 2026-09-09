function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function singleLine(value, fallback) {
  return String(value || fallback).replace(/[\r\n]+/g, " ").trim();
}

export function buildInviteEmail({ ownerName, inviteUrl }) {
  const safeOwner = escapeHtml(singleLine(ownerName, "Someone you trust"));
  const safeUrl = escapeHtml(inviteUrl);
  const plainOwner = singleLine(ownerName, "Someone you trust");
  return {
    subject: `${plainOwner} has shared their Good Grief plan with you`,
    html: `<!doctype html><html><body style="margin:0;background:#f7f1e7;color:#131a35;font-family:Montserrat,Arial,sans-serif"><div style="max-width:560px;margin:0 auto;padding:40px 24px"><div style="font-size:26px;font-weight:800;margin-bottom:36px">Good Grief</div><div style="background:#ffffff;border:3px solid #131a35;border-radius:18px;padding:32px"><p style="color:#d82f7d;font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase">A private invitation</p><h1 style="font-size:34px;line-height:1.05;margin:12px 0 18px">${safeOwner} trusts you with their plan.</h1><p style="font-size:17px;line-height:1.55">Create a free Good Grief account, or sign in with this email address, to view only the areas they chose to share.</p><a href="${safeUrl}" style="display:inline-block;margin-top:18px;background:#f6eb38;color:#131a35;border:3px solid #131a35;border-radius:999px;padding:14px 22px;font-weight:800;text-decoration:none">View the plan</a><p style="font-size:13px;line-height:1.5;margin-top:28px;color:#586078">This link is private. Please do not forward it. Access is read-only and can be withdrawn by the plan owner.</p></div></div></body></html>`,
    text: `${plainOwner} has shared their Good Grief plan with you. Sign in using this email address to view it: ${inviteUrl}\n\nThis private access is read-only and can be withdrawn by the plan owner.`,
  };
}

export async function sendInviteEmail({ to, ownerName, inviteUrl, inviteId, fetchImpl = fetch }) {
  if (!process.env.RESEND_API_KEY) return { sent: false, reason: "not_configured" };
  const message = buildInviteEmail({ ownerName, inviteUrl });
  try {
    const response = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "content-type": "application/json",
        "idempotency-key": `good-grief-plan-invite-${inviteId}`,
      },
      body: JSON.stringify({
        from: process.env.GOOD_GRIEF_EMAIL_FROM || "Good Grief <hello@getgoodgrief.co.uk>",
        to: [to],
        ...message,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return { sent: false, reason: "delivery_failed" };
    return { sent: true, messageId: payload.id || null };
  } catch {
    return { sent: false, reason: "delivery_failed" };
  }
}
