import test from "node:test";
import assert from "node:assert/strict";
import {
  daysBetween,
  rentalQuote,
  isRangeAvailable,
  blockedFor,
} from "../src/booking.ts";
test("inclusive dates remain correct across daylight saving changes", () => {
  assert.equal(daysBetween("2026-03-07", "2026-03-09"), 3);
  assert.equal(daysBetween("2026-11-01", "2026-11-01"), 1);
  assert.equal(daysBetween("2026-02-30", "2026-03-02"), 0);
  assert.equal(daysBetween("2026-10-12", "2026-10-10"), 0);
});
test("weekly and monthly pricing combine with extra daily rates", () => {
  assert.deepEqual(rentalQuote(8, 100, 550, 2000, 250, 75), {
    rental: 650,
    deposit: 250,
    delivery: 75,
    total: 975,
    savings: 150,
  });
  assert.equal(rentalQuote(32, 100, 550, 2000).rental, 2200);
});
test("rates never make a discounted rental more expensive than daily pricing", () =>
  assert.equal(rentalQuote(7, 100, 900, 4000).rental, 700));
test("unavailable days inside a range invalidate the entire request", () => {
  assert.equal(
    isRangeAvailable("2026-10-10", "2026-10-12", new Set(["2026-10-11"])),
    false,
  );
  assert.equal(
    isRangeAvailable("2026-10-12", "2026-10-13", new Set(["2026-10-11"])),
    true,
  );
});
test("only accepted real requests reserve dates", () => {
  const request = {
    equipmentId: "tractor",
    kind: "rent",
    start: "2026-10-10",
    end: "2026-10-12",
    status: "accepted",
  };
  assert.equal(blockedFor("tractor", [], [request]).size, 3);
  assert.equal(
    blockedFor(
      "tractor",
      [],
      [
        { ...request, status: "cancelled" },
        { ...request, sample: true },
      ],
    ).size,
    0,
  );
});
test("invalid rental lengths and negative charges are rejected", () => {
  assert.throws(() => rentalQuote(0, 100));
  assert.throws(() => rentalQuote(91, 100));
  assert.throws(() => rentalQuote(1, 100, 600, 2200, -10));
});
