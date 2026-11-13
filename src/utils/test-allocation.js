import { findPerfectAllocation } from "./allocation.js";

// TEST 1: Có phương án mỗi lớp chỉ nhận từ 1 lô
const test1 = {
  batches: [100, 100, 100],
  classes: [40, 60, 30, 70, 50, 30, 20],
};

// TEST 2: Không tồn tại phương án không chia lớp
const test2 = {
  batches: [100, 100, 100],
  classes: [60, 60, 60, 60, 60],
};

const test3 = {
  batches: [117, 114, 111, 108, 105, 102, 99, 96, 93, 90],

  classes: [
    39, 39, 39, 38, 38, 38, 37, 37, 37, 36, 36, 36, 35, 35, 35, 34, 34, 34, 33,
    33, 33, 32, 32, 32, 31, 31, 31, 30, 30, 30,
  ],
};

const { batches, classes } = test3;
const result = findPerfectAllocation(batches, classes);

console.log("Batches:", batches);
console.log("Classes:", classes);
console.log("Status:", result.status);
console.log("Nodes visited:", result.nodesVisited);

if (result.status === "FOUND") {
  for (const batch of result.allocation) {
    console.log(
      `Lô ${batch.batchIndex + 1} (${batch.quantity} suất):`,
      batch.classes
        .map((c) => `Lớp ${c.classIndex + 1}: ${c.quantity} suất`)
        .join(", "),
    );
   
  }
   console.log(result.allocation);
} else if (result.status === "NOT_FOUND") {
  console.log("Không thể phân bổ mà mỗi lớp chỉ nhận từ 1 lô.");
} else {
  console.log("Đã đạt giới hạn tìm kiếm, chưa thể kết luận.");
}
