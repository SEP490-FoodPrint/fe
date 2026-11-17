import assert from "node:assert/strict"
import { after, before, beforeEach, test } from "node:test"
import { AxiosError } from "axios"
import { createServer } from "vite"

const COMPLAINT_ID = "00000000-0000-4000-8000-000000000701"
const SCHOOL_ID = "00000000-0000-4000-8000-000000000702"
const DELIVERY_ID = "00000000-0000-4000-8000-000000000703"
const LOT_ID = "00000000-0000-4000-8000-000000000704"
const SUBMITTER_ID = "00000000-0000-4000-8000-000000000705"
const RESPONDER_ID = "00000000-0000-4000-8000-000000000706"

const LIST_ITEM = {
  id: COMPLAINT_ID,
  complaintCode: "FP-CP-00001",
  title: "Rau cải dập nát khi bàn giao buổi sáng",
  school: { id: SCHOOL_ID, name: "Trường Tiểu học Bình Minh", code: "TH-BM-01" },
  delivery: { id: DELIVERY_ID, deliveryNo: "DLV-2026-0042" },
  status: "SUBMITTED",
  createdAt: "2026-11-17T01:30:00.000Z",
  respondedAt: null,
}

const DETAIL_SUBMITTED = {
  ...LIST_ITEM,
  description: "Thùng rau giao lúc 06:15 bị dập khoảng 2kg.\nĐề nghị kiểm tra lại khâu bảo quản.",
  updatedAt: "2026-11-17T01:30:00.000Z",
  submittedBy: { id: SUBMITTER_ID, fullName: "Nguyễn Thị Lan" },
  ingredientLot: { id: LOT_ID, lotCode: "LOT-RC-20261117" },
  supplierResponse: null,
  respondedBy: null,
}

const DETAIL_RESPONDED = {
  ...DETAIL_SUBMITTED,
  status: "RESPONDED",
  supplierResponse: "Nhà cung cấp đã tiếp nhận phản ánh và giao bù đủ khối lượng trước 09:00.",
  respondedBy: { id: RESPONDER_ID, fullName: "Trần Minh Tuấn" },
  respondedAt: "2026-11-17T02:15:00.000Z",
  updatedAt: "2026-11-17T02:15:00.000Z",
}

const success = (data, statusCode = 200) => ({
  success: true,
  statusCode,
  message: "Thành công",
  data,
})

let server
let http
let SupplierComplaintServiceModule
let SupplierComplaintService
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
    cacheDir: "/tmp/foodprint-supplier-complaints-tests-vite",
    server: { middlewareMode: true, hmr: false, ws: false },
    optimizeDeps: { noDiscovery: true, entries: [] },
    appType: "custom",
  })

  globalThis.window = {
    location: { replace: () => assert.fail("Unexpected navigation redirect") },
  }

  http = (await server.ssrLoadModule("/src/services/01_axios/index.js")).default
  SupplierComplaintServiceModule = await server.ssrLoadModule(
    "/src/services/SupplierComplaintService/index.js",
  )
  SupplierComplaintService = SupplierComplaintServiceModule.default
  MenuItemModule = await server.ssrLoadModule("/src/router/MenuItem.jsx")
  RolesModule = await server.ssrLoadModule("/src/constants/roles.js")
  UtilsModule = await server.ssrLoadModule("/src/lib/utils.jsx")

  http.defaults.adapter = async config => {
    requests.push(config)
    const payload = await respond(config)
    return {
      status: payload?.statusCode || 200,
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

test("Sidebar menu exposes Danh sách khiếu nại to both Supplier Admin and Supplier Staff", () => {
  const { ROLES } = RolesModule
  const { hasPermission } = UtilsModule

  const supplierMenu = MenuItemModule.MenuItemSupplier()
  const complaintItem = supplierMenu.find(
    item => item.key === "/supplier/complaints",
  )

  assert.ok(complaintItem)
  assert.equal(complaintItem.label, "Danh sách khiếu nại")
  assert.equal(
    hasPermission(complaintItem.roles, ROLES.INGREDIENT_SUPPLIER_ADMIN),
    true,
  )
  assert.equal(
    hasPermission(complaintItem.roles, ROLES.INGREDIENT_SUPPLIER_STAFF),
    true,
  )
  assert.equal(
    hasPermission(complaintItem.roles, ROLES.SCHOOL_MANAGEMENT_BOARD),
    false,
  )
  assert.equal(
    hasPermission(complaintItem.roles, ROLES.SYSTEM_ADMIN),
    false,
  )
})

test("listComplaints sends strictly page and limit params and keeps null complaintCode/school.code without fabricating from UUID", async () => {
  respond = () =>
    success({
      items: [
        {
          ...LIST_ITEM,
          complaintCode: null,
          school: { ...LIST_ITEM.school, code: null },
        },
      ],
      pagination: { page: 2, limit: 25, hasNext: true },
    })

  const result = await SupplierComplaintService.listComplaints({
    page: 2,
    limit: 25,
    status: "SUBMITTED",
    search: "ignored",
  })

  assert.equal(requests.length, 1)
  assert.equal(requests[0].method, "get")
  assert.equal(requests[0].url, "/ingredient-quality-feedback")
  assert.deepEqual(requests[0].params, { page: 2, limit: 25 })
  assert.equal(result.items[0].complaintCode, null)
  assert.equal(
    SupplierComplaintServiceModule.formatComplaintCode(
      result.items[0].complaintCode,
    ),
    "Chưa có mã",
  )
  assert.equal(result.items[0].school.code, null)
  assert.equal(
    SupplierComplaintServiceModule.formatSchoolCode(result.items[0].school.code),
    "Chưa có mã",
  )
  assert.deepEqual(result.pagination, { page: 2, limit: 25, hasNext: true })
})

test("getComplaintById normalizes UUID lowercase and sends empty query params", async () => {
  respond = () =>
    success({
      ...DETAIL_SUBMITTED,
      ingredientLot: null,
    })

  const detail = await SupplierComplaintService.getComplaintById(
    COMPLAINT_ID.toUpperCase(),
  )

  assert.equal(requests.length, 1)
  assert.equal(requests[0].method, "get")
  assert.equal(
    requests[0].url,
    `/ingredient-quality-feedback/${COMPLAINT_ID}`,
  )
  assert.equal(requests[0].params, undefined)
  assert.equal(detail.complaintCode, "FP-CP-00001")
  assert.equal(detail.ingredientLot, null)
  assert.equal(detail.submittedBy?.fullName, "Nguyễn Thị Lan")
  assert.equal(detail.supplierResponse, null)
  assert.equal(detail.respondedBy, null)
})

test("respondToComplaint trims ends, preserves inner newlines, sends strict payload, and returns FeedbackDetail", async () => {
  respond = config => {
    const parsedBody = JSON.parse(config.data)
    assert.deepEqual(Object.keys(parsedBody), ["supplierResponse"])
    assert.equal(
      parsedBody.supplierResponse,
      "Dòng một\nDòng hai",
    )
    return success(DETAIL_RESPONDED)
  }

  const updated = await SupplierComplaintService.respondToComplaint(
    COMPLAINT_ID.toUpperCase(),
    "   Dòng một\nDòng hai   ",
  )

  assert.equal(requests.length, 1)
  assert.equal(requests[0].method, "post")
  assert.equal(
    requests[0].url,
    `/ingredient-quality-feedback/${COMPLAINT_ID}/response`,
  )
  assert.equal(requests[0].params, undefined)
  assert.equal(updated.status, "RESPONDED")
  assert.equal(updated.complaintCode, "FP-CP-00001")
  assert.equal(updated.respondedBy?.fullName, "Trần Minh Tuấn")
})

test("validateSupplierResponse measures trimmed Unicode code points cleanly up to 5000", () => {
  const { validateSupplierResponse, countResponseCodePoints } =
    SupplierComplaintServiceModule

  assert.equal(validateSupplierResponse("   \n\t  ").valid, false)

  // Surrogate pair emoji should count as 1 code point each, matching Array.from
  const emoji5000 = "🥬".repeat(5000)
  assert.equal(countResponseCodePoints(`  ${emoji5000}  `), 5000)
  assert.equal(validateSupplierResponse(`  ${emoji5000}  `).valid, true)

  const emoji5001 = "🥬".repeat(5001)
  assert.equal(validateSupplierResponse(emoji5001).valid, false)
})

test("Permission helpers enforce AND logic for view_details and respond when user permissions array exists", () => {
  const { canViewSupplierComplaints, canRespondSupplierComplaints } =
    SupplierComplaintServiceModule

  assert.equal(canViewSupplierComplaints(null), false)
  assert.equal(
    canViewSupplierComplaints({
      role: "INGREDIENT_SUPPLIER_STAFF",
      permissions: ["ingredient_quality_feedback.view_own"],
    }),
    false,
  )
  assert.equal(
    canViewSupplierComplaints({
      role: "INGREDIENT_SUPPLIER_STAFF",
      permissions: ["ingredient_quality_feedback.view_details"],
    }),
    true,
  )
  assert.equal(
    canRespondSupplierComplaints({
      role: "INGREDIENT_SUPPLIER_STAFF",
      permissions: ["ingredient_quality_feedback.view_details"],
    }),
    false,
  )
  assert.equal(
    canRespondSupplierComplaints({
      role: "INGREDIENT_SUPPLIER_STAFF",
      permissions: ["ingredient_quality_feedback.respond"],
    }),
    false,
  )
  assert.equal(
    canRespondSupplierComplaints({
      role: "INGREDIENT_SUPPLIER_STAFF",
      permissions: [
        "ingredient_quality_feedback.view_details",
        "ingredient_quality_feedback.respond",
      ],
    }),
    true,
  )
})

test("extractApiError maps 400 validation fields and 409 conflict messages", () => {
  const err400 = new AxiosError("Bad Request", "ERR_BAD_REQUEST")
  err400.response = {
    status: 400,
    data: {
      message: "Dữ liệu phản hồi không hợp lệ",
      error: {
        fields: [
          {
            field: "supplierResponse",
            message: "Nội dung phản hồi vượt quá 5.000 ký tự",
          },
        ],
      },
    },
  }

  const parsed = SupplierComplaintServiceModule.extractApiError(err400)
  assert.equal(parsed.status, 400)
  assert.equal(
    parsed.fields.supplierResponse,
    "Nội dung phản hồi vượt quá 5.000 ký tự",
  )
})
