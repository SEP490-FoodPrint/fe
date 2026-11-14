import assert from "node:assert/strict"
import { after, before, beforeEach, test } from "node:test"
import { AxiosError } from "axios"
import { createServer } from "vite"
import viteConfig from "../vite.config.js"

let server, http, menus, kitchen, adapter, keys, storageTools, respond
let requests = []

test("dish recipe form rejects missing, duplicate and invalid grade quantities", async () => {
  const { validRecipeLines } = await server.ssrLoadModule("/src/pages/SCHOOL/DishCatalog/component/GradeRecipeFields.jsx")
  const main = { ingredientEntryId: id(1), ingredientRole: "MAIN", requiredQuantity: "120.125", unit: "g" }
  const seasoning = { ingredientEntryId: id(2), ingredientRole: "SEASONING", requiredQuantity: "0.250", unit: "g" }
  assert.equal(validRecipeLines([main, seasoning]), true)
  assert.equal(validRecipeLines([seasoning]), false)
  assert.equal(validRecipeLines([main, { ...seasoning, ingredientEntryId: main.ingredientEntryId }]), false)
  for (const quantity of ["", "0", "1e3", "1.0001"]) assert.equal(validRecipeLines([{ ...main, requiredQuantity: quantity }]), false)
})

test("dish form applies entered quantities only to selected grades", async () => {
  const { sharedGradeRecipes } = await server.ssrLoadModule("/src/pages/SCHOOL/DishCatalog/component/GradeRecipeFields.jsx")
  const lines = [{ ingredientEntryId: id(1), ingredientRole: "MAIN", requiredQuantity: "75", unit: "g" }]
  const selected = [{ gradeId: id(50) }, { gradeId: id(51) }]
  const result = sharedGradeRecipes(selected, lines)
  assert.deepEqual(result.map(profile => profile.gradeId), [id(50), id(51)])
  assert.deepEqual(result.map(profile => profile.lines[0].requiredQuantity), ["75", "75"])
  result[0].lines[0].requiredQuantity = "90"
  assert.equal(result[1].lines[0].requiredQuantity, "75")
  assert.equal(lines[0].requiredQuantity, "75")
})

test("grade recipe selection uses the selected profile and keeps missing profiles explicit", async () => {
  const { dishForGrades } = await server.ssrLoadModule("/src/services/DishService/index.js")
  const base = { id: id(40), lines: [{ ingredientId: id(1), ingredientRole: "MAIN", requiredQuantity: "80", unit: "g" }], gradeRecipes: [{ gradeId: id(50), lines: [{ ingredientEntryId: id(41), ingredientId: id(42), ingredientRole: "MAIN", requiredQuantity: "120", unit: "g", name: "Thịt", supplierName: "NCC" }] }] }
  const scoped = dishForGrades(base, [id(50)])
  assert.deepEqual(scoped.ingredientStandards, [{ ingredientId: id(42), quantityPerPortion: "120", unit: "g" }])
  assert.deepEqual(scoped.ingredientIds, [id(42)])
  assert(dishForGrades(base, [id(50), id(51)]).gradeRecipeIssue)
  assert.equal(base.lines[0].requiredQuantity, "80")
})

test("recipe and allergy preview send grade scope and replace base ingredient identities", async () => {
  const { inspectMenuMealSelection } = await server.ssrLoadModule("/src/services/MenuService/index.js")
  respond = config => {
    const body = JSON.parse(config.data)
    assert.deepEqual(body.gradeIds, [id(50)])
    if (config.url === "/dishes/recipe-preview") return { ingredientIds: [id(42)], seasonings: [], dishes: [] }
    assert.equal(config.url, "/v1/menus/allergy-check")
    return { hasConflict: body.ingredientIds.includes(id(1)), conflicts: [] }
  }
  const result = await inspectMenuMealSelection({ dishes: [{ id: id(40), ingredientIds: [id(1)] }], gradeIds: [id(50)], refreshRecipe: true })
  assert.equal(result.allergies.hasConflict, false)
  assert.deepEqual(JSON.parse(requests.at(-1).data).ingredientIds, [id(42)])
  assert.deepEqual(result.issues, [])
})

test("weekly schedule requests and cache distinguish menus for the same week", async () => {
  respond = config => {
    if (config.url === "/v1/menus/week-schedule") return { weeklyMenuId: null, days: [], gradeIds: config.params.gradeIds?.split(",") || [], selected: config.params.menuId || "none" }
    assert.fail(`Unexpected URL ${config.url}`)
  }
  const first = await menus.getWeekSchedule("2026-11-09", { menuId: id(50) })
  const second = await menus.getWeekSchedule("2026-11-09", { menuId: id(51) })
  assert.equal(first.data.selected, id(50))
  assert.equal(second.data.selected, id(51))
  assert.equal(requests.length, 2)
  await menus.getWeekSchedule("2026-11-09", { gradeIds: [id(52), id(50)] })
  assert.equal(requests.at(-1).params.gradeIds, [id(50), id(52)].join(","))
})

test("approval list reads every page and labels menus with their grade scope", async () => {
  respond = config => ({ items: [{ id: id(config.params.page), status: "PENDING_APPROVAL", weekStartDate: "2026-11-09", grades: [{ grade: { name: `Khối ${config.params.page}` } }] }], pagination: { totalItems: 2 } })
  const rows = await menus.getApprovalWeeks()
  assert.equal(rows.length, 2)
  assert.deepEqual(rows.map(row => row.gradeNames), [["Khối 1"], ["Khối 2"]])
  assert.deepEqual(requests.map(config => config.params.page), [1, 2])
})

test("menu planning can load all grade menus without changing ordinary pagination", async () => {
  respond = config => ({ items: [{ ...snapshot(), id: id(config.params.page), grades: [{ gradeId: id(50 + config.params.page), grade: { name: `Khối ${config.params.page}` } }] }], pagination: { totalItems: 2 } })
  const response = await menus.getMenus({ limit: 1, allPages: true, weekStartDate: "2026-11-09" })
  assert.deepEqual([...new Set(response.data.map(row => row.weeklyMenuId))], [id(1), id(2)])
  assert.deepEqual(requests.map(config => config.params.page), [1, 2])
})

test("school allergy catalogue uses every API page and preserves per-ingredient counts without guessed pupils", async () => {
  const {getSchoolClassAllergies,computeAllergySummary,affectedCountsLabel} = await server.ssrLoadModule("/src/services/AllergyService/index.js")
  respond = config => {
    assert.equal(config.url,"/class-allergies/catalog")
    const common={classId:id(50),className:"Class A",academicYear:"2026-2027",updatedAt:"2026-11-13T00:00:00Z"}
    return config.params.page===1 ? {items:[{...common,ingredientEntryId:id(51),ingredientId:id(61),ingredientName:"Peanut",affectedCount:2}],pagination:{hasNext:true}}
      : {items:[{...common,ingredientEntryId:id(52),ingredientId:id(62),ingredientName:"Milk",affectedCount:2}],pagination:{hasNext:false}}
  }
  const rows=await getSchoolClassAllergies()
  assert.equal(rows.length,1)
  assert.deepEqual(computeAllergySummary(rows),{totalClasses:1,totalIngredients:2})
  assert.equal(affectedCountsLabel(rows[0].allergies),"Peanut: 2; Milk: 2")
  assert.equal(rows[0].homeroomTeacher,undefined)
  assert.equal(requests.length,2)
})

test("school allergy API errors remain errors rather than mock or zero-case data", async () => {
  const {getSchoolClassAllergies}=await server.ssrLoadModule("/src/services/AllergyService/index.js")
  respond=config=>{throw new AxiosError("Unavailable","ERR_BAD_RESPONSE",config,null,{status:503,data:{message:"Allergy data unavailable"},headers:{},config})}
  await assert.rejects(()=>getSchoolClassAllergies(),/Allergy data unavailable/)
})

test("dish catalog loads database recipes and preserves unclassified legacy lines without browser fallback", async () => {
  const service = await server.ssrLoadModule("/src/services/DishService/index.js")
  memory.set("FOODPRINT_DISH_CATALOG_V2",JSON.stringify([{id:"fake",name:"Fake browser dish"}]))
  respond = config => {
    assert.equal(config.url,"/dishes/catalog")
    return {categories:[{key:"RICE_STARCH",label:"Cơm / Tinh bột"}],items:[{id:id(40),name:"Database dish",lines:[{ingredientEntryId:id(41),ingredientId:id(42),name:"Rice",requiredQuantity:"0.080",unit:"kg",ingredientRole:null}]}]}
  }
  const rows = await service.loadDishCatalog()
  assert.equal(rows[0].name,"Database dish")
  assert.equal(rows[0].unclassifiedLines[0].requiredQuantity,"0.080")
  assert.equal(rows[0].ingredients.length,0)
  assert.deepEqual(rows[0].ingredientIds,[id(42)])
  respond = config => {throw new AxiosError("catalog unavailable","ERR_BAD_RESPONSE",config,null,{status:503,data:{message:"catalog unavailable"},headers:{},config})}
  await assert.rejects(()=>service.loadDishCatalog(),/catalog unavailable/)
})

test("allergy ingredient IDs come from recipe identities including seasonings, never dish names", async () => {
  const {dishIngredientIds} = await server.ssrLoadModule("/src/services/DishService/index.js")
  assert.deepEqual(dishIngredientIds({name:"Peanut demo",ingredientIds:[id(7)],ingredientStandards:[{ingredientId:id(7)}],lines:[{ingredientId:id(9)}],seasonings:[{ingredientId:id(8)}]}),[id(7),id(9),id(8)])
  assert.deepEqual(dishIngredientIds({name:"Peanut demo"}),[])
  assert.equal("MOCK_SCHOOL_ACADEMIC_YEARS" in adapter,false)
})

test("catalog and menu use the saved dish category and backend options without inferring from the name", async () => {
  const {loadDishCatalogData,dishCategoryKey,saveDishRecipe}=await server.ssrLoadModule("/src/services/DishService/index.js")
  const categories=[{key:"RICE_STARCH",label:"Cơm / Tinh bột"},{key:"SOUP",label:"Món canh"}]
  respond=config=>{
    if(config.method==="get") return {categories,items:[{id:id(40),name:"Canh tên thử nghiệm",category:"RICE_STARCH",categoryLabel:"Cơm / Tinh bột",lines:[]},{id:id(41),name:"Cơm chưa phân nhóm",category:null,categoryLabel:null,lines:[]}]}
    assert.equal(config.method,"put")
    assert.equal(JSON.parse(config.data).category,"SOUP")
    return {id:id(40),category:"SOUP",categoryLabel:"Món canh"}
  }
  const data=await loadDishCatalogData()
  assert.deepEqual(data.categories,categories)
  assert.equal(dishCategoryKey(data.items[0]),"RICE_STARCH")
  assert.equal(dishCategoryKey(data.items[1]),"UNCLASSIFIED")
  assert.equal(data.items[0].categoryLabel,"Cơm / Tinh bột")
  await saveDishRecipe(id(40),{name:"Canh tên thử nghiệm",category:"SOUP",lines:[]})
  const menu=snapshot()
  Object.assign(menu.menuDays[0].menuDayDishes[0].Dish,{category:"SOUP",categoryLabel:"Món canh"})
  assert.equal(adapter.menuWeekMeals(menu)[0].meals.LUNCH.dishes[0].category,"SOUP")
  assert.equal(adapter.adaptBackendMenuDetailToView(menu,undefined,"LUNCH").dishes[0].categoryLabel,"Món canh")
})

test("missing backend category options are an API error, not a generated list of dish groups", async () => {
  const {loadDishCatalogData}=await server.ssrLoadModule("/src/services/DishService/index.js")
  respond=()=>({items:[]})
  await assert.rejects(()=>loadDishCatalogData(),/API chưa trả danh mục nhóm món ăn/)
})

test("dish selection checks recorded peanut allergies even while an unclassified recipe preview fails", async () => {
  const {inspectMenuMealSelection}=await server.ssrLoadModule("/src/services/MenuService/index.js")
  let releasePreview
  const allergyStarted=new Promise(resolve=>{releasePreview=resolve})
  respond=async config=>{
    if(config.url==="/dishes/recipe-preview") {
      await allergyStarted
      throw new AxiosError("Unclassified recipe","ERR_BAD_RESPONSE",config,null,{status:422,data:{message:"Recipe needs classification"},headers:{},config})
    }
    assert.match(config.url,/allergy-check$/)
    assert.deepEqual(JSON.parse(config.data),{ingredientIds:[id(42)]})
    releasePreview()
    return {hasConflict:true,conflicts:[{ingredientId:id(42),ingredientName:"Peanut",affectedStudentsCount:4,affectedClasses:[{className:"3A",count:1},{className:"3B",count:2},{className:"4A",count:1}]}]}
  }
  const result=await inspectMenuMealSelection({dishes:[{id:id(40),name:"Database dish",lines:[{ingredientId:id(42),ingredientRole:null}]}],refreshRecipe:true})
  assert.equal(result.allergies.hasConflict,true)
  assert.equal(result.allergies.conflicts[0].affectedStudentsCount,4)
  assert.equal(result.issues.length,1)
  assert.match(result.issues[0],/Recipe needs classification/)
  assert.equal(requests.length,2)
})

test("selection includes seasoning identities added by database preview", async () => {
  const {inspectMenuMealSelection}=await server.ssrLoadModule("/src/services/MenuService/index.js")
  respond=config=>{
    if(config.url==="/dishes/recipe-preview") return {ingredientIds:[id(42),id(43)],seasonings:[{ingredientEntryId:id(44),quantityPerPortion:"1.250",unit:"g"}]}
    const ids=JSON.parse(config.data).ingredientIds
    return {hasConflict:ids.includes(id(43)),conflicts:ids.includes(id(43))?[{ingredientId:id(43),ingredientName:"Peanut seasoning"}]:[]}
  }
  const result=await inspectMenuMealSelection({dishes:[{id:id(40),ingredientIds:[id(42)]}],refreshRecipe:true})
  assert.equal(result.allergies.conflicts[0].ingredientId,id(43))
  assert.equal(result.seasonings[0].portionQty,"1.250")
  assert.deepEqual(result.issues,[])
  assert.equal(requests.length,3)
})

test("denied or unavailable selection-time allergy checks cannot become a safe result", async () => {
  const {inspectMenuMealSelection}=await server.ssrLoadModule("/src/services/MenuService/index.js")
  for(const status of [403,503]) {
    respond=config=>{throw new AxiosError("Unavailable","ERR_BAD_RESPONSE",config,null,{status,data:{message:"Cannot inspect school allergies"},headers:{},config})}
    const result=await inspectMenuMealSelection({dishes:[{id:id(40),ingredientIds:[id(42)]}]})
    assert.equal(result.allergies,null)
    assert.match(result.issues.join(" "),/Cannot inspect school allergies/)
  }
})

test("a dish name without a database recipe stays unchecked rather than guessed allergen-free", async () => {
  const {inspectMenuMealSelection}=await server.ssrLoadModule("/src/services/MenuService/index.js")
  const result=await inspectMenuMealSelection({dishes:[{id:id(40),name:"Peanut dish"}]})
  assert.equal(result.allergies,null)
  assert.match(result.issues.join(" "),/Peanut dish/)
  assert.equal(requests.length,0)
})

test("reopened menu selection checks its stored shared seasonings and keeps known conflicts despite an incomplete dish", async () => {
  const {inspectMenuMealSelection}=await server.ssrLoadModule("/src/services/MenuService/index.js")
  respond=config=>{
    assert.match(config.url,/allergy-check$/)
    assert.deepEqual(JSON.parse(config.data),{ingredientIds:[id(43)]})
    return {hasConflict:true,conflicts:[{ingredientId:id(43),ingredientName:"Peanut"}]}
  }
  const result=await inspectMenuMealSelection({dishes:[{id:id(40),name:"Missing recipe"}],seasonings:[{ingredientId:id(43)}]})
  assert.equal(result.allergies.hasConflict,true)
  assert.match(result.issues.join(" "),/Missing recipe/)
})
const memory = new Map()
const originalWindow = globalThis.window
const originalStorage = globalThis.localStorage
const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`
test("delivery inspections use server filters and independent delivery IDs without sending a browser role", async () => {
  const service = await server.ssrLoadModule("/src/services/DeliveryInspectionService/index.js")
  for (const role of ["SCHOOL_NUTRITION_OFFICER", "SCHOOL_KITCHEN_STAFF", "INGREDIENT_MANAGEMENT_DEPARTMENT", "PARENTS_COMMITTEE"]) {
    respond = config => {
      if (config.url === "/deliveries/inspections") {
        assert.deepEqual(config.params, { page: 2, limit: 20, search: "Rice", status: "PENDING_APPROVAL", period: "week" })
        return { items: [{id:id(70),currentRole:role}], pagination: {page:2,limit:20,totalItems:21,hasNext:false}, stats:{total:21,pending:21} }
      }
      if (config.method === "post") {
        assert.deepEqual(JSON.parse(config.data), { decision: "APPROVE", reason: null })
        return { id: config.url.split("/")[2], currentRole:role, status:"PENDING_APPROVAL" }
      }
      return { id:config.url.split("/")[2], currentRole:role, requiredRoles:[{code:role,name:role}], deliveryItems:[], deliveryApprovals:[] }
    }
    const page = await service.getDeliveryInspections({page:2,limit:20,search:"Rice",status:"PENDING_APPROVAL",period:"week"})
    assert.equal(page.items[0].currentRole,role)
    assert.equal(page.stats.total,21)
    for (const deliveryId of [id(70),id(71)]) {
      assert.equal((await service.getDeliveryInspection(deliveryId)).id,deliveryId)
      await service.decideDeliveryInspection(deliveryId,"APPROVE","")
    }
  }
})

test("delivery rejection returns a persistent cancellation notice and API errors never become local success", async () => {
  const service = await server.ssrLoadModule("/src/services/DeliveryInspectionService/index.js")
  respond = config => {
    if(config.method === "post") assert.deepEqual(JSON.parse(config.data),{decision:"REJECT",reason:"Damaged"})
    return {id:id(70),status:"REJECTED",currentRole:"SCHOOL_KITCHEN_STAFF",requiredRoles:[],deliveryItems:[],redeliveryRequiredCount:3,cancellationNotice:"Order cancelled; do not receive"}
  }
  const saved = await service.decideDeliveryInspection(id(70),"REJECT"," Damaged ")
  const reloaded = await service.getDeliveryInspection(id(70))
  assert.equal(saved.cancellationNotice,reloaded.cancellationNotice)
  respond=config=>{throw new AxiosError("Conflict","ERR_BAD_RESPONSE",config,null,{status:409,data:{message:"Decision already recorded"},headers:{},config})}
  await assert.rejects(()=>service.decideDeliveryInspection(id(70),"APPROVE",""),/Decision already recorded/)
  await assert.rejects(()=>service.getDeliveryInspections({}),/Decision already recorded/)
  respond=()=>({items:[]})
  await assert.rejects(()=>service.getDeliveryInspections({}),/Dữ liệu kiểm tra giao hàng không hợp lệ/)
})

test("shared inspection UI shows the actual department and never treats nutrition's signature as another role's decision", async () => {
  const React=await import("react")
  const {renderToStaticMarkup}=await import("react-dom/server")
  const {default:ApprovalModal}=await server.ssrLoadModule("/src/pages/SCHOOL/IngredientInspect/component/DeliveryApprovalModal.jsx")
  const {default:Detail}=await server.ssrLoadModule("/src/pages/SCHOOL/IngredientInspect/component/DeliveryDetailView.jsx")
  const requiredRoles=[{code:"SCHOOL_NUTRITION_OFFICER",name:"Dinh dưỡng"},{code:"SCHOOL_KITCHEN_STAFF",name:"Bếp"},{code:"INGREDIENT_MANAGEMENT_DEPARTMENT",name:"Kho"},{code:"PARENTS_COMMITTEE",name:"Ban phụ huynh"}]
  const delivery={id:id(70),deliveryNo:"D1",status:"PENDING_APPROVAL",requiredRoles,deliveryItems:[],deliveryApprovals:[{roleCode:requiredRoles[0].code,decision:"APPROVE",userName:"Nutrition signer",decidedAt:"2026-11-13T01:00:00Z"}],redeliveryRequiredCount:1,redeliveryLimit:2,canInspect:true}
  for(const role of requiredRoles) {
    const html=renderToStaticMarkup(React.createElement(ApprovalModal,{delivery:{...delivery,currentRole:role.code},onClose(){},onSubmitApproval(){}}))
    assert.match(html,new RegExp(`Quyết định của ${role.name}`))
  }
  const kitchenHtml=renderToStaticMarkup(React.createElement(Detail,{delivery:{...delivery,currentRole:"SCHOOL_KITCHEN_STAFF"},onBack(){},onOpenApprovalModal(){}}))
  assert.doesNotMatch(kitchenHtml,/Bộ phận của bạn đã đồng ý/)
  assert.match(kitchenHtml,/Đánh giá kiểm thực/)
  const cancelled=renderToStaticMarkup(React.createElement(Detail,{delivery:{...delivery,currentRole:"PARENTS_COMMITTEE",canInspect:false,cancellationNotice:"Không tiếp nhận thêm đơn này"},onBack(){},onOpenApprovalModal(){}}))
  assert.match(cancelled,/Không tiếp nhận thêm đơn này/)
  assert.match(cancelled,/Đợt giao đã hủy/)
})

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
  // Service tests need the real aliases and Sass setup, without bundling a config or React refresh.
  server = await createServer({ ...viteConfig, configFile: false, plugins: [], server: { middlewareMode: true, hmr: false, ws: false }, optimizeDeps: { noDiscovery: true, entries: [] }, appType: "custom" })
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

test("pending day edit reads a fresh week and saves/resubmits once with database recipe identities", async () => {
  const week = snapshot()
  week.status = "PENDING_APPROVAL"
  week.menuDays[0].approvalStatus = "PENDING_APPROVAL"
  respond = config => config.method === "get" ? week : { id: week.id, status: "PENDING_APPROVAL" }
  await menus.saveMenuDay(week.id, {
    dateISO: "2026-11-02", LUNCH: [{ dishId: id(30), ingredientStandards: [{ ingredientId: id(99), quantityPerPortion: "999", unit: "kg" }] }],
    AFTERNOON: [], useDishRecipes: true,
  }, { submit: true })
  assert.deepEqual(requests.map(config => config.method), ["get", "post"])
  assert.equal(requests[1].url, `/v1/menus/${week.id}/revise-and-submit`)
  const sent = JSON.parse(requests[1].data)
  assert.equal(sent.title, "Week")
  assert.equal(sent.days[0].note, "Monday note")
  assert.equal(sent.days[0].meals.length, 1)
  assert.deepEqual(sent.days[0].meals[0].dishes, [{ dishId: id(30) }])
  assert.equal(sent.days[0].meals[0].useDishRecipes, true)
  assert.equal(sent.days[1].note, "Tuesday note")
  assert.equal(sent.days[1].meals[0].dishes[0].ingredients[0].quantityPerPortion, "90.375")
})

test("approved day rejects both save paths even when its parent week is still a draft", async () => {
  const week = snapshot()
  week.menuDays[0].approvalStatus = "APPROVED"
  respond = () => week
  for (const submit of [false, true]) await assert.rejects(() => menus.saveMenuDay(week.id, { dateISO: "2026-11-02", LUNCH: [], AFTERNOON: [] }, { submit }))
  assert.equal(requests.every(config => config.method === "get"), true)
})

test("weekly editing preserves frozen quantities, seasonings, notes and explicit group identities", () => {
  const week = snapshot()
  week.menuDays[0].portionGroups = [{ id: id(80), name: "Normal", mealType: "LUNCH", isDefault: true, dishes: [{ dishId: id(3) }], avoidances: [] }]
  const day = adapter.menuWeekMeals(week)[0]
  const payload = adapter.menuDayWrite(day)
  assert.equal(day.canEdit, true)
  assert.equal(payload.note, "Monday note")
  assert.equal(payload.meals[0].portionGroups[0].id, id(80))
  assert.equal(payload.meals[0].seasonings[0].quantityPerPortion, "0.125")
  assert.equal(payload.meals[0].dishes[0].ingredients[0].quantityPerPortion, "80.125")
  const copied = adapter.menuDayWrite({ dateISO: "2026-11-09", LUNCH: [{ dishId: id(3) }], substitutesByMeal: { LUNCH: { [id(3)]: { dishId: id(4) } } }, useDishRecipes: true })
  assert.deepEqual(copied.meals[0].dishes, [{ dishId: id(3) }, { dishId: id(4) }])
})

test("weekly grid hides the plus on approved days and weeks and while loading", async () => {
  const React = await import("react")
  const { renderToStaticMarkup } = await import("react-dom/server")
  const { default: Grid } = await server.ssrLoadModule("/src/pages/SCHOOL/MenuPlanning/CreateMenu/CreateMenuWeeklyGrid.jsx")
  const schoolDays = [{ dateISO: "2026-11-02", dateVN: "02/11/2026", dayLabel: "T2" }]
  for (const [state, readOnly, hasPlus] of [[{ approvalStatus: "DRAFT" }, false, true], [{ approvalStatus: "PENDING_APPROVAL" }, false, true], [{ approvalStatus: "APPROVED" }, false, false], [{ weeklyStatus: "APPROVED" }, false, false], [{}, true, false]]) {
    const html = renderToStaticMarkup(React.createElement(Grid, { schoolDays, weeklyMeals: { "2026-11-02": state }, readOnly }))
    assert.equal(html.includes('aria-label="Thêm thực đơn ngày"'), hasPlus)
  }
})
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
