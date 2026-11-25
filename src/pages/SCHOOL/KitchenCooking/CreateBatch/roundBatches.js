/**
 * TASK-10 v8 (V29, V32): lô do hệ thống tự lập theo đợt giao, bếp không lập lô thủ công.
 * Kanban chỉ đưa lô chính thức (CONFIRMED trở đi) vào "Đang nấu"; món chưa có lô chính thức
 * ở lại "Danh sách món" kèm lý do chờ.
 */

/** Lô đã lập theo đợt giao nhưng chưa chính thức (kho chưa duyệt hoặc chờ Đợt 2). */
export const ROUND_WAITING_STATUSES = new Set(["PENDING_APPROVAL", "ROUND1_APPROVED", "ROUND2_APPROVED"]);

const servesDish = (batch, dish) =>
  batch.mealType === dish.mealType &&
  (batch.batchDishIds || [batch.dishId]).some((id) => id && (id === dish.dishId || id === dish.id));

function waitReason(waiting) {
  if (waiting.some((batch) => batch.status === "PENDING_APPROVAL")) return "Lô đã lập, chờ kho duyệt";
  if (waiting.length) return "Kho đã duyệt lô, chờ chính thức sau Đợt 2";
  return "Chưa có lô: hệ thống tự lập sau khi Đợt 1 nhận đủ hàng";
}

/**
 * Tách lô thành lô bếp thao tác được (Đang nấu / Đã nấu xong / Đã lưu mẫu) và món còn chờ.
 * Bỏ lô đã hủy.
 */
export function splitRoundBatches(formattedBatches, todayDishes) {
  const live = formattedBatches.filter((batch) => batch.status !== "CANCELLED");
  const batches = live.filter((batch) => !ROUND_WAITING_STATUSES.has(batch.status));
  const pending = todayDishes
    .filter((dish) => !batches.some((batch) => servesDish(batch, dish)))
    .map((dish) => {
      const waiting = live.filter((batch) => ROUND_WAITING_STATUSES.has(batch.status) && servesDish(batch, dish));
      return { ...dish, waitingBatchCount: waiting.length, waitReason: waitReason(waiting) };
    });
  return { batches, pending };
}
