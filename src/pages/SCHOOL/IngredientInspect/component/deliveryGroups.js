// Gom các xe giao (delivery) theo đợt của đơn: số đơn có đuôi "-D1", "-D1-2", "-D2"...
const ROUND_PATTERN = /-D(\d+)(?:-\d+)?$/i;

export function deliveryRound(requestNo) {
  const match = ROUND_PATTERN.exec(String(requestNo || ""));
  return match ? Number(match[1]) : null;
}

export const isReceived = (item) => item.status === "RECEIVED";
export const isInspecting = (item) => ["ARRIVED", "PENDING_APPROVAL"].includes(item.status);
export const isRejected = (item) => item.status === "REJECTED";

// Tiến độ ký của 4 bộ phận cho một xe.
export function approvalProgress(item) {
  const approvals = item.deliveryApprovals || [];
  return {
    approved: approvals.filter((approval) => approval.decision === "APPROVE").length,
    total: item.requiredRoles?.length || 4,
    rejected: approvals.some((approval) => approval.decision === "REJECT"),
  };
}

export function groupDeliveriesByRound(items = []) {
  const groups = new Map();
  for (const item of items) {
    const round = deliveryRound(item.requestNo);
    const key = round ? `round-${round}` : item.requestNo ? "other" : "standalone";
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        order: round ?? (key === "other" ? 900 : 1000),
        label: round ? `Đợt ${round}` : key === "other" ? "Đơn khác" : "Giao không theo đơn",
        items: [],
      });
    }
    groups.get(key).items.push(item);
  }
  return [...groups.values()]
    .sort((a, b) => a.order - b.order)
    .map((group) => ({
      ...group,
      received: group.items.filter(isReceived).length,
      inspecting: group.items.filter(isInspecting).length,
      rejected: group.items.filter(isRejected).length,
    }));
}

export function groupSummary(group) {
  return [
    `${group.items.length} xe`,
    group.received ? `${group.received} đã nhận` : "",
    group.inspecting ? `${group.inspecting} đang kiểm` : "",
    group.rejected ? `${group.rejected} bị từ chối` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}
