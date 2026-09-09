import test from "node:test";
import assert from "node:assert/strict";

import { ensurePaidProfile, planRecord } from "../server/planStorage.js";

test("cloud plan storage rejects an unpaid profile", () => {
  assert.throws(
    () => ensurePaidProfile({ payment_status: "unpaid" }),
    (error) => error.status === 402 && /Secure your plan/i.test(error.message),
  );
});

test("cloud plan storage accepts active and trialing profiles", () => {
  assert.doesNotThrow(() => ensurePaidProfile({ payment_status: "active" }));
  assert.doesNotThrow(() => ensurePaidProfile({ payment_status: "trialing" }));
});

test("a cloud plan record is tied to the authenticated owner", () => {
  assert.deepEqual(planRecord("user-123", { wishes: { pets: "Jasmine" } }, "2026-09-09T12:00:00.000Z"), {
    user_id: "user-123",
    answers: { wishes: { pets: "Jasmine" } },
    updated_at: "2026-09-09T12:00:00.000Z",
  });
  assert.throws(() => planRecord("", {}), /authenticated owner/i);
  assert.throws(() => planRecord("user-123", null), /valid plan/i);
});
