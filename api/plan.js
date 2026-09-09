import { authenticate, bodyOf, getAdmin, send } from "../server/services.js";
import { ensurePaidProfile, planRecord } from "../server/planStorage.js";

export default async function handler(req, res) {
  if (!["GET", "PUT"].includes(req.method)) return send(res, 405, { error: "Method not allowed" });
  try {
    const user = await authenticate(req);
    if (!user) return send(res, 401, { error: "Please sign in." });
    const admin = getAdmin();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("payment_status")
      .eq("user_id", user.id)
      .maybeSingle();
    if (profileError) throw profileError;
    ensurePaidProfile(profile);

    if (req.method === "GET") {
      const { data, error } = await admin
        .from("funeral_plans")
        .select("answers,updated_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return send(res, 200, { answers: data?.answers || {}, updatedAt: data?.updated_at || null, storage: "secure" });
    }

    const record = planRecord(user.id, bodyOf(req).answers);
    const { data, error } = await admin
      .from("funeral_plans")
      .upsert(record, { onConflict: "user_id" })
      .select("updated_at")
      .single();
    if (error) throw error;
    return send(res, 200, { saved: true, updatedAt: data.updated_at, storage: "secure" });
  } catch (error) {
    console.error("plan storage", error);
    return send(res, error.status || 500, { error: error.message || "Unable to store your plan." });
  }
}
