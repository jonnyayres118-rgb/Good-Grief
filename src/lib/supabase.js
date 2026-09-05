import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
export const isLiveBackend = Boolean(supabase);

function makeId() {
  return crypto.randomUUID?.() || `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readLocal(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

async function captureLead({ name, email, plan, consent }) {
  const endpoint = import.meta.env.VITE_LEAD_CAPTURE_ENDPOINT;
  if (!endpoint) return;
  await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name, email, membership_type: plan, marketing_consent: consent, account_date: new Date().toISOString() }),
  });
}

export async function createAccount({ name, email, password, plan, consent }) {
  if (!supabase) {
    const demoUser = { id: makeId(), name, email: email.toLowerCase(), plan };
    localStorage.setItem("gg-user", JSON.stringify(demoUser));
    await captureLead({ name, email, plan, consent }).catch(() => {});
    return { user: demoUser, demo: true, requiresConfirmation: false };
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name, selected_plan: plan },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
  await captureLead({ name, email, plan, consent }).catch(() => {});
  return { user: data.user, demo: false, requiresConfirmation: !data.session };
}

export async function resendConfirmation(email) {
  if (!supabase) return { demo: true };
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) throw error;
  return { sent: true };
}

export async function completeEmailConfirmation() {
  if (!supabase) return { confirmed: true, demo: true };
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const errorDescription = query.get("error_description") || hash.get("error_description");
  const errorCode = query.get("error_code") || hash.get("error_code");
  if (errorDescription || errorCode) throw new Error(errorDescription || errorCode);
  const code = query.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
  }
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session) throw new Error("This confirmation link is invalid or has expired.");
  return { confirmed: true, user: data.session.user };
}

export async function signIn({ email, password }) {
  if (!supabase) {
    const current = readLocal("gg-user", {});
    const demoUser = { id: current.id || makeId(), name: current.name || email.split("@")[0], email: email.toLowerCase(), plan: current.plan || "annual" };
    localStorage.setItem("gg-user", JSON.stringify(demoUser));
    return { user: demoUser, demo: true };
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { user: data.user, demo: false };
}

export async function currentUser() {
  if (!supabase) return readLocal("gg-user", null);
  const { data } = await supabase.auth.getUser();
  return data.user || null;
}

async function apiFetch(path, options = {}) {
  if (!supabase) throw new Error("The live account database has not been connected.");
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Please sign in first.");
  const response = await fetch(path, {
    ...options,
    headers: { "content-type": "application/json", authorization: `Bearer ${token}`, ...(options.headers || {}) },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Something went wrong.");
  return payload;
}

export async function persistPlan(plan) {
  localStorage.setItem("gg-plan", JSON.stringify(plan));
  if (!supabase) return { demo: true };
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) return { demo: true };
  const { error } = await supabase.from("funeral_plans").upsert(
    { user_id: userId, answers: plan, updated_at: new Date().toISOString() },
    { onConflict: "user_id" },
  );
  if (error) throw error;
  return { demo: false };
}

export function loadPlan() {
  return readLocal("gg-plan", {});
}

export async function loadCloudPlan() {
  if (!supabase) return loadPlan();
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) return loadPlan();
  const { data, error } = await supabase.from("funeral_plans").select("answers,updated_at").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  if (data?.answers) localStorage.setItem("gg-plan", JSON.stringify(data.answers));
  return { answers: data?.answers || loadPlan(), updatedAt: data?.updated_at || null };
}

export async function getEntitlement() {
  if (!supabase) {
    const membership = readLocal("gg-membership", null);
    return membership || { paid: false, membershipType: "none", paymentStatus: "unpaid", referralDiscountAvailable: Boolean(readLocal("gg-referral", false)) };
  }
  return apiFetch("/api/entitlement");
}

export async function getPaymentConfiguration() {
  if (!supabase) return { configured: false, mode: "preview" };
  const response = await fetch("/api/payment-config");
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) return { configured: false, mode: "unavailable" };
  return payload;
}

export async function startCheckout(plan) {
  if (!supabase) {
    if (!import.meta.env.DEV) throw new Error("Secure payments have not been connected yet.");
    const referralDiscountAvailable = Boolean(readLocal("gg-referral", false));
    localStorage.setItem("gg-membership", JSON.stringify({ paid: true, membershipType: plan, paymentStatus: "active", referralDiscountAvailable: false }));
    if (referralDiscountAvailable) localStorage.setItem("gg-referral", "false");
    return { demo: true };
  }
  return apiFetch("/api/checkout", { method: "POST", body: JSON.stringify({ plan }) });
}

export async function openBillingPortal() {
  if (!supabase) {
    if (!import.meta.env.DEV) throw new Error("Billing settings are not connected yet.");
    return { demo: true };
  }
  return apiFetch("/api/billing-portal", { method: "POST", body: "{}" });
}

export async function deleteAccount() {
  if (!supabase) {
    ["gg-user", "gg-plan", "gg-membership", "gg-access", "gg-incoming", "gg-shares", "gg-referral"].forEach(key => localStorage.removeItem(key));
    return { deleted: true, demo: true };
  }
  const result = await apiFetch("/api/account", { method: "DELETE", body: "{}" });
  await supabase.auth.signOut();
  localStorage.removeItem("gg-plan");
  return result;
}

export async function createInvite(email, answers, permissions) {
  if (!supabase) {
    const membership = await getEntitlement();
    if (!membership.paid) throw new Error("Complete payment before sharing your plan.");
    const token = makeId().replace(/-/g, "").slice(0, 20);
    const invite = { id: makeId(), invited_email: email.toLowerCase(), status: "pending", permissions, created_at: new Date().toISOString(), token };
    const access = readLocal("gg-access", []);
    localStorage.setItem("gg-access", JSON.stringify([invite, ...access.filter(item => item.invited_email !== invite.invited_email)]));
    const shares = readLocal("gg-shares", {});
    shares[token] = { answers: Object.fromEntries(permissions.map(key => [key, answers[key]])), invitedEmail: invite.invited_email, ownerName: readLocal("gg-user", {}).name || "Someone you trust", createdAt: invite.created_at };
    localStorage.setItem("gg-shares", JSON.stringify(shares));
    return { invite, inviteUrl: `${window.location.origin}/shared/${token}`, demo: true };
  }
  return apiFetch("/api/invites", { method: "POST", body: JSON.stringify({ email, permissions }) });
}

export async function getAccessSummary() {
  if (!supabase) return { peopleWithAccess: readLocal("gg-access", []), plansSharedWithMe: readLocal("gg-incoming", []) };
  return apiFetch("/api/invites");
}

export async function revokeAccess(id) {
  if (!supabase) {
    const next = readLocal("gg-access", []).filter(item => item.id !== id);
    localStorage.setItem("gg-access", JSON.stringify(next));
    return { peopleWithAccess: next, plansSharedWithMe: readLocal("gg-incoming", []) };
  }
  return apiFetch("/api/invites", { method: "DELETE", body: JSON.stringify({ id }) });
}

export async function acceptInvite(token) {
  if (!supabase) {
    const shared = readLocal("gg-shares", {})[token];
    if (!shared) throw new Error("This invitation is not available in this preview.");
    const user = readLocal("gg-user", null);
    if (!user) throw new Error("Create an account or sign in to accept this invitation.");
    if (shared.invitedEmail && shared.invitedEmail !== user.email?.toLowerCase()) throw new Error(`Sign in using ${shared.invitedEmail} to view this plan.`);
    localStorage.setItem("gg-referral", "true");
    return { accepted: true, discount: { plan: "annual", percentOff: 50, firstYearOnly: true }, demo: true };
  }
  return apiFetch("/api/accept-invite", { method: "POST", body: JSON.stringify({ token }) });
}

export async function loadSharedPlan(token) {
  if (!supabase) {
    const shared = readLocal("gg-shares", {})[token];
    if (!shared) throw new Error("This invitation is not available in this preview.");
    return { answers: shared.answers || {}, ownerName: shared.ownerName || "Someone you trust", updatedAt: shared.createdAt || null, demo: true };
  }
  return apiFetch("/api/shared-plan", { method: "POST", body: JSON.stringify({ token }) });
}
