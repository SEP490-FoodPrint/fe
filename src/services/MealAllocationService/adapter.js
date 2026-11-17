/**
 * Chuyển đổi dữ liệu phân bổ suất ăn ngày hôm nay từ Backend sang định dạng hiển thị cho component RecentMealAllocations
 */
export function adaptRecentAllocations(data) {
  if (!data) return [];

  // Ưu tiên 1: Lấy danh sách phân bổ các lớp từ distribution.demands
  if (Array.isArray(data.distribution?.demands) && data.distribution.demands.length > 0) {
    const isGlobalDistributed = data.distribution.status === "DISTRIBUTED";
    return data.distribution.demands.slice(0, 5).map((d) => {
      const isDelivered = isGlobalDistributed || d.allocationStatus === "DISTRIBUTED";
      const isAllocated =
        Number(d.allocatedPortions) >= Number(d.requiredPortions) && Number(d.allocatedPortions) > 0;
      const isPartial =
        Number(d.allocatedPortions) > 0 && Number(d.allocatedPortions) < Number(d.requiredPortions);

      let status = "Chờ phân bổ";
      let statusType = "warning";
      if (isDelivered) {
        status = "Đã giao";
        statusType = "success";
      } else if (isAllocated) {
        status = "Đã phân bổ";
        statusType = "info";
      } else if (isPartial) {
        status = "Đang giao";
        statusType = "warning";
      }

      const mealTag = d.mealType === "AFTERNOON" ? "Bữa xế" : "Bữa trưa";
      const rawName = d.className || d.name || "Lớp học";
      const target = rawName.toLowerCase().startsWith("lớp") ? rawName : `Lớp ${rawName}`;
      const portions = Number(d.allocatedPortions || d.requiredPortions || 0);

      return {
        id: d.id,
        target,
        timeTag: mealTag,
        portion: `${portions.toLocaleString("vi-VN")} suất`,
        status,
        statusType,
      };
    });
  }

  // Ưu tiên 2: Lấy từ cấu trúc grades nếu có
  if (Array.isArray(data.grades) && data.grades.length > 0) {
    const items = [];
    for (const g of data.grades) {
      for (const d of g.demands || []) {
        const rawName = d.className || d.name || "Lớp học";
        const target = rawName.toLowerCase().startsWith("lớp") ? rawName : `Lớp ${rawName}`;
        const portions = Number(d.totalPortions || d.total || 0);
        items.push({
          id: d.id,
          target,
          timeTag: "Bữa trưa",
          portion: `${portions.toLocaleString("vi-VN")} suất`,
          status: "Chờ phân bổ",
          statusType: "warning",
        });
        if (items.length >= 5) break;
      }
      if (items.length >= 5) break;
    }
    if (items.length > 0) return items;
  }

  // Ưu tiên 3: Lấy từ danh sách demands phẳng
  if (Array.isArray(data.demands) && data.demands.length > 0) {
    return data.demands.slice(0, 5).map((d) => {
      const rawName = d.name || d.className || "Lớp học";
      const target = rawName.toLowerCase().startsWith("lớp") ? rawName : `Lớp ${rawName}`;
      const portions = Number(d.totalPortions || d.total || 0);
      return {
        id: d.id,
        target,
        timeTag: d.mealType === "AFTERNOON" ? "Bữa xế" : "Bữa trưa",
        portion: `${portions.toLocaleString("vi-VN")} suất`,
        status: "Chờ phân bổ",
        statusType: "warning",
      };
    });
  }

  return [];
}
