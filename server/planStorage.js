import { isPaidProfile } from "./services.js";

export function ensurePaidProfile(profile) {
  if (isPaidProfile(profile)) return profile;
  const error = new Error("Secure your plan before using private cloud storage.");
  error.status = 402;
  throw error;
}

export function planRecord(userId, answers, updatedAt = new Date().toISOString()) {
  if (!userId) throw new Error("A cloud plan requires an authenticated owner.");
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    throw new Error("Submit a valid plan.");
  }
  return { user_id: userId, answers, updated_at: updatedAt };
}
