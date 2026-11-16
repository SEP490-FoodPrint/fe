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
const FACILITY_ID_1 = "00000000-0000-4000-8000-000000000608"
const FACILITY_ID_2 = "00000000-0000-4000-8000-000000000609"
const REQUEST_ITEM_ID_1 = "00000000-0000-4000-8000-000000000901"

const DELIVERY_LIST_ITEM = {
  id: DELIVERY_ID,
  deliveryNo: "FP-DE-00001",
  sourceType: "REQUEST",
  schoolId: SCHOOL_ID,
  schoolName: "Trường Tiểu học Lê Văn Tám",
  supplierId: SUPPLIER_ID,
  supplyRequestId: REQUEST_ID,
  requestNo: "YC-20261115-001",
  status: "IN_TRANSIT",
  statusLabel: "Đang giao",
  traceabilityVersion: 1,
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
      supplyRequestItemId: REQUEST_ITEM_ID_1,
      sourceFacility: {
        id: FACILITY_ID_1,
        name: "Nông trại Rau Sạch Củ Chi",
        facilityCode: "CC-01",
      },
      traceUrl: "http://localhost:5173/public/delivery-items/tok-abc",
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
  assert.equal(first.items[0].deliveryNo, "FP-DE-00001")
  assert.equal(first.items[0].statusLabel, "Đang giao")
  assert.equal(first.items[0].traceabilityVersion, 1)

  const { getDeliveryStatusMeta } = DeliveryServiceModule
  assert.equal(getDeliveryStatusMeta("PREPARING").label, "Đang chuẩn bị hàng")
  assert.equal(getDeliveryStatusMeta("IN_TRANSIT").label, "Đang giao")
  assert.equal(getDeliveryStatusMeta("REJECTED").label, "Yêu cầu giao hàng lại")
  assert.equal(getDeliveryStatusMeta("RECEIVED").label, "Hoàn thành")

  await DeliveryService.list({
    page: 1,
    limit: 10,
    sourceType: "STANDALONE",
    status: "PREPARING",
  })
  assert.deepEqual(requests[1].params, {
    page: 1,
    limit: 10,
    sourceType: "STANDALONE",
    status: "PREPARING",
  })
})

test("SupplierDeliveryService.getById, options (schools, ingredients, source-facilities), and labels adapt responses", async () => {
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
    if (config.url === "/deliveries/management/options/source-facilities") {
      return success({
        items: [
          {
            id: FACILITY_ID_1,
            facilityCode: "CC-01",
            name: "Nông trại Rau Sạch Củ Chi",
          },
        ],
        pagination: { page: 1, limit: 100, hasNext: false },
      })
    }
    if (config.url === `/deliveries/management/${DELIVERY_ID}/labels`) {
      const page = Number(config.params?.page || 1)
      return success({
        items: [
          {
            deliveryItemId:
              page === 1
                ? "00000000-0000-4000-8000-000000000701"
                : "00000000-0000-4000-8000-000000000702",
            deliveryNo: "FP-DE-00001",
            supplierName: "Nông sản Xanh FoodPrint",
            ingredientName: page === 1 ? "Cải xanh hữu cơ" : "Cà chua sạch",
            actualQuantity: "12.500",
            unit: "kg",
            sourceFacility: {
              name: "Nông trại Rau Sạch Củ Chi",
              facilityCode: "CC-01",
            },
            traceUrl: `http://localhost:5173/public/delivery-items/tok-${page}`,
            qrImageDataUrl: "data:image/png;base64,iVBORw0KGgo=",
          },
        ],
        pagination: { page, limit: 1, hasNext: page === 1 },
      })
    }
    return success({})
  }

  const detail = await DeliveryService.getById(DELIVERY_ID)
  assert.equal(detail.deliveryNo, "FP-DE-00001")
  assert.equal(detail.items.length, 1)
  assert.equal(detail.items[0].actualQuantity, "12.500")
  assert.equal(detail.items[0].sourceFacility.facilityCode, "CC-01")
  assert.equal(detail.items[0].traceUrl, "http://localhost:5173/public/delivery-items/tok-abc")

  const schools = await DeliveryService.listSchoolOptions()
  assert.equal(schools.items[0].code, "TH-LVT")

  const ingredients = await DeliveryService.listIngredientOptions()
  assert.equal(ingredients.items[0].defaultUnit, "kg")
  assert.equal(ingredients.items[0].categoryName, "Rau lá")

  const facilities = await DeliveryService.listSourceFacilityOptions()
  assert.equal(facilities.items[0].id, FACILITY_ID_1)
  assert.equal(facilities.items[0].facilityCode, "CC-01")

  const allLabels = await DeliveryService.listAllLabels(DELIVERY_ID, { limit: 1 })
  assert.equal(allLabels.length, 2)
  assert.equal(allLabels[0].deliveryNo, "FP-DE-00001")
  assert.equal(allLabels[1].ingredientName, "Cà chua sạch")
  assert.match(allLabels[0].qrImageDataUrl, /^data:image\/png;base64,/)
})

test("SupplierDeliveryService.create (REQUEST) sends Idempotency-Key + sources[] + actualQuantity without logistics", async () => {
  respond = async () =>
    success(
      {
        ...DELIVERY_DETAIL,
        status: "PREPARING",
        statusLabel: "Đang chuẩn bị hàng",
        workflowVersion: 2,
        nextAction: "ENTER_SHIPPING",
        expectedArrivalAt: null,
        vehiclePlate: null,
      },
      201,
    )
  const uuidKey = "A1B2C3D4-E5F6-4789-ABCD-0123456789EF"

  const created = await DeliveryService.create(
    {
      sourceType: "REQUEST",
      supplyRequestId: REQUEST_ID.toUpperCase(),
      sources: [
        {
          supplyRequestItemId: REQUEST_ITEM_ID_1.toUpperCase(),
          sourceFacilityId: FACILITY_ID_1.toUpperCase(),
          actualQuantity: "12,5",
        },
      ],
      expectedArrivalAt: "2026-11-16T06:30:00+07:00",
      vehiclePlate: "51D-123.45",
      note: "  Giao sớm trước giờ nhận bếp  ",
    },
    uuidKey,
  )

  assert.equal(created.id, DELIVERY_ID)
  assert.equal(created.status, "PREPARING")
  assert.equal(created.workflowVersion, 2)
  assert.equal(created.nextAction, "ENTER_SHIPPING")
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
    sources: [
      {
        supplyRequestItemId: REQUEST_ITEM_ID_1,
        sourceFacilityId: FACILITY_ID_1,
        actualQuantity: "12.5",
      },
    ],
    note: "Giao sớm trước giờ nhận bếp",
  })
  assert.equal("expectedArrivalAt" in sentBody, false)
  assert.equal("vehiclePlate" in sentBody, false)
})

test("SupplierDeliveryService.create (STANDALONE) omits logistics fields & dispatch moves order to IN_TRANSIT", async () => {
  respond = async () =>
    success(
      {
        ...DELIVERY_DETAIL,
        sourceType: "STANDALONE",
        supplyRequestId: null,
        requestNo: null,
        status: "PREPARING",
        statusLabel: "Đang chuẩn bị hàng",
        workflowVersion: 2,
        nextAction: "ENTER_SHIPPING",
        expectedArrivalAt: null,
        vehiclePlate: null,
      },
      201,
    )

  const prepared = await DeliveryService.create({
    sourceType: "STANDALONE",
    schoolId: SCHOOL_ID,
    expectedArrivalAt: "2026-11-16T06:30:00+07:00",
    vehiclePlate: "51C-888.99",
    note: "",
    items: [
      {
        ingredientId: INGREDIENT_ID_1,
        sourceFacilityId: FACILITY_ID_1,
        actualQuantity: " 12,5 ",
        unit: " kg ",
        extraIgnoredField: "must-not-be-sent",
      },
      {
        ingredientId: INGREDIENT_ID_2,
        sourceFacilityId: FACILITY_ID_2,
        actualQuantity: "3",
        unit: "lít",
      },
    ],
  })

  assert.equal(prepared.status, "PREPARING")
  assert.equal(requests.length, 1)
  const sentHeaders = requests[0].headers
  assert.match(
    sentHeaders["Idempotency-Key"],
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  )
  const sentCreateBody =
    typeof requests[0].data === "string"
      ? JSON.parse(requests[0].data)
      : requests[0].data
  assert.deepEqual(sentCreateBody, {
    sourceType: "STANDALONE",
    schoolId: SCHOOL_ID,
    note: null,
    items: [
      {
        ingredientId: INGREDIENT_ID_1,
        sourceFacilityId: FACILITY_ID_1,
        actualQuantity: "12.5",
        unit: "kg",
      },
      {
        ingredientId: INGREDIENT_ID_2,
        sourceFacilityId: FACILITY_ID_2,
        actualQuantity: "3",
        unit: "lít",
      },
    ],
  })
  assert.equal("expectedArrivalAt" in sentCreateBody, false)
  assert.equal("vehiclePlate" in sentCreateBody, false)

  respond = async () =>
    success(
      {
        ...DELIVERY_DETAIL,
        sourceType: "STANDALONE",
        supplyRequestId: null,
        requestNo: null,
        status: "IN_TRANSIT",
        statusLabel: "Đang giao hàng",
        workflowVersion: 2,
        nextAction: "TRACK_DELIVERY",
        expectedArrivalAt: "2026-11-17T08:00:00+07:00",
        vehiclePlate: "29C-12345",
      },
      200,
    )

  const dispatched = await DeliveryService.dispatch(prepared.id, {
    expectedArrivalAt: "2026-11-17T08:00:00+07:00",
    vehiclePlate: "  29C-12345  ",
  })
  assert.equal(requests.length, 2)
  assert.equal(requests[1].method, "post")
  assert.equal(requests[1].url, `/deliveries/management/${DELIVERY_ID}/dispatch`)
  const sentDispatchBody =
    typeof requests[1].data === "string"
      ? JSON.parse(requests[1].data)
      : requests[1].data
  assert.deepEqual(sentDispatchBody, {
    expectedArrivalAt: "2026-11-17T08:00:00+07:00",
    vehiclePlate: "29C-12345",
  })
  assert.equal(dispatched.status, "IN_TRANSIT")
  assert.equal(dispatched.vehiclePlate, "29C-12345")
})

test("validateDeliveryDraft enforces source facilities and mandatory vehiclePlate + expectedArrivalAt", () => {
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

  // Missing request, sources, ETA, and plate
  const reqInvalid = validateDeliveryDraft({
    sourceType: "REQUEST",
    supplyRequestId: "",
    requestItems: [{ id: REQUEST_ITEM_ID_1 }],
    sources: [],
    expectedArrivalLocal: "",
    vehiclePlate: "   ",
  })
  assert.equal(reqInvalid.valid, false)
  assert.ok(reqInvalid.errors.supplyRequestId)
  assert.ok(reqInvalid.errors.sources)
  assert.ok(reqInvalid.errors.sourceErrors[REQUEST_ITEM_ID_1])
  assert.ok(reqInvalid.errors.expectedArrivalAt)
  assert.ok(reqInvalid.errors.vehiclePlate)

  // Valid REQUEST draft
  const reqValid = validateDeliveryDraft({
    sourceType: "REQUEST",
    supplyRequestId: REQUEST_ID,
    requestItems: [{ id: REQUEST_ITEM_ID_1 }],
    sources: [{ supplyRequestItemId: REQUEST_ITEM_ID_1, sourceFacilityId: FACILITY_ID_1 }],
    expectedArrivalLocal: "2026-11-16T06:30",
    vehiclePlate: "51D-123.45",
  })
  assert.equal(reqValid.valid, true)

  // Missing sourceFacilityId & same ingredient across missing facilities
  const missingFieldsStandalone = validateDeliveryDraft({
    sourceType: "STANDALONE",
    schoolId: SCHOOL_ID,
    expectedArrivalLocal: "",
    vehiclePlate: "",
    items: [
      {
        ingredientId: INGREDIENT_ID_1,
        sourceFacilityId: "",
        actualQuantity: "5",
        unit: "kg",
      },
      {
        ingredientId: INGREDIENT_ID_1,
        sourceFacilityId: "",
        actualQuantity: "0",
        unit: "",
      },
    ],
  })
  assert.equal(missingFieldsStandalone.valid, false)
  assert.ok(missingFieldsStandalone.errors.expectedArrivalAt)
  assert.ok(missingFieldsStandalone.errors.vehiclePlate)
  assert.ok(missingFieldsStandalone.errors.itemErrors[0].sourceFacilityId)
  assert.equal(missingFieldsStandalone.errors.itemErrors[1].ingredientId, undefined)
  assert.ok(missingFieldsStandalone.errors.itemErrors[1].sourceFacilityId)
  assert.ok(missingFieldsStandalone.errors.itemErrors[1].actualQuantity)
  assert.ok(missingFieldsStandalone.errors.itemErrors[1].unit)

  // Duplicate (ingredientId, sourceFacilityId) pair in STANDALONE is rejected (case-insensitive)
  const dupPairStandalone = validateDeliveryDraft({
    sourceType: "STANDALONE",
    schoolId: SCHOOL_ID,
    expectedArrivalLocal: "2026-11-16T06:30",
    vehiclePlate: "51D-123.45",
    items: [
      {
        ingredientId: INGREDIENT_ID_1,
        sourceFacilityId: FACILITY_ID_1,
        actualQuantity: "5",
        unit: "kg",
      },
      {
        ingredientId: INGREDIENT_ID_1.toUpperCase(),
        sourceFacilityId: FACILITY_ID_1.toUpperCase(),
        actualQuantity: "3",
        unit: "kg",
      },
    ],
  })
  assert.equal(dupPairStandalone.valid, false)
  assert.equal(dupPairStandalone.errors.itemErrors[0], undefined)
  assert.equal(dupPairStandalone.errors.itemErrors[1].ingredientId, undefined)
  assert.equal(
    dupPairStandalone.errors.itemErrors[1].sourceFacilityId,
    DeliveryServiceModule.DUPLICATE_INGREDIENT_FACILITY_MSG,
  )

  // Valid STANDALONE draft: same ingredient across DIFFERENT source facilities & same facility across different ingredients
  const validStandalone = validateDeliveryDraft({
    sourceType: "STANDALONE",
    schoolId: SCHOOL_ID,
    expectedArrivalLocal: "2026-11-16T06:30",
    vehiclePlate: "51D-123.45",
    items: [
      {
        ingredientId: INGREDIENT_ID_1,
        sourceFacilityId: FACILITY_ID_1,
        actualQuantity: "12.5",
        unit: "kg",
      },
      {
        ingredientId: INGREDIENT_ID_1,
        sourceFacilityId: FACILITY_ID_2,
        actualQuantity: "7.5",
        unit: "kg",
      },
      {
        ingredientId: INGREDIENT_ID_2,
        sourceFacilityId: FACILITY_ID_1,
        actualQuantity: "4",
        unit: "kg",
      },
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

test("3-stage validators and workflow stage metadata support both creation flows without premature logistics errors", () => {
  const {
    DELIVERY_SOURCE_TYPE,
    ORDER_CREATION_STAGE,
    WORKFLOW_STAGE_STATUS,
    getWorkflowStageStatusMeta,
    validateStandaloneSchool,
    validateDeliveryIngredientsStep,
    validateDeliveryLogisticsStep,
  } = DeliveryServiceModule

  assert.equal(ORDER_CREATION_STAGE.CONFIRM, "CONFIRM")
  assert.equal(ORDER_CREATION_STAGE.INGREDIENTS, "INGREDIENTS")
  assert.equal(ORDER_CREATION_STAGE.LOGISTICS, "LOGISTICS")

  assert.equal(getWorkflowStageStatusMeta(WORKFLOW_STAGE_STATUS.CONFIRMED).label, "Đã xác nhận")
  assert.equal(getWorkflowStageStatusMeta(WORKFLOW_STAGE_STATUS.PREPARING).label, "Đang chuẩn bị hàng")
  assert.equal(getWorkflowStageStatusMeta(WORKFLOW_STAGE_STATUS.IN_TRANSIT).label, "Đang giao hàng")

  // Stage 1: manual school selection only
  assert.equal(validateStandaloneSchool({ schoolId: "" }).valid, false)
  assert.equal(validateStandaloneSchool({ schoolId: SCHOOL_ID }).valid, true)

  // Stage 2: ingredients & source facilities valid WITHOUT ETA or vehiclePlate
  const reqStep2 = validateDeliveryIngredientsStep({
    sourceType: DELIVERY_SOURCE_TYPE.REQUEST,
    supplyRequestId: REQUEST_ID,
    requestItems: [{ id: REQUEST_ITEM_ID_1 }],
    sources: [{ supplyRequestItemId: REQUEST_ITEM_ID_1, sourceFacilityId: FACILITY_ID_1 }],
  })
  assert.equal(reqStep2.valid, true)

  const standaloneStep2 = validateDeliveryIngredientsStep({
    sourceType: DELIVERY_SOURCE_TYPE.STANDALONE,
    schoolId: SCHOOL_ID,
    items: [
      {
        ingredientId: INGREDIENT_ID_1,
        sourceFacilityId: FACILITY_ID_1,
        actualQuantity: "5.5",
        unit: "kg",
      },
    ],
  })
  assert.equal(standaloneStep2.valid, true)

  // Stage 3: mandatory ETA & vehiclePlate
  const step3Missing = validateDeliveryLogisticsStep({
    expectedArrivalLocal: "",
    vehiclePlate: "",
  })
  assert.equal(step3Missing.valid, false)
  assert.ok(step3Missing.errors.expectedArrivalAt)
  assert.ok(step3Missing.errors.vehiclePlate)

  const step3Valid = validateDeliveryLogisticsStep({
    expectedArrivalLocal: "2026-11-16T06:30",
    vehiclePlate: "51D-123.45",
    note: "Giao cổng phụ",
  })
  assert.equal(step3Valid.valid, true)
})
