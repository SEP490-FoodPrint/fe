import assert from "node:assert/strict"
import test from "node:test"
import {
  belowMinimum,
  isValidAmount,
  normalizeAmount,
} from "../src/pages/SCHOOL/SamplePolicy/component/samplePolicyConfig.js"

test("accepts positive decimal amounts and normalizes the decimal comma", () => {
  assert.equal(normalizeAmount(" 80,125 "), "80.125")
  for (const value of ["0.001", "100", "150,125"]) {
    assert.equal(isValidAmount(value), true, value)
  }
  for (const value of ["", "0", "-1", "1.2345", "1e3", "1000000000"]) {
    assert.equal(isValidAmount(value), false, value)
  }
})

test("warns below the sample minimum without invalidating the amount", () => {
  assert.equal(isValidAmount("99,999"), true)
  assert.equal(belowMinimum("99,999", 100), true)
  assert.equal(belowMinimum("100", 100), false)
  assert.equal(belowMinimum("149,999", 150), true)
  assert.equal(belowMinimum("150", 150), false)
  assert.equal(belowMinimum("0", 100), false)
})
