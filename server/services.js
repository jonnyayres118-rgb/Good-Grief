import crypto from "node:crypto";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

let adminClient;
let stripeClient;

function env(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

export function getAdmin() {
  if (!adminClient) {
    adminClient = createClient(
      process.env.SUPABASE_URL || env("VITE_SUPABASE_URL"),
      env("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return adminClient;
}

export function getStripe() {
  if (!stripeClient) stripeClient = new Stripe(env("STRIPE_SECRET_KEY"));
  return stripeClient;
}

export async function authenticate(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  const { data, error } = await getAdmin().auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

export function send(res, status, payload) {
  res.status(status).setHeader("content-type", "application/json");
  res.end(JSON.stringify(payload));
}

export function bodyOf(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body;
}

export function requestOrigin(req) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}

export function makeInviteToken() {
  return crypto.randomBytes(24).toString("base64url");
}

export function hashInviteToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

export async function rawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

export function isPaidProfile(profile) {
  return Boolean(profile && ["active", "trialing"].includes(profile.payment_status));
}
