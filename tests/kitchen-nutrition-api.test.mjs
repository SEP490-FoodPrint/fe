import assert from "node:assert/strict"
import { after, before, beforeEach, test } from "node:test"
import { AxiosError } from "axios"
import { createServer } from "vite"
import viteConfig from "../vite.config.js"

let server, http, menus, kitchen, adapter, keys, storageTools, respond
let requests = []

test("grade menu filter lists individual grades and preserves shared menu mappings", async () => {
  const { menuGradeOptions, default: Filter } = await server.ssrLoadModule("/src/components/MenuScopeSelect.jsx")
  const menus = [{ id: "shared", gradeIds: ["g1", "g2"], gradeNames: ["Grade 1", "Grade 2"] }, { id: "other", gradeIds: ["g3"], gradeNames: ["Grade 3"] }]
  assert.deepEqual(menuGradeOptions(menus), [{ key: "g1", label: "Grade 1", menuId: "shared" }, { key: "g2", label: "Grade 2", menuId: "shared" }, { key: "g3", label: "Grade 3", menuId: "other" }])
  const React = await import("react")
  const { renderToStaticMarkup } = await import("react-dom/server")
  const html = renderToStaticMarkup(React.createElement(Filter, { menus, value: "shared", onChange: () => {} }))
  assert.match(html, /Grade 1/)
  assert.match(html, /Grade 2/)
  const allGrades = [{ id: "g1", name: "Grade 1" }, { id: "g2", name: "Grade 2" }]
  assert.deepEqual(menuGradeOptions([], allGrades), [{ key: "g1", label: "Grade 1", menuId: "" }, { key: "g2", label: "Grade 2", menuId: "" }])
  const emptyHtml = renderToStaticMarkup(React.createElement(Filter, { menus: [], grades: allGrades, gradeValue: "g2", onChange: () => {} }))
  assert.match(emptyHtml, /Grade 2/)
  assert.match(emptyHtml, /value="g2" selected/)
  const unselectedHtml = renderToStaticMarkup(React.createElement(Filter, { menus: [], grades: allGrades, gradeValue: "", onChange: () => {} }))
  assert.match(unselectedHtml, /value="" selected/)
  assert.doesNotMatch(html, /Th\u1ef1c \u0111\u01a1n \/ kh\u1ed1i/)
  const { sharedMenuScope } = await server.ssrLoadModule("/src/components/MenuScopeSelect.jsx")
  const oneMenu = [{ id: "shared", gradeIds: ["g1", "g2"], gradeNames: ["Grade 1", "Grade 2"] }]
  assert.deepEqual(sharedMenuScope(oneMenu, allGrades), { menuId: "shared", label: "To\u00e0n tr\u01b0\u1eddng" })
  assert.equal(sharedMenuScope(menus, allGrades), null)
  const sharedHtml = renderToStaticMarkup(React.createElement(Filter, { menus: oneMenu, grades: allGrades, value: "shared", onChange: () => {} }))
  assert.match(sharedHtml, /To\u00e0n tr\u01b0\u1eddng/)
  assert.match(sharedHtml, /disabled/)
  assert.doesNotMatch(sharedHtml, /Grade 1/)
})

test("dish catalogue groups categories by newest entry without sorting names", async () => {
  const { groupDishesByCategory } = await server.ssrLoadModule("/src/services/DishService/index.js")
  const input = [
    { id: "newest", name: "Z", category: "SOUP" },
    { id: "next", name: "A", category: "RICE" },
    { id: "older-soup", name: "B", category: "SOUP" },
    { id: "unclassified", name: "C", category: null },
    { id: "older-rice", name: "D", category: "RICE" },
    { id: "unclassified-older", name: "E", category: null },
  ]
  assert.deepEqual(groupDishesByCategory(input).map(dish => dish.id), ["newest", "older-soup", "next", "older-rice", "unclassified", "unclassified-older"])
  assert.equal(input[1].id, "next")
})

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

test("approval week loads every grade menu of a week in one request and renders one card per grade", async () => {
  const menu = (n, status) => ({ id: id(n), title: null, isSchoolWide: false, grades: [{ id: id(50 + n), name: `Khối ${n}` }], status, canDecide: status === "PENDING_APPROVAL", submittedAt: "30/10/2026 08:00", submissionVersion: null, summary: { proposer: "Y tế", supplier: "2 nhà cung cấp" }, days: [{ id: id(90 + n), shortLabel: "Thứ Hai", date: "02/11/2026", portions: 10, lunch: [{ name: `Cơm ${n}` }], snack: [] }], approval: { approver: null, role: "Ban Giám hiệu", note: "", reviewedAt: null } })
  respond = config => {
    assert.equal(config.url, "/v1/menus/approval-week")
    return { weekStartDate: "2026-11-02", weekEndDate: "2026-11-06", weekNumber: 9, weeks: [{ weekStartDate: "2026-11-02", weekEndDate: "2026-11-06", total: 2, pending: 1 }], menus: [menu(1, "PENDING_APPROVAL"), menu(2, "APPROVED")] }
  }
  const week = await menus.getApprovalWeek("2026-11-06")
  assert.equal(requests.length, 1)
  assert.deepEqual(requests[0].params, { date: "2026-11-06" })
  assert.equal(week.menus.length, 2)

  const React = await import("react")
  const { renderToStaticMarkup } = await import("react-dom/server")
  const { default: Header } = await server.ssrLoadModule("/src/pages/SCHOOL/MenuApproval/component/MenuApprovalHeader.jsx")
  const { default: Card } = await server.ssrLoadModule("/src/pages/SCHOOL/MenuApproval/component/GradeMenuCard.jsx")
  const header = renderToStaticMarkup(React.createElement(Header, { week, pendingCount: 1, totalCount: 2, onPrint: () => {} }))
  assert.match(header, /Duyệt thực đơn tuần 9 \(02\/11\/2026 – 06\/11\/2026\)/)
  const cards = week.menus.map((item, index) => renderToStaticMarkup(React.createElement(Card, { menu: item, position: index + 1, total: 2, onApprove: () => {}, onReject: () => {} })))
  assert.match(cards[0], /Khối 1/)
  assert.match(cards[0], /Thực đơn 1\/2/)
  assert.match(cards[0], /Phê duyệt/)
  assert.match(cards[0], /Cơm 1/)
  // Thực đơn đã duyệt không còn nút quyết định; tên khối đứng trước bảng món
  assert.doesNotMatch(cards[1], /Yêu cầu chỉnh sửa<\/button>/)
  assert.ok(cards[1].indexOf("Khối 2") < cards[1].indexOf("Cơm 2"))
})

test("menu planning can load all grade menus without changing ordinary pagination", async () => {
  respond = config => ({ items: [{ ...snapshot(), id: id(config.params.page), grades: [{ gradeId: id(50 + config.params.page), grade: { name: `Khối ${config.params.page}` } }] }], pagination: { totalItems: 2 } })
  const response = await menus.getMenus({ limit: 1, allPages: true, weekStartDate: "2026-11-09" })
  assert.deepEqual([...new Set(response.data.map(row => row.weeklyMenuId))], [id(1), id(2)])
  assert.deepEqual(requests.map(config => config.params.page), [1, 2])
})

test("menu list grade filter uses school context and stays visible without any weekly menus", async () => {
  const React = await import("react")
  const { renderToStaticMarkup } = await import("react-dom/server")
  const { default: Filter } = await server.ssrLoadModule("/src/pages/SCHOOL/MenuPlanning/component/MenuListFilterStrip.jsx")
  respond = config => {
    assert.equal(config.url, "/v1/menus/context")
    return { id: id(32), grades: [{ id: id(50), name: "Khối 1–3" }, { id: id(51), name: "Khối 4–5" }] }
  }
  const context = await menus.getContext({ forceRefresh: true })
  const html = renderToStaticMarkup(React.createElement(Filter, { filters: {}, gradeOptions: context.grades }))
  assert.match(html, /aria-label="Lọc theo khối"/)
  assert.match(html, /Tất cả khối/)
  assert.match(html, /Khối 1–3/)
  assert.match(html, /Khối 4–5/)
  assert.doesNotMatch(html, /Thực đơn \/ khối áp dụng/)
  assert.equal(requests.length, 1)
  for (const state of [{ gradeLoading: true }, { gradeOptions: [] }, { gradeError: "Không tải được khối" }]) {
    const markup = renderToStaticMarkup(React.createElement(Filter, { filters: {}, ...state }))
    assert.match(markup, /aria-label="Lọc theo khối"/)
    if (state.gradeError) assert.match(markup, /Không tải được khối/)
  }
})

test("menu grade filtering includes shared scopes, returns empty for an unused grade and keeps approval groups separate", async () => {
  const { filterMenuCardsByGrade, groupMenuCardsByWeek } = await server.ssrLoadModule("/src/services/MenuService/listGrades.js")
  const cards = [
    { id: "A-lunch", weeklyMenuId: "A", gradeIds: [id(50)], targetScope: "Khối 1–3", status: "DRAFT" },
    { id: "B-lunch", weeklyMenuId: "B", gradeIds: [id(51)], targetScope: "Khối 4–5", status: "APPROVED" },
    { id: "A-afternoon", weeklyMenuId: "A", gradeIds: [id(50)], targetScope: "Khối 1–3", status: "REVISION_REQUIRED", feedback: "Sửa bữa xế" },
  ]
  assert.equal(filterMenuCardsByGrade(cards).length, 3)
  assert.deepEqual(filterMenuCardsByGrade(cards, id(50)).map(card => card.id), ["A-lunch", "A-afternoon"])
  assert.deepEqual(filterMenuCardsByGrade(cards, id(52)), [])
  const groups = groupMenuCardsByWeek(filterMenuCardsByGrade(cards))
  assert.equal(groups.length, 2)
  assert.deepEqual(groups[0].menus.map(menu => menu.weeklyMenuId), ["A", "A"])
  assert.equal(groups[0].status, "REVISION_REQUESTED")
  assert.equal(groups[0].feedback, "Sửa bữa xế")
  assert.equal(groups[1].status, "APPROVED")
  assert.equal(groups[1].targetScope, "Khối 4–5")
  const shared = [{ ...cards[0], gradeIds: [id(50), id(51)] }]
  assert.equal(filterMenuCardsByGrade(shared, id(51)).length, 1)
  assert.equal(filterMenuCardsByGrade([{ ...cards[0], gradeIds: [], isSchoolWide: true }], id(51)).length, 1)
  assert.equal(filterMenuCardsByGrade([{ ...cards[0], gradeIds: [], isSchoolWide: false }], id(51)).length, 0)
})

test("kitchen grade selector lists every school grade without menus and has no current-week shortcut", async () => {
  const React = await import("react")
  const { renderToStaticMarkup } = await import("react-dom/server")
  const { default: Header } = await server.ssrLoadModule("/src/pages/SCHOOL/KitchenCooking/KitchenMenu/component/KitchenMenuHeader.jsx")
  const html = renderToStaticMarkup(React.createElement(Header, { gradeOptions: [{ id: id(50), name: "Khối 1–3" }, { id: id(51), name: "Khối 4–5" }], gradeId: id(51), gradeLoading: false }))
  assert.match(html, /aria-label="Lọc thực đơn theo khối"/)
  assert.match(html, /Tất cả khối/)
  assert.match(html, /Khối 1–3/)
  assert.match(html, /Khối 4–5/)
  assert.match(html, new RegExp(`value="${id(51)}" selected=""`))
  assert.doesNotMatch(html, /Tuần này|Chưa có thực đơn/)
})

test("kitchen menu grade filtering matches shared membership and keeps menus from other grades separate", async () => {
  const { loadKitchenGradeSchedules } = await server.ssrLoadModule("/src/services/MenuService/gradeSchedule.js")
  const first = snapshot()
  const second = { ...snapshot(), id: id(60) }
  second.menuDays[0].id = id(61)
  second.menuDays[0].menuDayDishes[0].Dish.name = "Món khối khác"
  const availableMenus = [
    { id: first.id, gradeIds: [id(50), id(51)], gradeNames: ["Khối 1–3", "Khối 4–5"] },
    { id: second.id, gradeIds: [id(52)], gradeNames: ["Khối khác"] },
  ]
  respond = config => {
    if (config.url.endsWith("/week-schedule")) {
      assert.equal(config.params.gradeIds, undefined)
      return { availableMenus, weeklyMenuId: config.params.menuId || null, days: [{ date: "2026-11-02", hasMenu: Boolean(config.params.menuId) }] }
    }
    if (config.url === `/v1/menus/${first.id}`) return first
    assert.equal(config.url, `/v1/menus/${second.id}`)
    return second
  }
  const selected = await loadKitchenGradeSchedules("2026-11-02", id(51))
  assert.equal(selected.length, 1)
  assert.equal(selected[0].weeklyMenuId, first.id)
  assert.equal(selected[0].days[0].meals.LUNCH.dishes[0].name, "Dish 3")
  assert.deepEqual(await loadKitchenGradeSchedules("2026-11-02", id(53)), [])
  const all = await loadKitchenGradeSchedules("2026-11-02")
  assert.deepEqual(all.map(menu => menu.weeklyMenuId), [first.id, second.id])
  assert.equal(all[1].days[0].meals.LUNCH.dishes[0].name, "Món khối khác")
})

test("kitchen menu loading failures remain errors instead of a grade with no menu", async () => {
  const { loadKitchenGradeSchedules } = await server.ssrLoadModule("/src/services/MenuService/gradeSchedule.js")
  respond = config => {
    if (!config.params.menuId) return { weeklyMenuId: null, availableMenus: [{ id: id(1), gradeIds: [id(50)], gradeNames: ["Khối 1–3"] }], days: [] }
    throw new AxiosError("Unavailable", "ERR_BAD_RESPONSE", config, null, { status: 503, data: { message: "Không tải được thực đơn" }, headers: {}, config })
  }
  await assert.rejects(loadKitchenGradeSchedules("2026-11-02", id(50)), /Không tải được thực đơn/)
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
  // Danh sách dị ứng chung của lớp: một số học sinh chung, không liệt kê/cộng theo nguyên liệu
  assert.equal(affectedCountsLabel(rows[0].allergies),"2")
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

test("dish catalogue preserves meal classification and sends it for create and edit", async () => {
  const { loadDishCatalogData, saveDishRecipe, dishMealTypeLabel } = await server.ssrLoadModule("/src/services/DishService/index.js")
  respond = config => {
    if (config.method === "get") return { categories: [], items: ["LUNCH", "AFTERNOON", "BOTH", null].map((mealType, index) => ({ id: id(40 + index), name: "Món", mealType, lines: [], gradeRecipes: [] })) }
    assert.equal(JSON.parse(config.data).mealType, config.method === "post" ? "BOTH" : "AFTERNOON")
    return { id: id(40), ...JSON.parse(config.data) }
  }
  const data = await loadDishCatalogData()
  assert.deepEqual(data.items.map(row => row.mealType), ["LUNCH", "AFTERNOON", "BOTH", null])
  assert.deepEqual(data.items.map(row => dishMealTypeLabel(row.mealType)), ["Bữa trưa", "Bữa xế", "Cả hai bữa", "Chưa phân loại"])
  const created = await saveDishRecipe(undefined, { name: "Món", mealType: "BOTH", lines: [] })
  assert.equal(created.data.mealType, "BOTH")
  const updated = await saveDishRecipe(id(40), { name: "Món", mealType: "AFTERNOON", lines: [] })
  assert.equal(updated.data.mealType, "AFTERNOON")
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
  id: id(1), status: "DRAFT", weekStartDate: "2026-11-02", title: "Week", isSchoolWide: true,
  menuDays: [
    { id: id(2), menuDate: "2026-11-02", approvalStatus: "DRAFT", note: "Monday note", menuDayDishes: [dish("LUNCH", 3, "80.125"), dish("AFTERNOON", 4, "120.250")], mealSeasonings: [{ mealType: "LUNCH", ingredientEntryId: id(21), quantityPerPortion: "0.125", unit: "g" }, { mealType: "AFTERNOON", ingredientEntryId: id(22), quantityPerPortion: "0.250", unit: "g" }], portionGroups: [] },
    { id: id(5), menuDate: "2026-11-03", approvalStatus: "DRAFT", note: "Tuesday note", menuDayDishes: [dish("LUNCH", 6, "90.375")], mealSeasonings: [], portionGroups: [] },
  ],
})
const edits = () => ({ formState: { name: "Edited", date: "02/11/2026", mealType: "LUNCH", notes: "Edited note" }, dishes: [{ dishId: id(3), name: "Dish 3", ingredientStandards: [{ ingredientId: id(13), quantityPerPortion: "81.125", unit: "g" }, { ingredientId: id(14), quantityPerPortion: "0.375", unit: "kg" }] }], seasonings: [{ ingredientEntryId: id(21), quantityPerPortion: "0.625", unit: "g" }] })

test("grade detail compares saved quantities for the same date and meal without refreshing catalogue recipes", async () => {
  const { loadGradeMenuDetails, gradeComparisonRows } = await server.ssrLoadModule("/src/services/MenuService/gradeDetail.js")
  const first = { ...snapshot(), isSchoolWide: false, grades: [{ gradeId: id(50), grade: { name: "Khối 1–3" } }] }
  const second = { ...snapshot(), id: id(60), isSchoolWide: false, grades: [{ gradeId: id(51), grade: { name: "Khối 4–5" } }] }
  second.menuDays[0].id = id(61)
  second.menuDays[0].menuDayDishes[0].ingredients[0].quantityPerPortion = "110.625"
  first.menuDays[0].mealSeasonings[0].ingredientEntry = { ingredientId: id(70) }
  const original = JSON.stringify(first)
  respond = config => {
    if (config.url === "/v1/menus/week-schedule") {
      assert.deepEqual(config.params, { date: "2026-11-02", menuId: first.id })
      return { availableMenus: [first, second].map(week => ({ id: week.id, gradeIds: week.grades.map(row => row.gradeId), gradeNames: week.grades.map(row => row.grade.name) })) }
    }
    if (config.url === `/v1/menus/${second.id}`) return second
    assert.match(config.url, /\/meals\/LUNCH\/requirements$/)
    return { portions: config.url.includes(id(61)) ? 75 : 100, portionsFinalized: true }
  }
  const scopes = await loadGradeMenuDetails(first, id(2), "LUNCH")
  assert.deepEqual(scopes.map(scope => scope.gradeIds), [[id(50)], [id(51)]])
  assert.deepEqual(scopes.map(scope => scope.menu.menuDayId), [id(2), id(61)])
  assert.deepEqual(scopes.map(scope => scope.portionLabel), ["100 suất", "75 suất"])
  assert.deepEqual(scopes[0].ingredientIds, [id(13), id(70)])
  const rows = gradeComparisonRows(scopes)
  assert.deepEqual(rows[0].rows[0].values, { [id(50)]: 80.125, [id(51)]: 110.625 })
  assert.equal(rows.some(row => row.id === `dish:${id(4)}`), false)
  assert.equal(JSON.stringify(first), original)
  assert.equal(requests.length, 4)
  assert(requests.every(config => config.method === "get"))
})

test("grade details never substitute a different day or meal when a grade has no matching menu", async () => {
  const { loadGradeMenuDetails } = await server.ssrLoadModule("/src/services/MenuService/gradeDetail.js")
  const first = { ...snapshot(), isSchoolWide: false, grades: [{ gradeId: id(50), grade: { name: "Khối 1–3" } }] }
  const missingDay = { ...snapshot(), id: id(60) }
  missingDay.menuDays = [missingDay.menuDays[1]]
  const missingMeal = { ...snapshot(), id: id(61) }
  missingMeal.menuDays[0].menuDayDishes = [dish("AFTERNOON", 4, "120")]
  respond = config => {
    if (config.url.endsWith("/week-schedule")) return { availableMenus: [
      { id: first.id, gradeIds: [id(50)], gradeNames: ["Khối 1–3"] },
      { id: missingDay.id, gradeIds: [id(51)], gradeNames: ["Khối 4"] },
      { id: missingMeal.id, gradeIds: [id(52)], gradeNames: ["Khối 5"] },
    ] }
    if (config.url === `/v1/menus/${missingDay.id}`) return missingDay
    if (config.url === `/v1/menus/${missingMeal.id}`) return missingMeal
    assert.equal(config.url, `/v1/menus/days/${id(2)}/meals/LUNCH/requirements`)
    return { portions: 0, portionsFinalized: true }
  }
  const scopes = await loadGradeMenuDetails(first, id(2), "LUNCH")
  assert.equal(scopes[0].portionLabel, "0 suất")
  for (const scope of scopes.slice(1)) {
    assert.equal(scope.menu, null)
    assert.match(scope.error, /Chưa có thực đơn cho ngày và bữa ăn này/)
    assert.equal(scope.loadFailed, undefined)
  }
  assert.equal(requests.filter(config => config.url.endsWith("/requirements")).length, 1)
})

test("a shared weekly menu labels combined portions explicitly and fetches one snapshot for both grades", async () => {
  const { loadGradeMenuDetails } = await server.ssrLoadModule("/src/services/MenuService/gradeDetail.js")
  const week = { ...snapshot(), isSchoolWide: false, grades: [{ gradeId: id(50), grade: { name: "Khối 1–3" } }, { gradeId: id(51), grade: { name: "Khối 4–5" } }] }
  respond = config => config.url.endsWith("/week-schedule") ? { availableMenus: [] } : { portions: 175, portionsFinalized: true }
  const scopes = await loadGradeMenuDetails(week, id(2), "LUNCH")
  assert.deepEqual(scopes.map(scope => scope.key), [id(50), id(51)])
  assert.equal(scopes[0].portionLabel, "175 suất dùng chung (Khối 1–3, Khối 4–5)")
  assert.equal(scopes[1].portionLabel, scopes[0].portionLabel)
  assert.equal(requests.length, 2)
  respond = config => config.url.endsWith("/week-schedule") ? { availableMenus: [] } : { portions: 175, portionsFinalized: false }
  assert.equal((await loadGradeMenuDetails(week, id(2), "LUNCH"))[0].portionLabel, "Chưa chốt đủ suất")
})

test("grade detail keeps the selected snapshot readable when another grade or attendance API fails", async () => {
  const { loadGradeMenuDetails } = await server.ssrLoadModule("/src/services/MenuService/gradeDetail.js")
  const week = { ...snapshot(), isSchoolWide: false, grades: [{ gradeId: id(50), grade: { name: "Khối 1–3" } }] }
  const unavailable = config => { throw new AxiosError("Unavailable", "ERR_BAD_RESPONSE", config, null, { status: 503, data: { message: "Không tải được dữ liệu" }, headers: {}, config }) }
  respond = config => {
    if (config.url.endsWith("/week-schedule")) return { availableMenus: [
      { id: week.id, gradeIds: [id(50)], gradeNames: ["Khối 1–3"] },
      { id: id(60), gradeIds: [id(51)], gradeNames: ["Khối 4–5"] },
    ] }
    return unavailable(config)
  }
  const scopes = await loadGradeMenuDetails(week, id(2), "LUNCH")
  assert.equal(scopes[0].menu.dishes[0].ingredientDetails[0].quantityPerPortion, 80.125)
  assert.equal(scopes[0].portionLabel, "Chưa tải được số suất")
  assert.equal(scopes[1].menu, null)
  assert.equal(scopes[1].loadFailed, true)
  respond = unavailable
  await assert.rejects(loadGradeMenuDetails(week, id(2), "LUNCH"), /Không tải được dữ liệu/)
})

test("comparison aligns ingredient identities and units, preserving missing values and zero quantities", async () => {
  const { gradeComparisonRows } = await server.ssrLoadModule("/src/services/MenuService/gradeDetail.js")
  const row = (ingredientId, unit, quantityPerPortion) => ({ id: ingredientId, name: "Cùng tên", unit, quantityPerPortion })
  const scopes = [
    { key: "A", menu: { dishes: [{ dishId: id(3), name: "Món chung", ingredientDetails: [row(id(13), "g", 0), row(id(14), "g", 10)] }], seasonings: [{ ingredientEntryId: id(21), name: "Muối", unit: "g", quantityPerPortion: "0.125" }] } },
    { key: "B", menu: { dishes: [{ dishId: id(3), name: "Món chung", ingredientDetails: [row(id(13), "g", 100), row(id(14), "kg", 0.02), row(id(15), "g", 30)] }, { dishId: id(4), name: "Món chung", ingredientDetails: [] }] } },
    { key: "C", menu: null, error: "Unavailable" },
  ]
  const sections = gradeComparisonRows(scopes)
  assert.equal(sections.length, 3)
  const lines = sections.find(section => section.id === `dish:${id(3)}`).rows
  assert.equal(lines.length, 3)
  assert.deepEqual(lines[0].values, { A: 0, B: 100 })
  assert.deepEqual(lines[1].values, { A: 10, B: "20" })
  assert.equal(lines[1].unit, "g")
  assert.deepEqual(lines[2].values, { B: 30 })
  assert.equal(sections.find(section => section.id === "seasonings").rows[0].values.A, "0.125")
})

test("grade comparison renders missing quantities and allergy failures without inventing safe results", async () => {
  const React = await import("react")
  const { renderToStaticMarkup } = await import("react-dom/server")
  const { MenuGradeComparisonTable } = await server.ssrLoadModule("/src/pages/SCHOOL/MenuPlanning/MenuDetail/component/MenuGradeDetails.jsx")
  const menu = { statusLabel: "Đã phê duyệt", dishes: [{ dishId: id(3), name: "Cơm", ingredientDetails: [{ id: id(13), name: "Gạo", unit: "g", quantityPerPortion: 0 }] }] }
  const scopes = [{ key: "A", label: "Khối 1–3", menu }, { key: "B", label: "Khối 4–5", menu: { ...menu, dishes: [] } }]
  const html = renderToStaticMarkup(React.createElement(MenuGradeComparisonTable, { scopes, allergyResults: { A: { error: "Không tải được dị ứng" } } }))
  assert.match(html, /Khối 1–3/)
  assert.match(html, /Khối 4–5/)
  assert.match(html, />0<\/td>/)
  assert.match(html, />—<\/td>/)
  assert.match(html, /Không tải được dị ứng/)
  assert.match(html, /Đang kiểm tra…/)
  assert.doesNotMatch(html, /Chưa phát hiện xung đột/)
})

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

test("nutrition view loads the latest whole-week revision reason from review history", async () => {
  const older = { decision: "REVISION_REQUESTED", menuDayId: null, feedback: "Lý do cũ", reviewedAt: "2026-11-01T08:00:00.000Z", reviewer: { fullName: "Hiệu trưởng" } }
  const latest = { ...older, feedback: "Cần thay món có tôm", reviewedAt: "2026-11-18T08:00:00.000Z" }
  respond = () => ({ items: [{ ...latest, menuDayId: id(2), feedback: "Nhận xét ngày" }, latest, older], pagination: { hasNext: false } })
  const result = await menus.getLatestRevisionReview(id(1))
  assert.deepEqual(result, latest)
  assert.equal(requests[0].url, `/v1/menus/${id(1)}/reviews`)
  assert.deepEqual(requests[0].params, { page: 1, limit: 20 })

  const React = await import("react")
  const { renderToStaticMarkup } = await import("react-dom/server")
  const { default: Notice } = await server.ssrLoadModule("/src/pages/SCHOOL/MenuPlanning/component/MenuRevisionNotice.jsx")
  const html = renderToStaticMarkup(React.createElement(Notice, { review: result }))
  assert.match(html, /Cần thay món có tôm/)
  assert.match(html, /Hiệu trưởng/)
  assert.match(html, /Chỉnh sửa thực đơn theo nhận xét/)
  assert.doesNotMatch(html, /Lý do cũ|Nhận xét ngày/)
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

test("cooking progress retains substitute dishes and tracks samples separately per batch", async () => {
  const { batchSampleProgress } = await server.ssrLoadModule("/src/services/KitchenService/adapter.js")
  const batch = { status: "COMPLETED", dishes: [{ dishId: id(3) }, { dishId: id(4) }], retainedFoodSamples: [{ dishId: id(3) }] }
  assert.deepEqual(batchSampleProgress(batch), { completed: 1, total: 2, complete: false })
  assert.equal(batchSampleProgress({ ...batch, retainedFoodSamples: [...batch.retainedFoodSamples, { dishId: id(4) }] }).complete, true)
  assert.equal(batchSampleProgress({ ...batch, retainedFoodSamples: [] }).complete, false)
  assert.deepEqual(batchSampleProgress({ dishes: [{ dishId: id(3) }], retainedFoodSamples: [] }), { completed: 0, total: 1, complete: false })
  assert.deepEqual(batchSampleProgress({ dishes: [{ dishId: id(3) }], retainedFoodSamples: [{ dishId: id(3) }] }), { completed: 1, total: 1, complete: true })
  const week = snapshot()
  const original = week.menuDays[0].menuDayDishes[0]
  week.menuDays[0].menuDayDishes.push({ ...original, dishId: id(4), Dish: { name: "Alternative" } })
  week.menuDays[0].portionGroups = [
    { mealType: "LUNCH", isDefault: true, dishes: [{ dishId: id(3) }], avoidances: [] },
    { mealType: "LUNCH", isDefault: false, dishes: [{ dishId: id(4) }], avoidances: [] },
  ]
  const lunch = adapter.menuWeekMeals(week)[0].meals.LUNCH
  assert(lunch.allDishes.some((dish) => dish.dishId === id(4)))
})

test("cooking board shows full meal demand and keeps a partially sampled batch awaiting samples", async () => {
  const React = await import("react")
  const { renderToStaticMarkup } = await import("react-dom/server")
  const { default: Board } = await server.ssrLoadModule("/src/pages/SCHOOL/KitchenCooking/CreateBatch/component/CreateBatchKanban.jsx")
  const batch = { id: id(1), batchCode: "CB-1", name: "Dish A, Dish B", mealType: "lunch", status: "COMPLETED", plannedPortions: 60, dishes: [{ dishId: id(3) }, { dishId: id(4) }], retainedFoodSamples: [{ dishId: id(3) }] }
  const html = renderToStaticMarkup(React.createElement(Board, { batches: [batch], pendingDishes: [], mealRequirements: { LUNCH: { portions: 100 } }, selectedMeal: "lunch" }))
  assert.match(html, /100/)
  assert.match(html, /1\/2/)
  const oneDish = { ...batch, dishes: [batch.dishes[0]], retainedFoodSamples: [{ dishId: id(3) }] }
  const oneDishHtml = renderToStaticMarkup(React.createElement(Board, { batches: [oneDish], pendingDishes: [], mealRequirements: { LUNCH: { portions: 100 } }, selectedMeal: "lunch" }))
  assert.match(oneDishHtml, /1\/1 l\u00f4/)
  assert.doesNotMatch(html, /T?t c? 1 l? ch? bi?n ?? n?u xong/)
})

test("cooking board keeps meal and grade filters available for empty grades", async () => {
  const React = await import("react")
  const { renderToStaticMarkup } = await import("react-dom/server")
  const { default: Board } = await server.ssrLoadModule("/src/pages/SCHOOL/KitchenCooking/CreateBatch/component/CreateBatchKanban.jsx")
  const html = renderToStaticMarkup(React.createElement(Board, {
    grades: [{ id: "g1", name: "Grade 1" }, { id: "g2", name: "Grade 2" }],
    gradeMenus: [{ id: "menu1", gradeIds: ["g1"] }], gradeValue: "g2", gradeMenuId: "",
    onGradeChange: () => {}, emptyState: React.createElement("p", null, "No menu for grade"),
  }))
  assert.match(html, /aria-label="Chọn bữa ăn"/)
  assert.match(html, /aria-label="Lọc theo khối lớp"/)
  assert.match(html, /value="g2" selected=""/)
  assert.match(html, /No menu for grade/)
})

test("weekend locks same-day kitchen actions on the cooking board", async () => {
  const { isVietnamWeekend } = await server.ssrLoadModule("/src/utils/weekend.js")
  assert.equal(isVietnamWeekend(Date.parse("2026-11-20T23:30:00+07:00")), false)
  assert.equal(isVietnamWeekend(Date.parse("2026-11-21T00:30:00+07:00")), true)
  assert.equal(isVietnamWeekend(Date.parse("2026-11-22T23:59:00+07:00")), true)
  assert.equal(isVietnamWeekend(Date.parse("2026-11-23T00:01:00+07:00")), false)
  const React = await import("react")
  const { renderToStaticMarkup } = await import("react-dom/server")
  const { default: Board } = await server.ssrLoadModule("/src/pages/SCHOOL/KitchenCooking/CreateBatch/component/CreateBatchKanban.jsx")
  const props = {
    pendingDishes: [{ id: "d1", dishId: "d1", name: "Canh", mealType: "lunch", portionStandard: 10 }],
    batches: [], onStartCooking: () => {}, onOpenPlanModal: () => {},
  }
  const locked = renderToStaticMarkup(React.createElement(Board, { ...props, locked: true }))
  assert.match(locked, /cuối tuần/)
  assert.match(locked, /disabled=""[^>]*aria-label="Nấu Canh"/)
  const open = renderToStaticMarkup(React.createElement(Board, { ...props, locked: false }))
  assert.doesNotMatch(open, /cuối tuần/)
  assert.doesNotMatch(open, /disabled=""[^>]*aria-label="Nấu Canh"/)
})

test("stock alerts show needed dry stock; fresh screen only urgent; order button passes shortage", async () => {
  const React = await import("react")
  const { renderToStaticMarkup } = await import("react-dom/server")
  const { StockAlertList, formatAlertDate, roundUpQuantity } = await server.ssrLoadModule("/src/components/StockAlertPanel.jsx")
  assert.equal(formatAlertDate("2026-11-24"), "Thứ Ba 24/11")
  assert.equal(roundUpQuantity("56.01"), 56.1)
  assert.equal(roundUpQuantity("56"), 56)
  const items = [
    { ingredientId: "rice", name: "Gạo tẻ", unit: "kg", required: "120", onHand: "64", pending: "0", shortage: "56", firstShortDate: "2026-11-24", level: "URGENT" },
    { ingredientId: "oil", name: "Dầu ăn", unit: "lít", required: "10", onHand: "4", pending: "2", shortage: "4", firstShortDate: "2026-11-26", level: "UPCOMING" },
  ]
  const all = renderToStaticMarkup(React.createElement(StockAlertList, { items, onCreateOrder: () => {} }))
  assert.match(all, /Gạo tẻ<\/span>: cần nhập thêm <strong>56 kg<\/strong> trước Thứ Ba 24\/11/)
  assert.match(all, /Dầu ăn/)
  assert.match(all, /Lập phiếu nhập/)
  const urgentOnly = renderToStaticMarkup(React.createElement(StockAlertList, { items, levels: ["URGENT"] }))
  assert.match(urgentOnly, /Gạo tẻ/)
  assert.doesNotMatch(urgentOnly, /Dầu ăn|Lập phiếu nhập/)
  assert.equal(renderToStaticMarkup(React.createElement(StockAlertList, { items: [items[1]], levels: ["URGENT"] })), "")
})

test("kitchen progress warns per grade by meal time: 90 min yellow, 30 min red, overdue red, samples always", async () => {
  const { kitchenProgressAlerts } = await server.ssrLoadModule("/src/utils/kitchenProgress.js")
  const meal = (mealType, status, counts, pendingDishes = []) => ({ mealType, status, dishCount: 3, notStarted: 0, cooking: 0, cookedNoSample: 0, done: 0, ...counts, pendingDishes })
  const progress = {
    menus: [
      { menuId: "m1", isSchoolWide: false, grades: [{ id: "g1", name: "Khối 1–3" }], meals: [
        meal("LUNCH", "DONE", { done: 3 }),
        meal("AFTERNOON", "COOKED_NO_SAMPLE", { done: 2, cookedNoSample: 1 }, [{ name: "Sữa chua", status: "COOKED_NO_SAMPLE" }]),
      ] },
      { menuId: "m2", isSchoolWide: false, grades: [{ id: "g2", name: "Khối 4–5" }], meals: [
        meal("LUNCH", "NOT_STARTED", { notStarted: 3 }, [{ name: "Cơm", status: "NOT_STARTED" }]),
      ] },
    ],
  }
  const mealTimes = { lunch: "11:00", afternoon: "14:30" }
  const at = (clock) => Date.parse(`2026-11-23T${clock}:00+07:00`)
  const levels = (clock) => kitchenProgressAlerts(progress, mealTimes, at(clock)).map((alert) => [alert.menuId, alert.mealType, alert.level])
  // Sớm hơn 90 phút: chỉ nhắc lưu mẫu
  assert.deepEqual(levels("09:00"), [["m1", "AFTERNOON", "sample"]])
  assert.deepEqual(levels("09:45"), [["m2", "LUNCH", "warning"], ["m1", "AFTERNOON", "sample"]])
  assert.deepEqual(levels("10:30"), [["m2", "LUNCH", "danger"], ["m1", "AFTERNOON", "sample"]])
  const overdue = kitchenProgressAlerts(progress, mealTimes, at("11:05"))
  assert.equal(overdue[0].level, "danger")
  assert.match(overdue[0].text, /Quá giờ ăn bữa trưa \(11:00\): Khối 4–5 chưa bắt đầu nấu \(Cơm\)/)
  assert.match(overdue[1].text, /Khối 1–3 · bữa xế: 1 món đã nấu xong nhưng chưa lưu đủ mẫu 24h \(Sữa chua\)/)
  // Chưa cấu hình giờ ăn: không cảnh báo theo giờ
  assert.deepEqual(kitchenProgressAlerts(progress, {}, at("11:05")).map((alert) => alert.level), ["sample"])

  const React = await import("react")
  const { renderToStaticMarkup } = await import("react-dom/server")
  const { default: Strip } = await server.ssrLoadModule("/src/pages/SCHOOL/KitchenCooking/CreateBatch/component/KitchenProgressStrip.jsx")
  const html = renderToStaticMarkup(React.createElement(Strip, { progress, mealTimes, selectedMeal: "lunch", activeMenuId: "m2", now: at("10:30") }))
  assert.match(html, /Bữa trưa · 11:00/)
  assert.match(html, /Khối 4–5<\/span><span[^>]*>Chưa nấu/)
  assert.match(html, /aria-pressed="true"[^>]*><span[^>]*>Khối 4–5/)
  assert.match(html, /role="alert"/)
  assert.equal(renderToStaticMarkup(React.createElement(Strip, { progress: { menus: [] }, mealTimes })), "")
})

test("inspection and sample photos are sent with their own record while photo-free requests stay JSON", async () => {
  const { decideDeliveryInspection } = await server.ssrLoadModule("/src/services/DeliveryInspectionService/index.js")
  const photo = new Blob(["photo"], { type: "image/jpeg" })
  respond = () => ({ id: id(1) })
  await decideDeliveryInspection(id(1), "REJECT", "damaged", photo)
  assert(requests[0].data instanceof FormData)
  assert.equal(requests[0].data.get("decision"), "REJECT")
  assert.equal(requests[0].data.get("reason"), "damaged")
  assert.equal(requests[0].data.get("photo").size, photo.size)
  await kitchen.createBatchSample(id(2), { dishId: id(3), quantity: "150", unit: "g", storageLocation: "A", sampledAt: "2026-11-14T12:00:00Z", photo })
  assert(requests[1].data instanceof FormData)
  assert.equal(requests[1].data.get("dishId"), id(3))
  assert.equal(requests[1].data.get("photo").size, photo.size)
  await decideDeliveryInspection(id(1), "APPROVE", "", null)
  assert.deepEqual(JSON.parse(requests[2].data), { decision: "APPROVE", reason: null })
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

test("multi-grade recipe preview reads each grade separately and checks its own allergens", async () => {
  const { inspectMenuMealSelection } = await server.ssrLoadModule("/src/services/MenuService/index.js")
  const dish = { id: id(40), name: "Món chung", gradeRecipes: [50, 51].map((grade, index) => ({ gradeId: id(grade), lines: [{ ingredientId: id(42 + index), ingredientRole: "MAIN", requiredQuantity: index ? "100" : "80", unit: "g" }] })) }
  respond = config => {
    const body = JSON.parse(config.data)
    assert.equal(body.gradeIds.length, 1)
    const larger = body.gradeIds[0] === id(51)
    if (config.url === "/dishes/recipe-preview") return { ingredientIds: [id(larger ? 43 : 42)], dishes: [{ dishId: id(40), ingredients: [{ ingredientId: id(larger ? 43 : 42), quantityPerPortion: larger ? "100" : "80", unit: "g" }] }], seasonings: [] }
    assert.equal(config.url, "/v1/menus/allergy-check")
    assert.deepEqual(body.ingredientIds, [id(larger ? 43 : 42)])
    return { hasConflict: larger, conflicts: larger ? [{ ingredientId: id(43), ingredientName: "Đậu phộng", affectedClasses: [{ classId: id(71), className: "4A", count: 2 }] }] : [] }
  }
  const result = await inspectMenuMealSelection({ dishes: [dish], gradeIds: [id(50), id(51)], refreshRecipe: true })
  assert.deepEqual(result.gradePreviews.map(row => row.recipe.dishes[0].ingredients[0].quantityPerPortion), ["80", "100"])
  assert.deepEqual(result.gradePreviews.map(row => row.allergies.hasConflict), [false, true])
  assert.equal(result.allergies.hasConflict, true)
  assert.equal(result.allergies.conflicts[0].affectedStudentsCount, 2)
  assert.deepEqual(result.issues, [])
})

test("unchanged multi-grade previews keep each saved snapshot without looking up current recipes", async () => {
  const { inspectMenuMealSelection } = await server.ssrLoadModule("/src/services/MenuService/index.js")
  respond = config => {
    assert.equal(config.url, "/v1/menus/allergy-check")
    const body = JSON.parse(config.data)
    assert.deepEqual(body.ingredientIds, [body.gradeIds[0] === id(50) ? id(42) : id(43)])
    return { hasConflict: false, conflicts: [] }
  }
  const recipe = (ingredientId, quantity) => ({ dishes: [{ dishId: id(40), ingredientStandards: [{ ingredientId, quantityPerPortion: quantity, unit: "g" }] }], seasonings: [] })
  const result = await inspectMenuMealSelection({ dishes: [{ dishId: id(40) }], gradeIds: [id(50), id(51)], gradeSnapshots: { [id(50)]: recipe(id(42), "18"), [id(51)]: recipe(id(43), "28") } })
  assert.deepEqual(result.gradePreviews.map(row => row.recipe.dishes[0].ingredients[0].quantityPerPortion), ["18", "28"])
  assert.equal(requests.length, 2)
})

test("grade authoring sends one atomic save request and one grouped submit request", async () => {
  respond = config => {
    const body = JSON.parse(config.data)
    if (config.url === "/v1/menus/grade-batch") {
      assert.deepEqual(body.gradeIds, [id(50), id(51)])
      assert.equal(body.submit, true)
      return { menus: [{ id: id(1), gradeIds: [id(50)] }, { id: id(60), gradeIds: [id(51)] }], allergyChecks: [], hasUnresolvedAllergies: false, submitted: true }
    }
    assert.equal(config.url, "/v1/menus/submit-group")
    assert.deepEqual(body.menuIds, [id(1), id(60)])
    return { menus: body.menuIds.map(id => ({ id, status: "PENDING_APPROVAL" })) }
  }
  await menus.saveGradeBatch({ gradeIds: [id(50), id(51)], weekStartDate: "2026-11-02", days: [] }, { submit: true })
  await menus.submitMenuGroup([id(1), id(60), id(1)])
  assert.equal(requests.length, 2)
})

test("same weekly dishes group into one display item while preserving every approval target", async () => {
  const { groupMenuCardsByWeek, groupSimilarMenuCards } = await server.ssrLoadModule("/src/services/MenuService/listGrades.js")
  const card = (weeklyMenuId, gradeId, quantity, dishId = id(40), status = "DRAFT") => ({ id: `${weeklyMenuId}_meal`, weeklyMenuId, gradeIds: [gradeId], targetScope: gradeId, rawDate: "2026-11-02", mealType: "LUNCH", status, dishes: [{ dishId, ingredientStandards: [{ ingredientId: id(42), quantityPerPortion: quantity, unit: "g" }] }] })
  const first = card(id(1), id(50), "80"), second = card(id(60), id(51), "100")
  const grouped = groupSimilarMenuCards(groupMenuCardsByWeek([first, second]))
  assert.equal(grouped.length, 1)
  assert.deepEqual(grouped[0].members.map(member => member.id), [id(1), id(60)])
  assert.deepEqual(grouped[0].menus[0].gradeIds, [id(50), id(51)])
  assert.equal(groupSimilarMenuCards(groupMenuCardsByWeek([first, { ...second, status: "APPROVED" }])).length, 2)
  assert.equal(groupSimilarMenuCards(groupMenuCardsByWeek([first, card(id(60), id(51), "100", id(41))])).length, 2)
})

test("new grade authoring cannot inherit dishes or seasonings from an unrelated grade", async () => {
  const { loadGradeAuthoringWeek } = await server.ssrLoadModule("/src/services/MenuService/gradeAuthoring.js")
  respond = config => config.url.endsWith("/week-schedule") ? { weeklyMenuId: id(1), availableMenus: [{ id: id(1), gradeIds: [id(50)] }], days: [{ date: "2026-11-02", hasMenu: true, status: "APPROVED" }] } : snapshot()
  const result = await loadGradeAuthoringWeek("2026-11-02", [id(51)])
  assert.equal(result.data.weeklyMenuId, null)
  assert.equal(result.data.weeklyMenuStatus, null)
  assert.equal(result.data.days[0].hasMenu, false)
  assert.deepEqual(result.data.days[0].meals.LUNCH.dishes, [])
  assert.deepEqual(result.data.days[0].seasoningsByMeal.LUNCH, [])
})

test("common authoring restores a separate saved snapshot for every selected grade", async () => {
  const { loadGradeAuthoringWeek } = await server.ssrLoadModule("/src/services/MenuService/gradeAuthoring.js")
  const first = { ...snapshot(), isSchoolWide: false, grades: [{ gradeId: id(50), grade: { name: "Khối 1–3" } }] }
  const second = { ...snapshot(), id: id(60), isSchoolWide: false, grades: [{ gradeId: id(51), grade: { name: "Khối 4–5" } }] }
  second.menuDays[0].id = id(61)
  second.menuDays[0].menuDayDishes[0].ingredients[0].quantityPerPortion = "110.625"
  const availableMenus = [first, second].map(week => ({ id: week.id, gradeIds: week.grades.map(row => row.gradeId), gradeNames: week.grades.map(row => row.grade.name) }))
  respond = config => {
    if (config.url.endsWith("/week-schedule")) {
      const selected = availableMenus.find(menu => menu.id === config.params.menuId)
      return { availableMenus, weeklyMenuId: selected?.id || null, weeklyMenuStatus: selected?.id === second.id ? second.status : first.status, gradeIds: selected?.gradeIds || [], days: [{ date: "2026-11-02", hasMenu: Boolean(selected), status: "DRAFT" }] }
    }
    return config.url.endsWith(`/${first.id}`) ? first : second
  }
  const response = await loadGradeAuthoringWeek("2026-11-02", [id(50), id(51)])
  assert.equal(response.data.gradeMenus.length, 2)
  const saved = response.data.days[0].gradeSnapshots
  assert.equal(saved[id(50)].LUNCH.dishes[0].ingredientStandards[0].quantityPerPortion, "80.125")
  assert.equal(saved[id(51)].LUNCH.dishes[0].ingredientStandards[0].quantityPerPortion, "110.625")
  second.menuDays[0].menuDayDishes[0].dishId = id(99)
  menus.invalidateMenuCache()
  await assert.rejects(loadGradeAuthoringWeek("2026-11-02", [id(50), id(51)]), /lịch món hoặc trạng thái khác nhau/)
  second.menuDays[0].menuDayDishes[0].dishId = first.menuDays[0].menuDayDishes[0].dishId
  second.status = "APPROVED"
  menus.invalidateMenuCache()
  await assert.rejects(loadGradeAuthoringWeek("2026-11-02", [id(50), id(51)]), /lịch món hoặc trạng thái khác nhau/)
})

test("grade preview renders a grade selector and its own quantities while hiding stale values during loading", async () => {
  const React = await import("react")
  const { renderToStaticMarkup } = await import("react-dom/server")
  const { default: Preview } = await server.ssrLoadModule("/src/pages/SCHOOL/MenuPlanning/component/MenuGradeRecipePreview.jsx")
  const props = { grades: [{ id: id(50), name: "Khối 1–3" }, { id: id(51), name: "Khối 4–5" }], dishes: [{ dishId: id(40), name: "Thịt kho" }], ingredientOptions: [{ ingredientId: id(42), name: "Thịt" }], previews: [50, 51].map((grade, index) => ({ gradeId: id(grade), allergies: { hasConflict: false }, issues: [], recipe: { dishes: [{ dishId: id(40), ingredients: [{ ingredientId: id(42), quantityPerPortion: index ? "100" : "80", unit: "g" }] }] } })) }
  const html = renderToStaticMarkup(React.createElement(Preview, props))
  assert.match(html, /Xem định lượng khối/)
  assert.match(html, /Khối 1–3/)
  assert.match(html, /Khối 4–5/)
  assert.match(html, /Thịt kho/)
  assert.match(html, />80<\/td>/)
  const pending = renderToStaticMarkup(React.createElement(Preview, { ...props, loading: true }))
  assert.match(pending, /Đang đối chiếu/)
  assert.doesNotMatch(pending, />80<\/td>/)
})

test("reopening selected grades ignores unassigned legacy menus instead of treating them as school-wide", async () => {
  const { loadGradeAuthoringWeek } = await server.ssrLoadModule("/src/services/MenuService/gradeAuthoring.js")
  const availableMenus = [
    { id: id(1), gradeIds: [id(50), id(51)], gradeNames: ["Khối 1–3", "Khối 4–5"], isSchoolWide: false },
    { id: id(60), gradeIds: [], gradeNames: [], isSchoolWide: false },
  ]
  const saved = { ...snapshot(), isSchoolWide: false, grades: availableMenus[0].gradeIds.map((gradeId, index) => ({ gradeId, grade: { name: availableMenus[0].gradeNames[index] } })) }
  respond = config => {
    if (config.url.endsWith("/week-schedule")) {
      assert.notEqual(config.params.menuId, id(60))
      return { availableMenus, weeklyMenuId: config.params.menuId || null, weeklyMenuStatus: "DRAFT", gradeIds: config.params.menuId ? availableMenus[0].gradeIds : [], days: [{ date: "2026-11-02", hasMenu: Boolean(config.params.menuId), status: "DRAFT" }] }
    }
    assert.equal(config.url, `/v1/menus/${saved.id}`)
    return saved
  }
  const reopened = await loadGradeAuthoringWeek("2026-11-02", [id(50), id(51)])
  assert.equal(reopened.data.gradeMenus.length, 1)
  assert.equal(reopened.data.weeklyMenuStatus, "DRAFT")
  assert.equal(reopened.data.days[0].gradeSnapshots[id(51)].LUNCH.dishes[0].dishId, id(3))
  const cards = adapter.adaptWeeklyMenuToCardList({ ...snapshot(), isSchoolWide: false, grades: [], isSchoolWide: false })
  assert.deepEqual(cards, [])
  assert.equal(adapter.adaptWeeklyMenuToCardList({ ...snapshot(), isSchoolWide: false, grades: [], isSchoolWide: true })[0].targetScope, "Toàn trường")
})

test("unassigned menus are hidden from all-grade cards, kitchen schedules and grade options", async () => {
  const { filterMenuCardsByGrade } = await server.ssrLoadModule("/src/services/MenuService/listGrades.js")
  const { menuGradeOptions } = await server.ssrLoadModule("/src/components/MenuScopeSelect.jsx")
  const { loadKitchenGradeSchedules } = await server.ssrLoadModule("/src/services/MenuService/gradeSchedule.js")
  const { loadGradeMenuDetails } = await server.ssrLoadModule("/src/services/MenuService/gradeDetail.js")
  const orphan = { id: id(60), gradeIds: [], gradeNames: [], isSchoolWide: false }
  const assigned = { id: id(1), gradeIds: [id(50)], gradeNames: ["Khối 1–3"], isSchoolWide: false }
  const school = { id: id(61), gradeIds: [], gradeNames: [], isSchoolWide: true }
  assert.deepEqual(filterMenuCardsByGrade([orphan, assigned, school]).map(menu => menu.id), [assigned.id, school.id])
  assert.deepEqual(menuGradeOptions([orphan]), [])
  assert.deepEqual(menuGradeOptions([orphan], [{ id: id(50), name: "Khối 1–3" }]), [{ key: id(50), label: "Khối 1–3", menuId: "" }])
  assert.equal(menuGradeOptions([school])[0].label, "Toàn trường")
  respond = config => {
    if (config.url.endsWith("/week-schedule")) {
      assert.notEqual(config.params.menuId, orphan.id)
      return { availableMenus: [orphan, assigned], weeklyMenuId: assigned.id, gradeIds: assigned.gradeIds, days: [{ date: "2026-11-02" }] }
    }
    if (config.url.endsWith("/requirements")) return { portionsFinalized: false }
    assert.equal(config.url, `/v1/menus/${assigned.id}`)
    return { ...snapshot(), isSchoolWide: false, grades: [{ gradeId: id(50), grade: { name: "Khối 1–3" } }] }
  }
  assert.deepEqual((await loadKitchenGradeSchedules("2026-11-02")).map(menu => menu.weeklyMenuId), [assigned.id])
  const details = await loadGradeMenuDetails({ ...snapshot(), isSchoolWide: false, grades: [{ gradeId: id(50), grade: { name: "Khối 1–3" } }] }, id(2), "LUNCH")
  assert.deepEqual(details.map(detail => detail.candidate.id), [assigned.id])
})

test("weekly status comes from the parent even if every saved day is approved", async () => {
  const { groupMenuCardsByWeek } = await server.ssrLoadModule("/src/services/MenuService/listGrades.js")
  const week = snapshot()
  week.menuDays = [week.menuDays[0]]
  week.menuDays[0].approvalStatus = "APPROVED"
  const cards = adapter.adaptWeeklyMenuToCardList(week)
  assert.equal(cards[0].status, "APPROVED")
  assert.equal(cards[0].weeklyStatus, "DRAFT")
  assert.equal(groupMenuCardsByWeek(cards)[0].status, "DRAFT")
})

test("daily progress does not mark missing days approved and meal filters do not change weekly completeness", async () => {
  const React = await import("react")
  const { renderToStaticMarkup } = await import("react-dom/server")
  const { default: View } = await server.ssrLoadModule("/src/pages/SCHOOL/MenuPlanning/component/MenuListWeeklyVerticalView.jsx")
  const schoolDays = [2, 3].map((date, index) => ({ dateISO: `2026-11-0${date}`, dateVN: `0${date}/11/2026`, dayLabel: `Thứ ${index + 2}`, dayOfWeek: index + 1 }))
  const week = snapshot()
  week.status = "APPROVED"
  week.menuDays = [week.menuDays[0]]
  week.menuDays[0].approvalStatus = "APPROVED"
  const cards = adapter.adaptWeeklyMenuToCardList(week)
  const html = renderToStaticMarkup(React.createElement(View, { schoolDays, menus: cards, weekStatus: "APPROVED" }))
  // Thứ chưa có món không hiện nhãn "Chưa tạo" (nhãn theo ngày chỉ còn đủ/thiếu bữa)
  assert.doesNotMatch(html, /Chưa tạo/)
  assert.match(html, /chưa đủ ngày\/bữa ăn/)
  assert.doesNotMatch(html, /title="Tiến độ ngày: Đã duyệt"[^]*Thứ 3[^]*title="Tiến độ ngày: Đã duyệt"/)
  const filtered = renderToStaticMarkup(React.createElement(View, { schoolDays: schoolDays.slice(0, 1), menus: cards.filter(card => card.mealType === "LUNCH"), allMenus: cards, mealTypeFilter: "LUNCH", weekStatus: "DRAFT" }))
  assert.match(filtered, /submitActive/)
  assert.doesNotMatch(filtered, /<button[^>]*disabled=""[^>]*title="Gửi thực đơn cả tuần/)
})

test("nutrition weekly list nests each allergy replacement under its original dish", async () => {
  const React = await import("react")
  const { renderToStaticMarkup } = await import("react-dom/server")
  const { default: View } = await server.ssrLoadModule("/src/pages/SCHOOL/MenuPlanning/component/MenuListWeeklyVerticalView.jsx")
  const week = snapshot()
  const day = week.menuDays[0]
  day.menuDayDishes.push(
    dish("LUNCH", 7, "80"), dish("LUNCH", 8, "80"), dish("LUNCH", 9, "80"),
    dish("AFTERNOON", 10, "80"),
  )
  const group = (mealType, isDefault, ids) => ({
    mealType, isDefault, dishes: ids.map(n => ({ dishId: id(n) })),
  })
  day.portionGroups = [
    group("LUNCH", true, [3, 7]),
    group("LUNCH", false, [3, 9]),
    group("LUNCH", false, [7, 8]),
    group("LUNCH", false, [7, 8]),
    group("AFTERNOON", true, [4]),
    group("AFTERNOON", false, [10]),
  ]
  const summary = structuredClone(week)
  for (const group of summary.menuDays[0].portionGroups) delete group.dishes
  respond = config => {
    if (config.url === "/v1/menus") return { items: [summary] }
    assert.equal(config.url, `/v1/menus/${week.id}`)
    return week
  }

  const query = { weekStartDate: week.weekStartDate }
  await menus.getMenus(query)
  assert.equal(requests.length, 1)
  const { data: cards } = await menus.getMenus({ ...query, includeAllergyDishes: true })
  assert.equal(requests.filter(request => request.url === `/v1/menus/${week.id}`).length, 1)
  const html = renderToStaticMarkup(React.createElement(View, {
    schoolDays: [{ dateISO: day.menuDate, dayOfWeek: 1 }],
    menus: cards,
  }))
  assert.match(html, />Dish 3<\/span><\/div><div[^>]*>\(Dish 8\)<\/div>/)
  assert.match(html, />Dish 7<\/span><\/div><div[^>]*>\(Dish 9\)<\/div>/)
  assert.match(html, />Dish 4<\/span><\/div><div[^>]*>\(Dish 10\)<\/div>/)
  assert.equal((html.match(/\(Dish 8\)/g) || []).length, 1)
  assert.doesNotMatch(html, />Dish (8|9|10)<\/span>/)
})

test("weekly list shows saved seasonings once per day and respects the selected meal", async () => {
  const React = await import("react")
  const { renderToStaticMarkup } = await import("react-dom/server")
  const { default: View } = await server.ssrLoadModule("/src/pages/SCHOOL/MenuPlanning/component/MenuListWeeklyVerticalView.jsx")
  const week = snapshot()
  week.menuDays = [week.menuDays[0]]
  week.menuDays[0].mealSeasonings = [
    { mealType: "LUNCH", ingredientEntry: { Ingredient: { name: "Muối" } } },
    { mealType: "AFTERNOON", ingredientEntry: { Ingredient: { name: "Muối" } } },
    { mealType: "LUNCH", ingredientEntry: { Ingredient: { name: "Nước mắm" } } },
    { mealType: "AFTERNOON", ingredientEntry: { Ingredient: { name: "Đường" } } },
  ]
  const cards = adapter.adaptWeeklyMenuToCardList(week)
  const props = { schoolDays: [{ dateISO: "2026-11-02", dateVN: "02/11/2026", dayOfWeek: 1, dayLabel: "Thứ Hai" }], allMenus: cards, menus: cards, weekStatus: "DRAFT" }
  const all = renderToStaticMarkup(React.createElement(View, props))
  assert.match(all, /GIA VỊ/)
  assert.equal((all.match(/>Muối<\/span>/g) || []).length, 1)
  assert.match(all, />Nước mắm<\/span>/)
  assert.match(all, />Đường<\/span>/)
  const afternoon = renderToStaticMarkup(React.createElement(View, { ...props, mealTypeFilter: "AFTERNOON", menus: cards.filter(card => card.mealType === "AFTERNOON") }))
  assert.match(afternoon, />Đường<\/span>/)
  assert.doesNotMatch(afternoon, />Nước mắm<\/span>/)
  assert.doesNotMatch(afternoon, /BỮA TRƯA/)
})

test("nutrition health overview service computes real KPI metrics and pending tasks without missing deliveriesPendingCount", async () => {
  const { getNutritionOverviewData } = await server.ssrLoadModule("/src/services/HealthOverviewService/index.js")
  respond = async config => {
    if (config.url === "/v1/menus" || config.url === "/menus") {
      return {
        items: [
          { id: id(80), title: "Tuần 45", status: "REVISION_REQUIRED", reviewNote: "Giảm muối", weekStartDate: "2026-11-09" },
          { id: id(81), title: "Tuần 46", status: "DRAFT", weekStartDate: "2026-11-16" },
          { id: id(82), title: "Tuần 44", status: "APPROVED", weekStartDate: "2026-11-02" },
        ],
      }
    }
    if (config.url === "/deliveries/inspections") {
      return {
        items: [
          { id: id(90), deliveryNo: "DELIV-01", supplierName: "CP", status: "ARRIVED", canInspect: true, arrivedAt: "2026-11-17T06:00:00Z" },
        ],
        stats: { pending: 1, arrived: 1, total: 2 },
        pagination: { page: 1, limit: 50, totalItems: 2 },
      }
    }
    if (config.url === "/class-allergies/catalog") {
      return {
        items: [
          { classId: id(100), className: "1A", ingredientEntryId: id(101), ingredientName: "Lạc", affectedCount: 2 },
        ],
        pagination: { hasNext: false, page: 1, limit: 100 },
      }
    }
    return {}
  }
  const result = await getNutritionOverviewData()
  assert.equal(result.kpis.menusTodoCount, 2)
  assert.equal(result.kpis.deliveriesPendingCount, 2)
  assert.equal(result.kpis.allergyClassCount, 1)
  assert.equal(result.tasks.length, 3)
  assert.equal(result.tasks[0].statusType, "danger")
  assert.equal(result.tasks[1].statusType, "warning")
  assert.equal(result.tasks[2].statusType, "info")
  assert.equal(result.tasks[2].status, "Bản nháp")
  assert.equal(result.tasks[2].subtitle, "")
})

test("recent meal allocations component adapts real backend distribution demands without mock allocations", async () => {
  const { adaptRecentAllocations } = await server.ssrLoadModule("/src/services/MealAllocationService/adapter.js")
  
  // 1. Empty data
  assert.deepEqual(adaptRecentAllocations(null), [])
  assert.deepEqual(adaptRecentAllocations({}), [])
  assert.deepEqual(adaptRecentAllocations({ distribution: { demands: [] } }), [])

  // 2. Real distribution demands
  const sampleData = {
    distribution: {
      status: "READY",
      demands: [
        {
          id: id(200),
          className: "1A",
          mealType: "LUNCH",
          requiredPortions: 35,
          allocatedPortions: 35,
          allocationStatus: "ALLOCATED",
        },
        {
          id: id(201),
          className: "Lớp 1B",
          mealType: "AFTERNOON",
          requiredPortions: 32,
          allocatedPortions: 0,
          allocationStatus: null,
        },
        {
          id: id(202),
          className: "2A",
          mealType: "LUNCH",
          requiredPortions: 30,
          allocatedPortions: 30,
          allocationStatus: "DISTRIBUTED",
        },
      ],
    },
  }

  const items = adaptRecentAllocations(sampleData)
  assert.equal(items.length, 3)
  assert.equal(items[0].target, "Lớp 1A")
  assert.equal(items[0].timeTag, "Bữa trưa")
  assert.equal(items[0].portion, "35 suất")
  assert.equal(items[0].status, "Đã phân bổ")
  assert.equal(items[0].statusType, "info")

  assert.equal(items[1].target, "Lớp 1B")
  assert.equal(items[1].timeTag, "Bữa xế")
  assert.equal(items[1].portion, "32 suất")
  assert.equal(items[1].status, "Chờ phân bổ")
  assert.equal(items[1].statusType, "warning")

  assert.equal(items[2].target, "Lớp 2A")
  assert.equal(items[2].status, "Đã giao")
  assert.equal(items[2].statusType, "success")
})

