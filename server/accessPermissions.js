export const SHAREABLE_AREAS = ["wishes", "people", "sendOff", "importantStuff", "vault"];

export function sanitizePermissions(value) {
  if (!Array.isArray(value)) return [...SHAREABLE_AREAS];
  return [...new Set(value.filter((key) => SHAREABLE_AREAS.includes(key)))];
}

export function filterSharedAnswers(answers = {}, permissions = []) {
  const allowed = sanitizePermissions(permissions);
  return Object.fromEntries(allowed.filter((key) => answers[key] && typeof answers[key] === "object").map((key) => [key, answers[key]]));
}
