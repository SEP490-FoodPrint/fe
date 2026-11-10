import { applyBatchAllocation } from "../../../../utils/mealAllocation.js"

const schoolId = "10000000-0000-4000-8000-000000000001"
const teacherId = "10000000-0000-4000-8000-000000000002"
const kitchenUserId = "10000000-0000-4000-8000-000000000003"
const mealDate = new Date("2026-11-10T00:00:00Z")
const createdAt = new Date("2026-11-10T01:00:00Z")
const finalizedAt = new Date("2026-11-10T02:00:00Z")
const completedAt = new Date("2026-11-10T03:00:00Z")
const dish = {
  id: "20000000-0000-4000-8000-000000000001",
  schoolId,
  name: "Thịt kho trứng",
  description: null,
  status: "ACTIVE",
  createdAt,
  updatedAt: createdAt,
}
const menuDay = {
  id: "20000000-0000-4000-8000-000000000002",
  weeklyMenuId: "20000000-0000-4000-8000-000000000003",
  menuDate: mealDate,
  note: null,
  approvalStatus: "APPROVED",
  createdAt,
  updatedAt: createdAt,
}

// Scalar Prisma records. Relations are represented by their foreign keys.
const classes = [["5A", 50], ["5B", 5], ["5C", 5], ["5D", 35], ["5E", 45], ["5G", 40]]
  .map(([name, registeredMealPortions], index) => ({
    id: `30000000-0000-4000-8000-00000000000${index + 1}`,
    schoolId,
    name,
    academicYear: "2026-2027",
    registeredMealPortions,
    status: "ACTIVE",
    createdAt,
    updatedAt: createdAt,
  }))

const dailyMealPortions = classes.map(({ id, registeredMealPortions }, index) => ({
  id: `40000000-0000-4000-8000-00000000000${index + 1}`,
  classId: id,
  confirmedByUserId: teacherId,
  mealDate,
  mealType: "LUNCH",
  totalPortions: registeredMealPortions,
  allergyNotes: null,
  status: "FINALIZED",
  finalizedAt,
  createdAt,
  updatedAt: finalizedAt,
}))

const cookingBatches = [
  [90, "Bếp chính · Ca sáng 09:45"],
  [80, "Bếp phụ 1 · Ca sáng 10:10"],
  [60, "Bếp phụ 2 · Ca sáng 10:25"],
].map(([plannedPortions, note], index) => ({
  id: `50000000-0000-4000-8000-00000000000${index + 1}`,
  batchCode: `CB-20261110-${index + 1}`,
  menuDayId: menuDay.id,
  dishId: dish.id,
  mealType: "LUNCH",
  cookingModeApplied: "SEPARATE_BY_LOT",
  createdByUserId: kitchenUserId,
  status: "COMPLETED",
  plannedPortions,
  note,
  confirmedByUserId: kitchenUserId,
  confirmedAt: finalizedAt,
  completedByUserId: kitchenUserId,
  completedAt,
  createdAt,
  updatedAt: completedAt,
}))

export const mockMealAllocation = {
  dish,
  menuDay,
  classes,
  dailyMealPortions,
  cookingBatches,
  mealAllocations: [],
  mealAllocationBatches: [],
}

export const allocationScenarios = [
  { id: "A", summary: "50 → 5 → 5 → 30", order: [0, 1, 2, 3] },
  { id: "B", summary: "50 → 35 → 5 → 0", order: [0, 3, 1, 2] },
]

// One local allocation per daily demand. The demand UUID also works as its demo ID.
export const getMockAllocationId = demandId => demandId

export function createScenarioData(scenario) {
  const [batch] = cookingBatches
  const orderedIds = scenario.order.map(index => dailyMealPortions[index].id)
  return applyBatchAllocation(mockMealAllocation, batch.id, orderedIds, batch.completedAt, getMockAllocationId)
}
