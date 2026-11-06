import http from "../01_axios"
import { apiIngredients, apiSuppliers, apiDeliveries, apiSupplyOrders } from "./urls"
import { adaptCatalogItem } from "./adapter"
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
   * Đảm bảo luôn có đầy đủ cả Kho khô (DRY_STOCK) và Tươi sống (DIRECT_USE)
   */
  async getMasterIngredientCatalog() {
    try {
      const response = await http.get(apiIngredients, {
        params: { page: 1, limit: 100 },
        notifyOnError: false,
      })
      const data = response?.data || response
      const apiItems = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []

      if (apiItems.length > 0) {
        const adaptedApi = apiItems.map(adaptCatalogItem)
        const hasDryStock = adaptedApi.some(it => it.handlingType === "DRY_STOCK")

        if (!hasDryStock) {
          // Nếu backend DB chỉ có đồ tươi sống, tự động bổ sung danh mục Đồ khô chuẩn
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
      // Backend chưa có data -> Tự động dùng mock chuẩn
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
    try {
      const response = await http.get(apiSuppliers, {
        params: { page: 1, limit: 100 },
        notifyOnError: false,
      })
      const data = response?.data || response
      if (Array.isArray(data?.items) && data.items.length > 0) return { items: data.items, isMock: false }
      if (Array.isArray(data) && data.length > 0) return { items: data, isMock: false }
    } catch (err) {
      // Fallback sang mock suppliers
    }
    return { items: MOCK_SUPPLIERS, isMock: true }
  },

  /**
   * Lấy danh sách Thực đơn đã phê duyệt (APPROVED) từ module Thực đơn
   */
  async getApprovedMenus() {
    try {
      const response = await http.get("/menus", {
        params: { status: "APPROVED", page: 1, limit: 50 },
        notifyOnError: false,
      })
      const data = response?.data || response
      if (Array.isArray(data?.items) && data.items.length > 0) {
        return { items: data.items, isMock: false }
      }
    } catch (err) {
      // Fallback sang mock danh sách thực đơn đã duyệt
    }
    return { items: MOCK_APPROVED_MENUS, isMock: true }
  },

  /**
   * Lấy danh sách Phiếu giao nhận & Nhập hàng (Deliveries)
   * Phân rõ 2 đợt giao và trạng thái duyệt 4 bên
   */
  async getDeliveries(params = {}) {
    try {
      const response = await http.get(apiDeliveries, {
        params: { page: 1, limit: 100 },
        notifyOnError: false,
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
   * Tạo Đơn mua hàng từ Thực đơn đã duyệt
   * Tự động sinh ra 2 đợt giao hàng:
   * - Đợt 1: 50% Sĩ số tối đa
   * - Đợt 2: Sĩ số dự kiến (chờ GVCN chốt sáng)
   */
  async createSupplyOrder({ menuId, note, orderDate }) {
    const targetMenu = MOCK_APPROVED_MENUS.find(m => m.id === menuId) || MOCK_APPROVED_MENUS[0]
    const orderNo = `PO-${orderDate ? orderDate.replace(/-/g, "") : "20261027"}-${Math.floor(10 + Math.random() * 90)}`
    const maxPortions = targetMenu.maxPortions || 850
    const batch1Portions = Math.floor(maxPortions / 2) // 50%

    // Tạo phiếu nhập Đợt 1
    const deliveryBatch1 = {
      id: `deliv-${Date.now()}-01`,
      deliveryNo: `PN-${orderNo.replace("PO-", "")}-D1`,
      orderNo,
      menuId: targetMenu.id,
      menuName: targetMenu.name,
      deliveryDate: orderDate || targetMenu.mealDate,
      deliveryTime: "05:30",
      batchType: "BATCH_1",
      batchLabel: "Đợt 1 (50% Suất tối đa)",
      maxPortions,
      plannedPortions: batch1Portions,
      supplierId: targetMenu.ingredients[0]?.supplierId || "sup-bavi-01",
      supplierName: targetMenu.ingredients[0]?.supplierName || "Liên minh NCC thực phẩm sạch",
      driverName: "Chờ NCC gán xe & tài xế",
      deliveryQr: `QR-LOT-${orderNo.replace("PO-", "")}-01`,
      refrigerationTemp: "Chưa đo (Chờ xe tới)",
      status: "CONFIRMED",
      statusLabel: "NCC đang chuẩn bị hàng",
      approvals: {
        ingredientManagement: { approved: null, name: "Ban QL NL" },
        healthOfficer: { approved: null, name: "Y tế" },
        parentsCommittee: { approved: null, name: "Ban PH" },
        kitchenStaff: { approved: null, name: "Bên Bếp" },
      },
      items: targetMenu.ingredients
        .filter(it => it.handlingType === "DIRECT_USE")
        .map(it => ({
          ingredientName: it.name,
          handlingType: it.handlingType,
          unit: it.unit,
          orderedQty: Number((batch1Portions * it.qtyPerPortion).toFixed(2)),
          deliveredQty: 0,
          status: "WAITING",
        })),
    }

    // Tạo phiếu nhập Đợt 2 (Chờ GVCN báo sĩ số)
    const deliveryBatch2 = {
      id: `deliv-${Date.now()}-02`,
      deliveryNo: `PN-${orderNo.replace("PO-", "")}-D2`,
      orderNo,
      menuId: targetMenu.id,
      menuName: targetMenu.name,
      deliveryDate: orderDate || targetMenu.mealDate,
      deliveryTime: "07:45",
      batchType: "BATCH_2",
      batchLabel: "Đợt 2 (Chờ GVCN chốt sĩ số)",
      maxPortions,
      batch1Portions,
      actualAttendance: null,
      plannedPortions: maxPortions - batch1Portions,
      supplierId: targetMenu.ingredients[0]?.supplierId || "sup-bavi-01",
      supplierName: targetMenu.ingredients[0]?.supplierName || "Liên minh NCC thực phẩm sạch",
      driverName: "--",
      deliveryQr: "--",
      refrigerationTemp: "--",
      status: "WAITING_ATTENDANCE",
      statusLabel: "Chờ GVCN báo sĩ số sáng",
      approvals: {
        ingredientManagement: { approved: null },
        healthOfficer: { approved: null },
        parentsCommittee: { approved: null },
        kitchenStaff: { approved: null },
      },
      items: targetMenu.ingredients
        .filter(it => it.handlingType === "DIRECT_USE")
        .map(it => ({
          ingredientName: it.name,
          handlingType: it.handlingType,
          unit: it.unit,
          orderedQty: Number(((maxPortions - batch1Portions) * it.qtyPerPortion).toFixed(2)),
          deliveredQty: 0,
          status: "WAITING",
        })),
    }

    localDeliveries = [deliveryBatch1, deliveryBatch2, ...localDeliveries]
    return { success: true, orderNo, deliveries: [deliveryBatch1, deliveryBatch2] }
  },

  /**
   * Cập nhật sĩ số thực tế do GVCN báo sáng cho Đợt 2
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
}

export default IngredientOrderService
