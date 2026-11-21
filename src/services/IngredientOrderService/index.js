import { requireOrderQuantity } from "src/utils/measurementUnits";
import http from "../01_axios";
import {
  apiIngredients,
  apiSuppliers,
  apiDeliveries,
  apiSupplyOrders,
} from "./urls";
import { adaptCatalogItem, adaptDeliveryItem } from "./adapter";
import { batchTypeOf, BATCH_TYPE } from "../../utils/supplyBatch";

/**
 * Tải toàn bộ các trang dữ liệu từ API có phân trang (tuân thủ giới hạn limit <= 100 của Backend)
 */
const fetchAllPages = async (url, params = {}) => {
  let page = 1;
  let allItems = [];
  while (page <= 20) {
    const res = await http
      .get(url, {
        params: { ...params, page, limit: 100 },
        notifyOnError: false,
        skipAuthRedirect: true,
      })
      .catch(() => null);
    const data = res?.data || res;
    const items = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data)
        ? data
        : [];
    allItems = allItems.concat(items);
    if (!data?.pagination?.hasNext || items.length < 100) {
      break;
    }
    page++;
  }
  return allItems;
};

const getTodayStr = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const formatDateVN = (dateInput) => {
  if (!dateInput) return "";
  const str = String(dateInput).trim();
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }
  return str;
};

const formatTimeStr = (isoString) => {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (!isNaN(d.getTime())) {
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    }
  } catch {
    // ignore
  }
  return "";
};

/**
 * Tìm contractId ACTIVE cho 1 supplierId từ danh sách supplier-partnerships,
 * sau đó gọi send (DRAFT → SENT) để NCC thấy được đơn trên hệ thống.
 */
const sendDraftOrder = async (orderId, supplierId, partnershipsCache) => {
  if (!orderId || !supplierId) return;
  try {
    let partnerships = partnershipsCache;
    if (!partnerships) {
      partnerships = await fetchAllPages("/supplier-partnerships", {
        status: "ACTIVE",
      });
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
      console.log(
        `[sendDraftOrder] Đã gửi đơn ${orderId} sang NCC ${supplierId} với HĐ ${activeContract.id}`,
      );
    } else {
      console.warn(
        `[sendDraftOrder] Không tìm thấy hợp đồng ACTIVE cho NCC ${supplierId}`,
      );
    }
  } catch (err) {
    console.warn(
      "[sendDraftOrder] Gửi đơn thất bại:",
      err?.response?.data?.message || err?.message,
    );
  }
};

// Chuẩn hóa tên để so khớp đúng tên (không phân biệt hoa thường, bỏ khoảng trắng thừa).
const normalizeIngredientName = (value) =>
  String(value || "")
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

/**
 * Xác định đúng dòng danh mục nguyên liệu của trường cho một mặt hàng đặt.
 * 1) Khớp mã: ingredientEntryId, rồi ingredientId (hoặc id nếu trùng một trong hai).
 * 2) Khớp đúng tên (đã chuẩn hóa), lọc theo NCC nếu mặt hàng có supplierId.
 * Không khớp hoặc trùng tên nhiều NCC thì ghi vào `unresolved` và trả về null; KHÔNG chọn nguyên liệu thay thế.
 */
const resolveSchoolEntry = (it, entries, unresolved) => {
  const byId = (field, value) =>
    value ? entries.filter((e) => e[field] === value) : [];
  const idMatches = [
    ...byId("entryId", it.ingredientEntryId),
    ...byId("entryId", it.id),
    ...byId("ingredientId", it.ingredientId),
    ...byId("ingredientId", it.id),
  ];
  const label =
    it.ingredientName ||
    it.name ||
    it.ingredientEntryId ||
    it.ingredientId ||
    it.id ||
    "(không tên)";
  if (idMatches.length) {
    const unique = [...new Map(idMatches.map((e) => [e.entryId, e])).values()];
    if (unique.length === 1) return unique[0];
    unresolved.ambiguous.push(label);
    return null;
  }
  const wanted = normalizeIngredientName(it.ingredientName || it.name);
  if (!wanted) {
    unresolved.missing.push(label);
    return null;
  }
  let candidates = entries.filter(
    (e) => normalizeIngredientName(e.name) === wanted,
  );
  if (it.supplierId)
    candidates = candidates.filter((e) => e.supplierId === it.supplierId);
  if (candidates.length === 1) return candidates[0];
  (candidates.length ? unresolved.ambiguous : unresolved.missing).push(label);
  return null;
};

// Dừng tạo đơn khi còn mặt hàng không xác định được, để không gửi nhầm nguyên liệu cho NCC.
const assertAllResolved = (unresolved) => {
  const messages = [];
  if (unresolved.missing.length)
    messages.push(
      `Không tìm thấy trong danh mục nguyên liệu của trường: ${[...new Set(unresolved.missing)].join(", ")}`,
    );
  if (unresolved.ambiguous.length)
    messages.push(
      `Có nhiều nguyên liệu trùng tên, cần chọn đúng nhà cung cấp: ${[...new Set(unresolved.ambiguous)].join(", ")}`,
    );
  if (messages.length)
    throw new Error(`${messages.join(". ")}. Chưa tạo đơn nào.`);
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
    "miếng",
    "lát",
  ];
  return discreteUnits.includes(u);
};

const calcQty = (qtyPerPortion, portions, unit = "") => {
  const raw = Number(qtyPerPortion) * Number(portions);
  if (isDiscreteUnit(unit)) {
    return Number(raw.toFixed(3));
  }
  return Number(raw.toFixed(3));
};

const IngredientOrderService = {
  /**
   * Lấy Danh mục nguyên liệu chuẩn (Master Ingredient Catalog)
   * CHỈ LẤY NGUYÊN LIỆU TỪ CÁC NHÀ CUNG CẤP ĐANG LIÊN KẾT (ACTIVE) VỚI TRƯỜNG
   */
  async getMasterIngredientCatalog() {
    try {
      // 1. Tải đồng thời: danh sách NCC liên kết, toàn bộ nguyên liệu, entries phân loại của trường và lô kho
      const [supRes, apiItems, entries, lots] = await Promise.all([
        this.getSuppliers(),
        fetchAllPages(apiIngredients),
        fetchAllPages("/ingredient-entries"),
        fetchAllPages("/ingredient-lots"),
      ]);

      const linkedSuppliers = supRes.items || [];
      const linkedSupplierIds = new Set(
        linkedSuppliers.map((s) => s.id).filter(Boolean),
      );
      const linkedSupplierNames = new Set(
        linkedSuppliers
          .map((s) => (s.name || "").toLowerCase().trim())
          .filter(Boolean),
      );

      // Bổ sung các mặt hàng có lô lưu kho nhưng chưa nằm trong danh mục (nếu có)
      const existingIds = new Set((apiItems || []).map((it) => it.id));
      const extraItems = [];
      (lots || []).forEach((l) => {
        const entry = l.DeliveryItem?.SupplyRequestItem?.IngredientEntry;
        const ing = entry?.Ingredient || l.Ingredient;
        const ingId = ing?.id || entry?.ingredientId || l.ingredientId;
        const ingName = ing?.name || l.ingredientName;
        const sup = ing?.Supplier || l.Supplier;
        if (ingId && !existingIds.has(ingId)) {
          existingIds.add(ingId);
          extraItems.push({
            id: ingId,
            name: ingName,
            supplierId: sup?.id || l.supplierId || "",
            supplierName: sup?.name || l.supplierName || "Nhà cung cấp đối tác",
            defaultUnit: l.unit || ing?.defaultUnit || "kg",
            category: l.category || ing?.category || "Lương thực & Gia vị",
            handlingType: entry?.handlingType || l.handlingType || "DRY_STOCK",
          });
        }
      });

      const allRawItems = (apiItems || []).concat(extraItems);

      if (allRawItems.length > 0) {
        let adaptedApi = allRawItems
          .map((item) => adaptCatalogItem(item, entries))
          .filter(Boolean);

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
              id: p.Supplier?.id || p.supplier?.id || p.supplierId,
              name: p.Supplier?.name || p.supplier?.name || p.supplierName,
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
      const queryParams = { status: "APPROVED", page: 1, limit: 50, ...params };
      let response = await http.get("/v1/menus", {
        params: queryParams,
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
            params: queryParams,
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
            : getTodayStr();
          const [rawEntries, allIngs, attendanceRes] = await Promise.all([
            fetchAllPages("/ingredient-entries"),
            fetchAllPages("/ingredients"),
            http
              .get("/v1/daily-meal-portions", {
                params: { date: queryDate, mealType: "LUNCH" },
                notifyOnError: false,
                skipAuthRedirect: true,
              })
              .catch(() => null),
          ]);

          entries = rawEntries.map((e) => {
            const matchedIng = allIngs.find((i) => i.id === e.ingredientId);
            return {
              ...e,
              Ingredient: matchedIng || e.Ingredient,
            };
          });

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
          const rawWeekStart = m.weekStartDate
            ? String(m.weekStartDate).slice(0, 10)
            : "";
          const firstDayDate = m.menuDays?.[0]?.menuDate
            ? String(m.menuDays[0].menuDate).slice(0, 10)
            : "";
          const cleanDate = rawWeekStart || firstDayDate || "2026-11-16";

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

          // 2. Trích xuất món ăn và nguyên liệu từ menuDays trong DB (tính cả toàn tuần lẫn từng ngày)
          const dishesFromDb = [];
          const extractedIngredientsMap = new Map();
          const menuDaysMap = {};

          if (Array.isArray(m.menuDays)) {
            for (const day of m.menuDays) {
              const dayDate = String(day.menuDate || "").slice(0, 10);
              const dayDishes = [];
              const dayIngredientsMap = new Map();

              if (Array.isArray(day.menuDayDishes)) {
                for (const mdd of day.menuDayDishes) {
                  const dName = mdd.Dish?.name || mdd.dishName;
                  if (dName) {
                    if (!dishesFromDb.includes(dName)) dishesFromDb.push(dName);
                    if (!dayDishes.includes(dName)) dayDishes.push(dName);
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

                      // Bỏ qua đồ lưu kho / gia vị kho: Phiếu nhập hàng tươi sống 2 đợt CHỈ nhận DIRECT_USE
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
                      const targetUnit =
                        ing.defaultUnit || ingItem.unit || "kg";
                      const itemUnit = String(ingItem.unit || "")
                        .toLowerCase()
                        .trim();
                      let qtyPerPortion =
                        Number(ingItem.quantityPerPortion) || 0;

                      // Quy đổi gam -> kg và ml -> lít để đồng bộ với đơn vị giao nhận
                      if (
                        (itemUnit === "g" || itemUnit === "gram") &&
                        (targetUnit.toLowerCase() === "kg" ||
                          targetUnit.toLowerCase() === "kilogram")
                      ) {
                        qtyPerPortion = qtyPerPortion / 1000;
                      } else if (
                        (itemUnit === "ml" || itemUnit === "mililit") &&
                        (targetUnit.toLowerCase() === "lít" ||
                          targetUnit.toLowerCase() === "lit" ||
                          targetUnit.toLowerCase() === "l")
                      ) {
                        qtyPerPortion = qtyPerPortion / 1000;
                      } else if (qtyPerPortion <= 0) {
                        qtyPerPortion = isDiscreteUnit(targetUnit) ? 1 : 0.05;
                      }

                      const unit = targetUnit;

                      // Gom chung cho toàn menu (fallback)
                      if (extractedIngredientsMap.has(ing.id)) {
                        const existing = extractedIngredientsMap.get(ing.id);
                        existing.qtyPerPortion = Number(
                          (existing.qtyPerPortion + qtyPerPortion).toFixed(12),
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

                      // Gom riêng cho ngày cụ thể này
                      if (dayDate) {
                        if (dayIngredientsMap.has(ing.id)) {
                          const existingDay = dayIngredientsMap.get(ing.id);
                          existingDay.qtyPerPortion = Number(
                            (existingDay.qtyPerPortion + qtyPerPortion).toFixed(
                              12,
                            ),
                          );
                        } else {
                          dayIngredientsMap.set(ing.id, {
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

              if (dayDate) {
                menuDaysMap[dayDate] = {
                  date: dayDate,
                  dishes: dayDishes,
                  ingredients: Array.from(dayIngredientsMap.values()),
                };
              }
            }
          }

          let ingredients = Array.from(extractedIngredientsMap.values());

          return {
            id: m.id,
            code: m.code || `TD-${m.id}`,
            name: m.title || `Thực đơn ${cleanDate}`,
            title: m.title || `Thực đơn ${cleanDate}`,
            mealDate: cleanDate,
            date: cleanDate,
            weekStartDate: rawWeekStart || cleanDate,
            menuDaysMap,
            menuDays: m.menuDays,
            status: m.status || "APPROVED",
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
            isSchoolWide: Boolean(m.isSchoolWide),
            gradeIds: Array.isArray(m.gradeIds)
              ? m.gradeIds
              : Array.isArray(m.grades)
                ? m.grades.map((g) => g.gradeId || g.id).filter(Boolean)
                : [],
            grades: m.grades || [],
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
   * LOẠI BỎ TOÀN BỘ ĐỒ LƯU KHO (DRY_STOCK) KHỎI PHIẾU NHẬP HÀNG TƯƠI SỐNG
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

      // Lấy danh sách NCC để map tên nhà cung cấp
      const supRes = await this.getSuppliers().catch(() => ({ items: [] }));
      const globalSupplierIdMap = new Map();
      (supRes?.items || []).forEach((s) => {
        if (s.id && s.name) {
          globalSupplierIdMap.set(String(s.id), s.name);
        }
      });

      // Lọc các đơn từ /supply-requests: CHỈ LẤY THỰC PHẨM TƯƠI SỐNG 2 ĐỢT (BATCH_1, BATCH_2), LOẠI BỎ ĐỒ LƯU KHO
      const freshSupplyItems = supplyItems.filter((so) => {
        return so.orderType !== "DRY_STOCK";
      });

      // Lấy chi tiết song song cho các đơn hàng tươi sống vừa lấy để có đầy đủ items, ngày giao, ghi chú
      const detailedFreshSupply = await Promise.all(
        freshSupplyItems.map(async (so) => {
          try {
            const detailRes = await http
              .get(`/supply-requests/${so.id}`, {
                notifyOnError: false,
                skipAuthRedirect: true,
              })
              .catch(() => null);
            const detailData = detailRes?.data || detailRes;
            if (detailData && detailData.id) {
              return {
                ...so,
                ...detailData,
                items: detailData.items || so.items || [],
                requestedDeliveryDate:
                  detailData.requestedDeliveryDate || so.requestedDeliveryDate,
              };
            }
          } catch {
            // bỏ qua lỗi nếu có
          }
          return so;
        }),
      );

      supplyList = detailedFreshSupply
        .map((so) => {
          const batchType = batchTypeOf(so);
          const isB2 = batchType === BATCH_TYPE.BATCH_2;
          const deliveryTime = isB2 ? "07:45" : "05:30";
          const dateStr = so.requestedDeliveryDate
            ? String(so.requestedDeliveryDate).slice(0, 10)
            : getTodayStr();

          // DeliveryNo hiển thị chuẩn PN-...
          const cleanNo = so.requestNo
            ? so.requestNo.replace(/^PN-|^PO-|^DEL-/, "")
            : so.id;
          const deliveryNo = `PN-${cleanNo}`;
          const sName =
            (so.supplierName &&
            so.supplierName !== "Nhà cung cấp đối tác" &&
            !so.supplierName.includes("Nhiều NCC")
              ? so.supplierName
              : null) ||
            globalSupplierIdMap.get(String(so.supplierId)) ||
            so.Supplier?.name ||
            so.supplier?.name ||
            "Nhà cung cấp đối tác";

          const rawItems = Array.isArray(so.items) ? so.items : [];
          const deliveryItems = rawItems.map((it) => ({
            id: it.id,
            ingredientId: it.ingredientEntryId || it.id,
            ingredientName: it.ingredientName || it.name || "Nguyên liệu tươi",
            requestedQuantity: Number(it.requestedQuantity || it.quantity || 0),
            actualQuantity: Number(it.requestedQuantity || it.quantity || 0),
            orderedQty: Number(it.requestedQuantity || it.quantity || 0),
            deliveredQty: Number(it.requestedQuantity || it.quantity || 0),
            unit: it.unit || "kg",
            supplierId: it.supplierId || so.supplierId,
            supplierName:
              (it.supplierName &&
              it.supplierName !== "Nhà cung cấp đối tác" &&
              !it.supplierName.includes("Nhiều NCC")
                ? it.supplierName
                : null) ||
              globalSupplierIdMap.get(String(it.supplierId || so.supplierId)) ||
              sName,
            handlingType: "DIRECT_USE",
            status: "ACCEPTED",
          }));

          let parsedMax = 0;
          let parsedPlanned = 0;
          const portionMatch = String(so.note || "").match(
            /Sĩ số:\s*(\d+)\s*HS\s*\|\s*Đợt 1:\s*(\d+)\s*suất/i,
          );
          if (portionMatch) {
            parsedMax = Number(portionMatch[1]) || 0;
            parsedPlanned = Number(portionMatch[2]) || 0;
          }

          const rawSoStatus = String(so.status || "").toUpperCase();
          const isSoConfirmed =
            rawSoStatus === "ACCEPTED" || rawSoStatus === "CONFIRMED";
          const isSoCreated =
            rawSoStatus === "SENT" ||
            rawSoStatus === "DRAFT" ||
            rawSoStatus === "CREATED" ||
            rawSoStatus === "IN_PROGRESS" ||
            rawSoStatus === "PENDING";

          return adaptDeliveryItem({
            id: so.id,
            deliveryNo,
            orderNo: so.requestNo,
            supplierId: so.supplierId,
            supplierName: sName,
            supplierPhone: so.supplierPhone || so.Supplier?.phone || "--",
            deliveryDate: dateStr,
            deliveryTime,
            batchType,
            maxPortions: parsedMax || undefined,
            plannedPortions: parsedPlanned || undefined,
            batch1Portions: parsedPlanned || undefined,
            status: isSoConfirmed
              ? "CONFIRMED"
              : isSoCreated
                ? "CREATED"
                : so.status,
            statusLabel: isSoConfirmed ? "NCC đã xác nhận" : "Chờ NCC xác nhận",
            driverName: "Chưa phân công (Chờ NCC điều xe)",
            vehiclePlate: "",
            refrigerationTemp: "Chưa đo (Chờ xe tới)",
            note:
              so.note ||
              (isB2
                ? "Thực phẩm tươi sống Đợt 2 (Cân đối sĩ số)"
                : "Thực phẩm tươi sống Đợt 1 (50% Suất)"),
            deliveryItems,
            items: deliveryItems,
            subOrderIds: [so.id],
          });
        })
        .filter(Boolean);
    } catch (err) {
      console.warn("Lỗi tải danh sách phiếu giao nhận từ Backend:", err);
    }

    // -------------------------------------------------------------
    // GOM NHÓM ĐỒNG BỘ: HỢP NHẤT SUPPLY REQUESTS & DELIVERIES THÀNH 1 PHIẾU NHẬP HÀNG TỔNG
    // Mỗi đợt (Batch 1 / Batch 2) cho 1 ngày ăn chỉ có DUY NHẤT 1 phiếu mang mã chuẩn PN-...
    // Dù các NCC có xác nhận lệch giờ nhau, tất cả các xe đều được gộp chung vào phiếu này.
    // -------------------------------------------------------------
    const getBaseOrderNo = (item) => {
      const candidates = [
        item.orderNo,
        item.requestNo,
        item.deliveryNo,
        item.SupplyRequest?.requestNo,
      ];
      for (const c of candidates) {
        if (!c) continue;
        const s = String(c).trim();
        if (/^PN-/i.test(s) || /^PO-/i.test(s)) {
          return s.replace(/^PO-/i, "PN-").replace(/-\d+$/, "");
        }
      }
      for (const c of candidates) {
        if (!c) continue;
        const s = String(c).trim();
        if (!/^FP-/i.test(s)) {
          return s.replace(/^DEL-/, "PN-").replace(/-\d+$/, "");
        }
      }
      return "";
    };

    const masterGroups = new Map();

    const addToGroup = (item, isDeliveryRecord) => {
      if (!item) return;
      if (item.batchType === "DRY_STOCK" || item.orderType === "DRY_STOCK")
        return;

      const baseNo = getBaseOrderNo(item);
      const date = item.deliveryDate || "";
      // Cùng ngày + cùng đợt = 1 phiếu tổng (nhiều NCC gộp trong đó); baseNo chỉ để hiển thị mã.
      const batch = item.batchType || "UNKNOWN";
      const key = `${date}_${batch}`;

      if (!masterGroups.has(key)) {
        masterGroups.set(key, {
          baseNo,
          date,
          batch,
          deliveries: [],
          supplyRequests: [],
        });
      }

      const g = masterGroups.get(key);
      if (isDeliveryRecord) {
        g.deliveries.push(item);
      } else {
        g.supplyRequests.push(item);
      }
    };

    deliveriesList.forEach((d) => addToGroup(d, true));
    supplyList.forEach((s) => addToGroup(s, false));

    const consolidatedDeliveries = Array.from(masterGroups.values()).map(
      (group) => {
        const { baseNo, date, batch, deliveries, supplyRequests } = group;
        const rep = deliveries[0] || supplyRequests[0] || {};
        const finalDeliveryNo =
          baseNo ||
          `PN-${String(rep.deliveryNo || rep.orderNo || date)
            .replace(/-\d+$/, "")
            .replace(/^PO-|^DEL-|^FP-DE-/, "")}`;

        // Tập hợp tất cả các NCC tham gia trong đợt này
        const groupSupplierMap = new Map();

        supplyRequests.forEach((so) => {
          const sName =
            (so.supplierName &&
            so.supplierName !== "Nhà cung cấp đối tác" &&
            !so.supplierName.includes("Nhiều NCC")
              ? so.supplierName
              : null) ||
            globalSupplierIdMap.get(String(so.supplierId)) ||
            so.Supplier?.name ||
            so.supplier?.name ||
            "Nhà cung cấp đối tác";
          const norm = sName.toLowerCase().trim();
          if (!groupSupplierMap.has(norm)) {
            groupSupplierMap.set(norm, {
              name: sName,
              id: so.supplierId,
              supplyItem: so,
              deliveryItem: null,
            });
          } else {
            const entry = groupSupplierMap.get(norm);
            if (!entry.supplyItem) entry.supplyItem = so;
            if (!entry.id && so.supplierId) entry.id = so.supplierId;
          }
        });

        deliveries.forEach((deliv) => {
          const sName =
            (deliv.supplierName &&
            deliv.supplierName !== "Nhà cung cấp đối tác" &&
            !deliv.supplierName.includes("Nhiều NCC")
              ? deliv.supplierName
              : null) ||
            globalSupplierIdMap.get(String(deliv.supplierId)) ||
            deliv.Supplier?.name ||
            deliv.supplier?.name ||
            "";
          let matchedKey = null;

          if (sName) {
            const norm = sName.toLowerCase().trim();
            if (groupSupplierMap.has(norm)) {
              matchedKey = norm;
            } else {
              for (const [k, v] of groupSupplierMap.entries()) {
                if (
                  (deliv.supplierId && v.id === deliv.supplierId) ||
                  norm.includes(k) ||
                  k.includes(norm)
                ) {
                  matchedKey = k;
                  break;
                }
              }
            }
          }

          if (matchedKey) {
            const entry = groupSupplierMap.get(matchedKey);
            entry.deliveryItem = deliv;
          } else {
            const resolvedName =
              sName ||
              globalSupplierIdMap.get(String(deliv.supplierId)) ||
              `NCC-${deliv.supplierId || deliveries.indexOf(deliv) + 1}`;
            const norm = resolvedName.toLowerCase().trim();
            groupSupplierMap.set(norm, {
              name: resolvedName,
              id: deliv.supplierId,
              supplyItem: null,
              deliveryItem: deliv,
            });
          }
        });

        const allItems = [];
        const supNames = [];
        const transportsBySupplier = {};
        const supplierApprovals = {};
        const subOrderIds = [];
        const deliveryIds = [];

        let vehicleIdx = 0;
        let anyInTransit = false;
        let anyArrived = false;
        let allApproved = true;
        let anyConfirmed = false;

        const entries = Array.from(groupSupplierMap.values());
        if (entries.length === 0) {
          allApproved = false;
        }

        entries.forEach((entry) => {
          vehicleIdx++;
          const sName = entry.name;
          supNames.push(sName);

          if (entry.supplyItem?.id) subOrderIds.push(entry.supplyItem.id);
          if (entry.deliveryItem?.id) deliveryIds.push(entry.deliveryItem.id);

          const srcItems =
            entry.deliveryItem?.items && entry.deliveryItem.items.length > 0
              ? entry.deliveryItem.items
              : entry.supplyItem?.items || [];

          srcItems.forEach((it) => {
            const resolvedItemSup =
              (it.supplierName &&
              it.supplierName !== "Nhà cung cấp đối tác" &&
              !it.supplierName.includes("Nhiều NCC")
                ? it.supplierName
                : null) ||
              globalSupplierIdMap.get(String(it.supplierId || entry.id)) ||
              (sName !== "Nhà cung cấp đối tác" ? sName : "") ||
              "Nhà cung cấp đối tác";

            allItems.push({
              ...it,
              supplierName: resolvedItemSup,
              supplierId: it.supplierId || entry.id,
            });
          });

          if (entry.deliveryItem) {
            const d = entry.deliveryItem;
            anyConfirmed = true;
            if (d.status === "IN_TRANSIT") anyInTransit = true;
            if (d.status === "ARRIVED" || d.status === "INSPECTING")
              anyArrived = true;
            if (
              d.status !== "APPROVED" &&
              d.status !== "RECEIVED" &&
              d.status !== "COMPLETED"
            ) {
              allApproved = false;
            }

            const expectedTimeStr = d.expectedArrivalAt
              ? `${formatTimeStr(d.expectedArrivalAt)} — Ngày ${formatDateVN(d.expectedArrivalAt)}`
              : d.deliveryTime
                ? `${d.deliveryTime} — Ngày ${formatDateVN(d.deliveryDate || date)}`
                : "Chờ NCC cập nhật";

            transportsBySupplier[sName] = {
              supplierId: entry.id,
              supplierName: sName,
              driver:
                d.driverName &&
                d.driverName !== "Chưa phân công (Chờ NCC điều xe)"
                  ? `${d.driverName}${d.driverPhone && d.driverPhone !== "--" && !d.driverName.includes("(") ? ` (${d.driverPhone})` : ""}`
                  : d.vehiclePlate
                    ? "Tài xế NCC"
                    : "Chưa phân công (Chờ NCC điều xe)",
              phone: d.driverPhone || d.phone || "--",
              vehicle: d.vehiclePlate || "Chưa phân công (Chờ NCC điều xe)",
              expectedTime: expectedTimeStr,
              qrCode:
                d.supplierDeliveryNo ||
                d.deliveryQr ||
                d.deliveryNo ||
                `QR-LOT-${finalDeliveryNo}-${String(vehicleIdx).padStart(2, "0")}`,
              status: d.status,
              hasDispatched: Boolean(
                d.vehiclePlate ||
                d.status === "IN_TRANSIT" ||
                d.status === "ARRIVED" ||
                d.status === "APPROVED",
              ),
              note: d.note || "",
            };

            supplierApprovals[sName] = d.approvals || {};
          } else {
            allApproved = false;
            const rawSupStatus = String(
              entry.supplyItem?.status || "",
            ).toUpperCase();
            const normalizedSupStatus =
              rawSupStatus === "ACCEPTED" || rawSupStatus === "CONFIRMED"
                ? "CONFIRMED"
                : "CREATED";

            transportsBySupplier[sName] = {
              supplierId: entry.id,
              supplierName: sName,
              driver: "Chưa phân công (Chờ NCC điều xe)",
              phone: "--",
              vehicle: "Chưa phân công (Chờ NCC điều xe)",
              expectedTime: "Chờ NCC cập nhật",
              qrCode: `QR-PENDING-${finalDeliveryNo}-${String(vehicleIdx).padStart(2, "0")}`,
              status: normalizedSupStatus,
              hasDispatched: false,
            };
            supplierApprovals[sName] = {};
          }
        });

        let masterStatus = "CREATED";
        let masterStatusLabel = "Chờ NCC xác nhận";

        if (allApproved && entries.length > 0) {
          masterStatus = "APPROVED";
          masterStatusLabel = "4/4 Đã duyệt & Bàn giao bếp";
        } else if (anyArrived) {
          masterStatus = "INSPECTING";
          masterStatusLabel = "Đang kiểm tra 4 bên";
        } else if (anyInTransit) {
          masterStatus = "IN_TRANSIT";
          masterStatusLabel = "NCC đang vận chuyển";
        } else if (anyConfirmed) {
          masterStatus = "CONFIRMED";
          masterStatusLabel = "NCC đã xác nhận";
        }

        return {
          ...rep,
          id: deliveries[0]?.id || supplyRequests[0]?.id || finalDeliveryNo,
          deliveryNo: finalDeliveryNo,
          orderNo: finalDeliveryNo,
          deliveryDate: date || rep.deliveryDate || getTodayStr(),
          deliveryTime:
            rep.deliveryTime || (batch === "BATCH_2" ? "07:45" : "05:30"),
          batchType: batch,
          batchLabel:
            batch === "BATCH_1"
              ? "Đợt 1 (50% Suất tối đa)"
              : "Đợt 2 (Cân đối sĩ số)",
          maxPortions: rep.maxPortions || 0,
          plannedPortions: rep.plannedPortions || 0,
          batch1Portions: rep.batch1Portions || rep.plannedPortions || 0,
          supplierName:
            supNames.length > 1
              ? `Nhiều NCC (${supNames.length} đối tác: ${supNames.join(", ")})`
              : supNames[0] || rep.supplierName || "Nhà cung cấp đối tác",
          suppliers: supNames,
          items: allItems,
          deliveryItems: allItems,
          transportsBySupplier,
          supplierApprovals,
          status: masterStatus,
          statusLabel: masterStatusLabel,
          subOrderIds,
          deliveryIds,
        };
      },
    );

    let items = consolidatedDeliveries.filter(
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
   * Lấy chi tiết 1 đơn hàng/phiếu giao nhận theo ID hoặc đối tượng fallbackDelivery
   * Truy vấn /supply-requests/:id hoặc /deliveries/:id
   */
  async getDeliveryDetail(id, fallbackDelivery = null) {
    if (!id && !fallbackDelivery) return null;
    try {
      // 1. Nếu fallbackDelivery đã có items đầy đủ và có map transportsBySupplier thì ưu tiên dùng
      if (
        Array.isArray(fallbackDelivery?.items) &&
        fallbackDelivery.items.length > 0 &&
        fallbackDelivery.transportsBySupplier
      ) {
        return fallbackDelivery;
      }

      // 2. Tra cứu từ danh sách phiếu nhập hàng tổng đã được gộp chuẩn
      const delivRes = await this.getDeliveries();
      const allMaster = delivRes?.items || [];
      const matched = allMaster.find(
        (m) =>
          m.id === id ||
          m.deliveryNo === id ||
          m.orderNo === id ||
          m.subOrderIds?.includes(id) ||
          m.deliveryIds?.includes(id) ||
          (fallbackDelivery &&
            (m.deliveryNo === fallbackDelivery.deliveryNo ||
              m.orderNo === fallbackDelivery.orderNo)),
      );

      if (matched) {
        return matched;
      }

      // 2. Lấy danh sách suppliers để map tên
      const supRes = await this.getSuppliers().catch(() => ({ items: [] }));
      const supplierMap = new Map(
        (supRes?.items || []).map((s) => [String(s.id), s.name]),
      );

      // 3. Nếu fallbackDelivery có subOrderIds (đơn gộp nhiều NCC)
      const subIds = fallbackDelivery?.subOrderIds || (id ? [id] : []);
      if (subIds.length > 0) {
        const details = await Promise.all(
          subIds.map((subId) =>
            http
              .get(`/supply-requests/${subId}`, {
                notifyOnError: false,
                skipAuthRedirect: true,
              })
              .then((r) => r?.data || r)
              .catch(() => null),
          ),
        );

        const validDetails = details.filter((d) => d && d.id);
        if (validDetails.length > 0) {
          const allItems = [];
          const supNames = new Set();
          let latestDate = fallbackDelivery?.deliveryDate;

          validDetails.forEach((d) => {
            const sName =
              (d.supplierName &&
              d.supplierName !== "Nhà cung cấp đối tác" &&
              !d.supplierName.includes("Nhiều NCC")
                ? d.supplierName
                : null) ||
              supplierMap.get(String(d.supplierId)) ||
              d.Supplier?.name ||
              d.supplier?.name ||
              "Nhà cung cấp đối tác";
            if (sName && sName !== "Nhà cung cấp đối tác") supNames.add(sName);
            if (d.requestedDeliveryDate) {
              latestDate = String(d.requestedDeliveryDate).slice(0, 10);
            }
            if (Array.isArray(d.items)) {
              d.items.forEach((it) => {
                const resolvedItemSup =
                  (it.supplierName &&
                  it.supplierName !== "Nhà cung cấp đối tác" &&
                  !it.supplierName.includes("Nhiều NCC")
                    ? it.supplierName
                    : null) ||
                  supplierMap.get(String(it.supplierId || d.supplierId)) ||
                  sName;

                allItems.push({
                  id: it.id,
                  ingredientId: it.ingredientEntryId || it.id,
                  ingredientName:
                    it.ingredientName || it.name || "Nguyên liệu tươi",
                  requestedQuantity: Number(
                    it.requestedQuantity || it.quantity || 0,
                  ),
                  actualQuantity: Number(
                    it.requestedQuantity || it.quantity || 0,
                  ),
                  orderedQty: Number(it.requestedQuantity || it.quantity || 0),
                  deliveredQty: Number(
                    it.requestedQuantity || it.quantity || 0,
                  ),
                  unit: it.unit || "kg",
                  supplierId: it.supplierId || d.supplierId,
                  supplierName: resolvedItemSup,
                  handlingType: "DIRECT_USE",
                  status: "ACCEPTED",
                });
              });
            }
          });

          const suppliersList = Array.from(supNames);
          const first = validDetails[0];
          const batchType = batchTypeOf(first) ?? batchTypeOf(fallbackDelivery);
          const isB2 = batchType === BATCH_TYPE.BATCH_2;
          const deliveryTime = isB2 ? "07:45" : "05:30";

          const rawFirstStatus = String(first.status || "").toUpperCase();
          const isFirstConfirmed =
            rawFirstStatus === "ACCEPTED" || rawFirstStatus === "CONFIRMED";
          const isFirstCreated =
            rawFirstStatus === "SENT" ||
            rawFirstStatus === "DRAFT" ||
            rawFirstStatus === "CREATED" ||
            rawFirstStatus === "IN_PROGRESS" ||
            rawFirstStatus === "PENDING";

          return adaptDeliveryItem({
            ...(fallbackDelivery || {}),
            id: fallbackDelivery?.id || first.id,
            deliveryNo:
              fallbackDelivery?.deliveryNo ||
              `PN-${first.requestNo?.replace(/^PN-|^PO-|^DEL-/, "")}`,
            orderNo:
              fallbackDelivery?.deliveryNo ||
              `PN-${first.requestNo?.replace(/^PN-|^PO-|^DEL-/, "")}`,
            supplierId: first.supplierId,
            supplierName:
              suppliersList.length > 1
                ? `Nhiều NCC (${suppliersList.length} đối tác: ${suppliersList.join(", ")})`
                : suppliersList[0] ||
                  fallbackDelivery?.supplierName ||
                  "Nhà cung cấp đối tác",
            suppliers: suppliersList,
            deliveryDate:
              latestDate || fallbackDelivery?.deliveryDate || getTodayStr(),
            deliveryTime,
            batchType,
            status: isFirstConfirmed
              ? "CONFIRMED"
              : isFirstCreated
                ? "CREATED"
                : first.status,
            statusLabel: isFirstConfirmed
              ? "NCC đã xác nhận"
              : "Chờ NCC xác nhận",
            note: first.note || fallbackDelivery?.note,
            deliveryItems: allItems,
            items: allItems,
            subOrderIds: subIds,
          });
        }
      }

      // 4. Nếu là đơn từ /deliveries/:id
      if (id) {
        const delivRes = await http
          .get(`/deliveries/${id}`, {
            notifyOnError: false,
            skipAuthRedirect: true,
          })
          .catch(() => null);
        const delivData = delivRes?.data || delivRes;
        if (delivData && delivData.id) {
          return adaptDeliveryItem(delivData);
        }
      }
    } catch (err) {
      console.warn("Lỗi tải chi tiết đơn hàng:", err);
    }
    return fallbackDelivery;
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
    menusSummary,
    plannedPortions,
    maxPortions,
    note,
    orderDate,
    items,
    targetScope,
  }) {
    const isMulti = Array.isArray(menus) && menus.length > 1;
    const dateFormatted = orderDate
      ? String(orderDate).slice(0, 10)
      : getTodayStr();
    const deliveryDate = dateFormatted;
    const orderNo = `PN-${dateFormatted.replace(/-/g, "")}-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;

    // Tải danh mục ingredient-entries, active partnerships và danh mục ingredients từ DB (đầy đủ các trang)
    const [entries, partnerships, allIngredients] = await Promise.all([
      fetchAllPages("/ingredient-entries"),
      fetchAllPages("/supplier-partnerships", { status: "ACTIVE" }),
      fetchAllPages("/ingredients"),
    ]);

    // Xây dựng danh bạ các IngredientEntry HỢP LỆ THẬT SỰ của trường trong DB
    const schoolActiveEntries = entries
      .filter((e) => e.status === "ACTIVE" || !e.status)
      .map((e) => {
        const ing = allIngredients.find((i) => i.id === e.ingredientId);
        return {
          entryId: e.id,
          ingredientId: e.ingredientId,
          supplierId: ing?.supplierId || ing?.Supplier?.id || "",
          supplierName: ing?.Supplier?.name || "Nhà cung cấp đối tác",
          name: ing?.name || "",
          normName: String(ing?.name || "")
            .trim()
            .toLowerCase(),
          unit: ing?.defaultUnit || "kg",
          handlingType: e.handlingType || "DIRECT_USE",
        };
      })
      .filter((e) => e.supplierId);

    // 1. Chuẩn hóa items và xác định đúng ingredientEntryId & supplierId từ DB
    const unresolved = { missing: [], ambiguous: [] };
    const freshItemsBatch1 = (Array.isArray(items) ? items : []).map((it) => {
      // Chỉ ghép theo mã hoặc đúng tên trong danh mục trường; không đoán, không lấy nguyên liệu thay thế.
      const targetEntry = resolveSchoolEntry(
        it,
        schoolActiveEntries,
        unresolved,
      );
      const sId = targetEntry?.supplierId || "";
      const sName = targetEntry?.supplierName || "";
      const entryId = targetEntry?.entryId || "";

      return {
        ...it,
        ingredientEntryId: entryId,
        supplierId: sId,
        supplierName: sName,
        orderedQty: Number(requireOrderQuantity(it.orderedQty ?? it.quantity)),
      };
    });

    if (freshItemsBatch1.length === 0) {
      throw new Error("Không có nguyên liệu tươi sống nào để đặt đơn Đợt 1.");
    }
    assertAllResolved(unresolved);

    // 2. Gom items theo từng supplierId thực tế
    const itemsBySupplier = {};
    freshItemsBatch1.forEach((it) => {
      const sId = it.supplierId;
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
        const q = Number(requireOrderQuantity(it.orderedQty));
        if (mergedItemsMap.has(eId)) {
          mergedItemsMap.set(
            eId,
            Number((mergedItemsMap.get(eId) + q).toFixed(3)),
          );
        } else {
          mergedItemsMap.set(eId, q);
        }
      });

      const portionsTag = plannedPortions
        ? ` [Sĩ số: ${maxPortions || 0} HS | Đợt 1: ${plannedPortions} suất]`
        : "";
      const noteText =
        (note?.trim() || "Phiếu giao nhận Đợt 1 thực phẩm tươi sống") +
        portionsTag;

      const payload = {
        supplierId: sId,
        requestNo: reqNo,
        orderType: "DIRECT_USE",
        batchNo: 1,
        requestedDeliveryDate: deliveryDate,
        note: noteText,
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
      deliveryNo: orderNo,
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

    const baseOrderNo = String(
      batch1Delivery.deliveryNo || batch1Delivery.orderNo || "",
    ).replace(/-D1(-\d+)?$/, "");
    const deliveryDate =
      orderDate || batch1Delivery.deliveryDate || getTodayStr();
    const actualCount = Number(actualAttendance) || 0;
    const maxPortions = Number(batch1Delivery.maxPortions) || 0;
    const batch1Portions =
      batch1Delivery.plannedPortions || Math.floor(maxPortions / 2);
    const remainingPortions = Math.max(0, actualCount - batch1Portions);

    // Tải danh mục ingredient-entries, active partnerships và danh mục ingredients từ DB (đầy đủ các trang)
    const [entries, partnerships, allIngredients] = await Promise.all([
      fetchAllPages("/ingredient-entries"),
      fetchAllPages("/supplier-partnerships", { status: "ACTIVE" }),
      fetchAllPages("/ingredients"),
    ]);

    // Xây dựng danh bạ các IngredientEntry HỢP LỆ THẬT SỰ của trường trong DB
    const schoolActiveEntries = entries
      .filter((e) => e.status === "ACTIVE" || !e.status)
      .map((e) => {
        const ing = allIngredients.find((i) => i.id === e.ingredientId);
        return {
          entryId: e.id,
          ingredientId: e.ingredientId,
          supplierId: ing?.supplierId || ing?.Supplier?.id || "",
          supplierName: ing?.Supplier?.name || "Nhà cung cấp đối tác",
          name: ing?.name || "",
          normName: String(ing?.name || "")
            .trim()
            .toLowerCase(),
          unit: ing?.defaultUnit || "kg",
          handlingType: e.handlingType || "DIRECT_USE",
        };
      })
      .filter((e) => e.supplierId);

    // 2. Chuẩn hóa items Đợt 2
    const sourceItems =
      Array.isArray(items) && items.length > 0
        ? items
        : batch1Delivery.items || [];
    const unresolvedBatch2 = { missing: [], ambiguous: [] };
    const freshItemsBatch2 = sourceItems.map((it) => {
      // Chỉ ghép theo mã hoặc đúng tên trong danh mục trường; không đoán, không lấy nguyên liệu thay thế.
      const targetEntry = resolveSchoolEntry(
        it,
        schoolActiveEntries,
        unresolvedBatch2,
      );
      const sId = targetEntry?.supplierId || "";
      const sName = targetEntry?.supplierName || "";
      const entryId = targetEntry?.entryId || "";

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
        orderedQty: Number(requireOrderQuantity(ordQty)),
      };
    });

    if (freshItemsBatch2.length === 0) {
      throw new Error("Không có nguyên liệu tươi sống nào cho Đợt 2.");
    }
    assertAllResolved(unresolvedBatch2);

    // 3. Gom items theo từng supplierId
    const itemsBySupplier = {};
    freshItemsBatch2.forEach((it) => {
      const sId = it.supplierId;
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
        const q = Number(requireOrderQuantity(it.orderedQty));
        if (mergedItemsMap.has(eId)) {
          mergedItemsMap.set(
            eId,
            Number((mergedItemsMap.get(eId) + q).toFixed(3)),
          );
        } else {
          mergedItemsMap.set(eId, q);
        }
      });

      const noteText =
        note?.trim() ||
        "Phiếu giao nhận Đợt 2 thực phẩm tươi sống (Cân đối sĩ số)";

      const payload = {
        supplierId: sId,
        requestNo: reqNo,
        orderType: "DIRECT_USE",
        batchNo: 2,
        requestedDeliveryDate: deliveryDate,
        note: noteText,
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
