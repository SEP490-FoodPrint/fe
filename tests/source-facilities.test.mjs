import assert from "node:assert/strict"
import { after, before, beforeEach, test } from "node:test"
import { AxiosError } from "axios"
import { createServer } from "vite"

const FACILITY_ID = "00000000-0000-4000-8000-000000000201"
const SUPPLIER_ID = "00000000-0000-4000-8000-000000000202"

const LIST_ITEM = {
  id: FACILITY_ID,
  supplierId: SUPPLIER_ID,
  facilityCode: "FP-SF-00001",
  name: "Vùng trồng Lâm Hà",
  status: "ACTIVE",
  isVisible: true,
  createdAt: "2026-11-10T08:00:00.000Z",
  updatedAt: "2026-11-12T09:30:00.000Z",
}

const DETAIL_ITEM = {
  ...LIST_ITEM,
  address: "Thôn 3, xã Gia Lâm, huyện Lâm Hà, Lâm Đồng",
  contactName: "Nguyễn Văn An",
  contactPhone: "0912345678",
  contactEmail: "an@lamha.vn",
}

const success = (data, statusCode = 200) => ({
  success: true,
  statusCode,
  data,
})

let server
let http
let SourceFacilityServiceModule
let SourceFacilityService
let MenuItemModule
let RolesModule
let UtilsModule

let requests = []
let respond = () => success({ items: [LIST_ITEM], pagination: { page: 1, limit: 20, hasNext: false } })

const savedWindow = globalThis.window

before(async () => {
  server = await createServer({
    cacheDir: "/tmp/foodprint-source-facility-tests-vite",
    server: { middlewareMode: true, hmr: false, ws: false },
    optimizeDeps: { noDiscovery: true, entries: [] },
    appType: "custom",
  })

  globalThis.window = {
    location: { replace: () => assert.fail("Unexpected navigation redirect") },
  }

  http = (await server.ssrLoadModule("/src/services/01_axios/index.js")).default
  SourceFacilityServiceModule = await server.ssrLoadModule(
    "/src/services/SourceFacilityService/index.js",
  )
  SourceFacilityService = SourceFacilityServiceModule.default
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

test("Sidebar menu exposes Cơ sở nguồn cung exclusively to Ingredient Supplier Admin", () => {
  const { ROLES } = RolesModule
  const { hasPermission } = UtilsModule
  const supplierMenu = MenuItemModule.MenuItemSupplier()

  const facilityItem = supplierMenu.find(
    item => item.key === "/supplier/source-facilities",
  )
  assert.ok(facilityItem, "Cơ sở nguồn cung menu item must exist")
  assert.equal(facilityItem.label, "Cơ sở nguồn cung")
  assert.equal(
    hasPermission(facilityItem.roles, ROLES.INGREDIENT_SUPPLIER_ADMIN),
    true,
  )
  assert.equal(
    hasPermission(facilityItem.roles, ROLES.INGREDIENT_SUPPLIER_STAFF),
    false,
  )
})

test("list calls GET /source-facilities with only page and limit params", async () => {
  respond = () =>
    success({
      items: [LIST_ITEM],
      pagination: { page: 2, limit: 10, hasNext: true },
    })

  const result = await SourceFacilityService.list({ page: 2, limit: 10 })
  assert.equal(requests.length, 1)
  assert.equal(requests[0].method, "get")
  assert.equal(requests[0].url, "/source-facilities")
  assert.deepEqual(requests[0].params, { page: 2, limit: 10 })
  assert.equal(result.items.length, 1)
  assert.equal(result.items[0].facilityCode, "FP-SF-00001")
  assert.equal(result.pagination.page, 2)
  assert.equal(result.pagination.limit, 10)
  assert.equal(result.pagination.hasNext, true)
  assert.equal("total" in result.pagination, false)
})

test("getById calls GET /source-facilities/:id and returns detail fields", async () => {
  respond = () => success(DETAIL_ITEM)

  const detail = await SourceFacilityService.getById(FACILITY_ID)
  assert.equal(requests[0].method, "get")
  assert.equal(requests[0].url, `/source-facilities/${FACILITY_ID}`)
  assert.equal(detail.id, FACILITY_ID)
  assert.equal(detail.facilityCode, "FP-SF-00001")
  assert.equal(detail.address, DETAIL_ITEM.address)
  assert.equal(detail.contactName, "Nguyễn Văn An")
  assert.equal(detail.contactPhone, "0912345678")
  assert.equal(detail.contactEmail, "an@lamha.vn")
})

test("create sends strict payload allowlist and normalizes empty optional strings to null", async () => {
  respond = () => success(DETAIL_ITEM, 201)

  await SourceFacilityService.create({
    facilityCode: "FP-FAKE-999",
    status: "INACTIVE",
    facilityType: "FARM",
    name: "  Vùng trồng Lâm Hà  ",
    address: "   ",
    contactName: " Nguyễn Văn An ",
    contactPhone: "",
    contactEmail: " an@lamha.vn ",
  })

  assert.equal(requests[0].method, "post")
  assert.equal(requests[0].url, "/source-facilities")
  const sentBody = JSON.parse(requests[0].data)
  assert.deepEqual(sentBody, {
    name: "Vùng trồng Lâm Hà",
    address: null,
    contactName: "Nguyễn Văn An",
    contactPhone: null,
    contactEmail: "an@lamha.vn",
  })
  assert.equal("facilityCode" in sentBody, false)
  assert.equal("status" in sentBody, false)
  assert.equal("facilityType" in sentBody, false)
})

test("update sends PATCH /source-facilities/:id with strict allowlist", async () => {
  respond = () =>
    success({
      ...DETAIL_ITEM,
      name: "Vùng trồng Lâm Hà (Cơ sở 2)",
      address: null,
    })

  const updated = await SourceFacilityService.update(FACILITY_ID, {
    id: FACILITY_ID,
    facilityCode: "FP-SF-00001",
    name: " Vùng trồng Lâm Hà (Cơ sở 2) ",
    address: "",
    contactName: "Trần Thị Bình",
    contactPhone: "+84912345678",
    contactEmail: "",
  })

  assert.equal(requests[0].method, "patch")
  assert.equal(requests[0].url, `/source-facilities/${FACILITY_ID}`)
  const sentBody = JSON.parse(requests[0].data)
  assert.deepEqual(sentBody, {
    name: "Vùng trồng Lâm Hà (Cơ sở 2)",
    address: null,
    contactName: "Trần Thị Bình",
    contactPhone: "+84912345678",
    contactEmail: null,
  })
  assert.equal(updated.address, null)
})

test("deactivate sends POST /source-facilities/:id/deactivate and returns INACTIVE facility", async () => {
  respond = () =>
    success({
      ...DETAIL_ITEM,
      status: "INACTIVE",
    })

  const deactivated = await SourceFacilityService.deactivate(FACILITY_ID)
  assert.equal(requests[0].method, "post")
  assert.equal(requests[0].url, `/source-facilities/${FACILITY_ID}/deactivate`)
  assert.deepEqual(JSON.parse(requests[0].data), {})
  assert.equal(deactivated.status, "INACTIVE")
})

test("validateFacilityForm validates required name, phone format, and email format", () => {
  const { validateFacilityForm } = SourceFacilityServiceModule

  const missingName = validateFacilityForm({
    name: "   ",
    contactPhone: "abc",
    contactEmail: "sai-dinh-dang",
  })
  assert.ok(missingName.name)
  assert.ok(missingName.contactPhone)
  assert.ok(missingName.contactEmail)

  const validMinimal = validateFacilityForm({
    name: "Vùng trồng Đà Lạt",
    address: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
  })
  assert.deepEqual(validMinimal, {})

  const validFull = validateFacilityForm({
    name: "Kho lạnh Bảo Lộc",
    address: "QL20, Bảo Lộc, Lâm Đồng",
    contactName: "Lê Minh",
    contactPhone: "+84 912-345-678",
    contactEmail: "kho@baoloc.vn",
  })
  assert.deepEqual(validFull, {})
})

test("extractApiError extracts HTTP status, message, and 400 fieldErrors map", () => {
  const { extractApiError } = SourceFacilityServiceModule
  const axiosErr = new AxiosError("Validation failed", "400", {}, {}, {
    status: 400,
    data: {
      success: false,
      statusCode: 400,
      message: "Dữ liệu không hợp lệ",
      error: {
        fields: [
          { field: "name", message: "Tên cơ sở là bắt buộc" },
          { field: "contactEmail", message: "Email không hợp lệ" },
        ],
      },
    },
  })

  const parsed = extractApiError(axiosErr)
  assert.equal(parsed.status, 400)
  assert.equal(parsed.message, "Dữ liệu không hợp lệ")
  assert.deepEqual(parsed.fieldErrors, {
    name: "Tên cơ sở là bắt buộc",
    contactEmail: "Email không hợp lệ",
  })
})
