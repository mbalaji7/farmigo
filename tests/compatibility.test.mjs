import test from "node:test";
import assert from "node:assert/strict";
import { checkCompatibility } from "../src/compatibility.ts";
test("power and connection mismatches are reported while missing requirements remain unknown", () => {
  const e = {
    minimumTractorHp: 120,
    pto: "540 rpm",
    hitch: "Category II",
    hydraulics: "2 remotes",
  };
  assert.equal(
    checkCompatibility(e, 100, "1000 rpm", "Category I").issues.length,
    3,
  );
  assert.equal(
    checkCompatibility(e, 150, "540 RPM", "category ii").issues.length,
    0,
  );
  assert.equal(
    checkCompatibility(e, 150, "540 RPM", "category ii").missing.length,
    0,
  );
  assert.equal(
    checkCompatibility({}, 150, "540 rpm", "Category II").missing.length,
    4,
  );
});
