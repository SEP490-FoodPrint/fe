import assert from "node:assert/strict"
import { after, before, beforeEach, test } from "node:test"
import { createServer } from "vite"

const ROLE_SYS_ID = "00000000-0000-4000-8000-000000000001"
const ROLE_BGH_ID = "00000000-0000-4000-8000-000000000002"
const ROLE_SUP_STAFF_ID = "00000000-0000-4000-8000-000000000003"
const PERM_MENU_VIEW_ID = "10000000-0000-4000-8000-000000000011"
const PERM_MENU_APPROVE_ID = "10000000-0000-4000-8000-000000000012"
const PERM_INACTIVE_ID = "10000000-0000-4000-8000-000000000013"

const success = (data, statusCode = 200) => ({
  success: true,
  statusCode,
  data,
})

let server
let http
let SystemConfigServiceModule
let SystemConfigService
let MenuItemModule
let RouterModule
let RolesModule
let UtilsModule

let requests = []
let respond = () => success({ items: [], pagination: { page: 1, limit: 100, hasNext: false } })

const savedWindow = globalThis.window

before(async () => {
  server = await createServer({
    cacheDir: "/tmp/foodprint-system-config-tests-vite",
    server: { middlewareMode: true, hmr: false, ws: false },
    optimizeDeps: { noDiscovery: true, entries: [] },
    appType: "custom",
  })

  globalThis.window = {
    location: { replace: () => assert.fail("Unexpected navigation redirect") },
  }

  http = (await server.ssrLoadModule("/src/services/01_axios/index.js")).default
  SystemConfigServiceModule = await server.ssrLoadModule(
    "/src/services/SystemConfigService/index.js",
  )
  SystemConfigService = SystemConfigServiceModule.default
  MenuItemModule = await server.ssrLoadModule("/src/router/MenuItem.jsx")
  RouterModule = await server.ssrLoadModule("/src/router/ROUTER.js")
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
      items: [],
      pagination: { page: 1, limit: 100, hasNext: false },
    })
})

after(async () => {
  if (savedWindow === undefined) delete globalThis.window
  else globalThis.window = savedWindow
  await server?.close()
})

test("Sidebar and routes register Cấu hình hệ thống exclusively for SYSTEM_ADMIN", () => {
  const { ROLES } = RolesModule
  const { hasPermission } = UtilsModule
  const ROUTER = RouterModule.default
  const systemMenu = MenuItemModule.MenuItemSystem()
  const configItem = systemMenu.find(item => item.key === ROUTER.SYSTEM_CONFIG)

  assert.ok(configItem, "MenuItemSystem must include SYSTEM_CONFIG")
  assert.equal(configItem.label, "Cấu hình hệ thống")
  assert.equal(ROUTER.SYSTEM_CONFIG, "/system/config")
  assert.equal(ROUTER.SYSTEM_CONFIG_DETAIL, "/system/config/:id")
  assert.equal(hasPermission(configItem.roles, ROLES.SYSTEM_ADMIN), true)
  assert.equal(hasPermission(configItem.roles, ROLES.SCHOOL_ADMINISTRATION), false)
  assert.equal(hasPermission(configItem.roles, ROLES.INGREDIENT_SUPPLIER_ADMIN), false)
})

test("listAllManageableRoles sends strict page/limit params, paginates, and excludes SYSTEM_ADMIN", async () => {
  respond = config => {
    assert.equal(config.url, "/roles")
    assert.deepEqual(Object.keys(config.params || {}).sort(), ["limit", "page"])
    if (config.params.page === 1) {
      return success({
        items: [
          {
            id: ROLE_SYS_ID,
            code: "SYSTEM_ADMIN",
            name: "System Admin",
            type: "SYSTEM",
            editable: false,
          },
          {
            id: ROLE_BGH_ID,
            code: "SCHOOL_MANAGEMENT_BOARD",
            name: "School Management Board",
            type: "SCHOOL",
            editable: true,
          },
        ],
        pagination: { page: 1, limit: 100, hasNext: true },
      })
    }
    return success({
      items: [
        {
          id: ROLE_SUP_STAFF_ID,
          code: "INGREDIENT_SUPPLIER_STAFF",
          name: "Ingredient Supplier Staff",
          type: "SUPPLIER",
          editable: true,
        },
      ],
      pagination: { page: 2, limit: 100, hasNext: false },
    })
  }

  const roles = await SystemConfigService.listAllManageableRoles()
  assert.equal(requests.length, 2)
  assert.equal(roles.length, 2)
  assert.equal(roles.some(item => item.code === "SYSTEM_ADMIN"), false)
  assert.equal(roles[0].displayName, "Ban Giám Hiệu")
  assert.equal(roles[0].typeLabel, "Nhà trường")
  assert.equal(roles[1].displayName, "Nhân viên Nhà cung cấp (Supplier Staff)")
  assert.equal(roles[1].typeLabel, "Nhà cung cấp")
})

test("mergeCatalogWithRolePermissions combines catalog active/inactive with assigned grants cleanly", () => {
  const catalog = [
    {
      id: PERM_MENU_APPROVE_ID,
      code: "menu.approve",
      name: "Duyệt thực đơn",
      module: "menu",
      action: "approve",
      description: "Phê duyệt thực đơn",
      isActive: true,
    },
    {
      id: PERM_MENU_VIEW_ID,
      code: "menu.view",
      name: "Xem thực đơn",
      module: "menu",
      action: "view",
      description: "Xem thực đơn",
      isActive: true,
    },
    {
      id: PERM_INACTIVE_ID,
      code: "report.export",
      name: "Xuất báo cáo",
      module: "reporting",
      action: "export",
      description: null,
      isActive: false,
    },
  ]

  const roleAssigned = [
    {
      id: PERM_MENU_VIEW_ID,
      code: "menu.view",
      name: "Xem thực đơn",
      module: "menu",
      action: "view",
      description: "Xem thực đơn",
      isActive: true,
    },
    {
      id: PERM_INACTIVE_ID,
      code: "report.export",
      name: "Xuất báo cáo",
      module: "reporting",
      action: "export",
      description: null,
      isActive: false,
    },
  ]

  const merged = SystemConfigServiceModule.mergeCatalogWithRolePermissions(
    catalog,
    roleAssigned,
  )

  assert.deepEqual(
    merged.map(item => ({
      code: item.code,
      assigned: item.assigned,
      isActive: item.isActive,
    })),
    [
      { code: "menu.approve", assigned: false, isActive: true },
      { code: "menu.view", assigned: true, isActive: true },
      { code: "report.export", assigned: true, isActive: false },
    ],
  )

  const unassigned = SystemConfigServiceModule.getUnassignedCatalogPermissions(
    catalog,
    roleAssigned,
  )
  assert.deepEqual(
    unassigned.map(item => item.code),
    ["menu.approve"],
  )
})

test("buildNextRolePermissionIds toggles grants without dropping existing inactive grants", () => {
  const current = [PERM_MENU_VIEW_ID, PERM_INACTIVE_ID]

  const added = SystemConfigServiceModule.buildNextRolePermissionIds(
    current,
    PERM_MENU_APPROVE_ID.toUpperCase(),
    true,
  )
  assert.deepEqual(added, [
    PERM_MENU_VIEW_ID,
    PERM_INACTIVE_ID,
    PERM_MENU_APPROVE_ID,
  ])

  const revoked = SystemConfigServiceModule.buildNextRolePermissionIds(
    current,
    PERM_INACTIVE_ID,
    false,
  )
  assert.deepEqual(revoked, [PERM_MENU_VIEW_ID])
})

test("replaceRolePermissions sends strict lowercase UUID list with X-CSRF-Protection header", async () => {
  respond = config => {
    assert.equal(config.method, "put")
    assert.equal(config.url, `/roles/${ROLE_BGH_ID}/permissions`)
    assert.equal(config.headers.get("X-CSRF-Protection"), "1")
    const body = typeof config.data === "string" ? JSON.parse(config.data) : config.data
    assert.deepEqual(body, {
      permissionIds: [PERM_MENU_VIEW_ID, PERM_MENU_APPROVE_ID],
    })
    return success({
      roleId: ROLE_BGH_ID,
      permissionIds: [PERM_MENU_VIEW_ID, PERM_MENU_APPROVE_ID],
    })
  }

  const result = await SystemConfigService.replaceRolePermissions(
    ROLE_BGH_ID.toUpperCase(),
    [
      PERM_MENU_VIEW_ID.toUpperCase(),
      PERM_MENU_APPROVE_ID,
      PERM_MENU_VIEW_ID,
    ],
  )

  assert.equal(result.roleId, ROLE_BGH_ID)
  assert.deepEqual(result.permissionIds, [PERM_MENU_VIEW_ID, PERM_MENU_APPROVE_ID])
})

test("getRolePermissions and replaceRolePermissions reject malformed UUIDs locally", async () => {
  await assert.rejects(
    () => SystemConfigService.getRolePermissions("not-a-uuid"),
    error => error?.response?.status === 400,
  )
  await assert.rejects(
    () => SystemConfigService.replaceRolePermissions(ROLE_BGH_ID, ["bad-uuid"]),
    error => error?.response?.status === 400,
  )
  assert.equal(requests.length, 0)
})
