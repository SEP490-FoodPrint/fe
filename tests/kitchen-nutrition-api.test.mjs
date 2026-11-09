import assert from "node:assert/strict"
import { after, before, beforeEach, test } from "node:test"
import { AxiosError } from "axios"
import { createServer } from "vite"

let server, http, menus, kitchen, adapter, keys, respond
let requests = []
const memory = new Map()
const originalWindow = globalThis.window
const originalStorage = globalThis.localStorage
const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`
const ingredient = (n, quantity, unit = "g") => ({ ingredientId: id(n), quantityPerPortion: quantity, unit, ingredient: { name: `Ingredient ${n}` } })
const dish = (mealType, n, quantity) => ({ mealType, dishId: id(n), Dish: { name: `Dish ${n}` }, ingredients: [ingredient(n + 10, quantity)] })
const snapshot = () => ({
  id: id(1), status: "DRAFT", weekStartDate: "2026-11-02", title: "Week",
  menuDays: [
    { id: id(2), menuDate: "2026-11-02", approvalStatus: "DRAFT", note: "Monday note", menuDayDishes: [dish("LUNCH", 3, "80.125"), dish("AFTERNOON", 4, "120.250")], mealSeasonings: [{ mealType: "LUNCH", ingredientEntryId: id(21), quantityPerPortion: "0.125", unit: "g" }, { mealType: "AFTERNOON", ingredientEntryId: id(22), quantityPerPortion: "0.250", unit: "g" }], portionGroups: [] },
    { id: id(5), menuDate: "2026-11-03", approvalStatus: "DRAFT", note: "Tuesday note", menuDayDishes: [dish("LUNCH", 6, "90.375")], mealSeasonings: [], portionGroups: [] },
  ],
})
const edits = () => ({ formState: { name: "Edited", date: "02/11/2026", mealType: "LUNCH", notes: "Edited note" }, dishes: [{ dishId: id(3), name: "Dish 3", ingredientStandards: [{ ingredientId: id(13), quantityPerPortion: "81.125", unit: "g" }, { ingredientId: id(14), quantityPerPortion: "0.375", unit: "kg" }] }], seasonings: [{ ingredientEntryId: id(21), quantityPerPortion: "0.625", unit: "g" }] })

before(async () => {
  server = await createServer({ configLoader: "runner", server: { middlewareMode: true, hmr: false, ws: false }, optimizeDeps: { noDiscovery: true, entries: [] }, appType: "custom" })
  globalThis.window = { location: { replace: () => assert.fail("Unexpected authentication redirect") } }
  globalThis.localStorage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, String(value)), removeItem: key => memory.delete(key) }
  http = (await server.ssrLoadModule("/src/services/01_axios/index.js")).default
  menus = (await server.ssrLoadModule("/src/services/MenuService/index.js")).default
  kitchen = (await server.ssrLoadModule("/src/services/KitchenService/index.js")).default
  adapter = await server.ssrLoadModule("/src/services/MenuService/adapter.js")
  keys = (await server.ssrLoadModule("/src/lib/storage.js")).default
  http.defaults.adapter = async config => {
    requests.push(config)
    return { status: 200, statusText: "OK", headers: {}, config, data: { success: true, data: await respond(config) } }
  }
})
beforeEach(() => {
  memory.clear()
  requests = []
  menus.invalidateMenuCache()
  respond = () => ({ items: [], pagination: { totalItems: 0 } })
})
after(async () => {
  await server?.close()
  if (originalWindow === undefined) delete globalThis.window; else globalThis.window = originalWindow
  if (originalStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = originalStorage
})

test("menu filters send server enums, dates and search and cache by user scope", async () => {
  memory.set(keys.USER_INFO, JSON.stringify({ id: id(31), schoolId: id(32) }))
  const query = { status: "REVISION_REQUESTED", weekStartDate: "2026-11-02", date: "2026-11-03", search: "  Rice  " }
  await menus.getMenus(query)
  assert.deepEqual(requests[0].params, { limit: 50, page: 1, status: "REVISION_REQUIRED", weekStartDate: query.weekStartDate, date: query.date, search: "Rice" })
  await menus.getMenus(query)
  assert.equal(requests.length, 1)
  memory.set(keys.USER_INFO, JSON.stringify({ id: id(33), schoolId: id(34) }))
  await menus.getMenus(query)
  assert.equal(requests.length, 2)
})

test("week schedule loads actual dishes and separate seasoning standards for both meals", async () => {
  respond = config => config.url.endsWith("/week-schedule")
    ? { weeklyMenuId: id(1), weekNumber: 9, days: [{ date: "2026-11-02", status: "DRAFT" }] }
    : snapshot()
  const result = await menus.getWeekSchedule("2026-11-02")
  assert.equal(result.data.weekNumber, 9)
  assert.equal(result.data.days[0].meals.LUNCH.dishes[0].dishId, id(3))
  assert.equal(result.data.days[0].meals.AFTERNOON.dishes[0].ingredientStandards[0].quantityPerPortion, "120.250")
  assert.equal(result.data.days[0].seasoningsByMeal.AFTERNOON[0].quantityPerPortion, "0.250")
  assert.equal(requests.length, 2)
  await menus.getWeekSchedule("2026-11-04")
  assert.equal(requests.length, 2)
})

test("editing one meal preserves every other meal/day and exact per-ingredient decimals", async () => {
  respond = config => config.method === "get" ? snapshot() : { id: id(1) }
  await menus.updateMenu(`${id(1)}_${id(2)}_LUNCH`, edits())
  assert.equal(requests[0].method, "get")
  const saved = JSON.parse(requests[1].data)
  assert.equal(saved.days.length, 2)
  assert.equal(saved.days[1].note, "Tuesday note")
  assert.equal(saved.days[1].meals[0].dishes[0].ingredients[0].quantityPerPortion, "90.375")
  const afternoon = saved.days[0].meals.find(meal => meal.mealType === "AFTERNOON")
  assert.equal(afternoon.dishes[0].ingredients[0].quantityPerPortion, "120.250")
  assert.equal(afternoon.seasonings[0].quantityPerPortion, "0.250")
  const lunch = saved.days[0].meals.find(meal => meal.mealType === "LUNCH")
  assert.deepEqual(lunch.dishes[0].ingredients, edits().dishes[0].ingredientStandards)
  assert.equal(saved.days[0].note, "Edited note")
  assert.equal(requests[1].headers.get("X-CSRF-Protection"), "1")
  assert.equal(requests[1].withCredentials, true)
})

test("failed snapshots, approved menus and moving a selected day never issue PUT", async () => {
  for (const row of [null, { ...snapshot(), status: "APPROVED" }]) {
    requests = []
    respond = () => row
    await assert.rejects(menus.updateMenu(`${id(1)}_${id(2)}_LUNCH`, edits()), Error)
    assert.equal(requests.some(config => config.method === "put"), false)
  }
  respond = () => snapshot()
  const changed = edits()
  changed.formState.date = "03/11/2026"
  await assert.rejects(menus.updateMenu(`${id(1)}_${id(2)}_LUNCH`, changed), Error)
  assert.equal(requests.some(config => config.method === "put"), false)
})

test("sample picker sends hasSample=false and a data:null sample stays null", async () => {
  await kitchen.getBatches({ status: "COMPLETED", hasSample: false })
  assert.equal(requests[0].params.hasSample, "false")
  respond = () => null
  assert.equal(await kitchen.getBatchSample(id(41)), null)
})

test("sample filters and KPI can see records beyond the first backend page", async () => {
  respond = config => ({ items: Array.from({ length: config.params.page === 1 ? 100 : 1 }, (_, index) => ({ id: `sample-${config.params.page}-${index}` })), pagination: { totalItems: 101 } })
  const result = await kitchen.getAllRetainedSamples()
  assert.equal(result.items.length, 101)
  assert.deepEqual(requests.map(config => config.params.page), [1, 2])
})

test("batch writes use actual endpoints and completion sends no manually entered totals", async () => {
  respond = () => ({ created: true, batches: [{ id: id(44), status: "UNCONFIRMED" }] })
  await kitchen.planBatch({ dishId: id(3), menuDayId: id(2), mealType: "LUNCH", plannedPortions: 999 })
  assert.deepEqual(JSON.parse(requests[0].data), { dishId: id(3), menuDayId: id(2), mealType: "LUNCH" })
  await kitchen.confirmBatch(id(44))
  await kitchen.completeBatch(id(44))
  assert.equal(requests[1].url, `/v1/kitchen/${id(44)}/confirm`)
  assert.equal(requests[2].url, `/v1/kitchen/${id(44)}/complete`)
  assert.deepEqual(JSON.parse(requests[2].data), {})
  await kitchen.deleteBatch(id(44))
  assert.equal(requests[3].method, "delete")
})

test("write failures propagate instead of reporting local success", async () => {
  respond = config => { throw new AxiosError("Rejected", "ERR_BAD_RESPONSE", config, null, { status: 409, data: { success: false, message: "Stock changed" }, headers: {}, config }) }
  await assert.rejects(kitchen.confirmBatch(id(44)), /Stock changed/)
  await assert.rejects(menus.submitMenu(id(1)), /Stock changed/)
})

test("detail adapter preserves the note and fractional recipe quantities for editing", () => {
  const result = adapter.adaptBackendMenuDetailToView(snapshot(), id(2), "LUNCH")
  assert.equal(result.notes, "Monday note")
  assert.equal(result.dishes[0].ingredientStandards[0].quantityPerPortion, "80.125")
})

test("allergy group displays the explicitly assigned dish rather than inventing a substitute", () => {
  const menu = snapshot()
  menu.menuDays[0].portionGroups = [{ mealType: "LUNCH", isDefault: false, name: "Selected group", dishes: [{ dishId: id(3) }] }]
  const result = adapter.adaptBackendMenuDetailToView(menu, id(2), "LUNCH")
  assert.equal(result.substituteDish.dishId, id(3))
  assert.equal(result.substituteDish.name, "Dish 3")
  menu.menuDays[0].portionGroups[0].dishes = []
  assert.equal(adapter.adaptBackendMenuDetailToView(menu, id(2), "LUNCH").substituteDish, null)
})
