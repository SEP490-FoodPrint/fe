import assert from "node:assert/strict"
import { after, before, beforeEach, test } from "node:test"
import { AxiosError } from "axios"
import { createServer } from "vite"

const STAFF_ID = "00000000-0000-4000-8000-000000000301"
const SUPPLIER_ID = "00000000-0000-4000-8000-000000000302"
const PERMISSION_ID = "00000000-0000-4000-8000-000000000303"

const LIST_ITEM = {
  id: STAFF_ID,
  username: "nhanvien_kho01",
  fullName: "Nguyễn Văn An",
  email: "an@nhacungcap.vn",
  phone: "0912345678",
  roleCode: "INGREDIENT_SUPPLIER_STAFF",
  roleName: "Nhân viên nhà cung cấp",
  status: "ACTIVE",
}

const DETAIL_ITEM = {
  ...LIST_ITEM,
  supplierId: SUPPLIER_ID,
  createdAt: "2026-11-10T08:00:00.000Z",
  updatedAt: "2026-11-12T09:30:00.000Z",
}

const PERMISSIONS_PAYLOAD = {
  userId: STAFF_ID,
  roleId: "00000000-0000-4000-8000-000000000399",
  permissions: [
    {
      id: PERMISSION_ID,
      code: "delivery.manage",
      name: "Quản lý đơn giao hàng",
      module: "delivery",
      action: "manage",
      description: "Tạo và cập nhật đơn giao hàng",
      isActive: true,
      enabled: true,
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
let SupplierStaffServiceModule
let SupplierStaffService
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
    cacheDir: "/tmp/foodprint-supplier-staff-tests-vite",
    server: { middlewareMode: true, hmr: false, ws: false },
    optimizeDeps: { noDiscovery: true, entries: [] },
    appType: "custom",
  })

  globalThis.window = {
    location: { replace: () => assert.fail("Unexpected navigation redirect") },
  }

  http = (await server.ssrLoadModule("/src/services/01_axios/index.js")).default
  SupplierStaffServiceModule = await server.ssrLoadModule(
    "/src/services/SupplierStaffService/index.js",
  )
  SupplierStaffService = SupplierStaffServiceModule.default
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

test("Sidebar menu exposes Quản lý nhân viên exclusively to Ingredient Supplier Admin", () => {
  const { ROLES } = RolesModule
  const { hasPermission } = UtilsModule
  const supplierMenu = MenuItemModule.MenuItemSupplier()

  const staffItem = supplierMenu.find(item => item.key === "/supplier/staff")
  assert.ok(staffItem, "Quản lý nhân viên menu item must exist")
  assert.equal(staffItem.label, "Quản lý nhân viên")
  assert.deepEqual(staffItem.roles, [ROLES.INGREDIENT_SUPPLIER_ADMIN])
  assert.equal(
    hasPermission(staffItem.roles, ROLES.INGREDIENT_SUPPLIER_ADMIN),
    true,
  )
  assert.equal(
    hasPermission(staffItem.roles, ROLES.INGREDIENT_SUPPLIER_STAFF),
    false,
  )
  assert.equal(
    hasPermission(staffItem.roles, ROLES.SCHOOL_ADMINISTRATION),
    false,
  )
})

test("list calls GET /supplier-staff with strict page and limit params only", async () => {
  respond = () =>
    success({
      items: [LIST_ITEM],
      pagination: { page: 2, limit: 10, hasNext: true },
    })

  const result = await SupplierStaffService.list({
    page: 2,
    limit: 10,
    search: "ignored",
    status: "ACTIVE",
  })

  assert.equal(requests.length, 1)
  assert.equal(requests[0].method, "get")
  assert.equal(requests[0].url, "/supplier-staff")
  assert.deepEqual(requests[0].params, { page: 2, limit: 10 })
  assert.equal(result.items.length, 1)
  assert.equal(result.items[0].username, "nhanvien_kho01")
  assert.equal(result.pagination.page, 2)
  assert.equal(result.pagination.hasNext, true)
})

test("getById calls GET /supplier-staff/:userId and adapts detail fields", async () => {
  respond = () => success(DETAIL_ITEM)

  const detail = await SupplierStaffService.getById(STAFF_ID)
  assert.equal(requests[0].method, "get")
  assert.equal(requests[0].url, `/supplier-staff/${STAFF_ID}`)
  assert.equal(detail.id, STAFF_ID)
  assert.equal(detail.supplierId, SUPPLIER_ID)
  assert.equal(detail.createdAt, DETAIL_ITEM.createdAt)
  assert.equal(detail.updatedAt, DETAIL_ITEM.updatedAt)
})

test("create sends strict payload allowlist, lowercases email, and converts empty phone to null", async () => {
  respond = () =>
    success(
      {
        ...DETAIL_ITEM,
        phone: null,
        email: "new.staff@nhacungcap.vn",
      },
      201,
    )

  const created = await SupplierStaffService.create({
    username: "  new_staff01  ",
    fullName: "  Trần Thị Bình  ",
    email: "  New.Staff@NhaCungCap.VN ",
    password: "Password@123",
    phone: "   ",
    extraIgnoredKey: "should-not-be-sent",
  })

  assert.equal(requests[0].method, "post")
  assert.equal(requests[0].url, "/supplier-staff")
  const sentBody = JSON.parse(requests[0].data)
  assert.deepEqual(sentBody, {
    username: "new_staff01",
    fullName: "Trần Thị Bình",
    email: "new.staff@nhacungcap.vn",
    password: "Password@123",
    phone: null,
  })
  assert.equal(created.phone, null)
})

test("changeStatus calls PATCH /supplier-staff/:userId/status for LOCKED and ACTIVE", async () => {
  respond = () => success({ ...DETAIL_ITEM, status: "LOCKED" })
  const locked = await SupplierStaffService.changeStatus(STAFF_ID, "LOCKED")
  assert.equal(requests[0].method, "patch")
  assert.equal(requests[0].url, `/supplier-staff/${STAFF_ID}/status`)
  assert.deepEqual(JSON.parse(requests[0].data), { status: "LOCKED" })
  assert.equal(locked.status, "LOCKED")

  respond = () => success({ ...DETAIL_ITEM, status: "ACTIVE" })
  const unlocked = await SupplierStaffService.changeStatus(STAFF_ID, "ACTIVE")
  assert.equal(requests[1].method, "patch")
  assert.equal(requests[1].url, `/supplier-staff/${STAFF_ID}/status`)
  assert.deepEqual(JSON.parse(requests[1].data), { status: "ACTIVE" })
  assert.equal(unlocked.status, "ACTIVE")
})

test("permissions endpoints get, disable (PUT), and enable (DELETE) call expected routes", async () => {
  respond = () => success(PERMISSIONS_PAYLOAD)
  const fetched = await SupplierStaffService.getPermissions(STAFF_ID)
  assert.equal(requests[0].method, "get")
  assert.equal(requests[0].url, `/supplier-staff/${STAFF_ID}/permissions`)
  assert.equal(fetched.permissions.length, 1)
  assert.equal(fetched.permissions[0].enabled, true)

  respond = () =>
    success({
      ...PERMISSIONS_PAYLOAD,
      permissions: [{ ...PERMISSIONS_PAYLOAD.permissions[0], enabled: false }],
    })
  const disabled = await SupplierStaffService.disablePermission(
    STAFF_ID,
    PERMISSION_ID,
  )
  assert.equal(requests[1].method, "put")
  assert.equal(
    requests[1].url,
    `/supplier-staff/${STAFF_ID}/permission-denials/${PERMISSION_ID}`,
  )
  assert.deepEqual(JSON.parse(requests[1].data), {})
  assert.equal(disabled.permissions[0].enabled, false)

  respond = () => success(PERMISSIONS_PAYLOAD)
  const enabled = await SupplierStaffService.enablePermission(
    STAFF_ID,
    PERMISSION_ID,
  )
  assert.equal(requests[2].method, "delete")
  assert.equal(
    requests[2].url,
    `/supplier-staff/${STAFF_ID}/permission-denials/${PERMISSION_ID}`,
  )
  assert.equal(requests[2].data, undefined)
  assert.equal(enabled.permissions[0].enabled, true)
})

test("validateCreateStaffForm checks username, fullName, email, phone length, and password rules", () => {
  const { validateCreateStaffForm } = SupplierStaffServiceModule

  const invalid = validateCreateStaffForm({
    username: "_ab",
    fullName: "   ",
    email: "not-an-email",
    phone: "0".repeat(31),
    password: "weak",
  })
  assert.equal(invalid.isValid, false)
  assert.ok(invalid.errors.username)
  assert.ok(invalid.errors.fullName)
  assert.ok(invalid.errors.email)
  assert.ok(invalid.errors.phone)
  assert.ok(invalid.errors.password)

  const overBytes = validateCreateStaffForm({
    username: "valid_user01",
    fullName: "Nguyễn Văn An",
    email: "an@example.com",
    phone: "",
    password: "A".repeat(70) + "a1!é",
  })
  assert.equal(overBytes.isValid, false)
  assert.ok(overBytes.errors.password)

  const valid = validateCreateStaffForm({
    username: "valid.staff-01",
    fullName: "Nguyễn Văn An",
    email: "an@example.com",
    phone: "",
    password: "Password@123",
  })
  assert.equal(valid.isValid, true)
  assert.deepEqual(valid.errors, {})
})

test("canToggleStaffStatus and getStaffStatusMeta map statuses cleanly", () => {
  const { canToggleStaffStatus, getStaffStatusMeta } = SupplierStaffServiceModule

  assert.equal(canToggleStaffStatus("ACTIVE"), true)
  assert.equal(canToggleStaffStatus("LOCKED"), true)
  assert.equal(canToggleStaffStatus("UNVERIFIED"), false)
  assert.equal(canToggleStaffStatus("DEACTIVATED"), false)

  assert.deepEqual(getStaffStatusMeta("ACTIVE"), {
    label: "Đang hoạt động",
    tone: "success",
  })
  assert.deepEqual(getStaffStatusMeta("LOCKED"), {
    label: "Đã khóa",
    tone: "warning",
  })
})

test("extractApiError extracts message, HTTP status, and error.fields map", () => {
  const { extractApiError } = SupplierStaffServiceModule
  const axiosErr = new AxiosError("Conflict", "409", {}, {}, {
    status: 409,
    data: {
      success: false,
      statusCode: 409,
      message: "Tên đăng nhập hoặc email đã được sử dụng",
      error: {
        fields: [{ field: "username", message: "Tên đăng nhập đã tồn tại" }],
      },
    },
  })

  const parsed = extractApiError(axiosErr)
  assert.equal(parsed.status, 409)
  assert.equal(parsed.message, "Tên đăng nhập hoặc email đã được sử dụng")
  assert.deepEqual(parsed.fields, {
    username: "Tên đăng nhập đã tồn tại",
  })
})
