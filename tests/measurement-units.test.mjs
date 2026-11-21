import assert from "node:assert/strict";
import test from "node:test";
import {
  quantityMilli,
  quantityError,
  unitStepWarning,
  findMeasurementUnit,
  requireOrderQuantity,
} from "../src/utils/measurementUnits.js";
const kg = {
  code: "kg",
  symbol: "kg",
  recommendedStep: "0.1",
  aliases: ["kilogram"],
};
test("recommendation uses exact decimals and suggests adjacent positive multiples", () => {
  assert.equal(unitStepWarning("10.5", kg), "");
  assert.equal(unitStepWarning("0.3", kg), "");
  assert.match(unitStepWarning("10.52", kg), /10,5 kg hoặc 10,6 kg/);
  assert.equal(requireOrderQuantity("10.52"), "10.52");
  assert.match(unitStepWarning("0.01", kg), /Giá trị gần nhất: 0,1 kg/);
  assert.doesNotMatch(unitStepWarning("0.01", kg), /0 kg/);
  assert.equal(
    unitStepWarning("0.5", { symbol: "quả", recommendedStep: "0.5" }),
    "",
  );
  assert.match(
    unitStepWarning("1.2", { symbol: "quả", recommendedStep: "0.5" }),
    /1 quả hoặc 1,5 quả/,
  );
  assert.match(
    unitStepWarning("1.5", { symbol: "miếng", recommendedStep: "1" }),
    /1 miếng hoặc 2 miếng/,
  );
  assert.equal(
    unitStepWarning("0.75", { symbol: "cái", recommendedStep: "0.25" }),
    "",
  );
  assert.match(
    unitStepWarning("0.6", { symbol: "cái", recommendedStep: "0.25" }),
    /0,5 cái hoặc 0,75 cái/,
  );
});
test("invalid input stays distinct from nonblocking recommendation", () => {
  for (const value of ["-1", "0", "1.0001", "1e3", "100000000000"]) {
    assert.ok(quantityError(value));
    assert.throws(() => requireOrderQuantity(value));
  }
  assert.equal(quantityMilli("10,520"), 10520n);
  assert.equal(findMeasurementUnit([kg], " KILOGRAM "), kg);
  assert.equal(unitStepWarning("1.2", null), "");
});
