export const MAX_TRUSTED_PEOPLE = 3;

export function storageMode({ backendConnected, paid }) {
  return backendConnected && paid ? "secure" : "device";
}

export function inviteCapacity(activeCount) {
  const active = Math.max(0, Number(activeCount) || 0);
  const remaining = Math.max(0, MAX_TRUSTED_PEOPLE - active);
  return {
    limit: MAX_TRUSTED_PEOPLE,
    active,
    remaining,
    available: remaining > 0,
  };
}
