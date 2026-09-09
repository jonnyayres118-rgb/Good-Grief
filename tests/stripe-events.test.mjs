import test from "node:test";
import assert from "node:assert/strict";

import { periodEndFromInvoice, shouldProcessEvent } from "../server/stripeEvents.js";

test("the latest invoice line period becomes the membership renewal date", () => {
  const invoice = {
    lines: { data: [
      { period: { end: 1810000000 } },
      { period: { end: 1820000000 } },
    ] },
  };
  assert.equal(periodEndFromInvoice(invoice), new Date(1820000000 * 1000).toISOString());
  assert.equal(periodEndFromInvoice({}), null);
});

test("completed or currently processing Stripe events are not processed twice", () => {
  assert.equal(shouldProcessEvent(null), true);
  assert.equal(shouldProcessEvent({ status: "failed" }), true);
  assert.equal(shouldProcessEvent({ status: "processing" }), false);
  assert.equal(shouldProcessEvent({ status: "completed" }), false);
});
