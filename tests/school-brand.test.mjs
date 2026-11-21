import assert from "node:assert/strict"
import { realpathSync } from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import { after, before, test } from "node:test"
import { createServer } from "vite"

const SCHOOL_ID = "00000000-0000-4000-8000-000000000101"
const BRAND = {
  schoolId: SCHOOL_ID,
  name: "Trường Tiểu học Lê Văn Tám",
  logoUrl: "https://res.cloudinary.com/demo/school-logo.png",
}

let server
let Service
let store
let http
let React
let renderToString
let BrandLogo
let requests = []
const savedWindow = globalThis.window

before(async () => {
  server = await createServer({
    cacheDir: "/tmp/foodprint-school-brand-tests-vite",
    server: { middlewareMode: true, hmr: false, ws: false },
    optimizeDeps: { noDiscovery: true, entries: [] },
    appType: "custom",
  })
  globalThis.window = {
    location: { replace: () => assert.fail("Unexpected navigation redirect") },
  }
  http = (await server.ssrLoadModule("/src/services/01_axios/index.js")).default
  Service = (await server.ssrLoadModule("/src/services/SchoolService/index.js")).default
  store = await server.ssrLoadModule("/src/lib/schoolBrand.js")
  const requireFromRoot = createRequire(
    path.join(realpathSync.native(server.config.root), "package.json"),
  )
  React = requireFromRoot("react")
  ;({ renderToString } = requireFromRoot("react-dom/server"))
  BrandLogo = (await server.ssrLoadModule("/src/components/Common/BrandLogo.jsx")).default
  http.defaults.adapter = async (config) => {
    requests.push(config)
    return {
      status: 200,
      statusText: "OK",
      headers: {},
      config,
      data: { success: true, statusCode: 200, data: BRAND },
    }
  }
})

after(async () => {
  if (savedWindow === undefined) delete globalThis.window
  else globalThis.window = savedWindow
  await server?.close()
})

test("school brand is read from the session school without sending a school id", async () => {
  requests = []
  assert.deepEqual(await Service.getSchoolBrand(), BRAND)
  assert.equal(requests[0].method, "get")
  assert.match(requests[0].url, /\/schools\/me\/brand$/)
})

test("logo upload sends one multipart file named logo, removal uses DELETE", async () => {
  requests = []
  const file = new Blob(["png"], { type: "image/png" })
  await Service.uploadSchoolLogo(file)
  await Service.removeSchoolLogo()
  assert.equal(requests[0].method, "put")
  assert.match(requests[0].url, /\/schools\/me\/logo$/)
  assert.ok(requests[0].data instanceof FormData)
  assert.equal(requests[0].data.get("logo") instanceof Blob, true)
  assert.equal(requests[1].method, "delete")
  assert.match(requests[1].url, /\/schools\/me\/logo$/)
})

test("brand store loads once per school and reflects a newly uploaded logo", async () => {
  requests = []
  await store.loadSchoolBrand(SCHOOL_ID)
  await store.loadSchoolBrand(SCHOOL_ID)
  assert.equal(requests.length, 1)
  store.setSchoolBrand({ ...BRAND, logoUrl: null })
  assert.equal(await store.loadSchoolBrand(SCHOOL_ID).then((brand) => brand.logoUrl), null)
  assert.equal(requests.length, 1)
})

test("sidebar brand shows the school logo and name, FoodPrint as subtitle", () => {
  const html = renderToString(
    React.createElement(BrandLogo, {
      variant: "dashboard",
      title: BRAND.name,
      logoSrc: BRAND.logoUrl,
      subtitle: "FoodPrint",
    }),
  )
  assert.match(html, /school-logo\.png/)
  assert.match(html, /Trường Tiểu học Lê Văn Tám/)
  assert.match(html, />FoodPrint</)

  const platform = renderToString(React.createElement(BrandLogo, { variant: "dashboard" }))
  assert.doesNotMatch(platform, /school-logo/)
  assert.match(platform, />FoodPrint</)
})
