/**
 * Chuẩn hóa `traceData` (GET /meal-traceability) thành 5 chặng cho
 * TraceabilityBlockchainCard. Chỉ dùng dữ liệu thật: chặng chưa có bằng chứng
 * thì hiện "Chưa ghi nhận", không bao giờ điền hash / số khối giả.
 */

export function formatStepTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "";
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${hours}:${mins} ${day}/${month}/${d.getFullYear()}`;
}

export function formatShortHash(hash) {
  if (!hash || typeof hash !== "string") return "";
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

export const MEAL_TYPE_LABELS = { LUNCH: "Bữa trưa", AFTERNOON: "Bữa xế" };

const TX_STATUS_LABELS = {
  CONFIRMED: "Đã ghi lên blockchain",
  SUBMITTED: "Đang ghi lên blockchain",
  PREPARED: "Chờ ghi lên blockchain",
  FAILED: "Ghi lên blockchain thất bại",
};

const VERIFY_LABELS = {
  VERIFIED: "Đã kiểm tra (Hợp lệ)",
  MISMATCH: "Dữ liệu không khớp",
  FAILED: "Kiểm tra thất bại",
  NOT_VERIFIED: "Chưa kiểm tra",
};

/**
 * Kết luận toàn vẹn của cả chuỗi.
 * - UNCHECKED: chưa bấm kiểm tra (verify=false), trừ khi có liên kết hash sai.
 * - VERIFIED: có bằng chứng, tất cả đã CONFIRMED và VERIFIED, mọi liên kết khớp.
 * - MISMATCH: có bằng chứng hoặc liên kết hash không khớp.
 * - INCOMPLETE: kiểm tra xong nhưng còn bằng chứng chưa ghi / lỗi kết nối.
 */
export function chainVerdict(chain, checked) {
  const nodes = Array.isArray(chain?.nodes) ? chain.nodes : [];
  const brokenLink = nodes.some((n) =>
    (n.links || []).some((l) => l.status === "MISMATCH"),
  );
  if (brokenLink || nodes.some((n) => n.verificationStatus === "MISMATCH"))
    return "MISMATCH";
  if (!checked) return "UNCHECKED";
  if (
    chain?.intact &&
    nodes.length > 0 &&
    nodes.every(
      (n) =>
        n.transactionStatus === "CONFIRMED" &&
        n.verificationStatus === "VERIFIED",
    )
  )
    return "VERIFIED";
  return "INCOMPLETE";
}

function toRecord(node, label) {
  return {
    id: node.id,
    label,
    verifyStatus: node.verificationStatus,
    verifyLabel: VERIFY_LABELS[node.verificationStatus] || "Chưa kiểm tra",
    verificationResult: node.verificationResult,
    blockchainStatus:
      TX_STATUS_LABELS[node.transactionStatus] || node.transactionStatus,
    recordedTime: formatStepTime(node.recordedAt || node.createdAt),
    dataHash: node.dataHash,
    shortHash: formatShortHash(node.dataHash),
    blockNumber: node.blockNumber,
    explorerUrl: node.explorerUrl,
    brokenLinks: (node.links || [])
      .filter((l) => l.status === "MISMATCH")
      .map((l) => l.field),
  };
}

const unique = (values) => [...new Set(values.filter(Boolean))];

export function buildBlockchainSteps(traceData, activeDish) {
  if (!traceData) return [];

  const chain = traceData.blockchainProof;
  const nodes = Array.isArray(chain?.nodes) ? chain.nodes : [];
  const batches = Array.isArray(activeDish?.batches) ? activeDish.batches : [];
  const ingredients = batches.flatMap((b) =>
    Array.isArray(b?.ingredients) ? b.ingredients : [],
  );

  const deliveries = new Map();
  ingredients.forEach((ing) => {
    if (ing?.delivery?.id) deliveries.set(ing.delivery.id, ing.delivery);
  });
  const deliveryIds = [...deliveries.keys()];
  const batchIds = unique(batches.map((b) => b?.cookingBatchId));
  const samples = batches.map((b) => b?.retainedSample).filter(Boolean);
  const sampleIds = unique(samples.map((s) => s.id));

  const pick = (kind, ids, eventTypes) =>
    nodes.filter(
      (n) =>
        n.kind === kind &&
        (!ids || ids.includes(n.recordId)) &&
        (!eventTypes || eventTypes.includes(n.eventType)),
    );

  const deliveryLabel = (id) => {
    const d = deliveries.get(id);
    return d ? `${d.supplierName}${d.deliveryNo ? ` · ${d.deliveryNo}` : ""}` : "";
  };
  const batchLabel = (id) =>
    batches.find((b) => b?.cookingBatchId === id)?.batchCode || "";

  const supplierNames = unique([...deliveries.values()].map((d) => d.supplierName));
  const dishName = activeDish?.dishName || "";
  const allocation = traceData.allocation || {};
  const classInfo = traceData.classInfo || {};
  const earliest = (values) =>
    values.filter(Boolean).sort((a, b) => new Date(a) - new Date(b))[0] || null;
  const plates = unique([...deliveries.values()].map((d) => d.vehiclePlate));
  const allocatedPortions = sumAllocationPortions(batches.map(batch=>batch?.allocatedPortions || 0));

  const declared = pick("delivery-declarations", deliveryIds);
  const inspected = pick("deliveries", deliveryIds);
  const cooked = pick("cooking-batches", batchIds);
  const sampled = pick("retained-samples", sampleIds, [
    "SAMPLE_STORED",
    "SAMPLE_DISPOSED",
  ]);
  const distributed = pick("meal-distributions", null);

  return [
    {
      id: "step-1",
      shortLabel: "NCC xuất hàng",
      title: "Nhà cung cấp xuất hàng",
      subtitle: supplierNames.join(", ") || "Chưa có đơn giao hàng",
      badges: plates.length ? [`Xe: ${plates.join(", ")}`] : [],
      timeStr: formatStepTime(
        earliest(declared.map((n) => n.createdAt)) ||
          earliest([...deliveries.values()].map((d) => d.expectedArrivalAt)),
      ),
      iconType: "truck",
      innerTitle: "Nhà cung cấp khai báo giao hàng",
      records: declared.map((n) => toRecord(n, deliveryLabel(n.recordId))),
    },
    {
      id: "step-2",
      shortLabel: "Kiểm nhận",
      title: "Trường kiểm nhận nguyên liệu",
      subtitle: supplierNames.join(", ") || "Chưa có đơn giao hàng",
      badges: [],
      timeStr: formatStepTime(
        earliest([...deliveries.values()].map((d) => d.receivedAt)),
      ),
      iconType: "check",
      innerTitle: "Kiểm nhận nguyên liệu tại cổng trường",
      records: inspected.map((n) => toRecord(n, deliveryLabel(n.recordId))),
    },
    {
      id: "step-3",
      shortLabel: "Nấu",
      title: "Bếp hoàn thành mẻ nấu",
      subtitle: dishName,
      badges: [
        `${batches.length} mẻ`,
        `${formatAllocationDecimal(allocatedPortions)} suất cho ${classInfo.name || "lớp"}`,
      ],
      timeStr: formatStepTime(earliest(batches.map((b) => b?.completedAt))),
      iconType: "cooking",
      innerTitle: "Bếp chế biến hoàn thành mẻ nấu",
      records: cooked.map((n) => toRecord(n, batchLabel(n.recordId))),
    },
    {
      id: "step-4",
      shortLabel: "Lưu mẫu",
      title: "Lưu mẫu thức ăn",
      subtitle: dishName,
      badges: [`${samples.length} mẫu`],
      timeStr: formatStepTime(earliest(samples.map((s) => s.sampledAt))),
      iconType: "sample",
      innerTitle: "Niêm phong lưu mẫu thức ăn",
      records: sampled.map((n) =>
        toRecord(n, n.eventType === "SAMPLE_DISPOSED" ? "Tiêu huỷ mẫu" : "Lưu mẫu"),
      ),
    },
    {
      id: "step-5",
      shortLabel: "Phát suất",
      title: "Phát suất ăn",
      subtitle: `${MEAL_TYPE_LABELS[allocation.mealType] || ""} · ${
        classInfo.name || ""
      } · ${allocation.totalPortions ?? 0} suất`,
      badges: [allocation.status === "DISTRIBUTED" ? "Đã phát" : "Chưa phát"],
      timeStr: formatStepTime(allocation.distributedAt),
      iconType: "distribution",
      innerTitle: `Bằng chứng phát suất toàn trường ngày ${
        allocation.mealDate || ""
      } (bao gồm lớp này)`,
      records: distributed.map((n) => toRecord(n, "Toàn trường")),
    },
  ];
}
import { sumAllocationPortions, formatAllocationDecimal } from "../../../../utils/allocationDecimal.js";
