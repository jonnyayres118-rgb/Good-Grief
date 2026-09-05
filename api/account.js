import { authenticate, getAdmin, send } from "../server/services.js";

export default async function handler(req, res) {
  if (req.method !== "DELETE") return send(res, 405, { error: "Method not allowed" });
  try {
    const user = await authenticate(req);
    if (!user) return send(res, 401, { error: "Please sign in." });
    const { error } = await getAdmin().auth.admin.deleteUser(user.id);
    if (error) throw error;
    return send(res, 200, { deleted: true });
  } catch (error) {
    console.error("account deletion", error);
    return send(res, 500, { error: "We could not delete the account. Please try again." });
  }
}
