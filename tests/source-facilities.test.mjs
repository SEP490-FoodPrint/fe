import assert from "node:assert/strict"
import { after, before, beforeEach, test } from "node:test"
import { createServer } from "vite"

let server
let SourceFacilityServiceModule
let SourceFacilityService
let MenuItemModule
let RolesModule
let UtilsModule

const memoryStorage = new Map()
const savedWindow = globalThis.window

before(async () => {
  server = await createServer({
    cacheDir: "/tmp/foodprint-source-facility-tests-vite",
    server: { middlewareMode: true, hmr: false, ws: false },
    optimizeDeps: { noDiscovery: true, entries: [] },
    appType: "custom",
  })

  globalThis.window = {
    sessionStorage: {
      getItem: key => memoryStorage.get(key) ?? null,
      setItem: (key, value) => memoryStorage.set(key, String(value)),
      removeItem: key => memoryStorage.delete(key),
    },
  }

  SourceFacilityServiceModule = await server.ssrLoadModule(
    "/src/services/SourceFacilityService/index.js",
  )
  SourceFacilityService = SourceFacilityServiceModule.default
  MenuItemModule = await server.ssrLoadModule("/src/router/MenuItem.jsx")
  RolesModule = await server.ssrLoadModule("/src/constants/roles.js")
  UtilsModule = await server.ssrLoadModule("/src/lib/utils.jsx")
})

beforeEach(() => {
  memoryStorage.clear()
})

after(async () => {
  globalThis.window = savedWindow
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

test("Mock facilities list includes all required fields and attention states", async () => {
  const result = await SourceFacilityService.list()
  assert.equal(result.isMock, true)
  assert.ok(result.demoNotice.includes("Dữ liệu minh họa"))
  assert.ok(result.items.length >= 6)

  const attentionCount = result.items.filter(
    item => SourceFacilityServiceModule.getFacilityAttention(item).needsAttention,
  ).length
  const activeCount = result.items.filter(
    item => item.cooperationStatus === "ACTIVE",
  ).length
  const pausedCount = result.items.filter(
    item => item.cooperationStatus === "PAUSED",
  ).length

  assert.ok(activeCount >= 1)
  assert.ok(pausedCount >= 1)
  assert.ok(attentionCount >= 3)
})

test("Validation catches required fields, invalid phone, and invalid expiry dates", () => {
  const { validateFacilityForm } = SourceFacilityServiceModule

  const invalidResult = validateFacilityForm(
    {
      code: "",
      name: "",
      facilityType: "",
      cooperationStatus: "",
      address: "",
      contactName: "",
      contactPhone: "12345",
      contactEmail: "bad-email",
      certifications: [
        {
          name: "",
          certificateNumber: "",
          issuedDate: "2026-06-01",
          expiryDate: "2026-05-01",
        },
      ],
    },
    { mode: "create", existingFacilities: [] },
  )

  assert.equal(invalidResult.isValid, false)
  assert.ok(invalidResult.fieldErrors.code)
  assert.ok(invalidResult.fieldErrors.name)
  assert.ok(invalidResult.fieldErrors.address)
  assert.ok(invalidResult.fieldErrors.contactName)
  assert.ok(invalidResult.fieldErrors.contactPhone)
  assert.ok(invalidResult.fieldErrors.contactEmail)
  assert.ok(invalidResult.certErrors[0].name)
  assert.ok(invalidResult.certErrors[0].certificateNumber)
  assert.ok(invalidResult.certErrors[0].expiryDate)

  const pastExpiryResult = validateFacilityForm(
    {
      code: "CS-TEST-01",
      name: "Trang trại kiểm thử",
      facilityType: "FARM",
      cooperationStatus: "ACTIVE",
      address: "Ba Vì, Hà Nội",
      contactName: "Nguyễn Văn A",
      contactPhone: "0912345678",
      certifications: [
        {
          name: "VietGAP",
          certificateNumber: "VG-01",
          issuedDate: "2024-01-01",
          expiryDate: "2025-01-01",
        },
      ],
    },
    {
      mode: "create",
      existingFacilities: [],
      referenceDate: new Date("2026-11-14T00:00:00"),
    },
  )

  assert.equal(pastExpiryResult.isValid, false)
  assert.ok(pastExpiryResult.certErrors[0].expiryDate)
})

test("Create and update persist in mock session storage", async () => {
  const created = await SourceFacilityService.create({
    code: "cs-new-99",
    name: "Hợp tác xã Mộc Châu",
    facilityType: "COOPERATIVE",
    cooperationStatus: "ACTIVE",
    address: "Thị trấn Mộc Châu, Sơn La",
    contactName: "Hoàng Thị Lan",
    contactPhone: "+84 912 345 678",
    contactEmail: "lan.ht@mocchau.example",
    suppliedIngredients: [{ name: "Su su", unit: "kg", standard: "VietGAP" }],
    certifications: [
      {
        name: "VietGAP",
        certificateNumber: "VG-SL-2026-99",
        issuer: "Sở NN&PTNT Sơn La",
        issuedDate: "2026-01-10",
        expiryDate: "2028-01-10",
      },
    ],
  })

  assert.equal(created.code, "CS-NEW-99")
  assert.equal(created.contactPhone, "+84912345678")

  const loaded = await SourceFacilityService.getById(created.id)
  assert.equal(loaded.name, "Hợp tác xã Mộc Châu")

  const updated = await SourceFacilityService.update(created.id, {
    ...loaded,
    cooperationStatus: "PAUSED",
    contactPhone: "0988777666",
  })

  assert.equal(updated.cooperationStatus, "PAUSED")
  assert.equal(updated.contactPhone, "0988777666")
})
