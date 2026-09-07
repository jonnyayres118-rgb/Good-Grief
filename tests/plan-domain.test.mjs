import test from "node:test";
import assert from "node:assert/strict";

import {
  AREA_KEYS,
  calculateProgress,
  containsSensitiveSecret,
  filterPlanByPermissions,
  getBlockStatus,
  markBlockSorted,
  normalizePlan,
  updateBlockAnswer,
} from "../src/domain/plan.js";

test("legacy funeral answers are preserved inside My send-off", () => {
  const plan = normalizePlan({ soundtrack: "Heroes", setting: "The beach" });
  assert.equal(plan.sendOff.music, "Heroes");
  assert.equal(plan.sendOff.setting, "The beach");
  assert.equal(getBlockStatus(plan, "sendOff", "music"), "sorted");
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

test("existing non-empty answers migrate to sorted blocks", () => {
  const plan = normalizePlan({ wishes: { possessions: "Jasmine gets the records" } });

  assert.equal(getBlockStatus(plan, "wishes", "possessions"), "sorted");
  assert.equal(plan.wishes._sorted.possessions, true);
});

test("editing a sorted block makes it a draft until it is marked sorted again", () => {
  const existing = normalizePlan({ wishes: { possessions: "Jasmine gets the records" } });
  const draft = updateBlockAnswer(existing, "wishes", "possessions", "Jasmine gets the records and books");

  assert.equal(getBlockStatus(draft, "wishes", "possessions"), "draft");
  assert.deepEqual(calculateProgress(draft), { completed: 0, drafted: 1, total: 20, percent: 0 });

  const sorted = markBlockSorted(draft, "wishes", "possessions");
  assert.equal(getBlockStatus(sorted, "wishes", "possessions"), "sorted");
  assert.deepEqual(calculateProgress(sorted), { completed: 1, drafted: 0, total: 20, percent: 5 });
});

test("a blank block cannot be marked sorted", () => {
  const plan = markBlockSorted(normalizePlan(), "wishes", "possessions");

  assert.equal(getBlockStatus(plan, "wishes", "possessions"), "empty");
  assert.equal(calculateProgress(plan).completed, 0);
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
