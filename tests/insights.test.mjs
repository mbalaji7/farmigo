import test from "node:test";
import assert from "node:assert/strict";
import { summarizeRequests } from "../src/insights.ts";
test("insights exclude sample requests, cancelled quotes, purchase prices, and rental deposits", () => {
  const result = summarizeRequests([
    {
      kind: "rent",
      status: "accepted",
      total: 1000,
      deposit: 200,
      stage: "returned",
    },
    { kind: "rent", status: "accepted", total: 9999, sample: true },
    { kind: "rent", status: "cancelled", total: 500 },
    { kind: "buy", status: "accepted", total: 20000 },
    { kind: "rent", status: "pending", total: 250 },
  ]);
  assert.deepEqual(result, {
    inquiries: 4,
    pending: 1,
    accepted: 1,
    quoted: 800,
    returned: 1,
  });
});
