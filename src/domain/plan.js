export const AREA_KEYS = ["wishes", "people", "sendOff", "importantStuff", "vault"];

export const AREA_FIELDS = {
  wishes: ["personalWishes", "possessions", "pets", "messages"],
  people: ["keyPeople", "decisionMaker", "familyNotes", "professionalContacts"],
  sendOff: ["farewell", "setting", "music", "details"],
  importantStuff: ["insurance", "property", "money", "household"],
  vault: ["documents", "storage", "digitalAccess", "advisers"],
};

const LEGACY_SEND_OFF_FIELDS = {
  bigPicture: "details",
  farewell: "farewell",
  setting: "setting",
  people: "details",
  soundtrack: "music",
  words: "details",
  style: "details",
  afterwards: "details",
  noThanks: "details",
  practical: "details",
};

export function createEmptyPlan() {
  return Object.fromEntries(AREA_KEYS.map((key) => [key, {}]));
}

export function normalizePlan(raw = {}) {
  const result = createEmptyPlan();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return result;

  for (const key of AREA_KEYS) {
    if (raw[key] && typeof raw[key] === "object" && !Array.isArray(raw[key])) {
      result[key] = { ...raw[key] };
    }
  }

  for (const [legacyKey, newKey] of Object.entries(LEGACY_SEND_OFF_FIELDS)) {
    const value = raw[legacyKey];
    if (!value || typeof value === "object") continue;
    if (result.sendOff[newKey]) {
      result.sendOff[newKey] = `${result.sendOff[newKey]}\n\n${value}`;
    } else {
      result.sendOff[newKey] = value;
    }
  }
  return result;
}

export function calculateProgress(rawPlan) {
  const plan = normalizePlan(rawPlan);
  const total = Object.values(AREA_FIELDS).reduce((sum, fields) => sum + fields.length, 0);
  const completed = AREA_KEYS.reduce((sum, area) => sum + AREA_FIELDS[area].filter((field) => {
    const value = plan[area][field];
    return Array.isArray(value) ? value.length > 0 : Boolean(String(value || "").trim());
  }).length, 0);
  return { completed, total, percent: Math.round((completed / total) * 100) };
}

export function filterPlanByPermissions(rawPlan, permissions = []) {
  const plan = normalizePlan(rawPlan);
  return Object.fromEntries(permissions.filter((key) => AREA_KEYS.includes(key)).map((key) => [key, plan[key]]));
}

export function containsSensitiveSecret(value = "") {
  const text = String(value).toLowerCase();
  return /\b(password|passcode|pin|cvv|security code|one[- ]time code|card number)\b/.test(text);
}
