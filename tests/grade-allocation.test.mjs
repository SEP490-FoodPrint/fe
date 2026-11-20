import assert from "node:assert/strict";
import test from "node:test";
import {
  gradeBatchProjection,
  mergeGradeBatchEntries,
  classRemainingAcrossOtherBatches,
} from "../src/utils/gradeAllocation.js";
import { previewBatchAllocation } from "../src/utils/mealAllocation.js";

function fixture() {
  return {
    grades: [
      {
        gradeId: "g45",
        demands: [{ id: "a", totalPortions: 254 }],
        dishes: [
          {
            dishId: "dish",
            totalRequiredPortions: "254.00",
            batches: [
              {
                cookingBatchId: "batch",
                plannedPortions: "617.00",
                entries: [
                  { dailyMealPortionId: "a", allocatedPortions: "254.00" },
                ],
              },
            ],
          },
        ],
      },
      {
        gradeId: "g13",
        demands: [{ id: "b", totalPortions: 363 }],
        dishes: [
          {
            dishId: "dish",
            totalRequiredPortions: "363.00",
            batches: [
              {
                cookingBatchId: "batch",
                plannedPortions: "617.00",
                entries: [
                  { dailyMealPortionId: "b", allocatedPortions: "363.00" },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}
const project = (data, draft, index) => {
  const grade = data.grades[index],
    dish = grade.dishes[0];
  return gradeBatchProjection(data, draft, grade, dish, dish.batches[0]);
};
test("shared 617 batch reports 254/254 and 363/363 within each grade", () => {
  const data = fixture();
  const first = project(data, {}, 0),
    second = project(data, {}, 1);
  assert.equal(first.allocatedForGrade, "254.00");
  assert.equal(first.gradeRequiredPortions, "254.00");
  assert.equal(second.allocatedForGrade, "363.00");
  assert.equal(second.gradeRequiredPortions, "363.00");
  assert.equal(first.sharedRemaining, "0.00");
  assert.equal(second.sharedRemaining, "0.00");
  assert.equal(first.editableCapacityForGrade, "254.00");
  assert.equal(second.editableCapacityForGrade, "363.00");
  assert.notEqual(first.scopeKey, second.scopeKey);
});
test("editing one grade preserves other grade entries and shared capacity", () => {
  const data = fixture(),
    key = "batch_dish";
  const draft = {
    [key]: mergeGradeBatchEntries(data, {}, key, "g45", [
      { dailyMealPortionId: "a", allocatedPortions: "242.00" },
    ]),
  };
  assert.equal(project(data, draft, 0).allocatedForGrade, "242.00");
  assert.equal(project(data, draft, 1).allocatedForGrade, "363.00");
  assert.equal(project(data, draft, 0).sharedRemaining, "12.00");
  assert.equal(project(data, draft, 0).editableCapacityForGrade, "254.00");
  const updated = {
    [key]: mergeGradeBatchEntries(data, draft, key, "g13", [
      { dailyMealPortionId: "b", allocatedPortions: "350.00" },
    ]),
  };
  assert.equal(project(data, updated, 0).allocatedForGrade, "242.00");
  assert.equal(project(data, updated, 1).sharedRemaining, "25.00");
});
test("multiple batches subtract amounts already received by the same class", () => {
  const dish = {
    batches: [
      { cookingBatchId: "one", entries: [{ id: "a", portions: 100 }] },
      { cookingBatchId: "two", entries: [{ id: "a", portions: 154 }] },
    ],
  };
  assert.equal(
    classRemainingAcrossOtherBatches(dish, "one", "a", 254),
    "100.00",
  );
  assert.equal(
    classRemainingAcrossOtherBatches(dish, "two", "a", 254),
    "154.00",
  );
});
test("class preview keeps exact hundredths and skips fully served classes", () => {
  const result = previewBatchAllocation(
    "0.30",
    [
      { id: "done", remaining: 0 },
      { id: "a", name: "A", remaining: "0.10" },
      { id: "b", name: "B", remaining: "0.20" },
    ],
    ["done", "a", "b"],
  );
  assert.deepEqual(
    result.entries.map((entry) => entry.portions),
    [0.1, 0.2],
  );
  assert.equal(result.remaining, 0);
});
