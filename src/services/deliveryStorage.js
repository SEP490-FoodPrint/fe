/**
 * Delivery Storage Service
 * Lưu trữ và đồng bộ các phiếu giao nhận được tạo trên hệ thống vào localStorage theo từng TRƯỜNG HỌC
 * Đảm bảo dữ liệu phân tách tuyệt đối giữa các trường (Trường Cầu Giấy, Trường FoodPrint...),
 * không bị rò rỉ đơn hàng của trường này sang trường khác.
 */

import STORAGE, { getStorage } from "src/lib/storage"

const STORAGE_KEY = "foodprint_created_deliveries"

/**
 * Lấy thông tin trường học hiện tại của người dùng đang đăng nhập
 */
export function getActiveSchool() {
  try {
    const user = getStorage(STORAGE.USER_INFO)
    if (!user) return { id: null, name: null }
    const id = user.schoolId || user.school_id || user.orgId || null
    const name = user.schoolName || user.orgName || null
    return { id, name }
  } catch {
    return { id: null, name: null }
  }
}

/**
 * Lấy toàn bộ danh sách thô từ localStorage (kèm tự động migrate đơn cũ sang Trường Cầu Giấy)
 */
function getAllRawDeliveries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    // Migrate các đơn cũ tạo trước đây mà chưa có schoolId/schoolName sang Trường Cầu Giấy
    // đồng thời phục hồi đúng NCC cho từng mặt hàng (ví dụ: Gạo tẻ của NCC kiểm thử)
    let hasMigration = false
    const migrated = parsed.map(item => {
      let updatedItem = item
      if (!item.schoolId && !item.schoolName) {
        hasMigration = true
        updatedItem = {
          ...updatedItem,
          schoolId: "10000000-0000-4000-8000-000000000001",
          schoolName: "Trường Tiểu học Cầu Giấy",
        }
      }

      // Phục hồi supplierName cho từng item nếu đơn chưa có
      if (Array.isArray(updatedItem.items) && updatedItem.items.length > 0) {
        let itemsChanged = false
        const fixedItems = updatedItem.items.map(it => {
          if (!it.supplierName && updatedItem.supplierName) {
            itemsChanged = true
            return {
              ...it,
              supplierName: updatedItem.supplierName,
            }
          }
          return it
        })

        if (itemsChanged) {
          hasMigration = true
          const uniqueSups = Array.from(new Set(fixedItems.map(it => it.supplierName).filter(Boolean)))
          updatedItem = {
            ...updatedItem,
            items: fixedItems,
            suppliers: uniqueSups.length > 0 ? uniqueSups : updatedItem.suppliers,
          }
        }
      }
          }
        }
      }

      return updatedItem
    })

    if (hasMigration) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
    }

    return migrated
  } catch (err) {
    console.warn("Lỗi đọc created deliveries từ localStorage:", err)
    return []
  }
}

/**
 * Kiểm tra xem 1 phiếu giao nhận có thuộc về trường học hiện tại không
 */
function isDeliveryForCurrentSchool(item, activeSchool) {
  if (!activeSchool?.id && !activeSchool?.name) return false

  // 1. So khớp ID trường học
  if (item.schoolId && activeSchool.id) {
    if (item.schoolId === activeSchool.id) return true
    // Nếu cả 2 đều có ID nhưng khác nhau -> không thuộc trường này
    return false
  }

  // 2. So khớp theo tên trường (schoolName / orgName)
  const itemSchool = (item.schoolName || "").toLowerCase().trim()
  const activeName = (activeSchool.name || "").toLowerCase().trim()

  if (itemSchool && activeName) {
    const itemIsFoodPrint = itemSchool.includes("foodprint")
    const activeIsFoodPrint = activeName.includes("foodprint")
    const itemIsCauGiay = itemSchool.includes("cầu giấy") || itemSchool.includes("cau giay")
    const activeIsCauGiay = activeName.includes("cầu giấy") || activeName.includes("cau giay")

    if (itemIsFoodPrint !== activeIsFoodPrint || itemIsCauGiay !== activeIsCauGiay) {
      return false
    }

    return itemSchool.includes(activeName) || activeName.includes(itemSchool)
  }

  return false
}

/**
 * Lấy danh sách phiếu giao nhận ĐÃ ĐƯỢC LỌC THEO ĐÚNG TRƯỜNG ĐANG ĐĂNG NHẬP
 */
export function getStoredDeliveries(targetSchool = null) {
  try {
    const all = getAllRawDeliveries()
    const activeSchool = targetSchool || getActiveSchool()

    return all
      .filter(item => isDeliveryForCurrentSchool(item, activeSchool))
      .map(item => {
        // Chuẩn hóa các đơn mới tạo ở FE về đúng trạng thái khởi tạo
        if (item.batchType === "DRY_STOCK" && item.status === "IN_TRANSIT") {
          return {
            ...item,
            status: "CREATED",
            statusLabel: "Chờ NCC xác nhận",
          }
        }
        return item
      })
  } catch (err) {
    console.warn("Lỗi lọc deliveries theo trường:", err)
    return []
  }
}

/**
 * Lưu phiếu giao nhận mới vào localStorage (tự động gắn schoolId & schoolName của trường hiện tại)
 */
export function saveStoredDelivery(delivery) {
  try {
    if (!delivery || (!delivery.id && !delivery.deliveryNo)) return []
    const activeSchool = getActiveSchool()

    const deliveryWithSchool = {
      ...delivery,
      schoolId:
        delivery.schoolId ||
        activeSchool.id ||
        "10000000-0000-4000-8000-000000000001",
      schoolName:
        delivery.schoolName ||
        activeSchool.name ||
        "Trường Tiểu học Cầu Giấy",
    }

    const current = getAllRawDeliveries()
    // Lọc bỏ record cũ có cùng id hoặc deliveryNo
    const filtered = current.filter(d => {
      if (delivery.id && d.id === delivery.id) return false
      if (delivery.deliveryNo && d.deliveryNo === delivery.deliveryNo) return false
      return true
    })
    const next = [deliveryWithSchool, ...filtered]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    return getStoredDeliveries()
  } catch (err) {
    console.warn("Lỗi lưu delivery vào localStorage:", err)
    return []
  }
}

/**
 * Xóa danh sách phiếu giao nhận lưu trữ
 */
export function clearStoredDeliveries() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.warn("Lỗi xóa created deliveries trong localStorage:", err)
  }
}
