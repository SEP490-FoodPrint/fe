import assert from "node:assert/strict"
import { after, before, test } from "node:test"
import { createServer } from "vite"

let server, http, service, requests
const success = data => ({ success: true, statusCode: 200, data })
const users = [
  { id: "school-admin", roleId: "school-role", schoolId: "school-1" },
  { id: "supplier-admin", roleId: "supplier-role", supplierId: "supplier-1" },
  { id: "officer", roleId: "officer-role", communeFoodSafetyUnitId: "unit-1" },
]
const roles = [
  { id: "school-role", code: "SCHOOL_ADMINISTRATION" },
  { id: "supplier-role", code: "INGREDIENT_SUPPLIER_ADMIN" },
  { id: "officer-role", code: "COMMUNE_FOOD_SAFETY_OFFICER" },
]
before(async () => {
  server = await createServer({ cacheDir: "/tmp/foodprint-lifecycle-tests-vite", server: { middlewareMode: true, hmr: false, ws: false }, optimizeDeps: { noDiscovery: true, entries: [] }, appType: "custom" })
  http = (await server.ssrLoadModule("/src/services/01_axios/index.js")).default
  service = await server.ssrLoadModule("/src/services/SystemDirectoryService/lifecycle.js")
  http.defaults.adapter = async config => {
    requests.push(config)
    let data
    if (config.url === "/users" || config.url === "/auth/roles") {
      const all = config.url === "/users" ? users : roles
      const page = config.params.page
      data = { items: page === 1 ? all.slice(0, 2) : all.slice(2), pagination: { hasNext: page === 1 } }
    } else if (config.url.endsWith("/lifecycle")) data = { userId: config.url.split("/")[2], intakeState: "ACTIVE", accountStatus: "ACTIVE" }
    else data = {}
    return { status: 200, statusText: "OK", headers: {}, config, data: success(data) }
  }
})
after(async () => { await server?.close() })

test("resolves officers and each organization administrator across pages", async () => {
  requests = []
  assert.deepEqual((await service.getOfficerDirectory()).map(user => user.id), ["officer"])
  assert.equal((await service.getLifecycleTarget("school", "school-1")).user.id, "school-admin")
  assert.equal((await service.getLifecycleTarget("supplier", "supplier-1")).user.id, "supplier-admin")
  assert.equal((await service.getLifecycleTarget("officer", "officer")).user.id, "officer")
  await assert.rejects(service.getLifecycleTarget("school", "missing"), /Không tìm thấy/)
  assert.ok(requests.some(request => request.url === "/users" && request.params.page === 2))
})

test("lifecycle writes use the published endpoints and payloads", async () => {
  requests = []
  await service.setIntakeState("supplier-admin", "PAUSED_FOR_FOOD_SAFETY_INSPECTION")
  await service.deactivateAccount("officer")
  assert.deepEqual(requests.map(request => [request.method, request.url, JSON.parse(request.data)]), [
    ["patch", "/users/supplier-admin/intake-state", { state: "PAUSED_FOR_FOOD_SAFETY_INSPECTION" }],
    ["post", "/users/officer/deactivate", {}],
  ])
})
