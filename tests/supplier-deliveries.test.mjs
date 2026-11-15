import assert from "node:assert/strict"
import { after, before, beforeEach, test } from "node:test"
import { AxiosError } from "axios"
import { createServer } from "vite"

const DELIVERY_ID = "00000000-0000-4000-8000-000000000601"
const SCHOOL_ID = "00000000-0000-4000-8000-000000000602"
const SUPPLIER_ID = "00000000-0000-4000-8000-000000000603"
const REQUEST_ID = "00000000-0000-4000-8000-000000000604"
const INGREDIENT_ID_1 = "00000000-0000-4000-8000-000000000605"
const INGREDIENT_ID_2 = "00000000-0000-4000-8000-000000000606"

const DELIVERY_LIST_ITEM = {
  id: DELIVERY_ID,
  deliveryNo: "DG-20261115-001",
  sourceType: "REQUEST",
  schoolId: SCHOOL_ID,
  schoolName: "Trường Tiểu học Lê Văn Tám",
  supplierId: SUPPLIER_ID,
  supplyRequestId: REQUEST_ID,
  requestNo: "YC-20261115-001",
  status: "CREATED",
  expectedArrivalAt: "2026-11-16T06:30:00+07:00",
  arrivedAt: null,
  receivedAt: null,
  vehiclePlate: "51D-123.45",
  note: "Giao cổng phụ bếp ăn",
  createdByUserId: "00000000-0000-4000-8000-000000000607",
  createdAt: "2026-11-15T02:00:00.000Z",
  updatedAt: "2026-11-15T02:00:00.000Z",
}

const DELIVERY_DETAIL = {
  ...DELIVERY_LIST_ITEM,
  items: [
    {
      id: "00000000-0000-4000-8000-000000000701",
      ingredientId: INGREDIENT_ID_1,
      ingredientName: "Cải xanh hữu cơ",
      ingredientEntryId: "00000000-0000-4000-8000-000000000801",
      supplyRequestItemId: "00000000-0000-4000-8000-000000000901",
      actualQuantity: "12.500",
      unit: "kg",
      note: null,
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
let DeliveryServiceModule
let DeliveryService
let MenuItemModule
let RolesModule
let UtilsModule
let RouterModule

let requests = []
let respond = () =>
  success({
    items: [DELIVERY_LIST_ITEM],
    pagination: { page: 1, limit: 20, hasNext: false },
  })

const savedWindow = globalThis.window

before(async () => {
  server = await createServer({
    cacheDir: "/tmp/foodprint-supplier-deliveries-tests-vite",
    server: { middlewareMode: true, hmr: false, ws: false },
    optimizeDeps: { noDiscovery: true, entries: [] },
    appType: "custom",
  })

  globalThis.window = {
    location: { replace: () => assert.fail("Unexpected navigation redirect") },
  }

  http = (await server.ssrLoadModule("/src/services/01_axios/index.js")).default
  DeliveryServiceModule = await server.ssrLoadModule(
    "/src/services/SupplierDeliveryService/index.js",
  )
  DeliveryService = DeliveryServiceModule.default
  MenuItemModule = await server.ssrLoadModule("/src/router/MenuItem.jsx")
  RolesModule = await server.ssrLoadModule("/src/constants/roles.js")
  UtilsModule = await server.ssrLoadModule("/src/lib/utils.jsx")
  RouterModule = await server.ssrLoadModule("/src/router/ROUTER.js")

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
      items: [DELIVERY_LIST_ITEM],
      pagination: { page: 1, limit: 20, hasNext: false },
    })
})

after(async () => {
  globalThis.window = savedWindow
  await server?.close()
})

test("MenuItemSupplier exposes Tạo & Quản lý Đơn giao for supplier admin and staff only", () => {
  const { MenuItemSupplier } = MenuItemModule
  const { ROLES } = RolesModule
  const { hasPermission } = UtilsModule
  const { ROUTER } = RouterModule

  const supplierMenu = MenuItemSupplier()
  const entry = supplierMenu.find(
    item => item.key === ROUTER.SUPPLIER_DELIVERIES,
  )
  assert.ok(entry, "Supplier delivery menu entry must exist")
  assert.equal(entry.label, "Tạo & Quản lý Đơn giao")

  assert.equal(hasPermission(entry.roles, ROLES.INGREDIENT_SUPPLIER_ADMIN), true)
  assert.equal(hasPermission(entry.roles, ROLES.INGREDIENT_SUPPLIER_STAFF), true)
  assert.equal(hasPermission(entry.roles, ROLES.SCHOOL_ADMIN), false)
})

test("SupplierDeliveryService.list sends strict query params and omits ALL/invalid filters", async () => {
  const first = await DeliveryService.list({
    page: 2,
    limit: 20,
    sourceType: "ALL",
    status: "ALL",
  })

  assert.equal(requests.length, 1)
  assert.equal(requests[0].method, "get")
  assert.equal(requests[0].url, "/deliveries/management")
  assert.deepEqual(requests[0].params, { page: 2, limit: 20 })
  assert.equal(first.items.length, 1)
  assert.equal(first.items[0].deliveryNo, "DG-20261115-001")

  await DeliveryService.list({
    page: 1,
    limit: 10,
    sourceType: "STANDALONE",
    status: "CREATED",
  })
  assert.deepEqual(requests[1].params, {
    page: 1,
    limit: 10,
    sourceType: "STANDALONE",
    status: "CREATED",
  })
})

test("SupplierDeliveryService.getById, listSchoolOptions, and listIngredientOptions adapt responses", async () => {
  respond = async config => {
    if (config.url === `/deliveries/management/${DELIVERY_ID}`) {
      return success(DELIVERY_DETAIL)
    }
    if (config.url === "/deliveries/management/options/schools") {
      return success({
        items: [{ id: SCHOOL_ID, code: "TH-LVT", name: "Trường Tiểu học Lê Văn Tám" }],
        pagination: { page: 1, limit: 100, hasNext: false },
      })
    }
    if (config.url === "/deliveries/management/options/ingredients") {
      return success({
        items: [
          {
            id: INGREDIENT_ID_1,
            name: "Cải xanh hữu cơ",
            defaultUnit: "kg",
            categoryId: null,
            categoryName: "Rau lá",
          },
        ],
        pagination: { page: 1, limit: 100, hasNext: false },
      })
    }
    return success({})
  }

  const detail = await DeliveryService.getById(DELIVERY_ID)
  assert.equal(detail.deliveryNo, "DG-20261115-001")
  assert.equal(detail.items.length, 1)
  assert.equal(detail.items[0].actualQuantity, "12.500")

  const schools = await DeliveryService.listSchoolOptions()
  assert.equal(schools.items[0].code, "TH-LVT")

  const ingredients = await DeliveryService.listIngredientOptions()
  assert.equal(ingredients.items[0].defaultUnit, "kg")
  assert.equal(ingredients.items[0].categoryName, "Rau lá")
})

test("SupplierDeliveryService.create (REQUEST) sends Idempotency-Key header and strict body", async () => {
  respond = async () => success(DELIVERY_DETAIL, 201)
  const uuidKey = "A1B2C3D4-E5F6-4789-ABCD-0123456789EF"

  const created = await DeliveryService.create(
    {
      sourceType: "REQUEST",
      supplyRequestId: REQUEST_ID.toUpperCase(),
      expectedArrivalAt: "2026-11-16T06:30:00+07:00",
      vehiclePlate: "  51D-123.45  ",
      note: "  Giao sớm trước giờ nhận bếp  ",
    },
    uuidKey,
  )

  assert.equal(created.id, DELIVERY_ID)
  assert.equal(requests.length, 1)
  assert.equal(requests[0].method, "post")
  assert.equal(requests[0].url, "/deliveries/management")
  assert.equal(requests[0].params, undefined)
  assert.equal(requests[0].headers["Idempotency-Key"], uuidKey.toLowerCase())
  const sentBody =
    typeof requests[0].data === "string"
      ? JSON.parse(requests[0].data)
      : requests[0].data
  assert.deepEqual(sentBody, {
    sourceType: "REQUEST",
    supplyRequestId: REQUEST_ID,
    expectedArrivalAt: "2026-11-16T06:30:00+07:00",
    vehiclePlate: "51D-123.45",
    note: "Giao sớm trước giờ nhận bếp",
  })
})

test("SupplierDeliveryService.create (STANDALONE) sends strict actualQuantity + unit items", async () => {
  respond = async () =>
    success(
      {
        ...DELIVERY_DETAIL,
        sourceType: "STANDALONE",
        supplyRequestId: null,
        requestNo: null,
      },
      201,
    )

  await DeliveryService.create({
    sourceType: "STANDALONE",
    schoolId: SCHOOL_ID,
    expectedArrivalAt: null,
    vehiclePlate: "",
    note: "",
    items: [
      {
        ingredientId: INGREDIENT_ID_1,
        actualQuantity: " 12,5 ",
        unit: " kg ",
        extraIgnoredField: "must-not-be-sent",
      },
      {
        ingredientId: INGREDIENT_ID_2,
        actualQuantity: "3",
        unit: "lít",
      },
    ],
  })

  assert.equal(requests.length, 1)
  const sentHeaders = requests[0].headers
  assert.match(
    sentHeaders["Idempotency-Key"],
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  )
  const sentBody =
    typeof requests[0].data === "string"
      ? JSON.parse(requests[0].data)
      : requests[0].data
  assert.deepEqual(sentBody, {
    sourceType: "STANDALONE",
    schoolId: SCHOOL_ID,
    expectedArrivalAt: null,
    vehiclePlate: null,
    note: null,
    items: [
      { ingredientId: INGREDIENT_ID_1, actualQuantity: "12.5", unit: "kg" },
      { ingredientId: INGREDIENT_ID_2, actualQuantity: "3", unit: "lít" },
    ],
  })
})

test("validateDeliveryDraft and decimal/datetime helpers enforce BE constraints", () => {
  const {
    validateDeliveryDraft,
    isValidPositiveDecimal,
    toIsoWithTimezoneOffset,
    extractApiError,
  } = DeliveryServiceModule

  assert.equal(isValidPositiveDecimal("12.5"), true)
  assert.equal(isValidPositiveDecimal("12,5"), true)
  assert.equal(isValidPositiveDecimal("0.250"), true)
  assert.equal(isValidPositiveDecimal("0"), false)
  assert.equal(isValidPositiveDecimal("0.000"), false)
  assert.equal(isValidPositiveDecimal("-2"), false)
  assert.equal(isValidPositiveDecimal("1.2345"), false)
  assert.equal(isValidPositiveDecimal("abc"), false)

  const iso = toIsoWithTimezoneOffset("2026-11-16T06:30")
  assert.match(iso, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/)
  assert.equal(toIsoWithTimezoneOffset(""), null)
  assert.equal(toIsoWithTimezoneOffset("invalid-date"), null)

  const reqInvalid = validateDeliveryDraft({
    sourceType: "REQUEST",
    supplyRequestId: "",
  })
  assert.equal(reqInvalid.valid, false)
  assert.ok(reqInvalid.errors.supplyRequestId)

  const dupStandalone = validateDeliveryDraft({
    sourceType: "STANDALONE",
    schoolId: SCHOOL_ID,
    items: [
      { ingredientId: INGREDIENT_ID_1, actualQuantity: "5", unit: "kg" },
      { ingredientId: INGREDIENT_ID_1, actualQuantity: "0", unit: "" },
    ],
  })
  assert.equal(dupStandalone.valid, false)
  assert.ok(dupStandalone.errors.itemErrors[1].ingredientId)
  assert.ok(dupStandalone.errors.itemErrors[1].actualQuantity)
  assert.ok(dupStandalone.errors.itemErrors[1].unit)

  const validStandalone = validateDeliveryDraft({
    sourceType: "STANDALONE",
    schoolId: SCHOOL_ID,
    expectedArrivalLocal: "2026-11-16T06:30",
    vehiclePlate: "51D-123.45",
    items: [
      { ingredientId: INGREDIENT_ID_1, actualQuantity: "12.5", unit: "kg" },
    ],
  })
  assert.equal(validStandalone.valid, true)

  const err = new AxiosError(
    "Conflict",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    {
      status: 409,
      data: {
        message: "Yêu cầu cung ứng không ở trạng thái có thể tạo đơn giao.",
        error: {
          fields: [{ field: "supplyRequestId", message: "Trạng thái không hợp lệ" }],
        },
      },
    },
  )
  const parsed = extractApiError(err)
  assert.equal(parsed.status, 409)
  assert.equal(parsed.fieldErrors.supplyRequestId, "Trạng thái không hợp lệ")
})
