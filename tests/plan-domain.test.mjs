import test from "node:test";
import assert from "node:assert/strict";

import {
  AREA_KEYS,
  calculateProgress,
  containsSensitiveSecret,
  filterPlanByPermissions,
  normalizePlan,
} from "../src/domain/plan.js";

test("legacy funeral answers are preserved inside My send-off", () => {
  const plan = normalizePlan({ soundtrack: "Heroes", setting: "The beach" });
  assert.equal(plan.sendOff.music, "Heroes");
  assert.equal(plan.sendOff.setting, "The beach");
  assert.deepEqual(Object.keys(plan), AREA_KEYS);
});

test("progress reports completed fields across the whole plan", () => {
  const plan = normalizePlan({
    wishes: { possessions: "Jasmine gets the records", messages: "With my solicitor" },
    sendOff: { music: "Bowie" },
  });
  const progress = calculateProgress(plan);
  assert.equal(progress.completed, 3);
  assert.equal(progress.total, 20);
  assert.equal(progress.percent, 15);
});

test("shared plans contain only explicitly permitted areas", () => {
  const plan = normalizePlan({
    wishes: { possessions: "The records" },
    sendOff: { music: "Bowie" },
    vault: { documents: "Blue folder" },
  });
  assert.deepEqual(filterPlanByPermissions(plan, ["wishes", "sendOff"]), {
    wishes: plan.wishes,
    sendOff: plan.sendOff,
  });
});

test("secret-like wording is detected before it is stored", () => {
  assert.equal(containsSensitiveSecret("My bank password is hunter2"), true);
  assert.equal(containsSensitiveSecret("PIN: 1234"), true);
  assert.equal(containsSensitiveSecret("My documents are in the blue folder"), false);
});
