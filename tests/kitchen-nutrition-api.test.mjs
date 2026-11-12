import assert from "node:assert/strict"
import { after, before, beforeEach, test } from "node:test"
import { AxiosError } from "axios"
import { createServer } from "vite"

let server, http, menus, kitchen, adapter, keys, storageTools, respond
let requests = []
const memory = new Map()
const originalWindow = globalThis.window
const originalStorage = globalThis.localStorage
const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`
const ingredient = (n, quantity, unit = "g") => ({ ingredientId: id(n), quantityPerPortion: quantity, unit, ingredient: { name: `Ingredient ${n}` } })

test("substitute dish matches all grouped child batches and preserves day and meal scope", async () => {
  const {getDishBatchState} = await server.ssrLoadModule("/src/services/KitchenService/adapter.js")
  const batch = (n, day, mealType, dishes) => ({id:id(n),batchCode:`CB${n}`,menuDayId:day,mealType,dishId:null,dishes:dishes.map(d=>({dishId:d}))})
  const rows = [batch(30,id(2),"LUNCH",[id(3),id(9)]),batch(31,id(2),"LUNCH",[id(9)]),batch(32,id(5),"LUNCH",[id(9)]),batch(33,id(2),"AFTERNOON",[id(9)])]
  assert.deepEqual(getDishBatchState(rows,id(9),"LUNCH",id(2)),{isBatchCreated:true,batchCode:"CB30, CB31",batchId:id(30)})
  assert.equal(getDishBatchState(rows,id(99),"LUNCH",id(2)).isBatchCreated,false)
})

test("completed child can record its own pending dish samples while parent remains incomplete", async () => {
  const {canRecordBatchSample} = await server.ssrLoadModule("/src/services/KitchenService/adapter.js")
  const child = {status:"COMPLETED",BatchGroup:{status:"CONFIRMED"},dishes:[{dishId:id(3)},{dishId:id(9)}],retainedFoodSamples:[{dishId:id(3)}]}
  assert.equal(canRecordBatchSample(child),true)
  assert.equal(canRecordBatchSample({...child,status:"CONFIRMED"}),false)
  assert.equal(canRecordBatchSample({...child,retainedFoodSamples:[{dishId:id(3)},{dishId:id(9)}]}),false)
})
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
  storageTools = await server.ssrLoadModule("/src/lib/storage.js")
  keys = storageTools.default
  http.defaults.adapter = async config => {
    requests.push(config)
    return { status: 200, statusText: "OK", headers: {}, config, data: { success: true, data: await respond(config) } }
  }
})
beforeEach(() => {
  memory.clear()
  requests = []
  menus.invalidateMenuCache()
  kitchen.invalidateCache()
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

function deferred() {
  let resolve
  const promise = new Promise(done => { resolve = done })
  return { promise, resolve }
}
const batchPage = marker => ({ items: [{ id: marker }], pagination: { page: 1, limit: 10, totalItems: 1 } })
function kitchenIdentity(n = 31) {
  memory.set(keys.USER_INFO, JSON.stringify({ id: id(n), schoolId: id(n + 1), role: "SCHOOL_KITCHEN_STAFF" }))
}

test("kitchen cache never returns another user or school's list or context", async () => {
  kitchenIdentity()
  respond = config => config.url.endsWith("/context") ? { id: id(32), name: "School A" } : batchPage("A")
  assert.equal((await kitchen.getBatches()).items[0].id, "A")
  assert.equal((await kitchen.getContext()).name, "School A")
  kitchenIdentity(33)
  respond = config => config.url.endsWith("/context") ? { id: id(34), name: "School B" } : batchPage("B")
  assert.equal((await kitchen.getBatches()).items[0].id, "B")
  assert.equal((await kitchen.getContext()).name, "School B")
  assert.equal(requests.length, 4)
})

test("one caller aborting does not cancel another caller sharing the same kitchen read", async () => {
  kitchenIdentity()
  const entered = deferred(), response = deferred()
  respond = () => { entered.resolve(); return response.promise }
  const first = new AbortController(), second = new AbortController()
  const one = kitchen.getBatches({}, { signal: first.signal }).then(value => ({ value }), error => ({ error }))
  await entered.promise
  const two = kitchen.getBatches({}, { signal: second.signal }).then(value => ({ value }), error => ({ error }))
  first.abort()
  response.resolve(batchPage("shared"))
  assert.equal((await one).error?.code, "ERR_CANCELED")
  assert.equal((await two).value?.items[0].id, "shared")
  assert.equal(requests.length, 1)
})

test("late reads cannot repopulate cache after a successful kitchen mutation", async () => {
  kitchenIdentity()
  const entered = deferred(), oldResponse = deferred()
  let reads = 0
  respond = config => {
    if (config.method === "post") return { id: id(44), status: "CONFIRMED" }
    if (++reads === 1) { entered.resolve(); return oldResponse.promise }
    return batchPage("fresh")
  }
  const old = kitchen.getBatches().then(value => ({ value }), error => ({ error }))
  await entered.promise
  await kitchen.confirmBatch(id(44))
  assert.equal((await kitchen.getBatches()).items[0].id, "fresh")
  oldResponse.resolve(batchPage("obsolete"))
  await old
  assert.equal((await kitchen.getBatches()).items[0].id, "fresh")
  assert.equal(reads, 2)
})

test("an obsolete request cannot overwrite force refresh or remove its in-flight entry", async () => {
  kitchenIdentity()
  const entered = deferred(), oldResponse = deferred(), refreshedResponse = deferred(), refreshedEntered = deferred()
  let reads = 0
  respond = () => {
    if (++reads === 1) { entered.resolve(); return oldResponse.promise }
    refreshedEntered.resolve()
    return refreshedResponse.promise
  }
  const old = kitchen.getBatches().then(value => ({ value }), error => ({ error }))
  await entered.promise
  const refreshed = kitchen.getBatches({}, { forceRefresh: true })
  await refreshedEntered.promise
  oldResponse.resolve(batchPage("obsolete"))
  await old
  const follower = kitchen.getBatches()
  refreshedResponse.resolve(batchPage("refreshed"))
  assert.equal((await refreshed).items[0].id, "refreshed")
  assert.equal((await follower).items[0].id, "refreshed")
  assert.equal(reads, 2)
})

test("kitchen list cache expires after 20 seconds and callers cannot mutate cached results", async context => {
  kitchenIdentity()
  let now = 1000, reads = 0
  context.mock.method(Date, "now", () => now)
  respond = () => batchPage(`version-${++reads}`)
  const first = await kitchen.getBatches()
  first.items[0].id = "modified by caller"
  now += 19999
  assert.equal((await kitchen.getBatches()).items[0].id, "version-1")
  assert.equal(reads, 1)
  now += 1
  assert.equal((await kitchen.getBatches()).items[0].id, "version-2")
  assert.equal(reads, 2)
})

test("stats and school context deduplicate simultaneous reads and normalize pagination out of stats keys", async () => {
  kitchenIdentity()
  const statsGate = deferred(), statsEntered = deferred()
  respond = () => { statsEntered.resolve(); return statsGate.promise }
  const first = kitchen.getStats({ page: 1, limit: 10, search: "rice" })
  await statsEntered.promise
  const second = kitchen.getStats({ page: 2, limit: 20, search: "rice" })
  statsGate.resolve({ total: 2 })
  assert.equal((await first).total, 2)
  assert.equal((await second).total, 2)
  assert.equal(requests.length, 1)
  const contextGate = deferred(), contextEntered = deferred()
  respond = () => { contextEntered.resolve(); return contextGate.promise }
  const one = kitchen.getContext()
  await contextEntered.promise
  const two = kitchen.getContext()
  contextGate.resolve({ id: id(32), name: "School" })
  assert.equal((await one).id, id(32))
  assert.equal((await two).id, id(32))
  assert.equal(requests.length, 2)
})

test("transport is cancelled only after the last shared subscriber leaves and the next caller can reload", async () => {
  kitchenIdentity()
  const entered = deferred(), response = deferred()
  respond = () => { entered.resolve(); return response.promise }
  const first = new AbortController(), second = new AbortController()
  const one = kitchen.getBatches({}, { signal: first.signal }).catch(error => error)
  await entered.promise
  const two = kitchen.getBatches({}, { signal: second.signal }).catch(error => error)
  first.abort()
  assert.equal(requests[0].signal.aborted, false)
  second.abort()
  assert.equal(requests[0].signal.aborted, true)
  assert.equal((await one).code, "ERR_CANCELED")
  assert.equal((await two).code, "ERR_CANCELED")
  respond = () => batchPage("new subscriber")
  assert.equal((await kitchen.getBatches()).items[0].id, "new subscriber")
  response.resolve(batchPage("obsolete"))
})

test("already aborted callers never consume a cached response or start transport", async () => {
  kitchenIdentity()
  respond = () => batchPage("cached")
  await kitchen.getBatches()
  const cancelled = new AbortController()
  cancelled.abort()
  await assert.rejects(kitchen.getBatches({}, { signal: cancelled.signal }), error => error.code === "ERR_CANCELED")
  await assert.rejects(kitchen.getStats({}, { signal: cancelled.signal }), error => error.code === "ERR_CANCELED")
  assert.equal(requests.length, 1)
})

test("logout and signing in as the same account never reuse the previous session cache", async () => {
  const user = { id: id(31), schoolId: id(32), role: "SCHOOL_KITCHEN_STAFF" }
  storageTools.setStorage(keys.USER_INFO, user)
  respond = () => batchPage("before logout")
  await kitchen.getBatches()
  storageTools.deleteStorage(keys.USER_INFO)
  storageTools.setStorage(keys.USER_INFO, user)
  respond = () => batchPage("new session")
  assert.equal((await kitchen.getBatches()).items[0].id, "new session")
  assert.equal(requests.length, 2)
})

test("unidentified cookie sessions do not share private caches and invalid responses are not cached", async () => {
  let reads = 0
  respond = () => batchPage(`read-${++reads}`)
  await kitchen.getBatches()
  await kitchen.getBatches()
  assert.equal(reads, 2)
  kitchenIdentity()
  respond = () => null
  await assert.rejects(kitchen.getBatches(), Error)
  await assert.rejects(kitchen.getStats(), Error)
  await assert.rejects(kitchen.getContext(), Error)
  respond = () => batchPage("recovered")
  assert.equal((await kitchen.getBatches()).items[0].id, "recovered")
})

test("force refresh replaces an existing cache entry and subsequent readers join the refresh", async () => {
  kitchenIdentity()
  respond = () => batchPage("cached")
  await kitchen.getBatches()
  const entered = deferred(), response = deferred()
  respond = () => { entered.resolve(); return response.promise }
  const refresh = kitchen.getBatches({}, { forceRefresh: true })
  await entered.promise
  const following = kitchen.getBatches()
  response.resolve(batchPage("refreshed"))
  assert.equal((await refresh).items[0].id, "refreshed")
  assert.equal((await following).items[0].id, "refreshed")
  assert.equal(requests.length, 2)
})

test("kitchen query caches have a fixed entry bound", async context => {
  kitchenIdentity()
  context.mock.method(Date, "now", () => 1000)
  respond = config => batchPage(config.params.search)
  for (let index = 0; index <= 100; index++) await kitchen.getBatches({ search: `query-${index}` })
  await kitchen.getBatches({ search: "query-100" })
  assert.equal(requests.length, 101)
  await kitchen.getBatches({ search: "query-0" })
  assert.equal(requests.length, 102)
})

test("all supported kitchen mutations invalidate both list and stats reads", async () => {
  kitchenIdentity()
  const mutations = [
    () => kitchen.createBatch({ dishId: id(3), menuDayId: id(2), mealType: "LUNCH" }),
    () => kitchen.confirmBatch(id(44)), () => kitchen.completeBatch(id(44)),
    () => kitchen.deleteBatch(id(44)),
    () => kitchen.createBatchSample(id(44), { quantity: "150", unit: "g" }),
    () => kitchen.disposeRetainedSample(id(45), { disposalNote: "Recorded" }),
  ]
  let revision = 0
  respond = config => config.method !== "get" ? { id: id(44) }
    : config.url.endsWith("/stats") ? { total: revision } : batchPage(`revision-${revision}`)
  for (const mutate of mutations) {
    await kitchen.getBatches()
    await kitchen.getStats()
    revision++
    await mutate()
    assert.equal((await kitchen.getBatches()).items[0].id, `revision-${revision}`)
    assert.equal((await kitchen.getStats()).total, revision)
  }
})

test("legacy batch detail calls still work and reading all batches stops on an empty page", async () => {
  respond = () => ({ id: id(44), status: "CONFIRMED" })
  assert.equal((await kitchen.getBatchDetail(id(44))).id, id(44))
  respond = () => ({ items: [], pagination: { totalItems: 100 } })
  assert.deepEqual((await kitchen.getAllBatches()).items, [])
  assert.equal(requests.length, 2)
})
