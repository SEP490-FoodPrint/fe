/**
 * Mock Data chuẩn API Backend cho Phân bổ suất ăn
 * Dành riêng cho: Trường Tiểu học FoodPrint (FP-DEMO-SCHOOL-01)
 * Ngày áp dụng: 15/11/2026 (Hôm nay)
 */

const initialAllocationData = {
  date: "2026-11-15",
  status: "READY",
  message: "Đã hoàn thành kiểm thực bước 2 & lưu mẫu thức ăn. Sẵn sàng phân bổ suất ăn cho 10 lớp học.",
  action: null,
  revision: "rev-foodprint-20261115-v1",
  missingSampleBatches: 0,
  schoolName: "Trường Tiểu học FoodPrint",
  schoolCode: "FP-DEMO-SCHOOL-01",

  totals: {
    finalized: 325,
    planned: 325,
    cooked: 325,
    sampled: 325,
  },

  meals: [
    {
      mealType: "LUNCH",
      finalized: 325,
      planned: 325,
      cooked: 325,
      sampled: 325,
    },
  ],

  // 10 lớp học bán trú của Trường Tiểu học FoodPrint
  demands: [
    { id: "dem-1a", name: "Lớp 1A", mealType: "LUNCH", totalPortions: 34, locked: false },
    { id: "dem-1b", name: "Lớp 1B", mealType: "LUNCH", totalPortions: 34, locked: false },
    { id: "dem-2a", name: "Lớp 2A", mealType: "LUNCH", totalPortions: 35, locked: false },
    { id: "dem-2b", name: "Lớp 2B", mealType: "LUNCH", totalPortions: 33, locked: false },
    { id: "dem-3a", name: "Lớp 3A (GVCN: teacher@foodprint.edu.vn)", mealType: "LUNCH", totalPortions: 34, locked: false },
    { id: "dem-3b", name: "Lớp 3B", mealType: "LUNCH", totalPortions: 32, locked: false },
    { id: "dem-4a", name: "Lớp 4A", mealType: "LUNCH", totalPortions: 31, locked: false },
    { id: "dem-4b", name: "Lớp 4B", mealType: "LUNCH", totalPortions: 30, locked: false },
    { id: "dem-5a", name: "Lớp 5A", mealType: "LUNCH", totalPortions: 32, locked: false },
    { id: "dem-5b", name: "Lớp 5B", mealType: "LUNCH", totalPortions: 30, locked: false },
  ],

  // 2 Lô nấu tương ứng với 2 khối lớp trong trường FoodPrint
  batches: [
    {
      id: "batch-fp-01",
      name: "Lô 1 · Bữa trưa · Khối lớp 1–3",
      mealType: "LUNCH",
      plannedPortions: 170,
      note: "Mẻ nấu 01 - Bếp A1 (Khẩu phần Khối 1-3) - Đã lưu mẫu tủ A1",
      status: "CONFIRMED",
      hasSample: true,
      scopeLabel: "Khối lớp 1–3",
      eligibleDemandIds: ["dem-1a", "dem-1b", "dem-2a", "dem-2b", "dem-3a"],
      entries: [
        { dailyMealPortionId: "dem-1a", allocatedPortions: 34, locked: false },
        { dailyMealPortionId: "dem-1b", allocatedPortions: 34, locked: false },
        { dailyMealPortionId: "dem-2a", allocatedPortions: 35, locked: false },
        { dailyMealPortionId: "dem-2b", allocatedPortions: 33, locked: false },
        { dailyMealPortionId: "dem-3a", allocatedPortions: 34, locked: false },
      ],
    },
    {
      id: "batch-fp-02",
      name: "Lô 2 · Bữa trưa · Khối lớp 4–5",
      mealType: "LUNCH",
      plannedPortions: 155,
      note: "Mẻ nấu 02 - Bếp B2 (Khẩu phần Khối 4-5) - Đã lưu mẫu tủ A1",
      status: "CONFIRMED",
      hasSample: true,
      scopeLabel: "Khối lớp 4–5",
      eligibleDemandIds: ["dem-3b", "dem-4a", "dem-4b", "dem-5a", "dem-5b"],
      entries: [
        { dailyMealPortionId: "dem-3b", allocatedPortions: 32, locked: false },
        { dailyMealPortionId: "dem-4a", allocatedPortions: 31, locked: false },
        { dailyMealPortionId: "dem-4b", allocatedPortions: 30, locked: false },
        { dailyMealPortionId: "dem-5a", allocatedPortions: 32, locked: false },
        { dailyMealPortionId: "dem-5b", allocatedPortions: 30, locked: false },
      ],
    },
  ],

  // Cấu trúc phân cấp theo Khối -> Món -> Lô (Chuẩn mới)
  grades: [
    {
      gradeId: "grade-1",
      gradeName: "Khối 1",
      demands: [
        { id: "dem-1a", classId: "cls-1a", className: "Lớp 1A", totalPortions: 34, locked: false },
        { id: "dem-1b", classId: "cls-1b", className: "Lớp 1B", totalPortions: 34, locked: false },
      ],
      dishes: [
        {
          dishId: "dish-ga-01",
          dishName: "Gà xào nấm",
          mealType: "LUNCH",
          totalRequiredPortions: 68,
          autoAssigned: true,
          batches: [
            {
              cookingBatchId: "batch-ga-k1",
              batchCode: "Lô G1",
              plannedPortions: 68,
              availablePortions: 0,
              autoAssigned: true,
              entries: [
                { dailyMealPortionId: "dem-1a", className: "Lớp 1A", allocatedPortions: 34, locked: false },
                { dailyMealPortionId: "dem-1b", className: "Lớp 1B", allocatedPortions: 34, locked: false },
              ],
            },
          ],
        },
        {
          dishId: "dish-bo-01",
          dishName: "Bò xào hành cần",
          mealType: "LUNCH",
          totalRequiredPortions: 68,
          autoAssigned: false,
          batches: [
            {
              cookingBatchId: "batch-bo-k1-1",
              batchCode: "Lô B1",
              plannedPortions: 34,
              availablePortions: 0,
              autoAssigned: false,
              entries: [
                { dailyMealPortionId: "dem-1a", className: "Lớp 1A", allocatedPortions: 34, locked: false },
              ],
            },
            {
              cookingBatchId: "batch-bo-k1-2",
              batchCode: "Lô B2",
              plannedPortions: 34,
              availablePortions: 0,
              autoAssigned: false,
              entries: [
                { dailyMealPortionId: "dem-1b", className: "Lớp 1B", allocatedPortions: 34, locked: false },
              ],
            },
          ],
        },
      ],
    },
    {
      gradeId: "grade-2-3",
      gradeName: "Khối 2 & 3",
      demands: [
        { id: "dem-2a", classId: "cls-2a", className: "Lớp 2A", totalPortions: 35, locked: false },
        { id: "dem-2b", classId: "cls-2b", className: "Lớp 2B", totalPortions: 33, locked: false },
        { id: "dem-3a", classId: "cls-3a", className: "Lớp 3A", totalPortions: 34, locked: false },
      ],
      dishes: [
        {
          dishId: "dish-thit-01",
          dishName: "Thịt heo kho trứng cút",
          mealType: "LUNCH",
          totalRequiredPortions: 102,
          autoAssigned: true,
          batches: [
            {
              cookingBatchId: "batch-thit-k23",
              batchCode: "Lô T1",
              plannedPortions: 102,
              availablePortions: 0,
              autoAssigned: true,
              entries: [
                { dailyMealPortionId: "dem-2a", className: "Lớp 2A", allocatedPortions: 35, locked: false },
                { dailyMealPortionId: "dem-2b", className: "Lớp 2B", allocatedPortions: 33, locked: false },
                { dailyMealPortionId: "dem-3a", className: "Lớp 3A", allocatedPortions: 34, locked: false },
              ],
            },
          ],
        },
        {
          dishId: "dish-canh-01",
          dishName: "Canh súp rau củ thập cẩm",
          mealType: "LUNCH",
          totalRequiredPortions: 102,
          autoAssigned: true,
          batches: [
            {
              cookingBatchId: "batch-canh-k23",
              batchCode: "Lô C1",
              plannedPortions: 102,
              availablePortions: 0,
              autoAssigned: true,
              entries: [
                { dailyMealPortionId: "dem-2a", className: "Lớp 2A", allocatedPortions: 35, locked: false },
                { dailyMealPortionId: "dem-2b", className: "Lớp 2B", allocatedPortions: 33, locked: false },
                { dailyMealPortionId: "dem-3a", className: "Lớp 3A", allocatedPortions: 34, locked: false },
              ],
            },
          ],
        },
      ],
    },
    {
      gradeId: "grade-4-5",
      gradeName: "Khối 4 & 5",
      demands: [
        { id: "dem-3b", classId: "cls-3b", className: "Lớp 3B", totalPortions: 32, locked: false },
        { id: "dem-4a", classId: "cls-4a", className: "Lớp 4A", totalPortions: 31, locked: false },
        { id: "dem-4b", classId: "cls-4b", className: "Lớp 4B", totalPortions: 30, locked: false },
        { id: "dem-5a", classId: "cls-5a", className: "Lớp 5A", totalPortions: 32, locked: false },
        { id: "dem-5b", classId: "cls-5b", className: "Lớp 5B", totalPortions: 30, locked: false },
      ],
      dishes: [
        {
          dishId: "dish-ca-01",
          dishName: "Cá hồi sốt cam",
          mealType: "LUNCH",
          totalRequiredPortions: 155,
          autoAssigned: true,
          batches: [
            {
              cookingBatchId: "batch-ca-k45",
              batchCode: "Lô CH1",
              plannedPortions: 155,
              availablePortions: 0,
              autoAssigned: true,
              entries: [
                { dailyMealPortionId: "dem-3b", className: "Lớp 3B", allocatedPortions: 32, locked: false },
                { dailyMealPortionId: "dem-4a", className: "Lớp 4A", allocatedPortions: 31, locked: false },
                { dailyMealPortionId: "dem-4b", className: "Lớp 4B", allocatedPortions: 30, locked: false },
                { dailyMealPortionId: "dem-5a", className: "Lớp 5A", allocatedPortions: 32, locked: false },
                { dailyMealPortionId: "dem-5b", className: "Lớp 5B", allocatedPortions: 30, locked: false },
              ],
            },
          ],
        },
        {
          dishId: "dish-rau-01",
          dishName: "Rau củ luộc chấm kho quẹt",
          mealType: "LUNCH",
          totalRequiredPortions: 155,
          autoAssigned: true,
          batches: [
            {
              cookingBatchId: "batch-rau-k45",
              batchCode: "Lô R1",
              plannedPortions: 155,
              availablePortions: 0,
              autoAssigned: true,
              entries: [
                { dailyMealPortionId: "dem-3b", className: "Lớp 3B", allocatedPortions: 32, locked: false },
                { dailyMealPortionId: "dem-4a", className: "Lớp 4A", allocatedPortions: 31, locked: false },
                { dailyMealPortionId: "dem-4b", className: "Lớp 4B", allocatedPortions: 30, locked: false },
                { dailyMealPortionId: "dem-5a", className: "Lớp 5A", allocatedPortions: 32, locked: false },
                { dailyMealPortionId: "dem-5b", className: "Lớp 5B", allocatedPortions: 30, locked: false },
              ],
            },
          ],
        },
      ],
    },
  ],

  // Trạng thái tổng hợp phân bổ hiển thị tại Tab 2 (Read-only view)
  distribution: {
    status: "READY",
    canConfirmDistribution: true,
    message: "Tất cả 10 lớp học đã được phân bổ đủ 100% chỉ tiêu suất ăn",
    meals: [{ mealType: "LUNCH", allocatedPortions: 325 }],
    demands: [
      {
        id: "dem-1a",
        classId: "cls-1a",
        className: "Lớp 1A",
        mealType: "LUNCH",
        requiredPortions: 34,
        allocatedPortions: 34,
        allocationStatus: "ALLOCATED",
        demandFinalized: true,
        batches: [{ batchId: "batch-fp-01", allocatedPortions: 34 }],
      },
      {
        id: "dem-1b",
        classId: "cls-1b",
        className: "Lớp 1B",
        mealType: "LUNCH",
        requiredPortions: 34,
        allocatedPortions: 34,
        allocationStatus: "ALLOCATED",
        demandFinalized: true,
        batches: [{ batchId: "batch-fp-01", allocatedPortions: 34 }],
      },
      {
        id: "dem-2a",
        classId: "cls-2a",
        className: "Lớp 2A",
        mealType: "LUNCH",
        requiredPortions: 35,
        allocatedPortions: 35,
        allocationStatus: "ALLOCATED",
        demandFinalized: true,
        batches: [{ batchId: "batch-fp-01", allocatedPortions: 35 }],
      },
      {
        id: "dem-2b",
        classId: "cls-2b",
        className: "Lớp 2B",
        mealType: "LUNCH",
        requiredPortions: 33,
        allocatedPortions: 33,
        allocationStatus: "ALLOCATED",
        demandFinalized: true,
        batches: [{ batchId: "batch-fp-01", allocatedPortions: 33 }],
      },
      {
        id: "dem-3a",
        classId: "cls-3a",
        className: "Lớp 3A",
        mealType: "LUNCH",
        requiredPortions: 34,
        allocatedPortions: 34,
        allocationStatus: "ALLOCATED",
        demandFinalized: true,
        batches: [{ batchId: "batch-fp-01", allocatedPortions: 34 }],
      },
      {
        id: "dem-3b",
        classId: "cls-3b",
        className: "Lớp 3B",
        mealType: "LUNCH",
        requiredPortions: 32,
        allocatedPortions: 32,
        allocationStatus: "ALLOCATED",
        demandFinalized: true,
        batches: [{ batchId: "batch-fp-02", allocatedPortions: 32 }],
      },
      {
        id: "dem-4a",
        classId: "cls-4a",
        className: "Lớp 4A",
        mealType: "LUNCH",
        requiredPortions: 31,
        allocatedPortions: 31,
        allocationStatus: "ALLOCATED",
        demandFinalized: true,
        batches: [{ batchId: "batch-fp-02", allocatedPortions: 31 }],
      },
      {
        id: "dem-4b",
        classId: "cls-4b",
        className: "Lớp 4B",
        mealType: "LUNCH",
        requiredPortions: 30,
        allocatedPortions: 30,
        allocationStatus: "ALLOCATED",
        demandFinalized: true,
        batches: [{ batchId: "batch-fp-02", allocatedPortions: 30 }],
      },
      {
        id: "dem-5a",
        classId: "cls-5a",
        className: "Lớp 5A",
        mealType: "LUNCH",
        requiredPortions: 32,
        allocatedPortions: 32,
        allocationStatus: "ALLOCATED",
        demandFinalized: true,
        batches: [{ batchId: "batch-fp-02", allocatedPortions: 32 }],
      },
      {
        id: "dem-5b",
        classId: "cls-5b",
        className: "Lớp 5B",
        mealType: "LUNCH",
        requiredPortions: 30,
        allocatedPortions: 30,
        allocationStatus: "ALLOCATED",
        demandFinalized: true,
        batches: [{ batchId: "batch-fp-02", allocatedPortions: 30 }],
      },
    ],
  },
};

// Biến lưu trữ trạng thái giả lập trong bộ nhớ
let currentAllocationState = JSON.parse(JSON.stringify(initialAllocationData));

export const mockMealAllocationService = {
  async getToday() {
    return JSON.parse(JSON.stringify(currentAllocationState));
  },

  async apply(payload) {
    if (payload && Array.isArray(payload.batches)) {
      // Cập nhật cả batches phẳng cũ
      currentAllocationState.batches = currentAllocationState.batches.map((batch) => {
        const found = payload.batches.find((b) => (b.cookingBatchId || b.id) === batch.id);
        if (found && Array.isArray(found.entries)) {
          return {
            ...batch,
            entries: found.entries.map((entry) => ({
              dailyMealPortionId: entry.dailyMealPortionId,
              allocatedPortions: Number(entry.allocatedPortions) || 0,
              locked: false,
            })),
          };
        }
        return batch;
      });

      // Cập nhật cấu trúc grades mới
      if (Array.isArray(currentAllocationState.grades)) {
        currentAllocationState.grades = currentAllocationState.grades.map((grade) => ({
          ...grade,
          dishes: grade.dishes.map((dish) => ({
            ...dish,
            batches: dish.batches.map((batchSlot) => {
              const found = payload.batches.find(
                (b) =>
                  (b.cookingBatchId || b.id) === batchSlot.cookingBatchId &&
                  (!b.dishId || b.dishId === dish.dishId),
              );
              if (found && Array.isArray(found.entries)) {
                return {
                  ...batchSlot,
                  entries: found.entries.map((entry) => {
                    const demand = grade.demands.find((d) => d.id === entry.dailyMealPortionId);
                    return {
                      dailyMealPortionId: entry.dailyMealPortionId,
                      className: demand?.className || entry.className || "",
                      allocatedPortions: Number(entry.allocatedPortions) || 0,
                      locked: false,
                    };
                  }),
                };
              }
              return batchSlot;
            }),
          })),
        }));

        // Đồng bộ ngược lại vào distribution.demands để Tab 2 luôn nhất quán
        if (currentAllocationState.distribution && Array.isArray(currentAllocationState.distribution.demands)) {
          let allFull = true;
          currentAllocationState.distribution.demands = currentAllocationState.distribution.demands.map((demand) => {
            const myGrade = currentAllocationState.grades.find((g) =>
              (g.demands || []).some((d) => d.id === demand.id),
            );
            if (!myGrade) return demand;

            const relevantDishes = (myGrade.dishes || []).filter((d) => d.mealType === demand.mealType);
            const dishCounts = relevantDishes.map((dish) => {
              let count = 0;
              for (const batch of dish.batches || []) {
                for (const entry of batch.entries || []) {
                  if (entry.dailyMealPortionId === demand.id) {
                    count += Number(entry.allocatedPortions) || 0;
                  }
                }
              }
              return count;
            });

            const completedPortions = dishCounts.length > 0 ? Math.min(...dishCounts) : demand.allocatedPortions;
            const isFull = completedPortions >= demand.requiredPortions;
            if (!isFull) allFull = false;

            return {
              ...demand,
              allocatedPortions: completedPortions,
              allocationStatus: isFull ? "ALLOCATED" : "PARTIAL",
            };
          });

          currentAllocationState.distribution.canConfirmDistribution = allFull;
          currentAllocationState.distribution.message = allFull
            ? "Tất cả 10 lớp học đã được phân bổ đủ 100% chỉ tiêu suất ăn"
            : "Chưa hoàn thành phân bổ đủ suất cho tất cả các lớp.";
        }
      }
    }

    currentAllocationState.revision = `rev-foodprint-${Date.now()}`;
    return JSON.parse(JSON.stringify(currentAllocationState));
  },

  async confirmDistribution() {
    currentAllocationState.distribution.status = "DISTRIBUTED";
    currentAllocationState.distribution.canConfirmDistribution = false;
    currentAllocationState.distribution.message = "Đã hoàn tất bàn giao phân bổ suất ăn đến các lớp học ngày 15/11/2026";
    currentAllocationState.revision = `rev-foodprint-${Date.now()}`;
    return JSON.parse(JSON.stringify(currentAllocationState));
  },

  resetMock() {
    currentAllocationState = JSON.parse(JSON.stringify(initialAllocationData));
  },
};
