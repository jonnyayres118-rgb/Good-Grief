import test from "node:test";
import assert from "node:assert/strict";

import {
  MAX_TRUSTED_PEOPLE,
  inviteCapacity,
  storageMode,
} from "../server/commercialRules.js";

test("an unpaid draft stays on the device even when the backend is connected", () => {
  assert.equal(storageMode({ backendConnected: true, paid: false }), "device");
});

test("a paid draft uses secure storage when the backend is connected", () => {
  assert.equal(storageMode({ backendConnected: true, paid: true }), "secure");
  assert.equal(storageMode({ backendConnected: false, paid: true }), "device");
});

test("a paid member can have three active trusted people", () => {
  assert.equal(MAX_TRUSTED_PEOPLE, 3);
  assert.deepEqual(inviteCapacity(0), { limit: 3, active: 0, remaining: 3, available: true });
  assert.deepEqual(inviteCapacity(2), { limit: 3, active: 2, remaining: 1, available: true });
  assert.deepEqual(inviteCapacity(3), { limit: 3, active: 3, remaining: 0, available: false });
  assert.deepEqual(inviteCapacity(8), { limit: 3, active: 8, remaining: 0, available: false });
});
