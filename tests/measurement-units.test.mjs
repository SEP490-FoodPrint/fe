import assert from "node:assert/strict";
import test from "node:test";
import {
  quantityMilli,
  quantityError,
  findMeasurementUnit,
  requireOrderQuantity,
} from "../src/utils/measurementUnits.js";
const kg = {
  code: "kg",
  symbol: "kg",
  aliases: ["kilogram"],
};
test("order quantities keep exact decimals without step rounding", () => {
  assert.equal(requireOrderQuantity("10.52"), "10.52");
  assert.equal(requireOrderQuantity("27.72"), "27.72");
  assert.equal(quantityError("27.72"), "");
});
test("invalid input is rejected", () => {
  for (const value of ["-1", "0", "1.0001", "1e3", "100000000000"]) {
    assert.ok(quantityError(value));
    assert.throws(() => requireOrderQuantity(value));
  }
  assert.equal(quantityMilli("10,520"), 10520n);
  assert.equal(findMeasurementUnit([kg], " KILOGRAM "), kg);
});
