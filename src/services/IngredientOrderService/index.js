import http from "../01_axios"
import { apiIngredients, apiSuppliers, apiDeliveries, apiSupplyOrders } from "./urls"
import { adaptCatalogItem } from "./adapter"
import { USE_MOCK_API } from "src/lib/config"
import {
  MOCK_MASTER_INGREDIENT_CATALOG,
  MOCK_SUPPLIERS,
  MOCK_APPROVED_MENUS,
  MOCK_DELIVERIES,
} from "src/pages/SCHOOL/IngredientOrders/mockData"

// Bộ nhớ đệm tạm thời cho các phiếu giao nhận đã tạo / cập nhật trong phiên làm việc
let localDeliveries = [...MOCK_DELIVERIES]

const IngredientOrderService = {
  /**
   * Lấy Danh mục nguyên liệu chuẩn (Master Ingredient Catalog)
   * Khi USE_MOCK_API = true (cấu hình trong .env): Trả về mock data 0ms
   * Khi USE_MOCK_API = false: Gọi API backend thật
   */
  async getMasterIngredientCatalog() {
    if (USE_MOCK_API) {
      return {
        items: MOCK_MASTER_INGREDIENT_CATALOG.map(adaptCatalogItem),
        total: MOCK_MASTER_INGREDIENT_CATALOG.length,
        isMock: true,
      }
    }

    try {
      const response = await http.get(apiIngredients, {
        params: { page: 1, limit: 100 },
        notifyOnError: false,
        skipAuthRedirect: true,
      })
      const data = response?.data || response
      const apiItems = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []

      if (apiItems.length > 0) {
        const adaptedApi = apiItems.map(adaptCatalogItem)
        const hasDryStock = adaptedApi.some(it => it.handlingType === "DRY_STOCK")

        if (!hasDryStock) {
          const dryItems = MOCK_MASTER_INGREDIENT_CATALOG.filter(it => it.handlingType === "DRY_STOCK").map(adaptCatalogItem)
          return {
            items: [...adaptedApi, ...dryItems],
            total: adaptedApi.length + dryItems.length,
            isMock: false,
          }
        }
        return { items: adaptedApi, total: adaptedApi.length, isMock: false }
      }
    } catch (err) {
      // Backend chưa có data -> Fallback sang mock chuẩn
    }

    return {
      items: MOCK_MASTER_INGREDIENT_CATALOG.map(adaptCatalogItem),
      total: MOCK_MASTER_INGREDIENT_CATALOG.length,
      isMock: true,
    }
  },

  /**
   * Lấy danh sách Nhà cung cấp liên kết
   */
  async getSuppliers() {
    if (USE_MOCK_API) {
      return { items: MOCK_SUPPLIERS, total: MOCK_SUPPLIERS.length, isMock: true }
    }

    try {
      const response = await http.get(apiSuppliers, {
        params: { page: 1, limit: 100 },
        notifyOnError: false,
        skipAuthRedirect: true,
      })
      const data = response?.data || response
      if (Array.isArray(data?.items) && data.items.length > 0) return { items: data.items, isMock: false }
      if (Array.isArray(data) && data.length > 0) return { items: data, isMock: false }
    } catch (err) {
      // Fallback
    }
    return { items: MOCK_SUPPLIERS, isMock: true }
  },

  /**
   * Lấy danh sách Thực đơn đã phê duyệt (APPROVED) từ module Thực đơn
   */
  async getApprovedMenus() {
    if (USE_MOCK_API) {
      return { items: MOCK_APPROVED_MENUS, total: MOCK_APPROVED_MENUS.length, isMock: true }
    }

    try {
      const response = await http.get("/menus", {
        params: { status: "APPROVED", page: 1, limit: 50 },
        notifyOnError: false,
        skipAuthRedirect: true,
      })
      const data = response?.data || response
      if (Array.isArray(data?.items) && data.items.length > 0) {
        return { items: data.items, isMock: false }
      }
    } catch (err) {
      // Fallback
    }
    return { items: MOCK_APPROVED_MENUS, isMock: true }
  },

  /**
   * Lấy danh sách Phiếu giao nhận & Nhập hàng (Deliveries)
   */
  async getDeliveries(params = {}) {
    if (USE_MOCK_API) {
      let items = [...localDeliveries]
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
            d.deliveryNo.toLowerCase().includes(kw) ||
            d.orderNo.toLowerCase().includes(kw) ||
            d.supplierName.toLowerCase().includes(kw) ||
            d.menuName.toLowerCase().includes(kw)
        )
      }
      return { items, total: items.length, isMock: true }
    }

    try {
      const response = await http.get(apiDeliveries, {
        params: { page: 1, limit: 100 },
        notifyOnError: false,
        skipAuthRedirect: true,
      })
      const data = response?.data || response
      if (Array.isArray(data?.items) && data.items.length > 0) {
        return { items: data.items, isMock: false }
      }
    } catch (err) {
      // Fallback
    }

    let items = [...localDeliveries]
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
          d.deliveryNo.toLowerCase().includes(kw) ||
          d.orderNo.toLowerCase().includes(kw) ||
          d.supplierName.toLowerCase().includes(kw) ||
          d.menuName.toLowerCase().includes(kw)
      )
    }
    return { items, isMock: true }
  },

  /**
   * 1. TẠO ĐƠN MUA HÀNG ĐỢT 1 (Giao sớm 05:30 sáng)
   * - Chỉ tạo Đợt 1 (50% Suất tối đa)
   * - Đồ khô: Chỉ có ở Đợt 1, kèm danh sách các món được tick giao cùng (nếu có)
   * - KHÔNG tạo Đợt 2 ngay
   */
  async createBatch1Order({ menuId, note, orderDate }) {
    const targetMenu = MOCK_APPROVED_MENUS.find(m => m.id === menuId) || MOCK_APPROVED_MENUS[0]
    const orderNo = `PO-${orderDate ? orderDate.replace(/-/g, "") : "20261027"}-${Math.floor(10 + Math.random() * 90)}`
    const maxPortions = targetMenu.maxPortions || 850
    const batch1Portions = Math.floor(maxPortions * 0.7) // 70% định lượng sáng

    // 1. Tươi sống Đợt 1 (100% thực phẩm tươi sống, giao sáng sớm kiểm tra cảm quan)
    const freshItemsBatch1 = targetMenu.ingredients
      .filter(it => it.handlingType === "DIRECT_USE")
      .map(it => ({
        ingredientName: it.name,
        handlingType: it.handlingType,
        unit: it.unit,
        orderedQty: Number((batch1Portions * it.qtyPerPortion).toFixed(2)),
        deliveredQty: 0,
        status: "WAITING",
      }))

    const deliveryBatch1 = {
      id: `deliv-${Date.now()}-01`,
      deliveryNo: `PN-${orderNo.replace("PO-", "")}-D1`,
      orderNo,
      menuId: targetMenu.id,
      menuName: targetMenu.name,
      deliveryDate: orderDate || targetMenu.mealDate,
      deliveryTime: "05:30",
      batchType: "BATCH_1",
      batchLabel: "Đợt 1 (70% Thực phẩm tươi sống sáng)",
      maxPortions,
      plannedPortions: batch1Portions,
      supplierId: targetMenu.ingredients[0]?.supplierId || "sup-bavi-01",
      supplierName: targetMenu.ingredients[0]?.supplierName || "Liên minh NCC thực phẩm sạch",
      driverName: "Chờ NCC gán xe & tài xế",
      deliveryQr: `QR-LOT-${orderNo.replace("PO-", "")}-01`,
      refrigerationTemp: "Chưa đo (Chờ xe tới)",
      status: "CONFIRMED",
      statusLabel: "NCC đang chuẩn bị hàng",
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
   * - KHÔNG có đồ khô
   * - Chỉ tạo được khi GVCN đã cập nhật sĩ số
   * - Số suất giao bù = actualAttendance - batch1Portions
   */
  async createBatch2Order({ batch1DeliveryId, actualAttendance, note }) {
    const batch1Delivery = localDeliveries.find(d => d.id === batch1DeliveryId)
    if (!batch1Delivery) {
      throw new Error("Không tìm thấy thông tin đơn hàng Đợt 1 tương ứng.")
    }

    const targetMenu = MOCK_APPROVED_MENUS.find(m => m.id === batch1Delivery.menuId) || MOCK_APPROVED_MENUS[0]
    const maxPortions = batch1Delivery.maxPortions || 850
    const batch1Portions = batch1Delivery.plannedPortions || 425
    const actualCount = Number(actualAttendance) || maxPortions
    const remainingPortions = Math.max(0, actualCount - batch1Portions)

    // Bê nguyên thực phẩm tươi sống từ menu Đợt 1 sang, tính theo số suất giao bù
    const freshItemsBatch2 = targetMenu.ingredients
      .filter(it => it.handlingType === "DIRECT_USE")
      .map(it => ({
        ingredientName: it.name,
        handlingType: it.handlingType,
        unit: it.unit,
        orderedQty: Number((remainingPortions * it.qtyPerPortion).toFixed(2)),
        deliveredQty: 0,
        status: "WAITING",
      }))

    const deliveryBatch2 = {
      id: `deliv-${Date.now()}-02`,
      deliveryNo: `PN-${batch1Delivery.orderNo.replace("PO-", "")}-D2`,
      orderNo: batch1Delivery.orderNo,
      menuId: batch1Delivery.menuId,
      menuName: batch1Delivery.menuName,
      deliveryDate: batch1Delivery.deliveryDate,
      deliveryTime: "07:45",
      batchType: "BATCH_2",
      batchLabel: `Đợt 2 (Chốt sĩ số: ${actualCount} HS)`,
      maxPortions,
      batch1Portions,
      actualAttendance: actualCount,
      plannedPortions: remainingPortions,
      supplierId: batch1Delivery.supplierId,
      supplierName: batch1Delivery.supplierName,
      driverName: batch1Delivery.driverName || "--",
      deliveryQr: `QR-LOT-${batch1Delivery.orderNo.replace("PO-", "")}-02`,
      refrigerationTemp: "Chưa đo (Chờ xe tới)",
      status: "CONFIRMED",
      statusLabel: `Đã chốt sĩ số (${actualCount} HS) - NCC đang chuẩn bị`,
      note: note || "",
      approvals: {
        ingredientManagement: { approved: null },
        healthOfficer: { approved: null },
        parentsCommittee: { approved: null },
        kitchenStaff: { approved: null },
      },
      items: freshItemsBatch2,
    }

    localDeliveries = [deliveryBatch2, ...localDeliveries]
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
   */
  async updateBatch2Attendance(deliveryId, actualCount) {
    const idx = localDeliveries.findIndex(d => d.id === deliveryId)
    if (idx !== -1) {
      const item = localDeliveries[idx]
      const batch1Portions = item.batch1Portions || 425
      const actualRemaining = Math.max(0, actualCount - batch1Portions)

      const targetMenu = MOCK_APPROVED_MENUS.find(m => m.id === item.menuId) || MOCK_APPROVED_MENUS[0]

      const updatedItems = targetMenu.ingredients
        .filter(it => it.handlingType === "DIRECT_USE")
        .map(it => ({
          ingredientName: it.name,
          handlingType: it.handlingType,
          unit: it.unit,
          orderedQty: Number((actualRemaining * it.qtyPerPortion).toFixed(2)),
          deliveredQty: 0,
          status: "WAITING",
        }))

      localDeliveries[idx] = {
        ...item,
        actualAttendance: actualCount,
        plannedPortions: actualRemaining,
        status: "CONFIRMED",
        statusLabel: `Đã chốt sĩ số (${actualCount} HS) - NCC đang chuẩn bị`,
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
