import assert from "node:assert/strict"
import { realpathSync } from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import { after, before, test } from "node:test"
import { createServer } from "vite"

const SUPPLIER_ID = "00000000-0000-4000-8000-000000000601"
const RICE = "00000000-0000-4000-8000-000000000701"
const FISH = "00000000-0000-4000-8000-000000000702"

const SUPPLIED = [
  {
    ingredientId: RICE,
    name: "Gạo tẻ",
    unit: "kg",
    category: "Ngũ cốc",
    handlingType: "DRY_STOCK",
    contracts: [
      { id: "c1", number: "HĐ-01", startsOn: "2026-01-01", endsOn: "2026-12-31" },
    ],
  },
  {
    ingredientId: FISH,
    name: "Cá basa",
    unit: "kg",
    category: "Thủy sản",
    handlingType: null,
    contracts: [
      { id: "c1", number: "HĐ-01", startsOn: "2026-01-01", endsOn: "2026-12-31" },
    ],
  },
]

let server
let helpers
let Service
let http
let React
let renderToString
let SuppliedIngredients
let requests = []
const savedWindow = globalThis.window

before(async () => {
  server = await createServer({
    cacheDir: "/tmp/foodprint-supplier-handling-tests-vite",
    server: { middlewareMode: true, hmr: false, ws: false },
    optimizeDeps: { noDiscovery: true, entries: [] },
    appType: "custom",
  })
  globalThis.window = {
    location: { replace: () => assert.fail("Unexpected navigation redirect") },
  }
  helpers = await server.ssrLoadModule("/src/lib/ingredientHandling.js")
  http = (await server.ssrLoadModule("/src/services/01_axios/index.js")).default
  Service = (
    await server.ssrLoadModule("/src/services/SupplierRelationshipService/index.js")
  ).default
  // Nạp React theo cùng root của Vite để component và renderer dùng chung một bản React
  // (Vite resolve module theo realpath; trên Windows chữ ổ đĩa có thể khác cwd)
  const requireFromRoot = createRequire(
    path.join(realpathSync.native(server.config.root), "package.json"),
  )
  React = requireFromRoot("react")
  ;({ renderToString } = requireFromRoot("react-dom/server"))
  SuppliedIngredients = (
    await server.ssrLoadModule(
      "/src/pages/SCHOOL/SupplierRelationships/component/SuppliedIngredients.jsx",
    )
  ).default
  http.defaults.adapter = async (config) => {
    requests.push(config)
    return {
      status: 200,
      statusText: "OK",
      headers: {},
      config,
      data: { success: true, statusCode: 200, data: { changes: [] } },
    }
  }
})

after(async () => {
  if (savedWindow === undefined) delete globalThis.window
  else globalThis.window = savedWindow
  await server?.close()
})

test("draft form cannot be saved while a selected ingredient has no handling type", () => {
  const handling = helpers.toHandlingMap([
    { ingredientId: RICE, handlingType: "DRY_STOCK" },
    { ingredientId: FISH, handlingType: null },
  ])
  assert.deepEqual(handling, { [RICE]: "DRY_STOCK", [FISH]: "" })
  assert.deepEqual(helpers.missingHandling([RICE, FISH], handling), [FISH])
  assert.deepEqual(
    helpers.missingHandling([RICE, FISH], { ...handling, [FISH]: "DIRECT_USE" }),
    [],
  )
  assert.deepEqual(
    helpers.contractItems([RICE, FISH], { [RICE]: "DRY_STOCK", [FISH]: "DIRECT_USE" }),
    [
      { ingredientId: RICE, handlingType: "DRY_STOCK" },
      { ingredientId: FISH, handlingType: "DIRECT_USE" },
    ],
  )
})

test("only rows whose handling type changed are sent for confirmation", () => {
  const changes = helpers.handlingChanges(SUPPLIED, {
    [RICE]: "DIRECT_USE",
    [FISH]: "",
  })
  assert.deepEqual(changes, [
    { ingredientId: RICE, name: "Gạo tẻ", from: "DRY_STOCK", to: "DIRECT_USE" },
  ])
  assert.equal(
    `${helpers.handlingText(changes[0].from)} → ${helpers.handlingText(changes[0].to)}`,
    "Lưu kho → Dùng ngay",
  )
  assert.equal(helpers.handlingText(null), "Chưa chọn")
})

test("service saves the whole table in one PUT request", async () => {
  requests = []
  await Service.updateIngredientHandling(SUPPLIER_ID, [
    { ingredientId: RICE, handlingType: "DIRECT_USE" },
  ])
  assert.equal(requests.length, 1)
  assert.equal(requests[0].method, "put")
  assert.equal(
    requests[0].url,
    `/supplier-partnerships/${SUPPLIER_ID}/ingredient-handling`,
  )
  assert.deepEqual(JSON.parse(requests[0].data), {
    items: [{ ingredientId: RICE, handlingType: "DIRECT_USE" }],
  })
})

test("supplied ingredient table shows labels and hides edit without permission", () => {
  const render = (canManage) =>
    renderToString(
      React.createElement(SuppliedIngredients, {
        items: SUPPLIED,
        canManage,
        onSave: async () => {},
      }),
    )
  const viewer = render(false)
  assert.match(viewer, /Nguyên liệu cung cấp cho trường/)
  assert.match(viewer, /Lưu kho/)
  assert.match(viewer, /Chưa chọn/)
  assert.match(viewer, /HĐ-01/)
  assert.doesNotMatch(viewer, /Chỉnh sửa/)
  assert.match(render(true), /Chỉnh sửa/)
})
