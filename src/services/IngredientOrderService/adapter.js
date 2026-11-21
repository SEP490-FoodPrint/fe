/**
 * Adapter chuẩn hóa dữ liệu Danh mục nguyên liệu và Phân hệ Đơn hàng
 */
import { batchTypeOf } from "../../utils/supplyBatch";

export const HANDLING_TYPES = {
  DRY_STOCK: {
    label: "Kho khô",
    color: "#b45309",
    bg: "#fef3c7",
    note: "Lưu kho dài ngày (gạo, muối, gia vị...)",
  },
  DIRECT_USE: {
    label: "Tươi sống (dùng trong ngày)",
    color: "#047857",
    bg: "#d1fae5",
    note: "Nhập dùng ngay trong ngày (thịt, cá, rau củ...)",
  },
};

/**
 * Tự động nhận diện phân loại đồ lưu kho (DRY_STOCK) vs tươi sống (DIRECT_USE)
 * dựa theo handlingType hoặc từ khóa tên / nhóm mặt hàng khi dữ liệu DB chưa gắn tag
 */
export function inferHandlingType(item = {}, entries = []) {
  // 1. Kiểm tra đối chiếu với danh mục ingredient_entries cấu hình của trường
  if (entries && entries.length > 0) {
    const entry = entries.find(
      (e) =>
        e.ingredientId === item.id ||
        e.id === item.id ||
        e.id === item.ingredientEntryId
    );
    if (entry) {
      if (entry.handlingType === "DRY_STOCK") return "DRY_STOCK";
      if (entry.handlingType === "DIRECT_USE") return "DIRECT_USE";
    }
  }

  // 2. Kiểm tra thuộc tính handlingType nếu đã có sẵn
  if (
    item?.handlingType === "DRY_STOCK" ||
    item?.handlingType === "DIRECT_USE"
  ) {
    return item.handlingType;
  }

  const category = String(item?.category || item?.categoryName || "").toLowerCase();
  const name = String(item?.name || "").toLowerCase();

  // 3. Loại trừ dứt khoát các mặt hàng tươi sống (dùng ngay trong ngày)
  const freshKeywords = [
    "thịt", "heo", "lợn", "bò", "gà", "vịt", "chim",
    "cá", "tôm", "cua", "mực", "nghêu", "sò", "ốc", "hải sản",
    "rau", "cải", "muống", "ngót", "mồng tơi", "bắp cải", "xà lách", "súp lơ",
    "củ", "cà rốt", "khoai tây", "khoai lang", "su hào", "củ cải", "cà chua", "dưa chuột",
    "bí đỏ", "bí xanh", "mướp", "đậu phụ", "tàu hũ",
    "trứng", "trứng gà", "trứng vịt", "trứng cút",
    "trái cây", "chuối", "dưa hấu", "táo", "lê", "xoài", "thanh long", "quít", "cam",
    "sữa tươi", "sữa chua",
  ];

  if (freshKeywords.some((kw) => category.includes(kw) || name.includes(kw))) {
    return "DIRECT_USE";
  }

  // 4. Các từ khóa đặc trưng xác định đồ khô / lương thực / gia vị lưu kho
  const dryKeywords = [
    "gạo", "lương thực", "gia vị", "muối", "đường", "dầu ăn", "dầu thực vật", "dầu",
    "nước mắm", "nước tương", "hạt nêm", "bột ngọt", "tiêu", "bột canh", "bột nêm", "mắm",
    "đồ khô", "hàng khô", "khô", "kho khô", "ngũ cốc", "bột mì", "bột năng", "bột bắp",
    "miến", "bún khô", "mì sợi", "mộc nhĩ", "nấm hương khô", "đậu xanh", "đậu đỏ", "đậu đen",
    "đậu tương", "đậu nành", "lạc", "đậu phộng", "vừng", "mè", "seasoning", "dry"
  ];

  if (dryKeywords.some((kw) => category.includes(kw) || name.includes(kw))) {
    return "DRY_STOCK";
  }

  return "DIRECT_USE";
}

export function adaptCatalogItem(item, entries = []) {
  if (!item) return null;

  const handlingType = inferHandlingType(item, entries);
  const handling = HANDLING_TYPES[handlingType] || HANDLING_TYPES.DIRECT_USE;

  return {
    id: item.id,
    name: item.name || "Nguyên liệu",
    category:
      item.category ||
      (handlingType === "DRY_STOCK"
        ? "Kho khô & Gia vị"
        : "Thực phẩm tươi sống"),
    handlingType: handlingType,
    handlingMeta: handling,
    defaultUnit:
      item.defaultUnit || (handlingType === "DRY_STOCK" ? "kg" : "kg"),
    shelfLifeDays:
      item.shelfLifeDays || (handlingType === "DRY_STOCK" ? 180 : 2),
    storageRequirements:
      item.storageRequirements ||
      item.description ||
      (handlingType === "DRY_STOCK"
        ? "Kê pallet cách đất 20cm, bảo quản nơi khô ráo thoáng mát"
        : "Bảo quản mát 0 - 4°C, chế biến ngay trong ngày"),
    supplierId: item.supplierId || "",
    supplierName:
      item.supplierName ||
      item.Supplier?.name ||
      item.supplier?.name ||
      "Nhà cung cấp đối tác",
    minOrderQty: item.minOrderQty || (handlingType === "DRY_STOCK" ? 10 : 5),
  };
}

/**
 * Chuẩn hóa đối tượng Phiếu giao nhận (Delivery) từ API Backend thành format
 * phù hợp với giao diện DeliveryTable, DeliveryDetailView, DeliveryStatsRail.
 */
export function adaptDeliveryItem(item) {
  if (!item) return null;

  // 1. Phân tích thời gian và ngày
  const rawDate =
    item.arrivedAt ||
    item.expectedArrivalAt ||
    item.receivedAt ||
    item.deliveryDate ||
    item.createdAt ||
    new Date().toISOString();

  let deliveryDate =
    typeof item.deliveryDate === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(item.deliveryDate)
      ? item.deliveryDate
      : "";
  let deliveryTime =
    typeof item.deliveryTime === "string" &&
      /^\d{2}:\d{2}$/.test(item.deliveryTime)
      ? item.deliveryTime
      : "";

  if (!deliveryDate || !deliveryTime) {
    try {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        if (!deliveryDate) deliveryDate = `${year}-${month}-${day}`;

        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        if (!deliveryTime) deliveryTime = `${hours}:${minutes}`;
      }
    } catch {
      if (!deliveryDate) deliveryDate = "2026-11-14";
      if (!deliveryTime) deliveryTime = "05:30";
    }
  }

  // 2. Đợt / loại đơn: chỉ đọc orderType + batchNo từ API (null = chưa xác định, không đoán)
  const batchType = item.batchType ?? batchTypeOf(item);

  const batchLabel =
    batchType === "BATCH_1"
      ? "Đợt 1 (50% Suất tối đa)"
      : batchType === "BATCH_2"
        ? "Đợt 2 (Cân đối sĩ số)"
        : batchType === "DRY_STOCK"
          ? "Đồ lưu kho"
          : "Chưa xác định đợt";

  // 3. Chuẩn hóa Hội đồng nghiệm thu 4 bên
  const approvals = {
    ingredientManagement: { approved: null, name: "Ban QL NL", time: "" },
    healthOfficer: { approved: null, name: "Cán bộ Y tế", time: "" },
    parentsCommittee: { approved: null, name: "Ban Phụ huynh", time: "" },
    kitchenStaff: { approved: null, name: "Bếp trưởng", time: "" },
  };

  if (item.approvals && typeof item.approvals === "object") {
    Object.assign(approvals, item.approvals);
  } else if (
    Array.isArray(item.deliveryApprovals) &&
    item.deliveryApprovals.length > 0
  ) {
    for (const app of item.deliveryApprovals) {
      const code = (app.roleCode || "").toUpperCase();
      const isApproved = app.decision === "APPROVE";
      const timeStr = app.decidedAt
        ? new Date(app.decidedAt).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        })
        : "";

      if (code.includes("INGREDIENT")) {
        approvals.ingredientManagement = {
          approved: isApproved,
          name: app.userName || "Ban QL NL",
          time: timeStr,
        };
      } else if (code.includes("NUTRITION") || code.includes("HEALTH")) {
        approvals.healthOfficer = {
          approved: isApproved,
          name: app.userName || "Cán bộ Y tế",
          time: timeStr,
        };
      } else if (code.includes("PARENTS")) {
        approvals.parentsCommittee = {
          approved: isApproved,
          name: app.userName || "Ban Phụ huynh",
          time: timeStr,
        };
      } else if (code.includes("KITCHEN")) {
        approvals.kitchenStaff = {
          approved: isApproved,
          name: app.userName || "Bếp trưởng",
          time: timeStr,
        };
      }
    }
  } else if (
    item.status === "RECEIVED" ||
    item.status === "APPROVED" ||
    item.status === "COMPLETED"
  ) {
    // Nếu đơn hàng đã duyệt/hoàn tất trong DB, 4 bên hiển thị đã duyệt đạt
    approvals.ingredientManagement = {
      approved: true,
      name: "Ban QL NL",
      time: deliveryTime,
    };
    approvals.healthOfficer = {
      approved: true,
      name: "Cán bộ Y tế",
      time: deliveryTime,
    };
    approvals.parentsCommittee = {
      approved: true,
      name: "Ban Phụ huynh",
      time: deliveryTime,
    };
    approvals.kitchenStaff = {
      approved: true,
      name: "Bếp trưởng",
      time: deliveryTime,
    };
  }

  // 4. Nhãn trạng thái tiếng Việt
  const statusLabels = {
    RECEIVED: "Đã nhận hàng & Vào bếp",
    COMPLETED: "4/4 Đã duyệt & Bàn giao bếp",
    APPROVED: "4/4 Đã duyệt & Bàn giao bếp",
    ARRIVED: "Đã đến cổng - Chờ kiểm tra",
    PENDING_APPROVAL: "Đang kiểm tra 4 bên",
    INSPECTING: "Đang kiểm tra 4 bên",
    IN_TRANSIT: "NCC đang vận chuyển",
    CREATED: "Chờ NCC xác nhận",
    SENT: "Chờ NCC xác nhận",
    PENDING: "Chờ NCC xác nhận",
    DRAFT: "Chờ NCC xác nhận",
    IN_PROGRESS: "Chờ NCC xác nhận",
    in_progress: "Chờ NCC xác nhận",
    CONFIRMED: "NCC đã xác nhận",
    ACCEPTED: "NCC đã xác nhận",
    REJECTED: "Không đạt yêu cầu",
    CANCELLED: "Đã hủy",
  };

  // 5. Chuẩn hóa danh sách mặt hàng
  const items =
    Array.isArray(item.deliveryItems) && item.deliveryItems.length > 0
      ? item.deliveryItems.map((di) => ({
        ingredientId: di.id,
        ingredientName: di.ingredientName || di.note || "Nguyên liệu",
        handlingType: di.handlingType || "DIRECT_USE",
        unit: di.unit || "kg",
        orderedQty:
          Number(di.requestedQuantity) || Number(di.actualQuantity) || 0,
        deliveredQty: Number(di.actualQuantity) || 0,
        supplierId:
          di.supplierId ||
          di.Ingredient?.supplierId ||
          di.Supplier?.id ||
          di.supplier?.id ||
          item.supplierId ||
          "",
        supplierName:
          (di.supplierName && di.supplierName !== "Nhà cung cấp đối tác" ? di.supplierName : "") ||
          di.Ingredient?.Supplier?.name ||
          di.Supplier?.name ||
          di.supplier?.name ||
          (item.Supplier?.name && item.Supplier.name !== "Nhà cung cấp đối tác" ? item.Supplier.name : "") ||
          (item.supplier?.name && item.supplier.name !== "Nhà cung cấp đối tác" ? item.supplier.name : "") ||
          (item.supplierName && item.supplierName !== "Nhà cung cấp đối tác" && !item.supplierName.includes("Nhiều NCC") ? item.supplierName : "") ||
          "",
        status: "ACCEPTED",
      }))
      : Array.isArray(item.items)
        ? item.items.map((it) => {
          const sName =
            (it.supplierName && it.supplierName !== "Nhà cung cấp đối tác" && !it.supplierName.includes("Nhiều NCC") ? it.supplierName : "") ||
            it.Supplier?.name ||
            it.supplier?.name ||
            (item.Supplier?.name && item.Supplier.name !== "Nhà cung cấp đối tác" ? item.Supplier.name : "") ||
            (item.supplier?.name && item.supplier.name !== "Nhà cung cấp đối tác" ? item.supplier.name : "") ||
            (item.supplierName && item.supplierName !== "Nhà cung cấp đối tác" && !item.supplierName.includes("Nhiều NCC") ? item.supplierName : "") ||
            "";
          return {
            ...it,
            supplierId: it.supplierId || item.supplierId || "",
            supplierName: sName,
            breakdown: it.breakdown || null,
            qtyPerPortion: it.qtyPerPortion ?? null,
            standardQty: it.standardQty ?? null,
            extraQty: it.extraQty ?? 0,
            isCustomized: it.isCustomized || false,
            isExtraItem: it.isExtraItem || false,
            defaultQtyPerPortion: it.defaultQtyPerPortion || null,
          };
        })
        : [];

  const itemSuppliersList = Array.from(
    new Set(
      items
        .map((i) => i.supplierName)
        .filter((name) => Boolean(name) && name !== "Nhà cung cấp đối tác" && !name.includes("Nhiều NCC")),
    ),
  );

  const resolvedSingleSupplier =
    (item.supplierName && item.supplierName !== "Nhà cung cấp đối tác" && !item.supplierName.includes("Nhiều NCC") ? item.supplierName : null) ||
    item.Supplier?.name ||
    item.supplier?.name ||
    (itemSuppliersList.length === 1 ? itemSuppliersList[0] : "");

  items.forEach((it) => {
    if (!it.supplierName && resolvedSingleSupplier) {
      it.supplierName = resolvedSingleSupplier;
    }
    if (!it.supplierName) {
      it.supplierName = "Nhà cung cấp đối tác";
    }
  });

  // Chuẩn hóa mã phiếu: Ưu tiên tuyệt đối mã chuẩn PN-... của trường học, không để mã FP- của NCC đè lên
  const findPnCode = (...codes) => {
    for (const c of codes) {
      if (!c) continue;
      const s = String(c).trim();
      if (/^PN-/i.test(s)) return s;
      if (/^PO-/i.test(s)) return s.replace(/^PO-/i, "PN-");
    }
    for (const c of codes) {
      if (!c) continue;
      const s = String(c).trim();
      if (!/^FP-/i.test(s)) return s.replace(/^PO-|^DEL-/, "PN-");
    }
    return "";
  };

  const rawPn = findPnCode(
    item.orderNo,
    item.requestNo,
    item.SupplyRequest?.requestNo,
    item.deliveryNo,
  );

  const cleanDeliveryNo =
    rawPn ||
    (item.deliveryNo
      ? `PN-${String(item.deliveryNo).replace(/^FP-DE-|^FP-|^DEL-/, "")}`
      : "PN-UNKNOWN");
  const baseOrderNo = cleanDeliveryNo.replace(/-\d+$/, "");

  return {
    id: item.id,
    deliveryNo: cleanDeliveryNo,
    orderNo: baseOrderNo,
    supplierDeliveryNo: item.deliveryNo,
    driverPhone: item.driverPhone || item.phone || "--",
    expectedArrivalAt: item.expectedArrivalAt || null,
    arrivedAt: item.arrivedAt || null,
    receivedAt: item.receivedAt || null,
    menuId: item.menuId || "menu-live",
    menuIds: item.menuIds || (item.menuId ? [item.menuId] : []),
    menuName:
      item.menuName ||
      item.note ||
      (batchType === "BATCH_1"
        ? "Thực đơn dinh dưỡng học đường (Đợt 1)"
        : "Thực đơn bổ sung (Đợt 2)"),
    note: item.note || "",
    menusSummary: item.menusSummary || null,
    targetScope: item.targetScope || "",
    actualAttendanceByGrade: item.actualAttendanceByGrade || null,
    deliveryDate,
    deliveryTime,
    batchType,
    batchLabel,
    maxPortions: Number(item.maxPortions) || 0,
    batch1Portions:
      item.batch1Portions ||
      (batchType === "BATCH_2"
        ? Math.floor((Number(item.maxPortions) || 0) / 2)
        : undefined),
    plannedPortions:
      item.plannedPortions ||
      (batchType === "BATCH_1"
        ? Math.floor((Number(item.maxPortions) || 0) / 2)
        : Number(item.maxPortions) || 0),
    actualAttendance:
      Number(item.actualAttendance) || Number(item.plannedPortions) || 0,
    supplierId: item.supplierId || item.Supplier?.id || "",
    supplierName:
      (item.supplierName && item.supplierName !== "Nhà cung cấp đối tác" && !item.supplierName.includes("Nhiều NCC")
        ? item.supplierName
        : null) ||
      item.Supplier?.name ||
      item.supplier?.name ||
      (itemSuppliersList.length > 1
        ? `Nhiều NCC (${itemSuppliersList.length} đối tác: ${itemSuppliersList.join(", ")})`
        : itemSuppliersList[0] ||
        item.supplierName ||
        "Nhà cung cấp đối tác"),
    suppliers: item.suppliers || (itemSuppliersList.length > 0 ? itemSuppliersList : item.Supplier?.name ? [item.Supplier.name] : []),
    driverName:
      item.status === "CREATED" ||
        item.status === "PENDING" ||
        item.status === "DRAFT" ||
        item.status === "SENT" ||
        item.status === "CONFIRMED" ||
        !item.vehiclePlate
        ? "Chưa phân công (Chờ NCC điều xe)"
        : item.driverName || `Lái xe (${item.vehiclePlate})`,
    vehiclePlate:
      item.status === "CREATED" ||
        item.status === "PENDING" ||
        item.status === "DRAFT" ||
        item.status === "SENT" ||
        item.status === "CONFIRMED"
        ? ""
        : item.vehiclePlate || "",
    deliveryQr: item.deliveryQr || `QR-${item.deliveryNo || item.id}`,
    refrigerationTemp: item.refrigerationTemp || "3.5°C",
    status: item.status || "ARRIVED",
    statusLabel: item.statusLabel || statusLabels[item.status] || item.status,
    approvals,
    items,
  };
}
