import test from "node:test";
import assert from "node:assert/strict";
import { sanitizePermissions, filterSharedAnswers } from "../server/accessPermissions.js";

test("invitation permissions accept only recognised areas", () => {
  assert.deepEqual(sanitizePermissions(["wishes", "sendOff", "admin", "vault"]), ["wishes", "sendOff", "vault"]);
  assert.deepEqual(sanitizePermissions([]), []);
});

test("shared answers are filtered to the accepted invitation permissions", () => {
  const filtered = filterSharedAnswers({ wishes: { pets: "Jasmine" }, sendOff: { music: "Bowie" }, vault: { documents: "Blue folder" } }, ["sendOff"]);
  assert.deepEqual(filtered, { sendOff: { music: "Bowie" } });
});
