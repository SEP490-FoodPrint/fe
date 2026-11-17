import assert from "node:assert/strict"
import { after, before, beforeEach, test } from "node:test"
import { AxiosError } from "axios"
import { createServer } from "vite"

const SCHOOL_ID = "00000000-0000-4000-8000-000000000501"
const CONTRACT_ID = "00000000-0000-4000-8000-000000000502"
const DOC_ID = "00000000-0000-4000-8000-000000000503"
const ING_ID = "00000000-0000-4000-8000-000000000504"

const SCHOOL_LIST_ITEM = {
  id: SCHOOL_ID,
  name: "Trường Tiểu học Bình Minh",
  code: "TH-BM-01",
  address: "12 Nguyễn Trãi, Thanh Xuân, Hà Nội",
  email: "binhminh@edu.vn",
  phone: "02435556677",
  status: "ACTIVE",
  relationship: {
    status: "ACTIVE",
    linkedAt: "2026-10-01T08:30:00.000Z",
  },
}

const SCHOOL_DETAIL = {
  ...SCHOOL_LIST_ITEM,
  description: "Trường tiểu học bán trú chuẩn quốc gia.",
  websiteUrl: "https://binhminh.edu.vn",
  logoUrl: null,
  coverImageUrl: null,
  boardingScale: "850 học sinh bán trú",
  relationship: {
    status: "SUSPENDED",
    linkedAt: "2026-10-01T08:30:00.000Z",
    suspendedAt: "2026-11-10T09:00:00.000Z",
    unlinkedAt: null,
    suspensionReason: "Chờ cập nhật phụ lục giá mới",
    unlinkReason: null,
  },
}

const CONTRACT_ITEM = {
  id: CONTRACT_ID,
  number: "HD-2026/BM-01",
  status: "ACTIVE",
  signedOn: "2026-09-25",
  startsOn: "2026-10-01",
  endsOn: "2027-05-31",
  scopeNote: "Cung cấp rau củ và thịt tươi theo tuần.",
  ingredients: [{ id: ING_ID, name: "Cải ngọt hữu cơ" }],
  activatedAt: "2026-09-26T04:15:00.000Z",
  closedAt: null,
  closeReason: null,
  documents: [
    {
      id: DOC_ID,
      kind: "SIGNED_CONTRACT",
      fileName: "hop-dong-binh-minh.pdf",
      mimeType: "application/pdf",
      size: 245760,
      createdAt: "2026-09-25T10:00:00.000Z",
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
let SupplierSchoolServiceModule
let SupplierSchoolService
let MenuItemModule
let RolesModule
let UtilsModule

let requests = []
let respond = () =>
  success({
    items: [SCHOOL_LIST_ITEM],
    pagination: { page: 1, limit: 20, hasNext: false },
  })

const savedWindow = globalThis.window

before(async () => {
  server = await createServer({
    cacheDir: "/tmp/foodprint-supplier-schools-tests-vite",
    server: { middlewareMode: true, hmr: false, ws: false },
    optimizeDeps: { noDiscovery: true, entries: [] },
    appType: "custom",
  })

  globalThis.window = {
    location: { replace: () => assert.fail("Unexpected navigation redirect") },
  }

  http = (await server.ssrLoadModule("/src/services/01_axios/index.js")).default
  SupplierSchoolServiceModule = await server.ssrLoadModule(
    "/src/services/SupplierSchoolService/index.js",
  )
  SupplierSchoolService = SupplierSchoolServiceModule.default
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
      items: [SCHOOL_LIST_ITEM],
      pagination: { page: 1, limit: 20, hasNext: false },
    })
})

after(async () => {
  if (savedWindow === undefined) delete globalThis.window
  else globalThis.window = savedWindow
  await server?.close()
})

test("Sidebar menu exposes Trường đã liên kết exclusively to Ingredient Supplier Admin", () => {
  const { ROLES } = RolesModule
  const { hasPermission } = UtilsModule
  const supplierMenu = MenuItemModule.MenuItemSupplier()
  const linkedSchoolsItem = supplierMenu.find(
    item => item.key === "/supplier/schools",
  )

  assert.ok(linkedSchoolsItem)
  assert.equal(linkedSchoolsItem.label, "Trường đã liên kết")
  assert.deepEqual(linkedSchoolsItem.roles, [ROLES.INGREDIENT_SUPPLIER_ADMIN])
  assert.equal(
    hasPermission(linkedSchoolsItem.roles, ROLES.INGREDIENT_SUPPLIER_ADMIN),
    true,
  )
  assert.equal(
    hasPermission(linkedSchoolsItem.roles, ROLES.INGREDIENT_SUPPLIER_STAFF),
    false,
  )
  assert.equal(
    hasPermission(linkedSchoolsItem.roles, ROLES.SYSTEM_ADMIN),
    false,
  )
})

test("listSchools sends strictly page and limit query params only and preserves null school code", async () => {
  respond = () =>
    success({
      items: [{ ...SCHOOL_LIST_ITEM, code: null }],
      pagination: { page: 2, limit: 50, hasNext: true },
    })

  const result = await SupplierSchoolService.listSchools({
    page: 2,
    limit: 50,
    search: "ignored",
    status: "ACTIVE",
  })

  assert.equal(requests.length, 1)
  assert.equal(requests[0].method, "get")
  assert.equal(requests[0].url, "/supplier-schools")
  assert.deepEqual(requests[0].params, { page: 2, limit: 50 })
  assert.equal(result.items[0].code, null)
  assert.equal(
    SupplierSchoolServiceModule.formatSchoolCode(result.items[0].code),
    "Chưa có mã",
  )
  assert.deepEqual(result.pagination, { page: 2, limit: 50, hasNext: true })
})

test("getSchoolById normalizes UUID lowercase and sends empty query params", async () => {
  respond = () => success(SCHOOL_DETAIL)

  const detail = await SupplierSchoolService.getSchoolById(
    SCHOOL_ID.toUpperCase(),
  )

  assert.equal(requests[0].url, `/supplier-schools/${SCHOOL_ID}`)
  assert.equal(requests[0].params, undefined)
  assert.equal(detail.code, "TH-BM-01")
  assert.equal(detail.status, "ACTIVE")
  assert.equal(detail.relationship.status, "SUSPENDED")
  assert.equal(detail.relationship.suspensionReason, "Chờ cập nhật phụ lục giá mới")
})

test("listContracts and getContractById use scoped endpoints and preserve status independently from dates", async () => {
  respond = config => {
    if (config.url.endsWith("/contracts")) {
      return success({
        items: [CONTRACT_ITEM],
        pagination: { page: 1, limit: 20, hasNext: false },
      })
    }
    return success({ ...CONTRACT_ITEM, status: "CLOSED", closeReason: "Đã hoàn tất" })
  }

  const listResult = await SupplierSchoolService.listContracts(
    SCHOOL_ID.toUpperCase(),
    { page: -4, limit: 250 },
  )
  assert.equal(requests[0].url, `/supplier-schools/${SCHOOL_ID}/contracts`)
  assert.deepEqual(requests[0].params, { page: 1, limit: 20 })
  assert.equal(listResult.items[0].number, "HD-2026/BM-01")

  const detail = await SupplierSchoolService.getContractById(
    SCHOOL_ID,
    CONTRACT_ID.toUpperCase(),
  )
  assert.equal(
    requests[1].url,
    `/supplier-schools/${SCHOOL_ID}/contracts/${CONTRACT_ID}`,
  )
  assert.equal(requests[1].params, undefined)
  assert.equal(detail.status, "CLOSED")
  assert.equal(detail.closeReason, "Đã hoàn tất")
  assert.deepEqual(
    SupplierSchoolServiceModule.getContractStatusMeta("ACTIVE"),
    { label: "Đã kích hoạt", tone: "success" },
  )
})

test("getDocumentContent passes disposition param, validates Blob & MIME, and extracts JSON error blobs", async () => {
  const pdfBlob = new Blob(["%PDF-1.4 fake"], { type: "application/pdf" })
  http.defaults.adapter = async config => {
    requests.push(config)
    return { status: 200, statusText: "OK", headers: {}, config, data: pdfBlob }
  }

  const doc = await SupplierSchoolService.getDocumentContent({
    schoolId: SCHOOL_ID.toUpperCase(),
    contractId: CONTRACT_ID.toUpperCase(),
    documentId: DOC_ID.toUpperCase(),
    disposition: "inline",
  })

  assert.equal(
    requests[0].url,
    `/supplier-schools/${SCHOOL_ID}/contracts/${CONTRACT_ID}/documents/${DOC_ID}`,
  )
  assert.deepEqual(requests[0].params, { disposition: "inline" })
  assert.equal(requests[0].responseType, "blob")
  assert.equal(doc.mimeType, "application/pdf")
  assert.ok(doc.size > 0)

  // Reject empty blob
  http.defaults.adapter = async config => {
    requests.push(config)
    return {
      status: 200,
      statusText: "OK",
      headers: {},
      config,
      data: new Blob([], { type: "application/pdf" }),
    }
  }
  await assert.rejects(
    SupplierSchoolService.getDocumentContent({
      schoolId: SCHOOL_ID,
      contractId: CONTRACT_ID,
      documentId: DOC_ID,
    }),
    /trống/,
  )

  // Extract JSON message from Blob error response
  const errorBlob = new Blob(
    [JSON.stringify({ message: "Tệp hợp đồng không còn tồn tại trên hệ thống" })],
    { type: "application/json" },
  )
  const axiosError = new AxiosError("Service Unavailable", "ERR_BAD_RESPONSE")
  axiosError.response = { status: 503, data: errorBlob }
  const extracted = await SupplierSchoolServiceModule.extractBlobError(axiosError)
  assert.equal(extracted.status, 503)
  assert.equal(extracted.message, "Tệp hợp đồng không còn tồn tại trên hệ thống")

  // Restore adapter
  http.defaults.adapter = async config => {
    requests.push(config)
    const payload = await respond(config)
    return { status: 200, statusText: "OK", headers: {}, config, data: payload }
  }
})

test("formatDateVi, formatFileSize, and sanitizeExternalUrl handle edge cases safely", () => {
  const { formatDateVi, formatFileSize, sanitizeExternalUrl, sanitizeImageUrl } =
    SupplierSchoolServiceModule

  assert.equal(formatDateVi("2026-10-01"), "01/10/2026")
  assert.equal(formatDateVi(null), "Chưa cập nhật")
  assert.equal(formatFileSize(512), "512 B")
  assert.equal(formatFileSize(1536), "1.5 KB")
  assert.equal(formatFileSize(2 * 1024 * 1024), "2.0 MB")
  assert.equal(sanitizeExternalUrl("javascript:alert(1)"), null)
  assert.equal(sanitizeExternalUrl("https://user:pass@example.com"), null)
  assert.equal(
    sanitizeExternalUrl("https://binhminh.edu.vn"),
    "https://binhminh.edu.vn/",
  )
  assert.equal(sanitizeImageUrl("//evil.example/a.png"), null)
  assert.equal(sanitizeImageUrl("/uploads/school-logo.png"), "/uploads/school-logo.png")
})
