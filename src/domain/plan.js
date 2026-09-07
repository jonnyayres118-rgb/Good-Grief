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

function hasValue(value) {
  return Array.isArray(value) ? value.length > 0 : Boolean(String(value || "").trim());
}

export function normalizePlan(raw = {}) {
  const result = createEmptyPlan();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return result;

  for (const key of AREA_KEYS) {
    if (raw[key] && typeof raw[key] === "object" && !Array.isArray(raw[key])) {
      const area = { ...raw[key] };
      const storedStatuses = area._sorted && typeof area._sorted === "object" && !Array.isArray(area._sorted)
        ? area._sorted
        : Object.fromEntries(AREA_FIELDS[key].filter((field) => hasValue(area[field])).map((field) => [field, true]));
      result[key] = { ...area, _sorted: { ...storedStatuses } };
    } else {
      result[key] = { _sorted: {} };
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
    result.sendOff._sorted[newKey] = true;
  }
  return result;
}

export function getBlockStatus(rawPlan, areaKey, field) {
  if (!AREA_FIELDS[areaKey]?.includes(field)) return "empty";
  const plan = normalizePlan(rawPlan);
  if (!hasValue(plan[areaKey][field])) return "empty";
  return plan[areaKey]._sorted?.[field] === true ? "sorted" : "draft";
}

export function updateBlockAnswer(rawPlan, areaKey, field, value) {
  const plan = normalizePlan(rawPlan);
  if (!AREA_FIELDS[areaKey]?.includes(field)) return plan;
  return {
    ...plan,
    [areaKey]: {
      ...plan[areaKey],
      [field]: value,
      _sorted: { ...plan[areaKey]._sorted, [field]: false },
    },
  };
}

export function markBlockSorted(rawPlan, areaKey, field) {
  const plan = normalizePlan(rawPlan);
  if (!AREA_FIELDS[areaKey]?.includes(field) || !hasValue(plan[areaKey][field])) return plan;
  return {
    ...plan,
    [areaKey]: {
      ...plan[areaKey],
      _sorted: { ...plan[areaKey]._sorted, [field]: true },
    },
  };
}

export function calculateProgress(rawPlan) {
  const plan = normalizePlan(rawPlan);
  const total = Object.values(AREA_FIELDS).reduce((sum, fields) => sum + fields.length, 0);
  const completed = AREA_KEYS.reduce((sum, area) => sum + AREA_FIELDS[area].filter((field) => getBlockStatus(plan, area, field) === "sorted").length, 0);
  const drafted = AREA_KEYS.reduce((sum, area) => sum + AREA_FIELDS[area].filter((field) => getBlockStatus(plan, area, field) === "draft").length, 0);
  return { completed, drafted, total, percent: Math.round((completed / total) * 100) };
}

export function filterPlanByPermissions(rawPlan, permissions = []) {
  const plan = normalizePlan(rawPlan);
  return Object.fromEntries(permissions.filter((key) => AREA_KEYS.includes(key)).map((key) => [key, plan[key]]));
}

export function containsSensitiveSecret(value = "") {
  const text = String(value).toLowerCase();
  return /\b(password|passcode|pin|cvv|security code|one[- ]time code|card number)\b/.test(text);
}
