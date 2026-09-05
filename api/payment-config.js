import { send } from "../server/services.js";

export default function handler(req, res) {
  if (req.method !== "GET") return send(res, 405, { error: "Method not allowed" });
  const configured = Boolean(
    process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_WEBHOOK_SECRET &&
    process.env.STRIPE_ANNUAL_PRICE_ID &&
    process.env.STRIPE_LIFETIME_PRICE_ID,
  );
  return send(res, 200, {
    configured,
    mode: process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ? "live" : configured ? "test" : "not_connected",
  });
}
