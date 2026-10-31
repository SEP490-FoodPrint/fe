import assert from "node:assert/strict"
import { after, before, beforeEach, test } from "node:test"
import { AxiosError } from "axios"
import { createServer } from "vite"
import { registrationList, registrationQuery, registrationRequest } from "../src/services/RegistrationService/adapter.js"
import { signupErrors, validPassword } from "../src/lib/authValidation.js"
import { onboardingBody } from "../src/services/AuthService/onboarding.js"
import { ROLES } from "../src/constants/roles.js"

const id = "00000000-0000-4000-8000-000000000101"
const principal = { id: "00000000-0000-4000-8000-000000000102", username: "system_admin", fullName: "Quản trị viên", role: "SYSTEM_ADMIN", orgType: "SYSTEM", permissions: ["registration.view"] }
const row = { id, applicantUserId: principal.id, requestType: "SCHOOL", status: "PENDING", submittedAt: "2026-10-30T08:00:00.000Z", reviewedAt: null, updatedAt: "2026-10-30T08:00:00.000Z", applicantUser: { id: principal.id, fullName: "Nguyễn Văn A" } }
const success = data => ({ success: true, statusCode: 200, data })
const list = (items = [row], total = 6, page = 1, limit = 5) => success({ items, pagination: { total, page, limit, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrevious: page > 1 } })
let server, http, RegistrationService, AuthService, SchoolService, storageKeys, navigation
let requests, respond
const memory = new Map()
const savedWindow = globalThis.window
const savedStorage = globalThis.localStorage

before(async () => {
  server = await createServer({
    cacheDir: "/tmp/foodprint-registration-tests-vite",
    server: { middlewareMode: true, hmr: false },
    optimizeDeps: { noDiscovery: true, entries: [] },
    define: { "import.meta.env.VITE_USE_MOCK": '"false"' },
    appType: "custom",
  })
  http = (await server.ssrLoadModule("/src/services/01_axios/index.js")).default
  RegistrationService = (await server.ssrLoadModule("/src/services/RegistrationService/index.js")).default
  AuthService = (await server.ssrLoadModule("/src/services/AuthService/index.js")).default
  SchoolService = (await server.ssrLoadModule("/src/services/SchoolService/index.js")).default
  storageKeys = (await server.ssrLoadModule("/src/lib/storage.js")).default
  navigation = await server.ssrLoadModule("/src/lib/utils.jsx")
  globalThis.window = { location: { replace: () => assert.fail("Unexpected redirect") } }
  globalThis.localStorage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, String(value)), removeItem: key => memory.delete(key) }
  http.defaults.adapter = async config => {
    requests.push(config)
    const payload = await respond(config)
    return { status: payload.statusCode || 200, statusText: "OK", headers: {}, config, data: payload }
  }
})

beforeEach(() => {
  memory.clear()
  requests = []
  respond = () => list()
})

after(async () => {
  await server?.close()
  if (savedWindow === undefined) delete globalThis.window
  else globalThis.window = savedWindow
  if (savedStorage === undefined) delete globalThis.localStorage
  else globalThis.localStorage = savedStorage
})

test("query uses the backend whitelist and omits empty filters", () => {
  assert.deepEqual(registrationQuery(), { page: 1, limit: 5 })
  assert.deepEqual(registrationQuery({ search: "  Nguyễn Văn  ", type: "SCHOOL", status: "PENDING", from: "2026-10-01", to: "2026-10-30", page: 2, pageSize: 2 }), {
    page: 2, limit: 2, search: "Nguyễn Văn", requestType: "SCHOOL", status: "PENDING", fromDate: "2026-10-01", toDate: "2026-10-30",
  })
})

test("list reads the nested pagination envelope without fabricating omitted fields", async () => {
  memory.set(storageKeys.TOKEN, "test-access-token")
  const result = await RegistrationService.getRequests({ page: 2 })
  assert.equal(requests[0].url, "/registration-requests")
  assert.equal(requests[0].headers.Authorization, undefined)
  assert.equal(requests[0].withCredentials, true)
  assert.equal(result.total, 6)
  assert.equal(result.data[0].applicant.full_name, "Nguyễn Văn A")
  assert.equal(result.data[0].applicant.email, undefined)
  assert.deepEqual(result.data[0].profile_data, {})
  assert.equal(result.isMock, false)
  assert.throws(() => registrationList({ data: [row], total: 6 }), /không hợp lệ/)
})

test("search uses its own endpoint and combines filters with server pagination", async () => {
  await RegistrationService.getRequests({ search: "  Nguyễn Văn  ", status: "PENDING", page: 2, pageSize: 2 })
  assert.equal(requests[0].url, "/registration-requests/search")
  assert.deepEqual(requests[0].params, { search: "Nguyễn Văn", status: "PENDING", page: 2, limit: 2 })
  await RegistrationService.getRequests({ search: "   " })
  assert.equal(requests[1].url, "/registration-requests")
})

test("summary uses unfiltered server counts and fetches at most one row per count", async () => {
  respond = config => list([], config.params.status === "PENDING" ? 12 : 80, 1, 1)
  assert.deepEqual(await RegistrationService.getSummary(), { total: 80, pending: 12 })
  assert.equal(requests.length, 2)
  assert(requests.every(config => config.params.limit === 1 && !config.params.search))
})

test("detail maps applicant/reviewer and preserves JSON payloads", async () => {
  const profile = { organizationName: "Trường học A", customField: { value: 1 } }
  const documents = [{ name: "Chứng nhận", url: "https://example.test/file.pdf" }]
  respond = () => success({ ...row, profileData: profile, supportingDocuments: documents, applicantUser: { ...row.applicantUser, email: "applicant@example.test" }, reviewedByUser: { id: principal.id, fullName: "Người duyệt" }, rejectionReason: "Lý do" })
  const result = await RegistrationService.getRequest(id)
  assert.equal(requests[0].url, `/registration-requests/${id}`)
  assert.equal(result.data.applicant.email, "applicant@example.test")
  assert.equal(result.data.reviewer.full_name, "Người duyệt")
  assert.deepEqual(result.data.profile_data, profile)
  assert.deepEqual(result.data.supporting_documents, documents)
  assert.equal(result.data.rejection_reason, "Lý do")
  assert.deepEqual(registrationRequest({ ...row, profileData: null, supportingDocuments: {} }).supporting_documents, [])
})

test("403/404/503 are surfaced to the page without falling back to demo data", async () => {
  for (const status of [403, 404, 503]) {
    respond = config => { throw new AxiosError("Request failed", "ERR_BAD_RESPONSE", config, null, { status, data: { success: false, message: `API error ${status}` } }) }
    await assert.rejects(RegistrationService.getRequest(id), new RegExp(`API error ${status}`))
  }
})

test("canceled requests stay canceled and review never calls an absent API", async () => {
  const controller = new AbortController()
  controller.abort()
  await assert.rejects(RegistrationService.getRequests({}, { signal: controller.signal }), error => error.code === "ERR_CANCELED")
  await assert.rejects(RegistrationService.reviewRequest(id, { status: "APPROVED" }), /chưa khả dụng/)
  assert.equal(requests.length, 0)
})

test("login uses cookie credentials/CSRF, stores no real token and restores via /auth/me", async () => {
  respond = () => success({ expiresIn: 900, user: principal })
  const session = await AuthService.login({ identifier: " system_admin ", password: "test-password" })
  assert.equal(requests[0].url, "/auth/login")
  assert.deepEqual(JSON.parse(requests[0].data), { identifier: "system_admin", password: "test-password" })
  assert.equal(requests[0].headers.Authorization, undefined)
  assert.equal(requests[0].headers["X-CSRF-Protection"], "1")
  assert.equal(requests[0].withCredentials, true)
  assert.equal(memory.has(storageKeys.TOKEN), false)
  assert.equal(memory.has(storageKeys.USER_INFO), false)
  assert.equal(session.user.userId, principal.id)
  respond = () => success({ ...principal, fullName: "Tên mới" })
  const restored = await AuthService.restoreSession()
  assert.equal(requests[1].url, "/auth/me")
  assert.equal(restored.fullName, "Tên mới")
  assert.equal(restored.role, "SYSTEM_ADMIN")
})

test("bad credentials never log in as a matching mock account", async () => {
  respond = config => { throw new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, null, { status: 401, data: { success: false, message: "Sai mật khẩu" } }) }
  await assert.rejects(AuthService.login({ identifier: "system_admin", password: "incorrect" }), /Sai mật khẩu/)
  assert.equal(memory.has(storageKeys.TOKEN), false)
  assert.equal(memory.has(storageKeys.USER_INFO), false)
})

test("real mode discards old mock sessions and blocks quick role login", async () => {
  memory.set(storageKeys.TOKEN, "mock_token_SYSTEM_ADMIN")
  memory.set(storageKeys.USER_INFO, JSON.stringify(principal))
  respond = () => success(principal)
  assert.equal((await AuthService.restoreSession()).id, principal.id)
  assert.equal(memory.has(storageKeys.TOKEN), false)
  assert.equal(requests.length, 1)
  assert.equal(requests[0].url, "/auth/me")
  assert.throws(() => AuthService.mockLoginByRole("SYSTEM_ADMIN"), /đang tắt/)
})

test("signup reads 201 and preserves the backend's UNVERIFIED onboarding receipt", async () => {
  respond = () => ({ success: true, statusCode: 201, data: { user: { id, username: "new_school", status: "UNVERIFIED" }, onboardingRequired: true } })
  const result = await AuthService.signup({ username: "new_school", fullName: "Người đại diện", email: "school@example.test", password: "long-test-password", requestType: "SCHOOL" })
  assert.equal(result.onboardingRequired, true)
  assert.equal(result.user.status, "UNVERIFIED")
  assert.equal(requests[0].url, "/auth/signup")
  assert.equal(requests[0].headers["X-CSRF-Protection"], "1")
  assert.equal(memory.has(storageKeys.TOKEN), false)
})

test("concurrent unauthorized reads share one refresh before retrying with cookies", async () => {
  let refreshed = false
  respond = async config => {
    if (config.url === "/auth/refresh") {
      await new Promise(resolve => setTimeout(resolve, 20))
      refreshed = true
      return success({ user: principal, expiresIn: 900 })
    }
    if (!refreshed) throw new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, null, { status: 401, data: { message: "Hết hạn" } })
    return list()
  }
  const results = await Promise.all([RegistrationService.getRequests(), RegistrationService.getRequests(), RegistrationService.getRequests()])
  assert(results.every(result => result.total === 6))
  assert.equal(requests.filter(config => config.url === "/auth/refresh").length, 1)
  assert.equal(requests.filter(config => config.url === "/registration-requests").length, 6)
  assert.equal(requests.find(config => config.url === "/auth/refresh").headers["X-CSRF-Protection"], "1")
})

test("refresh outages surface 503 without returning a logged-out or demo user", async () => {
  respond = config => {
    const status = config.url === "/auth/refresh" ? 503 : 401
    throw new AxiosError("Failed", "ERR_BAD_RESPONSE", config, null, { status, data: { message: status === 503 ? "Phiên tạm thời gián đoạn" : "Hết hạn" } })
  }
  await assert.rejects(AuthService.restoreSession(), error => error.response.status === 503 && error.message === "Phiên tạm thời gián đoạn")
  assert.equal(requests.length, 2)
})

test("logout revokes the backend session with CSRF and clears legacy browser storage", async () => {
  memory.set(storageKeys.TOKEN, "legacy-token")
  respond = () => success(null)
  await AuthService.logout()
  assert.equal(requests[0].url, "/auth/logout")
  assert.equal(requests[0].headers["X-CSRF-Protection"], "1")
  assert.equal(memory.has(storageKeys.TOKEN), false)
})

test("signup password rules count Unicode characters and enforce the UTF-8 byte limit", () => {
  assert.equal(validPassword("a".repeat(14)), false)
  assert.equal(validPassword("a".repeat(15)), true)
  assert.equal(validPassword("🙂".repeat(18)), true)
  assert.equal(validPassword("🙂".repeat(19)), false)
  const values = { username: "school_admin", fullName: "Nguyễn A", email: "a@example.test", phone: "", password: "long-test-password", confirmPassword: "mismatch" }
  assert.deepEqual(Object.keys(signupErrors(values)), ["confirmPassword"])
  assert.deepEqual(signupErrors({ ...values, confirmPassword: values.password }), {})
})

test("onboarding users keep the backend role code and use the matching frontend portal role", async () => {
  respond = () => success({ user: { ...principal, role: "INGREDIENT_SUPPLIER_ADMIN", orgType: "SUPPLIER", status: "UNVERIFIED", onboardingRequired: true, registrationRequest: null } })
  const { user } = await AuthService.login({ identifier: "supplier", password: "long-test-password" })
  assert.equal(user.roleCode, "INGREDIENT_SUPPLIER_ADMIN")
  assert.equal(user.role, ROLES.INGREDIENT_SUPPLIER_ADMIN)
  assert.equal(user.onboardingRequired, true)
  assert.equal(user.registrationRequest, null)
})

test("onboarding omits unused certificate rows and maps file indexes after filtering", () => {
  const values = { name: " Supplier ", email: "A@Example.test ", phone: "", address: "", taxCode: "123" }
  const blank = { certificationType: "", certificateNo: "", issuedDate: "", expiryDate: "", files: [] }
  const file = new File(["%PDF-1.7"], "certificate.pdf", { type: "application/pdf" })
  const row = { ...blank, certificationType: " ATTP ", certificateNo: " A-1 ", files: [file] }
  const body = onboardingBody({ requestType: "SUPPLIER", values, certifications: [blank, row] })
  assert(body instanceof FormData)
  assert.deepEqual([...body.keys()], ["profile", "certificate_0"])
  const profile = JSON.parse(body.get("profile"))
  assert.equal(profile.email, "a@example.test")
  assert.equal(profile.certifications.length, 1)
  assert.equal(profile.certifications[0].certificateNo, "A-1")
  assert.equal(body.get("certificate_0").name, "certificate.pdf")
})

test("onboarding without documents sends JSON and accepts only a confirmed PENDING receipt", async () => {
  respond = () => ({ success: true, statusCode: 201, data: { id, status: "PENDING", accountStatus: "UNVERIFIED" } })
  const result = await AuthService.submitOnboarding({ requestType: "SCHOOL", values: { name: " School ", code: "", email: "", phone: "", address: "" } })
  assert.equal(result.status, "PENDING")
  assert.equal(requests[0].url, "/auth/onboarding")
  assert.equal(requests[0].headers["X-CSRF-Protection"], "1")
  assert.deepEqual(JSON.parse(requests[0].data), { name: "School", code: null, email: null, phone: null, address: null })
  respond = () => success({ id, status: "APPROVED" })
  await assert.rejects(AuthService.submitOnboarding({ requestType: "SCHOOL", values: { name: "School" } }), /Chưa xác nhận/)
})

test("basic backend pagination remains readable without inventing totals or unsupported statistic filters", async () => {
  respond = () => success({ items: [row], pagination: { page: 1, limit: 5, hasNext: true } })
  const result = await RegistrationService.getRequests()
  assert.equal(result.total, null)
  assert.equal(result.hasNext, true)
  assert.equal(result.data.length, 1)
  requests = []
  assert.deepEqual(await RegistrationService.getSummary(), {})
  assert.equal(requests.length, 1)
  assert.equal(requests[0].params.status, undefined)
})

test("email verification uses the published endpoints and preserves cooldown metadata", async () => {
  respond = () => success({ expiresIn: 600, resendAfter: 60 })
  assert.deepEqual(await AuthService.sendActivationCode(" TEST@Example.test "), { expiresIn: 600, resendAfter: 60 })
  assert.equal(requests[0].url, "/auth/email-verification/request")
  assert.deepEqual(JSON.parse(requests[0].data), { email: "test@example.test" })
  assert.equal(requests[0].headers["X-CSRF-Protection"], "1")
  respond = () => success({ emailVerified: true, accountStatus: "UNVERIFIED" })
  assert.equal((await AuthService.verifyActivationCode({ email: "TEST@example.test", code: "012345" })).emailVerified, true)
  assert.equal(requests[1].url, "/auth/email-verification/verify")
  assert.equal(JSON.parse(requests[1].data).code, "012345")
  assert.equal(memory.has(storageKeys.TOKEN), false)
})

test("failed email codes never become a verified response", async () => {
  respond = config => { throw new AxiosError("Bad code", "ERR_BAD_REQUEST", config, null, { status: 400, data: { message: "Mã đã hết hạn" } }) }
  await assert.rejects(AuthService.verifyActivationCode({ email: "test@example.test", code: "000000" }), /Mã đã hết hạn/)
  assert.equal(requests.length, 1)
  assert.equal(memory.has(storageKeys.USER_INFO), false)
})

test("personal profile reads/updates /auth/me without sending role, status or email edits", async () => {
  respond = () => success({ ...principal, email: "test@example.test", phone: null })
  assert.equal((await AuthService.getPersonalProfile()).email, "test@example.test")
  assert.equal(requests[0].url, "/auth/me")
  respond = () => success({ ...principal, fullName: "Tên mới", phone: null })
  const updated = await AuthService.updatePersonalProfile({ fullName: " Tên mới ", phone: "", status: "ACTIVE", role: "SYSTEM_ADMIN", email: "other@example.test" })
  assert.equal(updated.fullName, "Tên mới")
  assert.equal(requests[1].method, "patch")
  assert.equal(requests[1].url, "/auth/me")
  assert.deepEqual(JSON.parse(requests[1].data), { fullName: "Tên mới", phone: null })
})

test("new applicants land on home and open registration only through the chosen account action", () => {
  const user = { ...principal, orgType: "SCHOOL", role: "SCHOOL_ADMIN", status: "UNVERIFIED", onboardingRequired: true, registrationRequest: null }
  assert.equal(navigation.getAuthRedirect(user), "/")
  assert.equal(navigation.needsRegistrationCompletion(user), true)
  assert.equal(navigation.getRegistrationDestination(user), "/register/profile")
  assert.equal(navigation.getRegistrationDestination({ ...user, registrationRequest: { status: "PENDING" } }), "/register/status")
  assert.equal(navigation.needsRegistrationCompletion({ ...user, registrationRequest: { status: "PENDING" } }), false)
  assert.equal(navigation.getAuthRedirect(principal), "/system/organization-approval")
})

test("active kitchen staff land on their dashboard while unverified staff stay on home", () => {
  const user = { ...principal, orgType: "SCHOOL", role: ROLES.SCHOOL_KITCHEN_STAFF, status: "ACTIVE" }
  assert.equal(navigation.getDefaultRedirectByUser(user), "/school/kitchen-cooking")
  assert.equal(navigation.getAuthRedirect(user), "/school/kitchen-cooking")
  assert.equal(navigation.getAuthRedirect({ ...user, status: "UNVERIFIED" }), "/")
  assert.equal(navigation.getAuthRedirect({ ...user, onboardingRequired: true }), "/")
})

test("school administrators keep the role required by the new administration route", async () => {
  respond = () => success({ user: { ...principal, role: "SCHOOL_ADMINISTRATION", orgType: "SCHOOL" } })
  const { user } = await AuthService.login({ identifier: "school_admin", password: "test-password" })
  assert.equal(user.roleCode, "SCHOOL_ADMINISTRATION")
  assert.equal(navigation.hasPermission([ROLES.SCHOOL_ADMIN], user.role), true)
  assert.equal(navigation.getAuthRedirect(user), "/school/overview")
})

test("unauthorized public school reads surface errors without redirecting anonymous visitors", async () => {
  const notifyOnError = http.defaults.notifyOnError
  http.defaults.notifyOnError = false
  respond = config => { throw new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, null, { status: 401, data: { message: "Không thể tải trường học" } }) }
  try {
    await assert.rejects(SchoolService.getPublicSchools(), /Không thể tải trường học/)
    await assert.rejects(SchoolService.getSchoolDetailByCode("SCH_ANH_DUONG"), /Không thể tải trường học/)
    assert.equal(requests.filter(config => config.url === "/auth/refresh").length, 2)
  } finally {
    http.defaults.notifyOnError = notifyOnError
  }
})

test("pending verification metadata never persists passwords, codes or tokens", async () => {
  const saved = globalThis.sessionStorage
  const entries = new Map()
  globalThis.sessionStorage = { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, String(value)), removeItem: key => entries.delete(key) }
  try {
    const { saveSignupSession, readSignupSession, clearSignupSession } = await import("../src/lib/signupSession.js")
    saveSignupSession({ email: "test@example.test", username: "test", requestType: "SCHOOL", password: "DO_NOT_STORE", code: "123456", token: "DO_NOT_STORE" })
    const raw = [...entries.values()].join("")
    assert(!raw.includes("DO_NOT_STORE"))
    assert(!raw.includes("123456"))
    assert.equal(readSignupSession().email, "test@example.test")
    clearSignupSession()
    assert.equal(readSignupSession(), null)
  } finally {
    if (saved === undefined) delete globalThis.sessionStorage
    else globalThis.sessionStorage = saved
  }
})

test("editing keeps stored files by ID and remaps retained certificate indexes after deleting a row", () => {
  const values = { name: "Supplier", email: "", phone: "", address: "", taxCode: "" }
  const certificate = { certificationType: "ISO", certificateNo: "ISO-002", files: [], existingDocuments: [{ id: "stored-second", field: "certificate_1", publicId: "DO_NOT_SEND" }] }
  const body = onboardingBody({ requestType: "SUPPLIER", values, editing: true, expectedUpdatedAt: "2026-10-31T08:00:00.000Z", certifications: [certificate] })
  assert.deepEqual(body.retainedDocuments, [{ id: "stored-second", field: "certificate_0" }])
  assert.equal(body.expectedUpdatedAt, "2026-10-31T08:00:00.000Z")
  assert.equal(JSON.stringify(body).includes("DO_NOT_SEND"), false)
  const removed = onboardingBody({ requestType: "SUPPLIER", values, editing: true, certifications: [] })
  assert.deepEqual(removed.retainedDocuments, [])
})

test("replacement files replace only their matching retained file; first submissions keep the original contract", () => {
  const values = { name: "School" }
  const file = new File(["%PDF-1.7"], "new.pdf", { type: "application/pdf" })
  const existingDocuments = [{ id: "stored-school", publicId: "DO_NOT_SEND" }]
  const kept = onboardingBody({ requestType: "SCHOOL", values, editing: true, existingDocuments })
  assert.deepEqual(kept.retainedDocuments, [{ id: "stored-school", field: "legalDocument" }])
  const replaced = onboardingBody({ requestType: "SCHOOL", values, editing: true, existingDocuments, documents: [file] })
  assert.deepEqual(JSON.parse(replaced.get("profile")).retainedDocuments, [])
  assert.equal(replaced.get("legalDocument").name, "new.pdf")
  assert.equal(onboardingBody({ requestType: "SCHOOL", values }).retainedDocuments, undefined)
})

test("rejected applications open the summary and are edited through the pencil action", () => {
  assert.equal(navigation.getRegistrationDestination({ orgType: "SCHOOL", registrationRequest: { status: "REJECTED" } }), "/register/status")
})
