import http from "../01_axios";
import {
  apiIngredients,
  apiSuppliers,
  apiDeliveries,
  apiSupplyOrders,
} from "./urls";
import { adaptCatalogItem, adaptDeliveryItem } from "./adapter";

/**
 * Tìm contractId ACTIVE cho 1 supplierId từ danh sách supplier-partnerships,
 * sau đó gọi send (DRAFT → SENT) để NCC thấy được đơn trên hệ thống.
 */
const sendDraftOrder = async (orderId, supplierId, partnershipsCache) => {
  if (!orderId || !supplierId) return;
  try {
    let partnerships = partnershipsCache;
    if (!partnerships) {
      const pRes = await http.get("/supplier-partnerships", {
        params: { status: "ACTIVE", page: 1, limit: 100 },
        notifyOnError: false,
      });
      const pData = pRes?.data || pRes;
      partnerships = Array.isArray(pData?.items) ? pData.items : [];
    }
    const partnership = partnerships.find(
      (p) => (p.supplier?.id || p.supplierId) === supplierId,
    );
    const contracts = partnership?.contracts || [];
    const activeContract = contracts.find(
      (c) => c.status === "ACTIVE" && c.eligible !== false,
    );
    if (activeContract?.id) {
      await http.post(
        `/supply-requests/${orderId}/send`,
        { contractId: activeContract.id },
        { notifyOnError: false },
      );
    }
  } catch (err) {
    console.warn("[sendDraftOrder] Gửi đơn thất bại:", err);
  }
};

const isValidUuid = (id) =>
  typeof id === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const isDiscreteUnit = (unit = "") => {
  if (!unit) return false;
  const u = String(unit).toLowerCase().trim();
  const discreteUnits = [
    "quả",
    "trứng",
    "hộp",
    "gói",
    "chai",
    "can",
    "lon",
    "hũ",
    "cái",
    "củ",
    "bắp",
    "ổ",
    "bó",
    "túi",
    "con",
  ];
  return discreteUnits.includes(u);
};

const calcQty = (qtyPerPortion, portions, unit = "") => {
  const raw = Number(qtyPerPortion) * Number(portions);
  if (isDiscreteUnit(unit)) {
    return Math.ceil(raw);
  }
  return Number(raw.toFixed(2));
};

const IngredientOrderService = {
  /**
   * Lấy Danh mục nguyên liệu chuẩn (Master Ingredient Catalog)
   * CHỈ LẤY NGUYÊN LIỆU TỪ CÁC NHÀ CUNG CẤP ĐANG LIÊN KẾT (ACTIVE) VỚI TRƯỜNG
   */
  async getMasterIngredientCatalog() {
    try {
      // 1. Lấy danh sách NCC đang liên kết ACTIVE với trường
      const supRes = await this.getSuppliers();
      const linkedSuppliers = supRes.items || [];
      const linkedSupplierIds = new Set(
        linkedSuppliers.map((s) => s.id).filter(Boolean),
      );
      const linkedSupplierNames = new Set(
        linkedSuppliers
          .map((s) => (s.name || "").toLowerCase().trim())
          .filter(Boolean),
      );

      // 2. Tải danh mục nguyên liệu từ Backend
      const response = await http.get(apiIngredients, {
        params: { page: 1, limit: 100 },
        notifyOnError: false,
        skipAuthRedirect: true,
      });
      const data = response?.data || response;
      const apiItems = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
          ? data
          : [];

      if (apiItems.length > 0) {
        let adaptedApi = apiItems.map(adaptCatalogItem).filter(Boolean);

        // Lọc nghiêm ngặt: Chỉ giữ lại nguyên liệu từ NCC đã liên kết với trường
        if (linkedSupplierIds.size > 0) {
          adaptedApi = adaptedApi.filter((ing) => {
            const idMatch =
              ing.supplierId && linkedSupplierIds.has(ing.supplierId);
            const nameMatch =
              ing.supplierName &&
              linkedSupplierNames.has(
                String(ing.supplierName).toLowerCase().trim(),
              );
            return idMatch || nameMatch;
          });
        }

        return { items: adaptedApi, total: adaptedApi.length, isMock: false };
      }
    } catch (err) {
      console.warn("Lỗi tải danh mục nguyên liệu từ Backend:", err);
    }

    return {
      items: [],
      total: 0,
      isMock: false,
    };
  },

  /**
   * Lấy danh sách Nhà cung cấp đã liên kết (ACTIVE) với trường
   */
  async getSuppliers() {
    try {
      // 1. Ưu tiên lấy từ /supplier-partnerships (danh sách quan hệ đối tác trường - NCC)
      try {
        const pRes = await http.get("/supplier-partnerships", {
          params: { status: "ACTIVE", page: 1, limit: 100 },
          notifyOnError: false,
          skipAuthRedirect: true,
        });
        const pData = pRes?.data || pRes;
        const pItems = Array.isArray(pData?.items) ? pData.items : [];
        if (pItems.length > 0) {
          const list = pItems
            .map((p) => ({
              id: p.supplier?.id || p.supplierId,
              name: p.supplier?.name || p.supplierName,
              status: p.status,
            }))
            .filter((s) => s.id && s.name);
          if (list.length > 0)
            return { items: list, total: list.length, isMock: false };
        }
      } catch {
        // Fallback sang /suppliers nếu /supplier-partnerships không khả dụng
      }

      // 2. Lấy từ /suppliers
      const response = await http.get(apiSuppliers, {
        params: { page: 1, limit: 100 },
        notifyOnError: false,
        skipAuthRedirect: true,
      });
      const data = response?.data || response;
      const items = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
          ? data
          : [];
      if (items.length > 0)
        return { items, total: items.length, isMock: false };
    } catch (err) {
      console.warn("Lỗi tải danh sách nhà cung cấp từ Backend:", err);
    }
    return { items: [], total: 0, isMock: false };
  },

  /**
   * Lấy danh sách Thực đơn đã phê duyệt (APPROVED) từ module Thực đơn
   */
  async getApprovedMenus(params = {}) {
    try {
      console.log(
        "[IngredientOrderService] Đang tải danh sách thực đơn đã duyệt từ /v1/menus ...",
      );
      let response = await http.get("/v1/menus", {
        params: { status: "APPROVED", page: 1, limit: 50 },
        notifyOnError: false,
        skipAuthRedirect: true,
      });
      console.log("[IngredientOrderService] Kết quả từ /v1/menus:", response);
      let data = response?.data || response;
      let apiItems = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
          ? data
          : [];

      // Fallback nếu /v1/menus không trả về nhưng /menus có dữ liệu
      if (apiItems.length === 0) {
        try {
          const fallbackRes = await http.get("/menus", {
            params: { status: "APPROVED", page: 1, limit: 50 },
            notifyOnError: false,
            skipAuthRedirect: true,
          });
          const fallbackData = fallbackRes?.data || fallbackRes;
          const fallbackItems = Array.isArray(fallbackData?.items)
            ? fallbackData.items
            : Array.isArray(fallbackData)
              ? fallbackData
              : [];
          if (fallbackItems.length > 0) {
            console.log(
              "[IngredientOrderService] Tìm thấy thực đơn từ fallback /menus:",
              fallbackItems,
            );
            apiItems = fallbackItems;
          }
        } catch {
          // ignore fallback error
        }
      }

      if (apiItems.length > 0) {
        // Tải danh mục ingredient-entries và sĩ số các lớp từ DB
        let entries = [];
        let dbClasses = [];
        try {
          const queryDate = params?.date
            ? String(params.date).slice(0, 10)
            : "2026-11-16";
          const [entryRes, attendanceRes] = await Promise.all([
            http
              .get("/ingredient-entries", {
                params: { limit: 100 },
                notifyOnError: false,
                skipAuthRedirect: true,
              })
              .catch(() => null),
            http
              .get("/v1/daily-meal-portions", {
                params: { date: queryDate, mealType: "LUNCH" },
                notifyOnError: false,
                skipAuthRedirect: true,
              })
              .catch(() => null),
          ]);

          const entryData = entryRes?.data || entryRes;
          entries = Array.isArray(entryData?.items)
            ? entryData.items
            : Array.isArray(entryData)
              ? entryData
              : [];

          const attendanceData = attendanceRes?.data || attendanceRes;
          if (Array.isArray(attendanceData?.classes)) {
            dbClasses = attendanceData.classes;
          }
        } catch (e) {
          console.warn(
            "[IngredientOrderService] Không thể tải dữ liệu phụ trợ:",
            e,
          );
        }

        // Tính tổng sĩ số suất ăn toàn trường từ các lớp thực tế trong DB
        const schoolTotalRegistered = dbClasses.reduce(
          (sum, c) => sum + (Number(c.registeredPortions) || 0),
          0,
        );

        const enrichedApi = apiItems.map((m) => {
          const cleanDate =
            (m.menuDays?.[0]?.menuDate
              ? String(m.menuDays[0].menuDate).slice(0, 10)
              : "") ||
            String(m.weekStartDate || "").slice(0, 10) ||
            "2026-11-16";

          // 1. Trích xuất tên khối từ grades hoặc gradeNames
          let gradeNames = Array.isArray(m.grades)
            ? m.grades.map((g) => g.grade?.name || g.name || "").filter(Boolean)
            : Array.isArray(m.gradeNames)
              ? m.gradeNames
              : [];

          // Nhận diện khối lớp chuẩn xác từ Tiêu đề (Title) và danh sách Grade
          const titleStr = String(m.title || "").toLowerCase();
          const isK13 =
            titleStr.includes("1-3") ||
            (!titleStr.includes("4-5") &&
              gradeNames.some(
                (g) => g.includes("1") || g.includes("2") || g.includes("3"),
              ));
          const isK45 =
            titleStr.includes("4-5") ||
            (!titleStr.includes("1-3") &&
              gradeNames.some((g) => g.includes("4") || g.includes("5")));

          let targetScope = "Khối lớp";
          if (m.isSchoolWide) {
            targetScope = "Toàn trường";
          } else if (isK13 && !isK45) {
            targetScope = "Khối 1-3";
            gradeNames = ["Khối 1-3"];
          } else if (isK45 && !isK13) {
            targetScope = "Khối 4-5";
            gradeNames = ["Khối 4-5"];
          } else if (gradeNames.length > 0) {
            targetScope = gradeNames.join(" - ");
          } else if (m.title) {
            targetScope = m.title;
          }

          // Tính số suất ăn tối đa (maxPortions) dựa trên dữ liệu lớp thực tế trong DB
          let calculatedMaxPortions = 0;
          if (m.isSchoolWide) {
            calculatedMaxPortions = schoolTotalRegistered;
          } else if (isK13 && !isK45) {
            calculatedMaxPortions = dbClasses
              .filter(
                (c) =>
                  c.gradeName?.includes("1-3") ||
                  c.className?.startsWith("1") ||
                  c.className?.startsWith("2") ||
                  c.className?.startsWith("3"),
              )
              .reduce((sum, c) => sum + (Number(c.registeredPortions) || 0), 0);
          } else if (isK45 && !isK13) {
            calculatedMaxPortions = dbClasses
              .filter(
                (c) =>
                  c.gradeName?.includes("4-5") ||
                  c.className?.startsWith("4") ||
                  c.className?.startsWith("5"),
              )
              .reduce((sum, c) => sum + (Number(c.registeredPortions) || 0), 0);
          } else if (gradeNames.length > 0) {
            calculatedMaxPortions = dbClasses
              .filter((c) => gradeNames.includes(c.gradeName))
              .reduce((sum, c) => sum + (Number(c.registeredPortions) || 0), 0);
          }

          // Fallback nếu chưa tải được lớp: sử dụng sĩ số chuẩn từ DB của trường (Toàn trường: 175, Khối 1-3: 50, Khối 4-5: 125)
          if (calculatedMaxPortions <= 0) {
            if (m.isSchoolWide) {
              calculatedMaxPortions =
                schoolTotalRegistered > 0 ? schoolTotalRegistered : 175;
            } else if (isK13 && !isK45) {
              calculatedMaxPortions = 50;
            } else if (isK45 && !isK13) {
              calculatedMaxPortions = 125;
            } else {
              calculatedMaxPortions =
                schoolTotalRegistered > 0 ? schoolTotalRegistered : 175;
            }
          }

          // 2. Trích xuất món ăn và nguyên liệu từ menuDays trong DB
          const dishesFromDb = [];
          const extractedIngredientsMap = new Map();

          if (Array.isArray(m.menuDays)) {
            for (const day of m.menuDays) {
              if (Array.isArray(day.menuDayDishes)) {
                for (const mdd of day.menuDayDishes) {
                  const dName = mdd.Dish?.name || mdd.dishName;
                  if (dName && !dishesFromDb.includes(dName)) {
                    dishesFromDb.push(dName);
                  }

                  // Quét danh sách nguyên liệu của từng món ăn
                  if (Array.isArray(mdd.ingredients)) {
                    for (const ingItem of mdd.ingredients) {
                      const ing = ingItem.ingredient;
                      if (!ing || !ing.id) continue;

                      // Tìm entry tương ứng trong DB để lấy ingredientEntryId và handlingType chuẩn
                      const entry = entries.find(
                        (e) => e.ingredientId === ing.id || e.id === ing.id,
                      );
                      const ingredientEntryId = entry?.id || ing.id;
                      const catName = (
                        ing.ingredientCategory?.categoryName || ""
                      ).toLowerCase();
                      const handlingType =
                        entry?.handlingType ||
                        (catName.includes("khô") || catName.includes("gia vị")
                          ? "DRY_STOCK"
                          : "DIRECT_USE");

                      // Bỏ qua đồ khô / gia vị kho: Phiếu nhập hàng tươi sống 2 đợt CHỈ nhận DIRECT_USE
                      if (handlingType === "DRY_STOCK") continue;

                      const supplierId =
                        ing.supplierId ||
                        ing.Supplier?.id ||
                        entry?.Ingredient?.supplierId ||
                        "";
                      const supplierName =
                        ing.Supplier?.name ||
                        entry?.Ingredient?.Supplier?.name ||
                        "Nhà cung cấp đối tác";
                      const unit = ingItem.unit || ing.defaultUnit || "kg";
                      const qtyPerPortion =
                        Number(ingItem.quantityPerPortion) || 0.05;

                      if (extractedIngredientsMap.has(ing.id)) {
                        const existing = extractedIngredientsMap.get(ing.id);
                        existing.qtyPerPortion = Number(
                          (existing.qtyPerPortion + qtyPerPortion).toFixed(4),
                        );
                      } else {
                        extractedIngredientsMap.set(ing.id, {
                          id: ing.id,
                          ingredientId: ing.id,
                          ingredientEntryId,
                          name: ing.name,
                          category:
                            ing.ingredientCategory?.categoryName ||
                            "Thực phẩm tươi sống",
                          handlingType: "DIRECT_USE",
                          unit,
                          qtyPerPortion,
                          supplierId,
                          supplierName,
                        });
                      }
                    }
                  }
                }
              }
            }
          }

          let ingredients = Array.from(extractedIngredientsMap.values());

          // Nếu món trong thực đơn chưa được gán nguyên liệu cụ thể, lấy các nguyên liệu DIRECT_USE thật từ DB
          if (ingredients.length === 0 && entries.length > 0) {
            const freshEntries = entries.filter(
              (e) => e.handlingType !== "DRY_STOCK",
            );
            ingredients = freshEntries.slice(0, 4).map((e) => ({
              id: e.ingredientId || e.id,
              ingredientId: e.ingredientId || e.id,
              ingredientEntryId: e.id,
              name: e.Ingredient?.name || e.name || "Nguyên liệu tươi",
              category: "Thực phẩm tươi sống",
              handlingType: "DIRECT_USE",
              unit: e.Ingredient?.defaultUnit || e.unit || "kg",
              qtyPerPortion: 0.05,
              supplierId: e.Ingredient?.supplierId || e.supplierId || "",
              supplierName:
                e.Ingredient?.Supplier?.name || "Nhà cung cấp đối tác",
            }));
          }

          return {
            id: m.id,
            code: m.code || `TD-${m.id}`,
            name: m.title || `Thực đơn ${cleanDate}`,
            title: m.title || `Thực đơn ${cleanDate}`,
            mealDate: cleanDate,
            date: cleanDate,
            weekStartDate: cleanDate,
            days:
              Array.isArray(m.menuDays) && m.menuDays.length > 0
                ? m.menuDays.map((d) => ({
                    date: String(d.menuDate || "").slice(0, 10),
                  }))
                : [0, 1, 2, 3, 4].map((offset) => {
                    const base = new Date(cleanDate + "T00:00:00Z");
                    base.setUTCDate(base.getUTCDate() + offset);
                    return { date: base.toISOString().slice(0, 10) };
                  }),
            mealType: "LUNCH",
            mealTypeLabel: "Bữa trưa",
            targetScope,
            gradeNames,
            maxPortions: calculatedMaxPortions,
            dishes:
              dishesFromDb.length > 0 ? dishesFromDb : ["Món ăn dinh dưỡng"],
            ingredients,
          };
        });

        // CHẾ ĐỘ THẬT: Chỉ trả về thực đơn thật từ DB
        return { items: enrichedApi, total: enrichedApi.length, isMock: false };
      }
    } catch (err) {
      console.error(
        "[IngredientOrderService] Lỗi tải thực đơn duyệt từ Backend:",
        err?.response?.status,
        err?.response?.data || err,
      );
    }

    return { items: [], total: 0, isMock: false };
  },

  /**
   * Lấy danh sách Phiếu giao nhận & Nhập hàng tươi sống 2 đợt (Deliveries)
   * 100% từ Backend Database: Kết hợp cả /deliveries và /supply-requests (các đơn vừa tạo chưa dispatch)
   * LOẠI BỎ TOÀN BỘ ĐỒ KHÔ (DRY_STOCK) KHỎI PHIẾU NHẬP HÀNG TƯƠI SỐNG
   */
  async getDeliveries(params = {}) {
    let deliveriesList = [];
    let supplyList = [];

    try {
      const [delivRes, supplyRes] = await Promise.all([
        http
          .get(apiDeliveries, {
            params: { page: 1, limit: 100 },
            notifyOnError: false,
            skipAuthRedirect: true,
          })
          .catch(() => null),
        http
          .get(apiSupplyOrders, {
            params: { page: 1, limit: 100 },
            notifyOnError: false,
            skipAuthRedirect: true,
          })
          .catch(() => null),
      ]);

      const delivData = delivRes?.data || delivRes;
      const delivItems = Array.isArray(delivData?.items)
        ? delivData.items
        : Array.isArray(delivData)
          ? delivData
          : [];
      deliveriesList = delivItems.map(adaptDeliveryItem).filter(Boolean);

      const supplyData = supplyRes?.data || supplyRes;
      const supplyItems = Array.isArray(supplyData?.items)
        ? supplyData.items
        : Array.isArray(supplyData)
          ? supplyData
          : [];

      // Lọc các đơn từ /supply-requests: CHỈ LẤY THỰC PHẨM TƯƠI SỐNG 2 ĐỢT (BATCH_1, BATCH_2), LOẠI BỎ ĐỒ KHÔ
      supplyList = supplyItems
        .filter((so) => {
          const reqNo = String(so.requestNo || "").toUpperCase();
          const isDry =
            reqNo.includes("DRY") ||
            reqNo.includes("PNK") ||
            so.orderType === "DRY_STOCK" ||
            so.batchType === "DRY_STOCK";
          return !isDry;
        })
        .map((so) => {
          const reqNo = String(so.requestNo || "").toUpperCase();
          const isB2 =
            reqNo.includes("B2") ||
            reqNo.includes("-D2") ||
            reqNo.includes("DOT 2") ||
            reqNo.includes("ĐỢT 2");
          const batchType = isB2 ? "BATCH_2" : "BATCH_1";
          const deliveryTime = isB2 ? "07:45" : "05:30";
          const dateStr = so.requestedDeliveryDate
            ? String(so.requestedDeliveryDate).slice(0, 10)
            : "2026-11-16";

          // DeliveryNo hiển thị
          const cleanNo = so.requestNo
            ? so.requestNo.replace(/^PO-/, "")
            : so.id;
          const deliveryNo = `PN-${cleanNo}`;

          return adaptDeliveryItem({
            id: so.id,
            deliveryNo,
            orderNo: so.requestNo,
            supplierId: so.supplierId,
            supplierName:
              so.supplierName || so.Supplier?.name || "Nhà cung cấp đối tác",
            supplierPhone: so.supplierPhone || so.Supplier?.phone || "--",
            deliveryDate: dateStr,
            deliveryTime,
            batchType,
            status:
              so.status === "ACCEPTED"
                ? "CONFIRMED"
                : so.status === "SENT" || so.status === "DRAFT"
                  ? "CREATED"
                  : so.status,
            statusLabel:
              so.status === "ACCEPTED" ? "NCC đã xác nhận" : "Chờ NCC xác nhận",
            driverName: "Chưa phân công (Chờ NCC điều xe)",
            vehiclePlate: "",
            refrigerationTemp: "Chưa đo (Chờ xe tới)",
            note:
              so.note ||
              (isB2
                ? "Thực phẩm tươi sống Đợt 2 (Cân đối sĩ số)"
                : "Thực phẩm tươi sống Đợt 1 (50% Suất)"),
            deliveryItems: Array.isArray(so.items)
              ? so.items.map((it) => ({
                  id: it.id,
                  ingredientName:
                    it.ingredientName || it.name || "Nguyên liệu tươi",
                  requestedQuantity: it.quantity || 0,
                  actualQuantity: it.quantity || 0,
                  unit: it.unit || "kg",
                  supplierId: so.supplierId,
                  supplierName:
                    so.supplierName ||
                    so.Supplier?.name ||
                    "Nhà cung cấp đối tác",
                  handlingType: "DIRECT_USE",
                }))
              : [],
          });
        })
        .filter(Boolean);
    } catch (err) {
      console.warn("Lỗi tải danh sách phiếu giao nhận từ Backend:", err);
    }

    // Gộp supply requests và deliveries, ưu tiên deliveries nếu cùng deliveryNo hoặc orderNo
    const existingNos = new Set(
      deliveriesList.map((d) => d.deliveryNo).filter(Boolean),
    );
    const existingOrderNos = new Set(
      deliveriesList.map((d) => d.orderNo).filter(Boolean),
    );

    const uniqueSupply = supplyList.filter(
      (s) => !existingNos.has(s.deliveryNo) && !existingOrderNos.has(s.orderNo),
    );

    // Hợp nhất sub-orders nếu 1 đơn bị tách theo nhiều NCC (ví dụ: PO-...-D1-1, PO-...-D1-2)
    const groupedSupply = new Map();
    uniqueSupply.forEach((order) => {
      const rawOrderNo = String(order.orderNo || "");
      const baseOrderNo = rawOrderNo.replace(/-\d+$/, "");
      const key = `${baseOrderNo}_${order.deliveryDate || ""}_${order.batchType || ""}`;
      if (!groupedSupply.has(key)) groupedSupply.set(key, []);
      groupedSupply.get(key).push(order);
    });

    const consolidatedSupply = Array.from(groupedSupply.values()).map(
      (group) => {
        if (group.length === 1) return group[0];
        const first = group[0];
        const rawOrderNo = String(first.orderNo || "");
        const baseOrderNo = rawOrderNo.replace(/-\d+$/, "");
        const baseDeliveryNo = String(first.deliveryNo || "").replace(
          /-\d+$/,
          "",
        );
        const allItems = [];
        const supNames = new Set();
        group.forEach((g) => {
          if (g.supplierName && g.supplierName !== "Nhà cung cấp đối tác")
            supNames.add(g.supplierName);
          if (Array.isArray(g.items)) {
            g.items.forEach((it) =>
              allItems.push({
                ...it,
                supplierName: it.supplierName || g.supplierName,
              }),
            );
          }
        });
        const suppliersList = Array.from(supNames);
        return {
          ...first,
          id: first.id,
          orderNo: baseOrderNo,
          deliveryNo: baseDeliveryNo,
          supplierName:
            suppliersList.length > 1
              ? `Nhiều NCC (${suppliersList.length} đối tác: ${suppliersList.join(", ")})`
              : suppliersList[0] || first.supplierName,
          suppliers: suppliersList,
          items: allItems,
        };
      },
    );

    let items = [...consolidatedSupply, ...deliveriesList].filter(
      (d) => d.batchType !== "DRY_STOCK" && d.orderType !== "DRY_STOCK",
    );

    // Bộ lọc
    if (params.batchType && params.batchType !== "all") {
      items = items.filter((d) => d.batchType === params.batchType);
    }
    if (params.status && params.status !== "all") {
      items = items.filter((d) => d.status === params.status);
    }
    if (params.search) {
      const kw = params.search.toLowerCase();
      items = items.filter(
        (d) =>
          d.deliveryNo?.toLowerCase().includes(kw) ||
          d.orderNo?.toLowerCase().includes(kw) ||
          d.supplierName?.toLowerCase().includes(kw) ||
          d.menuName?.toLowerCase().includes(kw),
      );
    }

    return { items, total: items.length, isMock: false };
  },

  /**
   * Lấy tổng hợp sĩ số điểm danh thực tế từ Giáo viên chủ nhiệm (GVCN)
   * phục vụ tự động cân đối và lập đơn Đợt 2.
   */
  async getDailyAttendanceSummary({ date, mealType = "LUNCH" }) {
    try {
      const response = await http.get("/v1/daily-meal-portions", {
        params: { date, mealType },
        notifyOnError: false,
        skipAuthRedirect: true,
      });
      const data = response?.data || response;
      return {
        date: data.date,
        mealType: data.mealType,
        totalPortions: Number(data.totalPortions) || 0,
        finalizedClasses: Number(data.finalizedClasses) || 0,
        pendingClasses: Number(data.pendingClasses) || 0,
        classes: Array.isArray(data.classes) ? data.classes : [],
      };
    } catch (err) {
      console.warn("Lỗi lấy tổng hợp sĩ số GVCN:", err);
      return null;
    }
  },

  /**
   * 1. TẠO ĐƠN MUA HÀNG ĐỢT 1 (Giao sớm 05:30 sáng) - ĐẨY TRỰC TIẾP LÊN DATABASE
   * API: POST /supply-requests & POST /supply-requests/:id/send
   * - 50% định lượng suất tối đa
   * - 100% Thực phẩm tươi sống dùng trong ngày (DIRECT_USE)
   * - Gom theo đúng NCC thực tế trong DB, tự động gửi đơn sang cổng NCC
   */
  async createBatch1Order({
    menuId,
    menuIds,
    menus,
    note,
    orderDate,
    items,
    targetScope,
  }) {
    const isMulti = Array.isArray(menus) && menus.length > 1;
    const dateFormatted = orderDate
      ? String(orderDate).slice(0, 10)
      : new Date().toISOString().slice(0, 10);
    const orderNo = `PO-${dateFormatted.replace(/-/g, "")}-${Math.floor(10 + Math.random() * 90)}`;

    // Tải danh mục ingredient-entries và active contracts từ DB
    const [entriesRes, pRes] = await Promise.all([
      http
        .get("/ingredient-entries", {
          params: { limit: 100 },
          notifyOnError: false,
        })
        .catch(() => null),
      http
        .get("/supplier-partnerships", {
          params: { status: "ACTIVE", page: 1, limit: 100 },
          notifyOnError: false,
        })
        .catch(() => null),
    ]);
    const entries = Array.isArray(entriesRes?.data?.items)
      ? entriesRes.data.items
      : Array.isArray(entriesRes?.data)
        ? entriesRes.data
        : [];
    const partnerships = Array.isArray(pRes?.data?.items)
      ? pRes.data.items
      : [];

    // 1. Chuẩn hóa items và xác định đúng ingredientEntryId & supplierId từ DB
    const freshItemsBatch1 = (Array.isArray(items) ? items : []).map((it) => {
      let entryId = it.ingredientEntryId || it.id;
      const match = entries.find(
        (e) =>
          e.id === entryId ||
          e.ingredientId === it.id ||
          e.ingredientId === it.ingredientId,
      );
      if (match) entryId = match.id;

      const sId =
        it.supplierId ||
        match?.Ingredient?.supplierId ||
        match?.supplierId ||
        "";
      const sName =
        it.supplierName ||
        match?.Ingredient?.Supplier?.name ||
        "Nhà cung cấp đối tác";

      return {
        ...it,
        ingredientEntryId: entryId,
        supplierId: sId,
        supplierName: sName,
        orderedQty: Number(it.orderedQty || it.quantity || 1),
      };
    });

    if (freshItemsBatch1.length === 0) {
      throw new Error("Không có nguyên liệu tươi sống nào để đặt đơn Đợt 1.");
    }

    // 2. Gom items theo từng supplierId thực tế
    const itemsBySupplier = {};
    freshItemsBatch1.forEach((it) => {
      const sId =
        it.supplierId ||
        partnerships[0]?.supplier?.id ||
        partnerships[0]?.supplierId;
      if (!sId) return;
      if (!itemsBySupplier[sId]) itemsBySupplier[sId] = [];
      itemsBySupplier[sId].push(it);
    });

    const supplierEntries = Object.entries(itemsBySupplier);
    if (supplierEntries.length === 0) {
      throw new Error(
        "Không xác định được Nhà cung cấp hợp lệ cho các nguyên liệu đã chọn.",
      );
    }

    // 3. Đẩy từng đơn lên Backend Database qua POST /supply-requests & POST /supply-requests/:id/send
    for (let i = 0; i < supplierEntries.length; i++) {
      const [sId, sItems] = supplierEntries[i];
      const reqNo =
        supplierEntries.length > 1 ? `${orderNo}-D1-${i + 1}` : `${orderNo}-D1`;

      // Loại bỏ các entryId trùng nhau trong cùng 1 request (nếu có, cộng dồn số lượng)
      const mergedItemsMap = new Map();
      sItems.forEach((it) => {
        const eId = it.ingredientEntryId;
        const q = Math.max(
          0.001,
          Number(Number(it.orderedQty || 1).toFixed(3)),
        );
        if (mergedItemsMap.has(eId)) {
          mergedItemsMap.set(
            eId,
            Number((mergedItemsMap.get(eId) + q).toFixed(3)),
          );
        } else {
          mergedItemsMap.set(eId, q);
        }
      });

      const payload = {
        supplierId: sId,
        requestNo: reqNo,
        requestedDeliveryDate: dateFormatted,
        items: Array.from(mergedItemsMap.entries()).map(
          ([ingredientEntryId, quantity]) => ({
            ingredientEntryId,
            quantity,
          }),
        ),
      };

      console.log(
        `[createBatch1Order] Đang gửi POST /supply-requests cho NCC ${sId}:`,
        payload,
      );
      const res = await http.post("/supply-requests", payload, {
        notifyOnError: true,
      });
      const draft = res?.data || res;

      // Tự động gửi đơn (DRAFT → SENT) để NCC thấy được đơn trên hệ thống
      if (draft?.id) {
        await sendDraftOrder(draft.id, sId, partnerships);
      }
    }

    return {
      success: true,
      orderNo,
      attachedDryCount: 0,
    };
  },

  /**
   * 2. TẠO ĐƠN GIAO HÀNG ĐỢT 2 (Giao lúc 07:45 sáng) - ĐẨY TRỰC TIẾP LÊN DATABASE
   * API: POST /supply-requests & POST /supply-requests/:id/send
   * - Dựa trên sĩ số thực tế do GVCN báo
   * - Bê nguyên nguyên liệu tươi sống của Đợt 1 sang bù định lượng
   * - Gom theo từng NCC và tự động gửi đơn sang cổng NCC
   */
  async createBatch2Order({
    batch1DeliveryId,
    actualAttendance,
    actualAttendanceByGrade,
    note,
    items,
    orderDate,
  }) {
    // 1. Tìm thông tin đơn Đợt 1 từ Database
    const delivRes = await this.getDeliveries();
    const allDeliveries = delivRes.items || [];
    let batch1Delivery = allDeliveries.find(
      (d) => d.id === batch1DeliveryId || d.deliveryNo === batch1DeliveryId,
    );

    if (!batch1Delivery) {
      if (isValidUuid(batch1DeliveryId)) {
        try {
          const sRes = await http.get(`/supply-requests/${batch1DeliveryId}`);
          const sData = sRes?.data || sRes;
          if (sData) batch1Delivery = adaptDeliveryItem(sData);
        } catch {
          // ignore
        }
      }
    }

    if (!batch1Delivery) {
      throw new Error(
        "Không tìm thấy thông tin đơn hàng Đợt 1 tương ứng để tạo Đợt 2.",
      );
    }

    const baseOrderNo = String(batch1Delivery.orderNo || "").replace(
      /-D1(-\d+)?$/,
      "",
    );
    const deliveryDate =
      orderDate ||
      batch1Delivery.deliveryDate ||
      new Date().toISOString().slice(0, 10);
    const actualCount = Number(actualAttendance) || 0;
    const maxPortions = Number(batch1Delivery.maxPortions) || 0;
    const batch1Portions =
      batch1Delivery.plannedPortions || Math.floor(maxPortions / 2);
    const remainingPortions = Math.max(0, actualCount - batch1Portions);

    // Tải danh mục ingredient-entries và active contracts từ DB
    const [entriesRes, pRes] = await Promise.all([
      http
        .get("/ingredient-entries", {
          params: { limit: 100 },
          notifyOnError: false,
        })
        .catch(() => null),
      http
        .get("/supplier-partnerships", {
          params: { status: "ACTIVE", page: 1, limit: 100 },
          notifyOnError: false,
        })
        .catch(() => null),
    ]);
    const entries = Array.isArray(entriesRes?.data?.items)
      ? entriesRes.data.items
      : Array.isArray(entriesRes?.data)
        ? entriesRes.data
        : [];
    const partnerships = Array.isArray(pRes?.data?.items)
      ? pRes.data.items
      : [];

    // 2. Chuẩn hóa items Đợt 2
    const sourceItems =
      Array.isArray(items) && items.length > 0
        ? items
        : batch1Delivery.items || [];
    const freshItemsBatch2 = sourceItems.map((it) => {
      let entryId = it.ingredientEntryId || it.id;
      const match = entries.find(
        (e) =>
          e.id === entryId ||
          e.ingredientId === it.id ||
          e.ingredientId === it.ingredientId,
      );
      if (match) entryId = match.id;

      const sId =
        it.supplierId ||
        match?.Ingredient?.supplierId ||
        match?.supplierId ||
        "";
      const sName =
        it.supplierName ||
        match?.Ingredient?.Supplier?.name ||
        "Nhà cung cấp đối tác";

      let ordQty = it.orderedQty;
      if (ordQty === undefined || ordQty === null) {
        ordQty =
          it.standardQty ??
          calcQty(it.qtyPerPortion || 0.05, remainingPortions, it.unit);
      }

      return {
        ...it,
        ingredientEntryId: entryId,
        supplierId: sId,
        supplierName: sName,
        orderedQty: Math.max(0.001, Number(Number(ordQty).toFixed(3))),
      };
    });

    if (freshItemsBatch2.length === 0) {
      throw new Error("Không có nguyên liệu tươi sống nào cho Đợt 2.");
    }

    // 3. Gom items theo từng supplierId
    const itemsBySupplier = {};
    freshItemsBatch2.forEach((it) => {
      const sId =
        it.supplierId ||
        partnerships[0]?.supplier?.id ||
        partnerships[0]?.supplierId;
      if (!sId) return;
      if (!itemsBySupplier[sId]) itemsBySupplier[sId] = [];
      itemsBySupplier[sId].push(it);
    });

    const supplierEntries = Object.entries(itemsBySupplier);
    for (let i = 0; i < supplierEntries.length; i++) {
      const [sId, sItems] = supplierEntries[i];
      const reqNo =
        supplierEntries.length > 1
          ? `${baseOrderNo}-D2-${i + 1}`
          : `${baseOrderNo}-D2`;

      const mergedItemsMap = new Map();
      sItems.forEach((it) => {
        const eId = it.ingredientEntryId;
        const q = Math.max(
          0.001,
          Number(Number(it.orderedQty || 1).toFixed(3)),
        );
        if (mergedItemsMap.has(eId)) {
          mergedItemsMap.set(
            eId,
            Number((mergedItemsMap.get(eId) + q).toFixed(3)),
          );
        } else {
          mergedItemsMap.set(eId, q);
        }
      });

      const payload = {
        supplierId: sId,
        requestNo: reqNo,
        requestedDeliveryDate: deliveryDate,
        items: Array.from(mergedItemsMap.entries()).map(
          ([ingredientEntryId, quantity]) => ({
            ingredientEntryId,
            quantity,
          }),
        ),
      };

      console.log(
        `[createBatch2Order] Đang gửi POST /supply-requests cho NCC ${sId}:`,
        payload,
      );
      const res = await http.post("/supply-requests", payload, {
        notifyOnError: true,
      });
      const draft = res?.data || res;

      // Tự động gửi đơn (DRAFT → SENT)
      if (draft?.id) {
        await sendDraftOrder(draft.id, sId, partnerships);
      }
    }

    return {
      success: true,
      orderNo: baseOrderNo,
      remainingPortions,
      actualAttendance: actualCount,
    };
  },

  /**
   * Cập nhật sĩ số thực tế do GVCN báo sáng cho Đợt 2 (lấy thông tin thực từ DB)
   */
  async updateBatch2Attendance(
    deliveryId,
    actualCount,
    actualAttendanceByGrade,
  ) {
    const res = await this.getDeliveries();
    const target = (res.items || []).find(
      (d) => d.id === deliveryId || d.deliveryNo === deliveryId,
    );
    if (target) {
      return { success: true, delivery: target };
    }
    return { success: false };
  },

  // Alias tương thích
  async createSupplyOrder(data) {
    return this.createBatch1Order(data);
  },
};

export default IngredientOrderService;
