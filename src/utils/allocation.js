
/**
 * FoodPrint - Perfect Meal Allocation
 *
 * Input:
 *   batches: số suất ăn của từng lô
 *   classes: số suất ăn cần cấp cho từng lớp
 *
 * Output:
 *   FOUND: tìm được phân bổ không chia lớp
 *   NOT_FOUND: đã xác minh không có phân bổ hợp lệ
 *   LIMIT_REACHED: chưa thể kết luận
 */

export function findPerfectAllocation(batches, classes, maxNodes = 1000000) {
  // ========================================================================
  //Validate
    if (
    !Array.isArray(batches) ||
    !Array.isArray(classes) ||
    batches.length === 0 ||
    classes.length === 0 ||
    [...batches, ...classes].some(
      x => !Number.isSafeInteger(x) || x <= 0
    )
  ) {
    throw new Error("Input không hợp lệ");
  }

  const sum = arr => arr.reduce((a, b) => a + b, 0);

  if (sum(batches) !== sum(classes)) {
    throw new Error("Tổng suất ăn của lô và lớp phải bằng nhau");
  }

  if (!Number.isSafeInteger(maxNodes) || maxNodes <= 0) {
    throw new Error("maxNodes phải là số nguyên dương");
  }
  // ========================================================================

  // Sắp xếp lớp có nhu cầu lớn trước, giữ lại index gốc
  const sortedClasses = classes
    .map((quantity, index) => ({ quantity, index }))
    .sort((a, b) => b.quantity - a.quantity);

  const remaining = [...batches];
  const assignment = Array(classes.length).fill(-1);
  const failedStates = new Set();

  let nodesVisited = 0;
  let limitReached = false;

  function dfs(pos) {
    if (++nodesVisited > maxNodes) {
      limitReached = true;
      return false;
    }

    // Tất cả lớp đã được phân bổ
    if (pos === sortedClasses.length) {
      return remaining.every(value => value === 0);
    }

    const state = `${pos}|${[...remaining].sort((a, b) => a - b).join(",")}`;

    if (failedStates.has(state)) {
      return false;
    }

    const current = sortedClasses[pos];
    const triedCapacities = new Set();

    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i] < current.quantity) continue;

      // Các lô có cùng dung lượng còn lại là đối xứng
      if (triedCapacities.has(remaining[i])) continue;
      triedCapacities.add(remaining[i]);

      // Thử phân nguyên lớp vào lô i
      remaining[i] -= current.quantity;
      assignment[current.index] = i;

      if (dfs(pos + 1)) return true;

      // Backtracking
      remaining[i] += current.quantity;
      assignment[current.index] = -1;

      if (limitReached) return false;
    }

    if (!limitReached) {
      failedStates.add(state);
    }

    return false;
  }

  const found = dfs(0);

  if (found) {
    return {
      status: "FOUND",
      allocation: batches.map((quantity, batchIndex) => ({
        batchIndex,
        quantity,
        classes: assignment
          .map((assignedBatch, classIndex) => ({
            classIndex,
            quantity: classes[classIndex],
            assignedBatch
          }))
          .filter(item => item.assignedBatch === batchIndex)
          .map(({ classIndex, quantity }) => ({
            classIndex,
            quantity
          }))
      })),
      nodesVisited
    };
  }

  return {
    status: limitReached ? "LIMIT_REACHED" : "NOT_FOUND",
    allocation: null,
    nodesVisited
  };
}