import assert from "node:assert/strict"
import { after, before, test } from "node:test"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { createServer } from "vite"
import viteConfig from "../vite.config.js"
import { smallQuantity, formatSmallQuantity, formatSmallQuantityText } from "../src/utils/quantity.js"

test("operational quantities keep g/ml at every size and preserve decimal precision", () => {
  for (const [quantity, unit, expected] of [
    ["1.250", "kg", "1250 g"], ["0.000001", "kg", "0.001 g"],
    ["99999999.999", "kg", "99999999999 g"],
    ["2.5", "Lít", "2500 ml"], ["0.125", "L", "125 ml"],
    ["100000", "g", "100000 g"], ["100000", "ml", "100000 ml"],
    ["0", "kg", "0 g"],
  ]) assert.equal(formatSmallQuantity(quantity, unit), expected)
  assert.equal(formatSmallQuantityText("6 kg"), "6000 g")
  assert.equal(formatSmallQuantityText("46.8 lít"), "46800 ml")
})

test("unknown and count units, missing values and non-quantity labels remain safe", () => {
  assert.equal(formatSmallQuantity("4", "quả"), "4 quả")
  assert.equal(formatSmallQuantity("2", "hộp"), "2 hộp")
  assert.equal(formatSmallQuantity("1", "constructor"), "1 constructor")
  assert.equal(formatSmallQuantity(null, "kg"), "—")
  assert.equal(formatSmallQuantity("", "ml"), "—")
  assert.equal(formatSmallQuantityText("Theo định mức"), "Theo định mức")
  assert.deepEqual(smallQuantity("", "kg"), { quantity: "", unit: "g" })
})

let server
before(async () => { server = await createServer({ ...viteConfig, configFile: false, plugins: [], server: { middlewareMode: true, hmr: false, ws: false }, optimizeDeps: { noDiscovery: true, entries: [] }, appType: "custom" }) })
after(async () => { await server?.close() })

test("batch preview and sample list display small units without changing request quantities", async () => {
  const { default: Preview } = await server.ssrLoadModule("/src/pages/SCHOOL/KitchenCooking/CreateBatch/component/ProposedBatchSection.jsx")
  const plan = { id: "dish", name: "Món ăn", ingredients: [{ code: "lot", name: "Thịt", amount: "1.2 kg" }, { code: "s", name: "Nước mắm", amount: "0.25 l" }] }
  const original = structuredClone(plan)
  const html = renderToStaticMarkup(React.createElement(Preview, { selectedDish: plan }))
  assert.match(html, /1200 g/)
  assert.match(html, /250 ml/)
  assert.deepEqual(plan, original)
  const { default: Table } = await server.ssrLoadModule("/src/pages/SCHOOL/KitchenCooking/KitchenSamples/component/KitchenSamplesTable.jsx")
  const sampleHtml = renderToStaticMarkup(React.createElement(Table, { samples: [{ id: "s", quantity: "0.15", unit: "kg", status: "STORED" }] }))
  assert.match(sampleHtml, /150 g/)
  assert.doesNotMatch(sampleHtml, /Khối lượng \(gam\)/)
})

test("meal-wide seasoning totals stay in g/ml above a thousand", async () => {
  const { default: Seasonings } = await server.ssrLoadModule("/src/pages/SCHOOL/MenuPlanning/component/MenuSeasoningCard.jsx")
  const html = renderToStaticMarkup(React.createElement(Seasonings, { totalStudents: 1250, seasonings: [{ id: "g", portionQty: "1", unit: "g" }, { id: "ml", portionQty: "2", unit: "ml" }] }))
  assert.match(html, /1250 g/)
  assert.match(html, /2500 ml/)
  assert.doesNotMatch(html, /1\.25 Kg|2\.50 Lít/)
})

test("grade comparison aligns equivalent quantities stored in different units", async () => {
  const { gradeComparisonRows } = await server.ssrLoadModule("/src/services/MenuService/gradeDetail.js")
  const scopes = [
    { key: "g1", menu: { dishes: [{ dishId: "d", name: "Món ăn", ingredientDetails: [{ ingredientId: "i", name: "Thịt", quantityPerPortion: "0.1", unit: "kg" }] }] } },
    { key: "g2", menu: { dishes: [{ dishId: "d", name: "Món ăn", ingredientDetails: [{ ingredientId: "i", name: "Thịt", quantityPerPortion: "120", unit: "g" }] }] } },
  ]
  const snapshot = structuredClone(scopes)
  const rows = gradeComparisonRows(scopes)[0].rows
  assert.equal(rows.length, 1)
  assert.equal(rows[0].unit, "g")
  assert.deepEqual(rows[0].values, { g1: "100", g2: "120" })
  assert.deepEqual(scopes, snapshot)
})
