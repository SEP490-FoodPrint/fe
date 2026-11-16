import assert from "node:assert/strict"
import { after, before, beforeEach, test } from "node:test"
import { createServer } from "vite"

const success = (data, statusCode = 200) => ({
  success: true,
  statusCode,
  data,
})

let server
let http
let SupplierIngredientService
let requests = []
let respond = () => success({})

const savedWindow = globalThis.window

before(async () => {
  server = await createServer({
    cacheDir: "/tmp/foodprint-ingredient-upload-tests-vite",
    server: { middlewareMode: true, hmr: false, ws: false },
    optimizeDeps: { noDiscovery: true, entries: [] },
    appType: "custom",
  })

  globalThis.window = {
    location: { replace: () => assert.fail("Unexpected navigation redirect") },
  }

  http = (await server.ssrLoadModule("/src/services/01_axios/index.js")).default
  SupplierIngredientService = (
    await server.ssrLoadModule("/src/services/SupplierIngredientService/index.js")
  ).default

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
  respond = () => success({})
})

after(async () => {
  if (savedWindow === undefined) delete globalThis.window
  else globalThis.window = savedWindow
  await server?.close()
})

test("uploadImage posts FormData with single 'image' field to /ingredients/management/upload-image and unwraps asset", async () => {
  const asset = {
    publicId: "foodprint/ingredients/ing-1",
    url: "https://res.cloudinary.com/demo/image/upload/ing-1.jpg",
    format: "jpg",
    bytes: 12345,
    width: 800,
    height: 600,
  }
  respond = () => success(asset, 201)

  const file = new File(["binary-image"], "carrot.jpg", { type: "image/jpeg" })
  const result = await SupplierIngredientService.uploadImage(file)

  assert.equal(requests.length, 1)
  const req = requests[0]
  assert.equal(req.method, "post")
  assert.equal(req.url, "/ingredients/management/upload-image")
  assert.equal(req.params, undefined)
  assert.equal(req.headers.get("X-CSRF-Protection"), "1")
  assert.ok(req.data instanceof FormData)
  assert.deepEqual([...req.data.keys()], ["image"])
  const uploadedFile = req.data.get("image")
  assert.equal(uploadedFile.name, "carrot.jpg")
  assert.deepEqual(result, asset)
})

test("uploadImages posts FormData with up to 5 'images' fields to /ingredients/management/upload-images and unwraps mixed results", async () => {
  const batchResults = [
    {
      index: 0,
      status: "success",
      asset: {
        publicId: "foodprint/ingredients/desc-1",
        url: "https://res.cloudinary.com/demo/image/upload/desc-1.png",
        format: "png",
        bytes: 2048,
        width: 400,
        height: 400,
      },
    },
    {
      index: 1,
      status: "failed",
      error: {
        code: "INVALID_IMAGE_FILE",
        message: "Định dạng ảnh không hợp lệ",
      },
    },
  ]
  respond = () => success({ results: batchResults }, 200)

  const files = Array.from({ length: 6 }, (_, i) =>
    new File([`img-${i}`], `desc-${i}.png`, { type: "image/png" }),
  )
  const results = await SupplierIngredientService.uploadImages(files)

  assert.equal(requests.length, 1)
  const req = requests[0]
  assert.equal(req.method, "post")
  assert.equal(req.url, "/ingredients/management/upload-images")
  assert.equal(req.params, undefined)
  assert.ok(req.data instanceof FormData)
  const entries = req.data.getAll("images")
  assert.equal(entries.length, 5)
  assert.deepEqual(
    [...new Set(req.data.keys())],
    ["images"],
  )
  assert.deepEqual(results, batchResults)
})

test("changeStatus, hide, and activate send PATCH /ingredients/management/:id/status with ACTIVE or INACTIVE", async () => {
  const ingId = "00000000-0000-4000-8000-000000000401"
  respond = config => {
    const body = typeof config.data === "string" ? JSON.parse(config.data) : config.data
    return success({
      id: ingId,
      name: "Cà rốt Đà Lạt",
      defaultUnit: "kg",
      status: body.status,
      imageDescription: [],
    })
  }

  const hidden = await SupplierIngredientService.hide(ingId)
  assert.equal(hidden.status, "INACTIVE")
  assert.equal(requests[0].method, "patch")
  assert.equal(requests[0].url, `/ingredients/management/${ingId}/status`)
  assert.equal(requests[0].headers.get("X-CSRF-Protection"), "1")
  assert.deepEqual(JSON.parse(requests[0].data), { status: "INACTIVE" })

  const reopened = await SupplierIngredientService.activate(ingId)
  assert.equal(reopened.status, "ACTIVE")
  assert.equal(requests[1].method, "patch")
  assert.equal(requests[1].url, `/ingredients/management/${ingId}/status`)
  assert.deepEqual(JSON.parse(requests[1].data), { status: "ACTIVE" })

  const toggled = await SupplierIngredientService.changeStatus(ingId, "inactive")
  assert.equal(toggled.status, "INACTIVE")
  assert.deepEqual(JSON.parse(requests[2].data), { status: "INACTIVE" })

  await assert.rejects(
    () => SupplierIngredientService.changeStatus(ingId, "DELETED"),
    /ACTIVE hoặc INACTIVE/,
  )
})
