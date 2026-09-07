import test from "node:test";
import assert from "node:assert/strict";
import { planSteps, productAreas, pricing } from "../src/content/product.js";

test("the product is organised around the five approved family-planning areas", () => {
  assert.deepEqual(productAreas.map((area) => area.title), [
    "My wishes", "My people", "My send-off", "My important stuff", "My vault",
  ]);
  assert.equal(productAreas.every((area) => area.fields.length === 4), true);
});

test("pricing stays simple with annual and lifetime choices", () => {
  assert.deepEqual(pricing.map(({ name, price }) => ({ name, price })), [
    { name: "Annual", price: "£29" },
    { name: "Lifetime", price: "£75" },
  ]);
});

test("every planning block offers three specific ways to begin", () => {
  assert.equal(planSteps.length, 20);
  assert.equal(planSteps.every((step) => Array.isArray(step.starterPrompts) && step.starterPrompts.length === 3), true);
  assert.equal(planSteps.every((step) => step.starterPrompts.every((prompt) => prompt.trim().length >= 8)), true);
});
