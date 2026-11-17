import http from "../01_axios"
import { apiMenus } from "../MenuService/urls"
import { getDeliveryInspections } from "../DeliveryInspectionService"
import { getSchoolClassAllergies } from "../AllergyService"
import ROUTER from "src/router/ROUTER"

const formatDateVN = (dateInput) => {
  if (!dateInput) return "—"
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return String(dateInput)
  const pad = (n) => String(n).padStart(2, "0")
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

const formatDateTimeVN = (dateInput) => {
  if (!dateInput) return "—"
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return String(dateInput)
  const pad = (n) => String(n).padStart(2, "0")
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} (${pad(d.getHours())}:${pad(d.getMinutes())})`
}

export async function getNutritionOverviewData({ signal } = {}) {
  const [menusResult, deliveriesResult, allergiesResult] = await Promise.allSettled([
    http.get(apiMenus, { params: { limit: 100 }, signal, notifyOnError: false }),
    getDeliveryInspections({ limit: 50 }, signal),
    getSchoolClassAllergies({ signal }),
  ])

  // 1. Thực đơn cần xử lý
  let rawMenus = []
  if (menusResult.status === "fulfilled") {
    const res = menusResult.value
    rawMenus = res?.data?.items || res?.items || res?.data || []
    if (!Array.isArray(rawMenus)) rawMenus = []
  }

  const revisionMenus = rawMenus.filter((m) => m.status === "REVISION_REQUIRED")
  const draftMenus = rawMenus.filter((m) => m.status === "DRAFT")
  const menusTodoCount = revisionMenus.length + draftMenus.length

  // 2. Giao hàng nguyên liệu chờ kiểm tra
  let deliveries = []
  let deliveriesPendingCount = 0
  if (deliveriesResult.status === "fulfilled") {
    const res = deliveriesResult.value
    deliveries = Array.isArray(res?.items) ? res.items : []
    const pendingItems = deliveries.filter(
      (d) => d.canInspect || d.status === "PENDING_APPROVAL" || d.status === "ARRIVED"
    )
    if (typeof res?.stats?.pending === "number") {
      deliveriesPendingCount = res.stats.pending + (res.stats.arrived || 0)
    } else {
      deliveriesPendingCount = pendingItems.length
    }
  }

  // 3. Cảnh báo dị ứng theo lớp
  let allergyClasses = []
  if (allergiesResult.status === "fulfilled") {
    allergyClasses = Array.isArray(allergiesResult.value) ? allergiesResult.value : []
  }

  // 4. Tổng hợp danh sách công việc cần xử lý
  const tasks = []

  // Ưu tiên 1: Thực đơn BGH yêu cầu sửa (Nguy cấp / Đỏ)
  revisionMenus.forEach((menu) => {
    tasks.push({
      id: `menu-${menu.id}`,
      type: "MENU",
      title: menu.title ? `Thực đơn ${menu.title}` : `Thực đơn tuần bắt đầu ${formatDateVN(menu.weekStartDate)}`,
      subtitle: menu.reviewNote
        ? `BGH yêu cầu điều chỉnh: "${menu.reviewNote}"`
        : "BGH yêu cầu điều chỉnh — Cần cập nhật món & định lượng",
      date: formatDateVN(menu.updatedAt || menu.weekStartDate),
      status: "BGH yêu cầu sửa",
      statusType: "danger",
      priority: 1,
      route: ROUTER.SCHOOL_MENU_PLANNING,
      originalData: menu,
    })
  })

  // Ưu tiên 2: Đợt giao hàng chờ kiểm tra 4 bên (Cảnh báo / Vàng)
  const pendingDeliveries = deliveries.filter(
    (d) => d.canInspect || d.status === "PENDING_APPROVAL" || d.status === "ARRIVED"
  )
  pendingDeliveries.forEach((delivery) => {
    tasks.push({
      id: `delivery-${delivery.id}`,
      type: "DELIVERY",
      title: `Đợt giao ${delivery.supplierName || "NCC"} (${delivery.deliveryNo})`,
      subtitle: delivery.note || (delivery.itemsCount ? `${delivery.itemsCount} mặt hàng nguyên liệu nhập trường` : "Nguyên liệu nhập ca sáng cần đánh giá chất lượng 4 bên"),
      date: formatDateTimeVN(delivery.arrivedAt || delivery.expectedArrivalAt || delivery.createdAt),
      status: delivery.status === "ARRIVED" ? "Đã đến trường" : "Chờ đánh giá tiếp nhận",
      statusType: "warning",
      priority: 2,
      route: ROUTER.SCHOOL_INGREDIENT_INSPECT,
      originalData: delivery,
    })
  })

  // Ưu tiên 3: Thực đơn bản nháp đang soạn lập (Thông tin / Xanh)
  draftMenus.forEach((menu) => {
    tasks.push({
      id: `menu-${menu.id}`,
      type: "MENU",
      title: menu.title ? `Thực đơn ${menu.title}` : `Thực đơn tuần bắt đầu ${formatDateVN(menu.weekStartDate)}`,
      subtitle: "",
      date: formatDateVN(menu.updatedAt || menu.createdAt || menu.weekStartDate),
      status: "Bản nháp",
      statusType: "info",
      priority: 3,
      route: ROUTER.SCHOOL_MENU_PLANNING,
      originalData: menu,
    })
  })

  tasks.sort((a, b) => a.priority - b.priority)

  const errors = []
  if (menusResult.status === "rejected") errors.push(`Thực đơn: ${menusResult.reason?.message || "Lỗi tải"}`)
  if (deliveriesResult.status === "rejected") errors.push(`Giao hàng: ${deliveriesResult.reason?.message || "Lỗi tải"}`)
  if (allergiesResult.status === "rejected") errors.push(`Dị ứng: ${allergiesResult.reason?.message || "Lỗi tải"}`)

  return {
    kpis: {
      menusTodoCount,
      deliveriesPendingCount,
      allergyClassCount: allergyClasses.length,
    },
    tasks,
    allergyClasses,
    errors: errors.length > 0 ? errors.join("; ") : null,
  }
}
