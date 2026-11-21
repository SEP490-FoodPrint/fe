import assert from "node:assert/strict";
import test from "node:test";
import { allocationRows, hasAllocationChanges } from "../src/utils/allocationDraft.js";

const entry = (id, portions) => ({ dailyMealPortionId: id, allocatedPortions: portions });
const base = (b1, b2) => ({
  grades: [
    {
      dishes: [
        {
          dishId: "dish",
          batches: [
            { cookingBatchId: "b1", entries: b1 },
            { cookingBatchId: "b2", entries: b2 },
          ],
        },
      ],
    },
  ],
});
const original = () => base([entry("c1", "28"), entry("c2", "12")], [entry("c3", "10.5")]);

test("changing row order or number formatting does not enable saving", () => {
  const view = original();
  assert.equal(hasAllocationChanges(view, {}), false);
  const reordered = { b1_dish: [entry("c2", "12.00"), entry("c1", "28.00")] };
  assert.equal(hasAllocationChanges(view, { "b1_dish": reordered.b1_dish }), false);
  assert.equal(allocationRows(view)[0].allocatedPortions, "28.00");
});

test("moving a class between batches or changing portions enables saving", () => {
  const view = original();
  assert.equal(hasAllocationChanges(view, { b1_dish: [entry("c1", "28")] }), true);
  assert.equal(hasAllocationChanges(view, { b1_dish: [entry("c1", "27.99"), entry("c2", "12")] }), true);
});

test("editing then undoing back to the source content turns saving off again", () => {
  const view = original();
  assert.equal(hasAllocationChanges(view, { b1_dish: [entry("c1", "30"), entry("c2", "12")] }), true);
  assert.equal(hasAllocationChanges(view, { b1_dish: [entry("c1", "28.0"), entry("c2", "12")] }), false);
});

test("exact decimals survive a move between batches", () => {
  const rows = allocationRows(original(), { b2_dish: [entry("c3", "10.5"), entry("c1", "16.67")] });
  assert.equal(rows.find((r) => r.batchId === "b2" && r.demandId === "c1").allocatedPortions, "16.67");
});

import { previewBatchAllocation } from "../src/utils/mealAllocation.js";

test("class order fills from the top and the last class receives only the remainder", () => {
  const classes = [
    { id: "a", name: "4A", remaining: 30, total: 30 },
    { id: "b", name: "4B", remaining: 30, total: 30 },
    { id: "c", name: "4C", remaining: 30, total: 30 },
  ];
  const { entries, remaining } = previewBatchAllocation(70, classes, ["c", "a", "b"]);
  assert.deepEqual(entries.map((e) => [e.id, e.portions, e.remaining]), [["c", 30, 0], ["a", 30, 0], ["b", 10, 20]]);
  assert.equal(remaining, 0);
  assert.equal(previewBatchAllocation(100, classes, ["a", "b", "c"]).remaining, 10);
});
