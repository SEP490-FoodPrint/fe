import assert from "node:assert/strict"
import { test } from "node:test"
import {
  firstUnconfirmed, latestConfirmed, proofVersion, safeExplorerUrl, sealState, shortHash,
} from "../src/services/BlockchainProofService/adapter.js"
import { apiAnchorProofVersion, apiGetGradeChain, apiGetProofVersions, apiGetPublicGradeChain, apiGetPublicGradeMeals, apiVerifyProofVersion } from "../src/services/BlockchainProofService/urls.js"
import { classLabel, gradeLabel, gradeMeal, mealChain, parseMealKey, readableResult } from "../src/services/BlockchainProofService/chainAdapter.js"

const row = (version, transactionStatus, extra = {}) => proofVersion({
  id: `00000000-0000-4000-8000-00000000000${version}`,
  kind: "registrations",
  recordId: "00000000-0000-4000-8000-000000000100",
  version,
  eventType: version === 3 ? "REGISTRATION_APPROVED" : "REGISTRATION_SUBMITTED",
  dataHash: `0x${"a".repeat(64)}`,
  transactionStatus,
  transactionHash: transactionStatus === "PREPARED" ? null : `0x${"b".repeat(64)}`,
  explorerUrl: transactionStatus === "PREPARED" ? null : `https://sepolia.etherscan.io/tx/0x${"b".repeat(64)}`,
  recordedAt: transactionStatus === "CONFIRMED" ? "2026-11-17T08:00:00.000Z" : null,
  verificationStatus: "NOT_VERIFIED",
  createdAt: "2026-11-17T07:59:00.000Z",
  ...extra,
})

test("one record is sealed only when every version is confirmed", () => {
  assert.equal(sealState([]), "NONE")
  assert.equal(sealState([row(1, "CONFIRMED"), row(2, "SUBMITTED")]), "PENDING")
  assert.equal(sealState([row(1, "CONFIRMED"), row(2, "PREPARED")]), "PENDING")
  assert.equal(sealState([row(1, "FAILED"), row(2, "SUBMITTED")]), "FAILED")
  assert.equal(sealState([row(1, "CONFIRMED"), row(2, "CONFIRMED")]), "CONFIRMED")
})

test("integrity check targets the newest confirmed version; resend targets the oldest open one", () => {
  const versions = [row(1, "CONFIRMED"), row(2, "FAILED"), row(3, "PREPARED")]
  assert.equal(latestConfirmed(versions)?.version, 1)
  assert.equal(firstUnconfirmed(versions)?.version, 2)
  assert.equal(latestConfirmed([row(1, "PREPARED")]), null)
  assert.equal(firstUnconfirmed([row(1, "CONFIRMED")]), null)
})

test("versions get readable event labels and keep document check results", () => {
  const version = row(3, "CONFIRMED", {
    verificationStatus: "MISMATCH",
    documents: [{ id: "d1", field: "certificate_1", fileName: "attp.pdf", status: "MISMATCH" }, null],
  })
  assert.equal(version.eventLabel, "Duyệt hồ sơ")
  assert.deepEqual(version.documents, [{ id: "d1", field: "certificate_1", fileName: "attp.pdf", status: "MISMATCH" }])
  assert.equal(row(1, "CONFIRMED").documents, null)
  assert.throws(() => proofVersion({ id: "x" }), /không hợp lệ/)
})

test("only https Etherscan links are rendered", () => {
  assert.equal(safeExplorerUrl("https://sepolia.etherscan.io/tx/0xabc"), "https://sepolia.etherscan.io/tx/0xabc")
  assert.equal(safeExplorerUrl("http://sepolia.etherscan.io/tx/0xabc"), null)
  assert.equal(safeExplorerUrl("https://evil.example/etherscan.io"), null)
  assert.equal(safeExplorerUrl("javascript:alert(1)"), null)
  assert.equal(safeExplorerUrl(null), null)
})

test("hashes are shortened for display and urls reject unknown kinds", () => {
  assert.equal(shortHash(`0x${"a".repeat(64)}`), "0xaaaaaa…aaaaaa")
  assert.equal(shortHash(null), "—")
  assert.equal(apiGetProofVersions("registrations", "a/b"), "/blockchain-proofs/registrations/a%2Fb/versions")
  assert.equal(apiVerifyProofVersion("deliveries", "v1"), "/blockchain-proofs/deliveries/versions/v1/verify")
  assert.equal(apiAnchorProofVersion("retained-samples", "v1"), "/blockchain-proofs/retained-samples/versions/v1/anchor")
  assert.throws(() => apiGetProofVersions("users", "x"), /không hợp lệ/)
})

const DELIVERY = "00000000-0000-4000-8000-000000000201"
const BATCH = "00000000-0000-4000-8000-000000000202"
const SAMPLE = "00000000-0000-4000-8000-000000000203"
const SCHOOL = "00000000-0000-4000-8000-000000000204"

let nodeCount = 0
const node = (kind, recordId, extra = {}) => ({
  id: `00000000-0000-4000-8000-0000000003${String(++nodeCount).padStart(2, "0")}`,
  kind,
  recordId,
  version: 1,
  eventType: "COOKING_COMPLETED",
  dataHash: `0x${"a".repeat(64)}`,
  transactionStatus: "CONFIRMED",
  explorerUrl: `https://sepolia.etherscan.io/tx/0x${"b".repeat(64)}`,
  recordedAt: "2026-11-16T03:00:00.000Z",
  verificationStatus: "VERIFIED",
  createdAt: "2026-11-16T02:59:00.000Z",
  links: [],
  ...extra,
})

const chainResponse = nodes => ({
  mealAllocationId: null,
  schoolId: SCHOOL,
  date: "2026-11-16",
  intact: true,
  meal: {
    gradeId: "g3",
    gradeName: "3",
    mealType: "LUNCH",
    portions: 60,
    status: "DISTRIBUTED",
    distributedAt: null,
    classes: [
      { id: "a", className: "3A", portions: 30, status: "DISTRIBUTED", distributedAt: null },
      { id: "b", className: "Lớp 3B", portions: 30, status: "DISTRIBUTED", distributedAt: null },
    ],
  },
  steps: {
    deliveries: [{ id: DELIVERY, deliveryNo: "DL-1", supplierName: "NCC A", status: "RECEIVED", vehiclePlate: "51C-1", expectedArrivalAt: null, receivedAt: null }],
    cookingBatches: [{ id: BATCH, batchCode: "B1", status: "COMPLETED", dishes: ["Canh chua"], plannedPortions: 120, allocatedPortions: 30, completedAt: null }],
    retainedSamples: [{ id: SAMPLE, cookingBatchId: BATCH, dishName: "Canh chua", status: "STORED", sampledAt: null, disposedAt: null }],
    distribution: { recordId: `${SCHOOL}:2026-11-16`, date: "2026-11-16" },
  },
  nodes,
})

test("meal chain puts every step on the route, even without a proof", () => {
  const chain = mealChain(chainResponse([
    node("delivery-declarations", DELIVERY, { eventType: "DELIVERY_DECLARED" }),
    node("deliveries", DELIVERY, { eventType: "DELIVERY_INSPECTED", links: [{ field: "declarationHash", status: "MATCH" }] }),
    node("cooking-batches", BATCH),
  ]))
  assert.deepEqual(chain.stops.map(stop => [stop.phase, stop.state]), [
    ["declare", "VERIFIED"],
    ["inspect", "VERIFIED"],
    ["cook", "VERIFIED"],
    ["sample", "MISSING"],
    ["distribute", "MISSING"],
  ])
  assert.equal(chain.stops[0].proofs[0].eventLabel, "Nhà cung cấp khai báo giao hàng")
  assert.deepEqual(chain.issues.map(issue => issue.tone), ["neutral", "neutral"])
  const last = chain.stops.at(-1)
  assert.equal(last.title, "Phát suất ăn cho khối 3")
  assert.deepEqual(last.facts, ["Đã phát", "2 lớp: 3A, 3B"])
  assert.equal(chain.meal.gradeLabel, "Khối 3")
})

test("a changed step and a broken link are flagged where they happen", () => {
  const chain = mealChain({
    ...chainResponse([
      node("delivery-declarations", DELIVERY, {
        verificationStatus: "MISMATCH",
        verificationResult: "Dữ liệu hiện tại khác dữ liệu đã neo: vehiclePlate",
      }),
      node("deliveries", DELIVERY, { links: [{ field: "declarationHash", status: "MISMATCH" }] }),
    ]),
    intact: false,
  })
  assert.equal(chain.intact, false)
  assert.equal(chain.counts.broken, 2)
  assert.deepEqual(chain.issues.filter(issue => issue.tone === "error").map(issue => issue.message), [
    "Dữ liệu đã bị sửa sau khi niêm phong: biển số xe",
    "Không khớp với khai báo của nhà cung cấp đã niêm phong trước đó",
  ])
})

test("send failures and pending sends are not reported as intact", () => {
  const chain = mealChain(chainResponse([
    node("cooking-batches", BATCH, { transactionStatus: "FAILED", verificationStatus: "NOT_VERIFIED" }),
    node("retained-samples", SAMPLE, { transactionStatus: "SUBMITTED", verificationStatus: "NOT_VERIFIED" }),
    node("meal-distributions", `${SCHOOL}:2026-11-16`, { verificationStatus: "NOT_VERIFIED" }),
  ]))
  const states = Object.fromEntries(chain.stops.map(stop => [stop.phase, stop.state]))
  assert.equal(states.cook, "FAILED")
  assert.equal(states.sample, "PENDING")
  assert.equal(states.distribute, "SEALED")
  assert.throws(() => mealChain({}), /không hợp lệ/)
  assert.equal(apiGetGradeChain("x/y"), "/blockchain-proofs/chains/grade-meals/x%2Fy")
  assert.equal(apiGetGradeChain(null), "/blockchain-proofs/chains/grade-meals/none")
})

test("grade meal rows get readable labels and keys", () => {
  const row = gradeMeal({ key: "g1:AFTERNOON", gradeId: "g1", gradeName: "Khối 1", schoolName: "TH A", mealType: "AFTERNOON", classCount: 3, portions: 90, status: "PARTIAL" })
  assert.equal(row.gradeLabel, "Khối 1")
  assert.equal(row.mealLabel, "Bữa chiều")
  assert.equal(row.statusLabel, "Đang phát")
  assert.equal(gradeLabel(null), "Chưa xếp khối")
  assert.equal(gradeLabel("2"), "Khối 2")
  assert.deepEqual(parseMealKey("none:LUNCH"), { gradeId: null, mealType: "LUNCH" })
  assert.deepEqual(parseMealKey(row.key), { gradeId: "g1", mealType: "AFTERNOON" })
  assert.throws(() => parseMealKey("g1:DINNER"), /không hợp lệ/)
  assert.equal(readableResult("Không kết nối được blockchain"), "Không kết nối được blockchain")
})

test("verification text keeps business notes and class names are not doubled", () => {
  assert.equal(
    readableResult("Dữ liệu hiện tại khác dữ liệu đã neo: vehiclePlate. Khớp khai báo giao hàng của NCC"),
    "Dữ liệu đã bị sửa sau khi niêm phong: biển số xe. Khớp khai báo giao hàng của NCC",
  )
  assert.equal(readableResult("Dữ liệu hiện tại khác dữ liệu đã neo: items[0].actualQuantity, items[1].actualQuantity"),
    "Dữ liệu đã bị sửa sau khi niêm phong: số lượng thực nhận")
  assert.equal(classLabel("Lớp 1A"), "Lớp 1A")
  assert.equal(classLabel("3B"), "Lớp 3B")
})

test("a stored check result is not shown as intact until the user checks now", () => {
  const response = chainResponse([node("cooking-batches", BATCH)])
  const stale = mealChain(response, { checked: false })
  assert.equal(stale.stops.find(stop => stop.phase === "cook").state, "SEALED")
  assert.equal(mealChain(response).stops.find(stop => stop.phase === "cook").state, "VERIFIED")
})

test("public urls encode the school code", () => {
  assert.equal(apiGetPublicGradeMeals("TH A/1"), "/blockchain-proofs/public/schools/TH%20A%2F1/grade-meals")
  assert.equal(apiGetPublicGradeChain("TH-1", "g"), "/blockchain-proofs/public/schools/TH-1/grade-meals/g")
  assert.equal(apiGetPublicGradeChain("TH-1", null), "/blockchain-proofs/public/schools/TH-1/grade-meals/none")
})

test("classes without a grade are traced together", () => {
  const response = chainResponse([])
  response.meal = { ...response.meal, gradeId: null, gradeName: null, status: "PARTIAL" }
  const chain = mealChain(response)
  assert.equal(chain.meal.gradeLabel, "Chưa xếp khối")
  assert.equal(chain.stops.at(-1).title, "Phát suất ăn cho các lớp chưa xếp khối")
  assert.equal(chain.stops.at(-1).expectsProof, true)
})
