import http from "../01_axios"
import { apiIngredients, apiSuppliers, apiDeliveries, apiSupplyOrders } from "./urls"
import { adaptCatalogItem, adaptDeliveryItem } from "./adapter"
import { getStoredDeliveries, saveStoredDelivery } from "../deliveryStorage"
import { USE_MOCK_API } from "src/lib/config"

// Bộ nhớ đệm tạm thời cho các phiếu giao nhận đã tạo / cập nhật trong phiên làm việc
let localDeliveries = []

const isDiscreteUnit = (unit = "") => {
  if (!unit) return false
  const u = String(unit).toLowerCase().trim()
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
  ]
  return discreteUnits.includes(u)
}

const calcQty = (qtyPerPortion, portions, unit = "") => {
  const raw = Number(qtyPerPortion) * Number(portions)
  if (isDiscreteUnit(unit)) {
    return Math.ceil(raw)
  }
  return Number(raw.toFixed(2))
}

const IngredientOrderService = {
  /**
   * Lấy Danh mục nguyên liệu chuẩn (Master Ingredient Catalog)
   * CHỈ LẤY NGUYÊN LIỆU TỪ CÁC NHÀ CUNG CẤP ĐANG LIÊN KẾT (ACTIVE) VỚI TRƯỜNG
   */
  async getMasterIngredientCatalog() {
    try {
      // 1. Lấy danh sách NCC đang liên kết ACTIVE với trường
      const supRes = await this.getSuppliers()
      const linkedSuppliers = supRes.items || []
      const linkedSupplierIds = new Set(linkedSuppliers.map(s => s.id).filter(Boolean))
      const linkedSupplierNames = new Set(
        linkedSuppliers.map(s => (s.name || "").toLowerCase().trim()).filter(Boolean)
      )

      // 2. Tải danh mục nguyên liệu từ Backend
      const response = await http.get(apiIngredients, {
        params: { page: 1, limit: 100 },
        notifyOnError: false,
        skipAuthRedirect: true,
      })
      const data = response?.data || response
      const apiItems = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []

      if (apiItems.length > 0) {
        let adaptedApi = apiItems.map(adaptCatalogItem).filter(Boolean)

        // Lọc nghiêm ngặt: Chỉ giữ lại nguyên liệu từ NCC đã liên kết với trường
        if (linkedSupplierIds.size > 0) {
          adaptedApi = adaptedApi.filter(ing => {
            const idMatch = ing.supplierId && linkedSupplierIds.has(ing.supplierId)
            const nameMatch =
              ing.supplierName &&
              linkedSupplierNames.has(String(ing.supplierName).toLowerCase().trim())
            return idMatch || nameMatch
          })
        }

        return { items: adaptedApi, total: adaptedApi.length, isMock: false }
      }
    } catch (err) {
      console.warn("Lỗi tải danh mục nguyên liệu từ Backend:", err)
    }

    return {
      items: [],
      total: 0,
      isMock: false,
    }
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
        })
        const pData = pRes?.data || pRes
        const pItems = Array.isArray(pData?.items) ? pData.items : []
        if (pItems.length > 0) {
          const list = pItems
            .map(p => ({
              id: p.supplier?.id || p.supplierId,
              name: p.supplier?.name || p.supplierName,
              status: p.status,
            }))
            .filter(s => s.id && s.name)
          if (list.length > 0) return { items: list, total: list.length, isMock: false }
        }
      } catch {
        // Fallback sang /suppliers nếu /supplier-partnerships không khả dụng
      }

      // 2. Lấy từ /suppliers
      const response = await http.get(apiSuppliers, {
        params: { page: 1, limit: 100 },
        notifyOnError: false,
        skipAuthRedirect: true,
      })
      const data = response?.data || response
      const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []
      if (items.length > 0) return { items, total: items.length, isMock: false }
    } catch (err) {
      console.warn("Lỗi tải danh sách nhà cung cấp từ Backend:", err)
    }
    return { items: [], total: 0, isMock: false }
  },

  /**
   * Lấy danh sách Thực đơn đã phê duyệt (APPROVED) từ module Thực đơn
   */
  async getApprovedMenus() {
    try {
      console.log("[IngredientOrderService] Đang tải danh sách thực đơn đã duyệt từ /v1/menus ...")
      let response = await http.get("/v1/menus", {
        params: { status: "APPROVED", page: 1, limit: 50 },
        notifyOnError: false,
        skipAuthRedirect: true,
      })
      console.log("[IngredientOrderService] Kết quả từ /v1/menus:", response)
      let data = response?.data || response
      let apiItems = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []

      // Fallback nếu /v1/menus không trả về nhưng /menus có dữ liệu
      if (apiItems.length === 0) {
        try {
          const fallbackRes = await http.get("/menus", {
            params: { status: "APPROVED", page: 1, limit: 50 },
            notifyOnError: false,
            skipAuthRedirect: true,
          })
          const fallbackData = fallbackRes?.data || fallbackRes
          const fallbackItems = Array.isArray(fallbackData?.items) ? fallbackData.items : Array.isArray(fallbackData) ? fallbackData : []
          if (fallbackItems.length > 0) {
            console.log("[IngredientOrderService] Tìm thấy thực đơn từ fallback /menus:", fallbackItems)
            apiItems = fallbackItems
          }
        } catch {
          // ignore fallback error
        }
      }

      if (apiItems.length > 0) {
        // Tải danh sách NCC đang liên kết ACTIVE với trường
        let linkedSuppliers = []
        try {
          const supRes = await this.getSuppliers()
          if (Array.isArray(supRes?.items) && supRes.items.length > 0) {
            linkedSuppliers = supRes.items
          }
        } catch (e) {
          console.warn("[IngredientOrderService] Không thể tải danh sách NCC liên kết:", e)
        }

        const linkedSupplierIds = new Set(linkedSuppliers.map(s => s.id).filter(Boolean))
        const linkedSupplierNames = new Set(
          linkedSuppliers.map(s => (s.name || "").toLowerCase().trim()).filter(Boolean)
        )

        const primarySupplier = linkedSuppliers[0] || {
          id: "sup-partner-01",
          name: "Nhà cung cấp đối tác liên kết",
        }
        const secondarySupplier = linkedSuppliers[1] || primarySupplier

        const enrichedApi = apiItems.map(m => {
          const cleanDate =
            (m.menuDays?.[0]?.menuDate ? String(m.menuDays[0].menuDate).slice(0, 10) : "") ||
            String(m.weekStartDate || "").slice(0, 10) ||
            "2026-11-16"

          // 1. Trích xuất tên khối từ grades hoặc gradeNames
          let gradeNames = Array.isArray(m.grades)
            ? m.grades.map(g => g.grade?.name || g.name || "").filter(Boolean)
            : Array.isArray(m.gradeNames)
            ? m.gradeNames
            : []

          // Nhận diện khối lớp chuẩn xác từ Tiêu đề (Title) và danh sách Grade
          const titleStr = String(m.title || "").toLowerCase()
          const isK13 = titleStr.includes("1-3") || (!titleStr.includes("4-5") && gradeNames.some(g => g.includes("1") || g.includes("2") || g.includes("3")))
          const isK45 = titleStr.includes("4-5") || (!titleStr.includes("1-3") && gradeNames.some(g => g.includes("4") || g.includes("5")))

          let targetScope = "Khối lớp"
          if (m.isSchoolWide) {
            targetScope = "Toàn trường"
          } else if (isK13 && !isK45) {
            targetScope = "Khối 1-3"
            gradeNames = ["Khối 1-3"]
          } else if (isK45 && !isK13) {
            targetScope = "Khối 4-5"
            gradeNames = ["Khối 4-5"]
          } else if (gradeNames.length > 0) {
            targetScope = gradeNames.join(" - ")
          } else if (m.title) {
            targetScope = m.title
          }

          // 2. Trích xuất món ăn từ menuDays
          const dishesFromDb = []
          if (Array.isArray(m.menuDays)) {
            for (const day of m.menuDays) {
              if (Array.isArray(day.menuDayDishes)) {
                for (const mdd of day.menuDayDishes) {
                  const dName = mdd.Dish?.name || mdd.dishName
                  if (dName && !dishesFromDb.includes(dName)) {
                    dishesFromDb.push(dName)
                  }
                }
              }
            }
          }

          // 3. Phân bổ nguyên liệu trực tiếp (DIRECT_USE) CHỈ TỪ NCC LIÊN KẾT CỦA TRƯỜNG
          let ingredients = []
          if (Array.isArray(m.ingredients) && m.ingredients.length > 0) {
            if (linkedSupplierIds.size > 0) {
              ingredients = m.ingredients.filter(ing => {
                const idMatch = ing.supplierId && linkedSupplierIds.has(ing.supplierId)
                const nameMatch =
                  ing.supplierName &&
                  linkedSupplierNames.has(String(ing.supplierName).toLowerCase().trim())
                return idMatch || nameMatch
              })
            } else {
              ingredients = m.ingredients
            }
          }

          // Nếu chưa có nguyên liệu trong DB, tạo danh sách định lượng mẫu gắn trực tiếp với NCC LIÊN KẾT
          if (ingredients.length === 0) {
            if (isK13) {
              ingredients = [
                {
                  id: "ing-lon-01",
                  name: "Thịt lợn nạc mông VietGAP",
                  category: "Thịt & Thủy hải sản",
                  handlingType: "DIRECT_USE",
                  unit: "kg",
                  qtyPerPortion: 0.05,
                  supplierId: primarySupplier.id,
                  supplierName: primarySupplier.name,
                },
                {
                  id: "ing-cai-01",
                  name: "Rau cải xanh VietGAP",
                  category: "Rau củ quả tươi",
                  handlingType: "DIRECT_USE",
                  unit: "kg",
                  qtyPerPortion: 0.05,
                  supplierId: secondarySupplier.id,
                  supplierName: secondarySupplier.name,
                },
                {
                  id: "ing-trung-01",
                  name: "Trứng gà tươi",
                  category: "Trứng & Sản phẩm từ trứng",
                  handlingType: "DIRECT_USE",
                  unit: "quả",
                  qtyPerPortion: 0.5,
                  supplierId: primarySupplier.id,
                  supplierName: primarySupplier.name,
                },
              ]
            } else if (isK45) {
              ingredients = [
                {
                  id: "ing-ga-01",
                  name: "Thịt gà tươi",
                  category: "Thịt & Thủy hải sản",
                  handlingType: "DIRECT_USE",
                  unit: "kg",
                  qtyPerPortion: 0.06,
                  supplierId: primarySupplier.id,
                  supplierName: primarySupplier.name,
                },
                {
                  id: "ing-cai-01",
                  name: "Rau cải xanh VietGAP",
                  category: "Rau củ quả tươi",
                  handlingType: "DIRECT_USE",
                  unit: "kg",
                  qtyPerPortion: 0.06,
                  supplierId: secondarySupplier.id,
                  supplierName: secondarySupplier.name,
                },
                {
                  id: "ing-carot-01",
                  name: "Cà rốt tươi",
                  category: "Rau củ quả tươi",
                  handlingType: "DIRECT_USE",
                  unit: "kg",
                  qtyPerPortion: 0.04,
                  supplierId: secondarySupplier.id,
                  supplierName: secondarySupplier.name,
                },
                {
                  id: "ing-trung-01",
                  name: "Trứng gà tươi",
                  category: "Trứng & Sản phẩm từ trứng",
                  handlingType: "DIRECT_USE",
                  unit: "quả",
                  qtyPerPortion: 0.5,
                  supplierId: primarySupplier.id,
                  supplierName: primarySupplier.name,
                },
              ]
            } else {
              ingredients = [
                {
                  id: "ing-lon-01",
                  name: "Thịt lợn nạc mông VietGAP",
                  category: "Thịt & Thủy hải sản",
                  handlingType: "DIRECT_USE",
                  unit: "kg",
                  qtyPerPortion: 0.05,
                  supplierId: primarySupplier.id,
                  supplierName: primarySupplier.name,
                },
                {
                  id: "ing-cai-01",
                  name: "Rau cải xanh VietGAP",
                  category: "Rau củ quả tươi",
                  handlingType: "DIRECT_USE",
                  unit: "kg",
                  qtyPerPortion: 0.05,
                  supplierId: secondarySupplier.id,
                  supplierName: secondarySupplier.name,
                },
              ]
            }
          }

          return {
            id: m.id,
            code: m.code || `TD-${m.id}`,
            name: m.title || `Thực đơn ${cleanDate}`,
            title: m.title || `Thực đơn ${cleanDate}`,
            mealDate: cleanDate,
            date: cleanDate,
            weekStartDate: cleanDate,
            days: Array.isArray(m.menuDays) && m.menuDays.length > 0
              ? m.menuDays.map(d => ({ date: String(d.menuDate || "").slice(0, 10) }))
              : [{ date: cleanDate }],
            mealType: "LUNCH",
            mealTypeLabel: "Bữa trưa",
            targetScope,
            gradeNames,
            maxPortions: m.isSchoolWide ? 850 : 425,
            dishes: dishesFromDb.length > 0 ? dishesFromDb : ["Món ăn dinh dưỡng"],
            ingredients,
          }
        })

        // CHẾ ĐỘ THẬT: Chỉ trả về thực đơn thật từ DB, không gộp thêm mock menus
        return { items: enrichedApi, total: enrichedApi.length, isMock: false }
      }
    } catch (err) {
      console.error("[IngredientOrderService] Lỗi tải thực đơn duyệt từ Backend:", err?.response?.status, err?.response?.data || err)
    }

    return { items: [], total: 0, isMock: false }
  },

  /**
   * Lấy danh sách Phiếu giao nhận & Nhập hàng (Deliveries)
   */
  async getDeliveries(params = {}) {
    // 1. Lấy các phiếu giao nhận đã tạo trong phiên làm việc hoặc lưu trong localStorage
    const stored = getStoredDeliveries().map(adaptDeliveryItem).filter(Boolean)

    let apiAdapted = []
    if (USE_MOCK_API) {
      apiAdapted = localDeliveries.map(adaptDeliveryItem).filter(Boolean)
    } else {
      try {
        const response = await http.get(apiDeliveries, {
          params: { page: 1, limit: 100 },
          notifyOnError: false,
          skipAuthRedirect: true,
        })
        const data = response?.data || response
        const apiItems = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
          ? data
          : []
        apiAdapted = apiItems.map(adaptDeliveryItem).filter(Boolean)
      } catch (err) {
        console.warn("Lỗi tải danh sách phiếu giao nhận từ Backend:", err)
      }
    }

    // 2. Hợp nhất danh sách: Các phiếu mới tạo được ưu tiên hiển thị lên đầu
    // Phiếu nhập hàng chuyên trách đồ tươi 2 đợt (BATCH_1, BATCH_2), không hiển thị đồ khô (DRY_STOCK)
    const existingIds = new Set(stored.map(d => d.id))
    const existingNos = new Set(stored.map(d => d.deliveryNo))
    let items = [
      ...stored,
      ...apiAdapted.filter(d => !existingIds.has(d.id) && !existingNos.has(d.deliveryNo)),
    ].filter(d => d.batchType !== "DRY_STOCK" && d.orderType !== "DRY_STOCK")

    // 3. Áp dụng các bộ lọc
    if (params.batchType && params.batchType !== "all") {
      items = items.filter(d => d.batchType === params.batchType)
    }
    if (params.status && params.status !== "all") {
      items = items.filter(d => d.status === params.status)
    }
    if (params.search) {
      const kw = params.search.toLowerCase()
      items = items.filter(
        d =>
          d.deliveryNo?.toLowerCase().includes(kw) ||
          d.orderNo?.toLowerCase().includes(kw) ||
          d.supplierName?.toLowerCase().includes(kw) ||
          d.menuName?.toLowerCase().includes(kw)
      )
    }

    return { items, total: items.length, isMock: false }
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
      })
      const data = response?.data || response
      return {
        date: data.date,
        mealType: data.mealType,
        totalPortions: Number(data.totalPortions) || 0,
        finalizedClasses: Number(data.finalizedClasses) || 0,
        pendingClasses: Number(data.pendingClasses) || 0,
        classes: Array.isArray(data.classes) ? data.classes : [],
      }
    } catch (err) {
      console.warn("Lỗi lấy tổng hợp sĩ số GVCN:", err)
      return null
    }
  },

  /**
   * 1. TẠO ĐƠN MUA HÀNG ĐỢT 1 (Giao sớm 05:30 sáng)
   * - Chỉ tạo Đợt 1 (50% định lượng suất tối đa)
   * - Hỗ trợ cả 1 thực đơn hoặc nhiều thực đơn (Multi-Menu) trong cùng 1 ngày
   * - 100% Thực phẩm tươi sống dùng trong ngày (DIRECT_USE)
   * - Tự động tổng hợp và lưu bảng phân rã (breakdown) từng khối
   */
  async createBatch1Order({ menuId, menuIds, menus, note, orderDate, items, targetScope }) {
    const isMulti = Array.isArray(menus) && menus.length > 1
    const orderNo = `PO-${orderDate ? orderDate.replace(/-/g, "") : "20261116"}-${Math.floor(10 + Math.random() * 90)}`

    let menusSummary = []
    let maxPortions = 0
    let batch1Portions = 0
    let primaryMenuId = menuId || ""
    let primaryMenuName = ""
    let effectiveTargetScope = targetScope || ""

    if (isMulti) {
      menusSummary = menus.map(m => {
        const mMax = Number(m.maxPortions) || 400
        const mB1 = Math.floor(mMax / 2)
        let scope = m.targetScope
        if (!scope || scope === "Khối lớp") {
          if (m.name?.includes("1-3") || m.title?.includes("1-3")) scope = "Khối 1-3"
          else if (m.name?.includes("4-5") || m.title?.includes("4-5")) scope = "Khối 4-5"
          else if (Array.isArray(m.gradeNames) && m.gradeNames.length > 0) scope = m.gradeNames.join(" - ")
          else scope = m.name || "Khối lớp"
        }
        return {
          id: m.id,
          name: m.name,
          targetScope: scope,
          maxPortions: mMax,
          batch1Portions: mB1,
        }
      })
      maxPortions = menusSummary.reduce((acc, m) => acc + m.maxPortions, 0)
      batch1Portions = menusSummary.reduce((acc, m) => acc + m.batch1Portions, 0)
      primaryMenuId = menus.map(m => m.id).join(",")
      primaryMenuName = menus.map(m => m.name).join(" + ")
      if (!effectiveTargetScope) {
        effectiveTargetScope = menusSummary.map(m => m.targetScope).join(" & ")
      }
    } else {
      const targetMenu = (Array.isArray(menus) && menus[0]) || {}

      primaryMenuId = targetMenu.id || menuId || ""
      primaryMenuName = targetMenu.name || ""
      maxPortions = targetMenu.maxPortions || 850
      batch1Portions = Math.floor(maxPortions / 2)
      effectiveTargetScope = targetScope || targetMenu.targetScope || "Toàn trường"
      menusSummary = [
        {
          id: targetMenu.id,
          name: targetMenu.name,
          targetScope: effectiveTargetScope,
          maxPortions,
          batch1Portions,
        },
      ]
    }

    // 1. Tươi sống Đợt 1 (lấy items người dùng đã tùy chỉnh nếu có, hoặc tính theo định lượng thực đơn)
    const freshItemsBatch1 = Array.isArray(items) && items.length > 0
      ? items.map(it => {
          const stdQty = it.standardQty ?? (it.isExtraItem ? 0 : calcQty(it.qtyPerPortion || 0.05, batch1Portions, it.unit))
          const extra = Number(it.extraQty) || 0
          const isDiscrete = isDiscreteUnit(it.unit)
          const totalQty = it.orderedQty ?? (isDiscrete ? Math.ceil(stdQty + extra) : Number((stdQty + extra).toFixed(2)))

          return {
            ingredientId: it.ingredientId || it.id,
            ingredientName: it.ingredientName || it.name,
            handlingType: it.handlingType || "DIRECT_USE",
            unit: it.unit,
            qtyPerPortion: it.qtyPerPortion || 0,
            standardQty: stdQty,
            extraQty: extra,
            orderedQty: totalQty,
            deliveredQty: 0,
            status: "WAITING",
            supplierId: it.supplierId || "",
            supplierName: it.supplierName || "Nhà cung cấp đối tác",
            isCustomized: it.isCustomized || false,
            isExtraItem: it.isExtraItem || false,
            defaultQtyPerPortion: it.defaultQtyPerPortion,
            breakdown: it.breakdown || null,
          }
        })
      : []

    const uniqueSuppliers = Array.from(
      new Set(freshItemsBatch1.map(i => i.supplierName).filter(Boolean))
    )
    const summarySupplierName =
      uniqueSuppliers.length === 1
        ? uniqueSuppliers[0]
        : uniqueSuppliers.length > 1
          ? `Nhiều NCC (${uniqueSuppliers.length} đối tác)`
          : "Nhiều NCC liên kết"

    const deliveryBatch1 = {
      id: `deliv-${Date.now()}-01`,
      deliveryNo: `PN-${orderNo.replace("PO-", "")}-D1`,
      orderNo,
      menuId: primaryMenuId,
      menuIds: isMulti ? menus.map(m => m.id) : [primaryMenuId],
      menuName: primaryMenuName,
      menusSummary,
      targetScope: effectiveTargetScope,
      deliveryDate: orderDate || (isMulti ? menus[0]?.mealDate : "2026-11-16"),
      deliveryTime: "05:30",
      batchType: "BATCH_1",
      batchLabel: `Đợt 1 (50% Suất tối đa - ${effectiveTargetScope})`,
      maxPortions,
      plannedPortions: batch1Portions,
      supplierId: freshItemsBatch1[0]?.supplierId || "sup-bavi-01",
      supplierName: summarySupplierName,
      suppliers: uniqueSuppliers,
      driverName: "Chờ NCC gán xe & tài xế",
      deliveryQr: `QR-LOT-${orderNo.replace("PO-", "")}-01`,
      refrigerationTemp: "Chưa đo (Chờ xe tới)",
      status: "CREATED",
      statusLabel: "Chờ NCC xác nhận",
      note: note || "",
      approvals: {
        ingredientManagement: { approved: null, name: "Ban QL NL" },
        healthOfficer: { approved: null, name: "Y tế" },
        parentsCommittee: { approved: null, name: "Ban PH" },
        kitchenStaff: { approved: null, name: "Bên Bếp" },
      },
      items: freshItemsBatch1,
    }

    localDeliveries = [deliveryBatch1, ...localDeliveries]
    saveStoredDelivery(deliveryBatch1)
    return {
      success: true,
      orderNo,
      delivery: deliveryBatch1,
      attachedDryCount: 0,
    }
  },

  /**
   * 2. TẠO ĐƠN GIAO HÀNG ĐỢT 2 (Giao lúc 07:45 sáng)
   * - Bê nguyên nguyên liệu tươi sống của Đợt 1 sang
   * - TỰ ĐỘNG ĐỒNG BỘ ĐỊNH LƯỢNG ĐÃ THAY ĐỔI Ở ĐỢT 1
   * - Hỗ trợ tính số suất giao bù theo từng khối/thực đơn khi có nhiều thực đơn
   */
  async createBatch2Order({ batch1DeliveryId, actualAttendance, actualAttendanceByGrade, note, items }) {
    let batch1Delivery =
      localDeliveries.find(d => d.id === batch1DeliveryId) ||
      getStoredDeliveries().find(d => d.id === batch1DeliveryId)

    if (!batch1Delivery) {
      throw new Error("Không tìm thấy thông tin đơn hàng Đợt 1 tương ứng.")
    }

    const menusSummary = batch1Delivery.menusSummary || []
    const isMultiMenu = Array.isArray(menusSummary) && menusSummary.length > 1
    const maxPortions = batch1Delivery.maxPortions || 850
    const batch1Portions = batch1Delivery.plannedPortions || Math.floor(maxPortions / 2)
    const actualCount = Number(actualAttendance) || maxPortions

    let remainingPortions = 0
    let gradeRemainingMap = {}

    if (isMultiMenu) {
      menusSummary.forEach(ms => {
        let blockActual = actualAttendanceByGrade?.[ms.id]
        if (typeof blockActual !== "number" || isNaN(blockActual)) {
          const ratio = (ms.maxPortions || 400) / maxPortions
          blockActual = Math.round(actualCount * ratio)
        }
        const b1P = ms.batch1Portions || Math.floor((ms.maxPortions || 400) / 2)
        const rem = Math.max(0, blockActual - b1P)
        gradeRemainingMap[ms.id] = {
          maxPortions: ms.maxPortions,
          batch1Portions: b1P,
          actualAttendance: blockActual,
          remainingPortions: rem,
          targetScope: ms.targetScope,
        }
        remainingPortions += rem
      })
    } else {
      remainingPortions = Math.max(0, actualCount - batch1Portions)
    }

    // Bê nguyên thực phẩm tươi sống từ Đợt 1 sang (ưu tiên items truyền vào, hoặc đọc từ batch1Delivery.items)
    const freshItemsBatch2 = Array.isArray(items) && items.length > 0
      ? items.map(it => {
          const stdQty = it.standardQty ?? (it.isExtraItem ? 0 : calcQty(it.qtyPerPortion || 0.05, remainingPortions, it.unit))
          const extra = Number(it.extraQty) || 0
          const isDiscrete = isDiscreteUnit(it.unit)
          const totalQty = it.orderedQty ?? (isDiscrete ? Math.ceil(stdQty + extra) : Number((stdQty + extra).toFixed(2)))

          return {
            ingredientId: it.ingredientId || it.id,
            ingredientName: it.ingredientName || it.name,
            handlingType: it.handlingType || "DIRECT_USE",
            unit: it.unit,
            qtyPerPortion: it.qtyPerPortion || 0,
            standardQty: stdQty,
            extraQty: extra,
            orderedQty: totalQty,
            deliveredQty: 0,
            status: "WAITING",
            supplierId: it.supplierId || "",
            supplierName: it.supplierName || "Nhà cung cấp đối tác",
            isCustomized: it.isCustomized || false,
            isExtraItem: it.isExtraItem || false,
            defaultQtyPerPortion: it.defaultQtyPerPortion,
            breakdown: it.breakdown || null,
          }
        })
      : (batch1Delivery.items || []).map(b1Item => {
          const isDiscrete = isDiscreteUnit(b1Item.unit)
          let stdQty = 0
          let newBreakdown = null

          if (Array.isArray(b1Item.breakdown) && b1Item.breakdown.length > 0) {
            newBreakdown = b1Item.breakdown.map(bd => {
              const rem = gradeRemainingMap[bd.menuId]?.remainingPortions ?? Math.max(0, bd.portions || 0)
              const cQty = Number(((bd.qtyPerPortion || 0) * rem).toFixed(2))
              return {
                ...bd,
                portions: rem,
                calculatedQty: cQty,
              }
            })
            const rawSum = newBreakdown.reduce((acc, b) => acc + b.calculatedQty, 0)
            stdQty = isDiscrete ? Math.ceil(rawSum) : Number(rawSum.toFixed(2))
          } else {
            stdQty = calcQty(b1Item.qtyPerPortion || 0.05, remainingPortions, b1Item.unit)
          }

          return {
            ...b1Item,
            standardQty: stdQty,
            extraQty: 0,
            orderedQty: stdQty,
            deliveredQty: 0,
            status: "WAITING",
            breakdown: newBreakdown,
          }
        })

    const uniqueSuppliers = Array.from(
      new Set(freshItemsBatch2.map(i => i.supplierName).filter(Boolean))
    )
    const summarySupplierName =
      uniqueSuppliers.length === 1
        ? uniqueSuppliers[0]
        : uniqueSuppliers.length > 1
          ? `Nhiều NCC (${uniqueSuppliers.length} đối tác)`
          : "Nhiều NCC liên kết"

    const deliveryBatch2 = {
      id: `deliv-${Date.now()}-02`,
      deliveryNo: `PN-${batch1Delivery.orderNo.replace("PO-", "")}-D2`,
      orderNo: batch1Delivery.orderNo,
      menuId: batch1Delivery.menuId,
      menuIds: batch1Delivery.menuIds || [batch1Delivery.menuId],
      menuName: batch1Delivery.menuName,
      menusSummary: batch1Delivery.menusSummary,
      targetScope: batch1Delivery.targetScope || "Toàn trường",
      actualAttendanceByGrade: Object.keys(gradeRemainingMap).length > 0 ? gradeRemainingMap : null,
      deliveryDate: batch1Delivery.deliveryDate,
      deliveryTime: "07:45",
      batchType: "BATCH_2",
      batchLabel: `Đợt 2 (Chốt sĩ số: ${actualCount} HS - ${batch1Delivery.targetScope || "Toàn trường"})`,
      maxPortions,
      batch1Portions,
      actualAttendance: actualCount,
      plannedPortions: remainingPortions,
      supplierId: batch1Delivery.supplierId,
      supplierName: summarySupplierName,
      suppliers: uniqueSuppliers,
      driverName: batch1Delivery.driverName || "--",
      deliveryQr: `QR-LOT-${batch1Delivery.orderNo.replace("PO-", "")}-02`,
      refrigerationTemp: "Chưa đo (Chờ xe tới)",
      status: "CREATED",
      statusLabel: "Chờ NCC xác nhận",
      note: note || "",
      approvals: {
        ingredientManagement: { approved: null, name: "Ban QL NL" },
        healthOfficer: { approved: null, name: "Y tế" },
        parentsCommittee: { approved: null, name: "Ban PH" },
        kitchenStaff: { approved: null, name: "Bên Bếp" },
      },
      items: freshItemsBatch2,
    }

    localDeliveries = [deliveryBatch2, ...localDeliveries]
    saveStoredDelivery(deliveryBatch2)
    return {
      success: true,
      delivery: deliveryBatch2,
      orderNo: batch1Delivery.orderNo,
      remainingPortions,
      actualAttendance: actualCount,
    }
  },

  /**
   * Cập nhật sĩ số thực tế do GVCN báo sáng cho Đợt 2 (khi phiếu đã tạo)
   * Tự động tính lại theo đúng định lượng đã lưu từ Đợt 1 (hỗ trợ cả đa thực đơn)
   */
  async updateBatch2Attendance(deliveryId, actualCount, actualAttendanceByGrade) {
    const idx = localDeliveries.findIndex(d => d.id === deliveryId)
    if (idx !== -1) {
      const item = localDeliveries[idx]
      const batch1Portions = item.batch1Portions || 425
      const menusSummary = item.menusSummary || []
      const isMultiMenu = Array.isArray(menusSummary) && menusSummary.length > 1
      const maxPortions = item.maxPortions || 850
      const totalActual = Number(actualCount) || maxPortions

      let actualRemaining = 0
      let gradeRemainingMap = {}

      if (isMultiMenu) {
        menusSummary.forEach(ms => {
          let blockActual = actualAttendanceByGrade?.[ms.id]
          if (typeof blockActual !== "number" || isNaN(blockActual)) {
            const ratio = (ms.maxPortions || 400) / maxPortions
            blockActual = Math.round(totalActual * ratio)
          }
          const b1P = ms.batch1Portions || Math.floor((ms.maxPortions || 400) / 2)
          const rem = Math.max(0, blockActual - b1P)
          gradeRemainingMap[ms.id] = {
            maxPortions: ms.maxPortions,
            batch1Portions: b1P,
            actualAttendance: blockActual,
            remainingPortions: rem,
            targetScope: ms.targetScope,
          }
          actualRemaining += rem
        })
      } else {
        actualRemaining = Math.max(0, totalActual - batch1Portions)
      }

      // Tìm Đợt 1 tương ứng để đảm bảo kế thừa định lượng tùy chỉnh
      const batch1Delivery = localDeliveries.find(
        d => d.orderNo === item.orderNo && d.batchType === "BATCH_1"
      )

      const sourceItems = item.items && item.items.length > 0
        ? item.items
        : (batch1Delivery?.items || [])

      const updatedItems = sourceItems.map(it => {
        if (it.isExtraItem) {
          // Món thêm ngoài giữ nguyên số lượng đã đặt
          return it
        }

        const isDiscrete = isDiscreteUnit(it.unit)
        let stdQty = 0
        let newBreakdown = null

        if (Array.isArray(it.breakdown) && it.breakdown.length > 0) {
          newBreakdown = it.breakdown.map(bd => {
            const rem = gradeRemainingMap[bd.menuId]?.remainingPortions ?? Math.max(0, bd.portions || 0)
            const cQty = Number(((bd.qtyPerPortion || 0) * rem).toFixed(2))
            return {
              ...bd,
              portions: rem,
              calculatedQty: cQty,
            }
          })
          const rawSum = newBreakdown.reduce((acc, b) => acc + b.calculatedQty, 0)
          stdQty = isDiscrete ? Math.ceil(rawSum) : Number(rawSum.toFixed(2))
        } else {
          const b1Item = batch1Delivery?.items?.find(
            b => (b.ingredientId && (b.ingredientId === it.ingredientId || b.ingredientId === it.id)) ||
                 b.ingredientName === (it.ingredientName || it.name)
          )
          const portionRate = it.qtyPerPortion ?? b1Item?.qtyPerPortion ?? it.defaultQtyPerPortion ?? 0.05
          stdQty = calcQty(portionRate, actualRemaining, it.unit)
        }

        const extra = Number(it.extraQty) || 0
        const totalQty = isDiscrete ? Math.ceil(stdQty + extra) : Number((stdQty + extra).toFixed(2))

        return {
          ...it,
          ingredientName: it.ingredientName || it.name,
          handlingType: it.handlingType || "DIRECT_USE",
          unit: it.unit,
          standardQty: stdQty,
          extraQty: extra,
          orderedQty: totalQty,
          deliveredQty: 0,
          status: "WAITING",
          breakdown: newBreakdown || it.breakdown,
        }
      })

      localDeliveries[idx] = {
        ...item,
        actualAttendance: totalActual,
        actualAttendanceByGrade: Object.keys(gradeRemainingMap).length > 0 ? gradeRemainingMap : item.actualAttendanceByGrade,
        plannedPortions: actualRemaining,
        status: "CONFIRMED",
        statusLabel: `Đã chốt sĩ số (${totalActual} HS) - NCC đang chuẩn bị`,
        items: updatedItems,
      }
      return { success: true, delivery: localDeliveries[idx] }
    }
    return { success: false }
  },

  // Alias tương thích
  async createSupplyOrder(data) {
    return this.createBatch1Order(data)
  },
}

export default IngredientOrderService
