import assert from "node:assert/strict"
import { after, before, beforeEach, test } from "node:test"
import { AxiosError } from "axios"
import { createServer } from "vite"

const ORDER_ID = "00000000-0000-4000-8000-000000000301"
const SCHOOL_ID = "00000000-0000-4000-8000-000000000302"
const SUPPLIER_ID = "00000000-0000-4000-8000-000000000303"

const LIST_ITEM = {
  id: ORDER_ID,
  requestNo: "YC-20261115-001",
  schoolId: SCHOOL_ID,
  supplierId: SUPPLIER_ID,
  schoolName: "Trường Tiểu học Lê Văn Tám",
  status: "SENT",
  requestedDeliveryDate: "2026-11-18",
  sentAt: "2026-11-15T01:30:00.000Z",
  acceptedAt: null,
  createdAt: "2026-11-15T01:00:00.000Z",
  updatedAt: "2026-11-15T01:30:00.000Z",
}

const DETAIL_ITEM = {
  ...LIST_ITEM,
  note: "Giao trước 6h30 sáng tại cổng bếp ăn.",
  acceptedByUserId: null,
  items: [
    {
      id: "00000000-0000-4000-8000-000000000401",
      ingredientEntryId: "00000000-0000-4000-8000-000000000501",
      ingredientName: "Cải xanh hữu cơ",
      requestedQuantity: "12.5",
      unit: "kg",
      note: "Chọn rau tươi non",
    },
  ],
}

const success = (data, statusCode = 200) => ({
  success: true,
  statusCode,
  data,
})

let server
let http
let SupplierOrderServiceModule
let SupplierOrderService
let MenuItemModule
let RolesModule
let UtilsModule

let requests = []
let respond = () =>
  success({
    items: [LIST_ITEM],
    pagination: { page: 1, limit: 20, hasNext: false },
  })

const savedWindow = globalThis.window

before(async () => {
  server = await createServer({
    cacheDir: "/tmp/foodprint-supplier-orders-tests-vite",
    server: { middlewareMode: true, hmr: false, ws: false },
    optimizeDeps: { noDiscovery: true, entries: [] },
    appType: "custom",
  })

  globalThis.window = {
    location: { replace: () => assert.fail("Unexpected navigation redirect") },
  }

  http = (await server.ssrLoadModule("/src/services/01_axios/index.js")).default
  SupplierOrderServiceModule = await server.ssrLoadModule(
    "/src/services/SupplierOrderService/index.js",
  )
  SupplierOrderService = SupplierOrderServiceModule.default
  MenuItemModule = await server.ssrLoadModule("/src/router/MenuItem.jsx")
  RolesModule = await server.ssrLoadModule("/src/constants/roles.js")
  UtilsModule = await server.ssrLoadModule("/src/lib/utils.jsx")

  http.defaults.adapter = async config => {
    requests.push(config)
    const payload = await respond(config)
    return {
      status: payload.statusCode || 200,
      statusText: "OK",
      headers: {},
      config,
      data: payload,
    }
  }
})

beforeEach(() => {
  requests = []
  respond = () =>
    success({
      items: [LIST_ITEM],
      pagination: { page: 1, limit: 20, hasNext: false },
    })
})

after(async () => {
  if (savedWindow === undefined) delete globalThis.window
  else globalThis.window = savedWindow
  await server?.close()
})

test("Supplier sidebar menu exposes Đơn hàng Cung ứng to both supplier admin and staff", () => {
  const { ROLES } = RolesModule
  const { hasPermission } = UtilsModule
  const supplierMenu = MenuItemModule.MenuItemSupplier()
  const orderItem = supplierMenu.find(item => item.key === "/supplier/supply-orders")

  assert.ok(orderItem, "Đơn hàng Cung ứng menu item must exist")
  assert.equal(hasPermission(orderItem.roles, ROLES.INGREDIENT_SUPPLIER_ADMIN), true)
  assert.equal(hasPermission(orderItem.roles, ROLES.INGREDIENT_SUPPLIER_STAFF), true)
})

test("list sends only allowed page, limit, and optional valid status query params", async () => {
  const allResult = await SupplierOrderService.list({
    page: 2,
    limit: 10,
    status: "ALL",
  })
  assert.equal(requests.length, 1)
  assert.equal(requests[0].method, "get")
  assert.equal(requests[0].url, "/supply-requests")
  assert.deepEqual(requests[0].params, { page: 2, limit: 10 })
  assert.equal(allResult.items[0].schoolName, "Trường Tiểu học Lê Văn Tám")

  await SupplierOrderService.list({ page: 1, limit: 20, status: "SENT" })
  assert.deepEqual(requests[1].params, { page: 1, limit: 20, status: "SENT" })
})

test("getById calls GET /supply-requests/:id without query params and adapts items", async () => {
  respond = () => success(DETAIL_ITEM)

  const detail = await SupplierOrderService.getById(ORDER_ID)

  assert.equal(requests.length, 1)
  assert.equal(requests[0].method, "get")
  assert.equal(requests[0].url, `/supply-requests/${ORDER_ID}`)
  assert.equal(requests[0].params, undefined)
  assert.equal(detail.note, "Giao trước 6h30 sáng tại cổng bếp ăn.")
  assert.equal(detail.items.length, 1)
  assert.equal(detail.items[0].ingredientName, "Cải xanh hữu cơ")
  assert.equal(detail.items[0].requestedQuantity, "12.5")
})

test("accept posts empty object to /supply-requests/:id/accept with X-CSRF-Protection", async () => {
  const acceptedAt = "2026-11-15T02:00:00.000Z"
  respond = () =>
    success({
      id: ORDER_ID,
      status: "ACCEPTED",
      acceptedByUserId: "sup-user-1",
      acceptedAt,
    })

  const result = await SupplierOrderService.accept(ORDER_ID)

  assert.equal(requests.length, 1)
  assert.equal(requests[0].method, "post")
  assert.equal(requests[0].url, `/supply-requests/${ORDER_ID}/accept`)
  assert.equal(requests[0].params, undefined)
  assert.equal(requests[0].headers.get("X-CSRF-Protection"), "1")
  assert.equal(result.status, "ACCEPTED")
  assert.equal(result.acceptedAt, acceptedAt)
})

test("formatters, stage metadata, and extractApiError handle dates, quantities, and 409 conflicts", () => {
  const {
    formatDateVi,
    formatQuantityVi,
    extractApiError,
    getOrderStatusMeta,
    SUPPLY_ORDER_STATUS,
  } = SupplierOrderServiceModule

  assert.equal(getOrderStatusMeta(SUPPLY_ORDER_STATUS.ACCEPTED).label, "Đã xác nhận")
  assert.equal(getOrderStatusMeta("PREPARING").label, "Đang chuẩn bị hàng")
  assert.equal(getOrderStatusMeta(SUPPLY_ORDER_STATUS.IN_PROGRESS).label, "Đang giao hàng")

  assert.equal(formatDateVi("2026-11-18"), "18/11/2026")
  assert.equal(formatDateVi(null), "Chưa ấn định")
  assert.equal(formatQuantityVi("12.5"), "12,5")

  const conflict = new AxiosError(
    "Conflict",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    {
      status: 409,
      data: { message: "Đơn hàng không ở trạng thái chờ nhận" },
    },
  )
  assert.deepEqual(extractApiError(conflict), {
    status: 409,
    message: "Đơn hàng không ở trạng thái chờ nhận",
  })
})
