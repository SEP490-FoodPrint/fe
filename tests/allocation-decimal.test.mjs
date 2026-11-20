import assert from "node:assert/strict";
import test from "node:test";
import {
  formatAllocationDecimal,
  sumAllocationPortions,
  compareAllocationPortions,
} from "../src/utils/allocationDecimal.js";

test("decimal portions preserve exact hundredth totals", () => {
  assert.equal(sumAllocationPortions(["16.67", "33.33"]), "50.00");
  assert.equal(sumAllocationPortions(["0.10", "0.20"]), "0.30");
  assert.equal(compareAllocationPortions("50.00", 50), 0);
  assert.equal(formatAllocationDecimal("16.67"), "16,67");
  assert.equal(formatAllocationDecimal("33.33"), "33,33");
  assert.equal(formatAllocationDecimal("1000.000000000", 3), "1000,000");
  assert.throws(() => sumAllocationPortions(["16.677"]));
});
