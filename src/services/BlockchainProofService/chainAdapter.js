// Turns the meal chain API into "stops" of a delivery-style timeline, so a broken or missing
// proof shows at the step where it happened instead of disappearing from the list.
import { proofVersion } from "./adapter.js"

export const MEAL_TYPE_LABELS = { LUNCH: "Bữa trưa", AFTERNOON: "Bữa chiều" }

export const ALLOCATION_STATUS_LABELS = {
  ALLOCATED: "Đã phân bổ",
  DISTRIBUTED: "Đã phát",
  FINALIZED: "Đã chốt",
  CANCELLED: "Đã huỷ",
  PARTIAL: "Đang phát",
}

/** Per-stop state, from best to worst. */
export const STOP_STATES = {
  VERIFIED: { tone: "success", label: "Nguyên vẹn" },
  SEALED: { tone: "success", label: "Đã niêm phong" },
  PENDING: { tone: "info", label: "Đang niêm phong" },
  UNCHECKED: { tone: "warning", label: "Không kiểm tra được" },
  FAILED: { tone: "warning", label: "Chưa niêm phong được" },
  MISSING: { tone: "neutral", label: "Chưa có bằng chứng" },
  BROKEN: { tone: "error", label: "Phát hiện thay đổi" },
}

/** Hash references in a payload, named after the step they point back to. */
const LINK_LABELS = {
  declarationHash: "khai báo của nhà cung cấp",
  deliveryInspectionHash: "biên bản kiểm nhận",
  cookingCompletedHash: "mẻ nấu",
  previousHash: "lần lưu mẫu",
}

/** Payload field names that the API reports as changed, in plain words. */
const FIELD_LABELS = {
  vehiclePlate: "biển số xe",
  expectedArrivalAt: "giờ giao dự kiến",
  arrivedAt: "giờ xe đến",
  receivedAt: "giờ nhận hàng",
  receivedByUserId: "người nhận hàng",
  outcome: "kết quả kiểm nhận",
  approvals: "quyết định của các bên",
  items: "danh sách hàng",
  lots: "lô nguyên liệu",
  actualQuantity: "số lượng thực nhận",
  plannedPortions: "số suất",
  dishes: "món ăn",
  completedAt: "giờ hoàn thành",
  photoHash: "ảnh minh chứng",
  sampledAt: "giờ lưu mẫu",
  storageLocation: "vị trí lưu mẫu",
  allocations: "danh sách lớp",
  batches: "mẻ được chia",
  totalPortions: "tổng số suất",
  distributedAt: "giờ phát",
}

const text = value => (typeof value === "string" && value ? value : null)
const number = value => (Number.isFinite(value) ? value : null)
const list = value => (Array.isArray(value) ? value.filter(item => item && typeof item === "object") : [])

/** Class names may already read "Lớp 1A"; add the word only when missing. */
export function classLabel(name) {
  const value = text(name)
  if (!value) return "Lớp"
  return /^lớp\s/i.test(value) ? value : `Lớp ${value}`
}

/** Grade names may already read "Khối 3"; classes without a grade are grouped together. */
export function gradeLabel(name) {
  const value = text(name)
  if (!value) return "Chưa xếp khối"
  return /^khối\s/i.test(value) ? value : `Khối ${value}`
}

/** Generated codes like "CB-<uuid>" help no one reading the page. */
const readableCode = value => (text(value) && value.length <= 24 ? value : null)

const MEAL_TYPES = ["LUNCH", "AFTERNOON"]

/** `<gradeId|none>:<mealType>` -> { gradeId (null for none), mealType }. */
export function parseMealKey(key) {
  const [grade, mealType] = String(key || "").split(":")
  if (!grade || !MEAL_TYPES.includes(mealType)) throw new Error("Bữa ăn không hợp lệ.")
  return { gradeId: grade === "none" ? null : grade, mealType }
}

const mealLabel = mealType => MEAL_TYPE_LABELS[mealType] || mealType || "Bữa ăn"
const statusLabel = status => ALLOCATION_STATUS_LABELS[status] || status || ""

/** One grade's meal on a day, as a row to pick. */
export function gradeMeal(value) {
  return {
    key: value?.key,
    gradeId: text(value?.gradeId),
    gradeLabel: gradeLabel(value?.gradeName),
    schoolName: text(value?.schoolName),
    mealType: value?.mealType,
    mealLabel: mealLabel(value?.mealType),
    classCount: number(value?.classCount),
    portions: number(value?.portions),
    status: value?.status,
    statusLabel: statusLabel(value?.status),
    distributedAt: text(value?.distributedAt),
  }
}

/** The traced grade meal with its classes. */
function chainMeal(value) {
  const classes = list(value?.classes).map(item => ({
    id: item.id,
    classLabel: classLabel(item.className),
    portions: number(item.portions),
    status: item.status,
    statusLabel: statusLabel(item.status),
    distributedAt: text(item.distributedAt),
  }))
  return {
    gradeId: text(value?.gradeId),
    gradeLabel: gradeLabel(value?.gradeName),
    mealType: value?.mealType,
    mealLabel: mealLabel(value?.mealType),
    portions: number(value?.portions),
    status: value?.status,
    statusLabel: statusLabel(value?.status),
    distributedAt: text(value?.distributedAt),
    classes,
  }
}

/** "Dữ liệu hiện tại khác dữ liệu đã neo: a, b" -> same sentence with readable field names. */
export function readableResult(result) {
  const value = text(result)
  if (!value) return null
  const marker = value.indexOf(": ")
  if (!value.startsWith("Dữ liệu hiện tại khác") || marker < 0) return value
  // Business notes may follow the field list as ". <note>"; field paths never contain ". ".
  const [fieldList, ...notes] = value.slice(marker + 2).split(". ")
  const fields = fieldList.split(",").map(item => {
    const key = item.trim().replace(/\[\d+\]/g, "").split(".").pop()
    return FIELD_LABELS[key] || item.trim()
  })
  return [`Dữ liệu đã bị sửa sau khi niêm phong: ${[...new Set(fields)].join(", ")}`, ...notes].join(". ")
}

/**
 * Without `checked` the stored result of an earlier check is dropped: it can be stale or edited
 * in the database, so only a check made now may say "intact". Link results are always fresh.
 */
function chainNode(value, checked) {
  const proof = proofVersion(value)
  if (!checked) {
    proof.verificationStatus = "NOT_VERIFIED"
    proof.verificationResult = null
    proof.verifiedAt = null
  }
  return {
    ...proof,
    links: list(value?.links).map(link => ({
      field: link.field,
      status: link.status,
      label: LINK_LABELS[link.field] || link.field,
    })),
  }
}

function stopState(proofs) {
  if (!proofs.length) return "MISSING"
  const broken = proofs.some(proof =>
    proof.verificationStatus === "MISMATCH" || proof.links.some(link => link.status === "MISMATCH"))
  if (broken) return "BROKEN"
  if (proofs.some(proof => proof.transactionStatus === "FAILED")) return "FAILED"
  if (proofs.some(proof => proof.transactionStatus !== "CONFIRMED")) return "PENDING"
  if (proofs.some(proof => proof.verificationStatus === "FAILED")) return "UNCHECKED"
  if (proofs.every(proof => proof.verificationStatus === "VERIFIED")) return "VERIFIED"
  return "SEALED"
}

/** Problems worth a banner: changed data, broken links, failed sends, missing proofs. */
function stopIssues(stop) {
  const issues = []
  for (const proof of stop.proofs) {
    if (proof.verificationStatus === "MISMATCH")
      issues.push({ tone: "error", message: readableResult(proof.verificationResult) || "Dữ liệu khác bản đã niêm phong" })
    for (const link of proof.links)
      if (link.status === "MISMATCH")
        issues.push({ tone: "error", message: `Không khớp với ${link.label} đã niêm phong trước đó` })
    if (proof.transactionStatus === "FAILED")
      issues.push({ tone: "warning", message: "Ghi lên blockchain chưa thành công" })
    if (proof.verificationStatus === "FAILED")
      issues.push({ tone: "warning", message: proof.verificationResult || "Không kiểm tra được với blockchain" })
  }
  if (!stop.proofs.length && stop.expectsProof)
    issues.push({ tone: "neutral", message: "Bước này chưa được niêm phong trên blockchain" })
  return issues
}

function stop(base, proofs) {
  const value = { ...base, proofs }
  value.state = stopState(proofs)
  value.issues = stopIssues(value)
  return value
}

export function mealChain(value, { checked = true } = {}) {
  if (!value || typeof value !== "object" || !value.steps) throw new Error("Dữ liệu truy xuất không hợp lệ.")
  const nodes = list(value.nodes).map(node => chainNode(node, checked))
  const proofsOf = (kind, recordId) => nodes.filter(node => node.kind === kind && node.recordId === recordId)
  const steps = value.steps
  const meal = chainMeal(value.meal)
  const deliveries = list(steps.deliveries)
  const batches = list(steps.cookingBatches)
  const samples = list(steps.retainedSamples)
  const distribution = steps.distribution || {}

  const stops = [
    ...deliveries.map(delivery => {
      const proofs = proofsOf("delivery-declarations", delivery.id)
      return stop({
        key: `declare-${delivery.id}`,
        phase: "declare",
        title: "Nhà cung cấp xuất hàng",
        subtitle: delivery.supplierName,
        facts: [
          delivery.deliveryNo && `Phiếu ${delivery.deliveryNo}`,
          delivery.vehiclePlate && `Xe ${delivery.vehiclePlate}`,
          delivery.expectedArrivalAt && `Dự kiến đến ${formatTime(delivery.expectedArrivalAt)}`,
        ].filter(Boolean),
        time: proofs[0]?.createdAt || null,
        expectsProof: true,
      }, proofs)
    }),
    ...deliveries.map(delivery => stop({
      key: `inspect-${delivery.id}`,
      phase: "inspect",
      title: "Trường kiểm nhận nguyên liệu",
      subtitle: delivery.supplierName,
      facts: [delivery.deliveryNo && `Phiếu ${delivery.deliveryNo}`].filter(Boolean),
      time: text(delivery.receivedAt),
      expectsProof: delivery.status === "RECEIVED" || delivery.status === "REJECTED",
    }, proofsOf("deliveries", delivery.id))),
    ...batches.map(batch => stop({
      key: `cook-${batch.id}`,
      phase: "cook",
      title: "Bếp hoàn thành mẻ nấu",
      subtitle: Array.isArray(batch.dishes) && batch.dishes.length ? batch.dishes.join(", ") : "Mẻ nấu",
      facts: [
        readableCode(batch.batchCode) && `Mẻ ${batch.batchCode}`,
        number(batch.plannedPortions) !== null && `${batch.plannedPortions} suất cả mẻ`,
        number(batch.allocatedPortions) !== null && `${batch.allocatedPortions} suất cho khối này`,
      ].filter(Boolean),
      time: text(batch.completedAt),
      expectsProof: batch.status === "COMPLETED",
    }, proofsOf("cooking-batches", batch.id))),
    ...samples.map(sample => stop({
      key: `sample-${sample.id}`,
      phase: "sample",
      title: sample.status === "DISPOSED" ? "Lưu mẫu và đã tiêu huỷ" : "Lưu mẫu thức ăn",
      subtitle: sample.dishName,
      facts: [sample.disposedAt && `Tiêu huỷ ${formatTime(sample.disposedAt)}`].filter(Boolean),
      time: text(sample.sampledAt),
      expectsProof: true,
    }, proofsOf("retained-samples", sample.id))),
    stop({
      key: "distribute",
      phase: "distribute",
      title: meal.gradeId ? `Phát suất ăn cho ${meal.gradeLabel.replace(/^Khối/, "khối")}` : "Phát suất ăn cho các lớp chưa xếp khối",
      subtitle: [meal.mealLabel, meal.portions !== null && `${meal.portions} suất`].filter(Boolean).join(" · "),
      facts: [
        meal.statusLabel,
        meal.classes.length && `${meal.classes.length} lớp: ${meal.classes.map(item => item.classLabel.replace(/^Lớp\s/, "")).join(", ")}`,
      ].filter(Boolean),
      time: meal.distributedAt,
      expectsProof: ["DISTRIBUTED", "FINALIZED", "PARTIAL"].includes(meal.status),
    }, proofsOf("meal-distributions", distribution.recordId)),
  ]

  const issues = stops.flatMap(item => item.issues.map(issue => ({ ...issue, stopKey: item.key, stopTitle: item.title })))
  const sealed = stops.filter(item => item.proofs.length && item.state !== "PENDING" && item.state !== "FAILED").length
  const verified = stops.filter(item => item.state === "VERIFIED").length
  return {
    mealAllocationId: text(value.mealAllocationId),
    date: text(value.date),
    meal,
    intact: value.intact === true,
    stops,
    issues,
    counts: { total: stops.length, sealed, verified, broken: stops.filter(item => item.state === "BROKEN").length },
  }
}

export function formatTime(value) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })
}
