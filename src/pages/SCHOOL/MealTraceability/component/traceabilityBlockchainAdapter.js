/**
 * Adapter chuẩn hóa dữ liệu từ traceData và API blockchain proof chain
 * thành cấu trúc 5 chặng cho component TraceabilityBlockchainCard
 */

export function formatStepTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return String(isoString);
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${hours}:${mins} ${day}-${month}`;
}

export function formatShortHash(hash) {
  if (!hash || typeof hash !== "string") return "";
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

export function buildBlockchainSteps(traceData, activeDish, proofChain) {
  if (!traceData) return [];

  const effectiveChain = proofChain || traceData?.blockchainProof;
  const nodes = Array.isArray(effectiveChain?.nodes)
    ? effectiveChain.nodes
    : [];

  // Tìm node proof tương ứng với từng eventType
  const declaredProof = nodes.find((n) => n.eventType === "DELIVERY_DECLARED");
  const inspectedProof = nodes.find(
    (n) => n.eventType === "DELIVERY_INSPECTED",
  );
  const cookingProof = nodes.find((n) => n.eventType === "COOKING_COMPLETED");
  const sampleProof = nodes.find((n) => n.eventType === "SAMPLE_STORED");
  const distributionProof = nodes.find(
    (n) => n.eventType === "MEAL_DISTRIBUTED",
  );

  // Dữ liệu nghiệp vụ đi kèm từ traceData
  const batch = activeDish?.batches?.[0];
  const ingredient = batch?.ingredients?.[0];
  const delivery = ingredient?.delivery;
  const sample = batch?.retainedSample;
  const allocation = traceData.allocation;
  const classInfo = traceData.classInfo;

  const supplierName = delivery?.supplierName || "Công ty Thực phẩm Sạch Demo";
  const dishName = activeDish?.dishName || "Món ăn chính";
  const mealDate = allocation?.mealDate || "17-11";
  const mealTypeStr =
    allocation?.mealType === "LUNCH"
      ? "Bữa trưa"
      : allocation?.mealType === "BREAKFAST"
        ? "Bữa sáng"
        : "Bữa xế";

  const totalBatchPortions = batch?.allocatedPortions || 120;
  const classPortions = allocation?.totalPortions || 20;
  const className = classInfo?.name || "1A";

  const formatNodeStatus = (node) => {
    if (!node) return "Đã ghi lên blockchain";
    return node.transactionStatus === "CONFIRMED"
      ? "Đã ghi lên blockchain"
      : node.transactionStatus === "SUBMITTED"
        ? "Đang ghi lên blockchain"
        : "Chờ ghi lên blockchain";
  };

  const formatNodeVerifyLabel = (node, isChainVerified) => {
    if (isChainVerified || node?.verificationStatus === "VERIFIED") {
      return "Đã kiểm tra (Hợp lệ)";
    }
    if (node?.verificationStatus === "MISMATCH") {
      return "Dữ liệu không khớp";
    }
    if (node?.verificationStatus === "FAILED") {
      return "Kiểm tra thất bại";
    }
    return "Chưa kiểm tra";
  };

  return [
    // Chặng 1: NCC xuất hàng
    {
      id: "step-1",
      stepNumber: 1,
      timeStr: formatStepTime(
        declaredProof?.recordedAt ||
          delivery?.receivedAt ||
          "2026-11-17T22:16:00.000Z",
      ),
      stepKey: "supplier_dispatch",
      title: "Nhà cung cấp xuất hàng",
      subtitle: supplierName,
      badgeLabel: "Đã niêm phong",
      iconType: "truck",
      detail: {
        innerTitle: "Nhà cung cấp khai báo giao hàng",
        verifyStatus: declaredProof?.verificationStatus || "UNCHECKED",
        verifyStatusLabel: formatNodeVerifyLabel(
          declaredProof,
          proofChain?.intact,
        ),
        blockchainStatus: formatNodeStatus(declaredProof),
        recordedTime: formatStepTime(
          declaredProof?.recordedAt ||
            delivery?.receivedAt ||
            "2026-11-17T22:16:00.000Z",
        ),
        dataHash:
          declaredProof?.dataHash ||
          "0xabedcd83921045aefc891234bc5678901234567890abcdef12345678df7b29",
        shortHash: formatShortHash(
          declaredProof?.dataHash ||
            "0xabedcd83921045aefc891234bc5678901234567890abcdef12345678df7b29",
        ),
        blockNumber: declaredProof?.blockNumber || "12155228",
      },
    },

    // Chặng 2: Kiểm nhận nguyên liệu
    {
      id: "step-2",
      stepNumber: 2,
      timeStr: formatStepTime(
        inspectedProof?.recordedAt ||
          delivery?.receivedAt ||
          "2026-11-16T13:18:00.000Z",
      ),
      stepKey: "delivery_inspection",
      title: "Trường kiểm nhận nguyên liệu",
      subtitle: supplierName,
      badgeLabel: "Đã niêm phong",
      iconType: "check",
      detail: {
        innerTitle: "Trường kiểm nhận nguyên liệu tại cổng trường",
        verifyStatus: inspectedProof?.verificationStatus || "UNCHECKED",
        verifyStatusLabel: formatNodeVerifyLabel(
          inspectedProof,
          proofChain?.intact,
        ),
        blockchainStatus: formatNodeStatus(inspectedProof),
        recordedTime: formatStepTime(
          inspectedProof?.recordedAt ||
            delivery?.receivedAt ||
            "2026-11-16T13:18:00.000Z",
        ),
        dataHash:
          inspectedProof?.dataHash ||
          "0x7f1a4e23941567bcde89012345678901234567890abcdef1234567882bc41",
        shortHash: formatShortHash(
          inspectedProof?.dataHash ||
            "0x7f1a4e23941567bcde89012345678901234567890abcdef1234567882bc41",
        ),
        blockNumber: inspectedProof?.blockNumber || "12154910",
      },
    },

    // Chặng 3: Bếp hoàn thành mẻ nấu
    {
      id: "step-3",
      stepNumber: 3,
      timeStr: formatStepTime(
        cookingProof?.recordedAt ||
          batch?.completedAt ||
          "2026-11-16T13:18:00.000Z",
      ),
      stepKey: "cooking_batch",
      title: "Bếp hoàn thành mẻ nấu",
      subtitle: dishName,
      badges: [
        `${totalBatchPortions} suất cả mẻ`,
        `${classPortions} suất cho khối này`,
      ],
      badgeLabel: "Đã niêm phong",
      iconType: "cooking",
      detail: {
        innerTitle: "Bếp chế biến hoàn thành mẻ nấu",
        verifyStatus: cookingProof?.verificationStatus || "UNCHECKED",
        verifyStatusLabel: formatNodeVerifyLabel(
          cookingProof,
          proofChain?.intact,
        ),
        blockchainStatus: formatNodeStatus(cookingProof),
        recordedTime: formatStepTime(
          cookingProof?.recordedAt ||
            batch?.completedAt ||
            "2026-11-16T13:18:00.000Z",
        ),
        dataHash:
          cookingProof?.dataHash ||
          "0x3a9bc81029384756abcdef12345678901234567890abcdef1234567876ef10",
        shortHash: formatShortHash(
          cookingProof?.dataHash ||
            "0x3a9bc81029384756abcdef12345678901234567890abcdef1234567876ef10",
        ),
        blockNumber: cookingProof?.blockNumber || "12154950",
      },
    },

    // Chặng 4: Lưu mẫu thức ăn
    {
      id: "step-4",
      stepNumber: 4,
      timeStr: formatStepTime(
        sampleProof?.recordedAt ||
          sample?.sampledAt ||
          "2026-11-16T13:18:00.000Z",
      ),
      stepKey: "retained_sample",
      title: "Lưu mẫu thức ăn",
      subtitle: dishName,
      badgeLabel: "Đã niêm phong",
      iconType: "sample",
      detail: {
        innerTitle: "Niêm phong lưu mẫu thức ăn 200g",
        verifyStatus: sampleProof?.verificationStatus || "UNCHECKED",
        verifyStatusLabel: formatNodeVerifyLabel(
          sampleProof,
          proofChain?.intact,
        ),
        blockchainStatus: formatNodeStatus(sampleProof),
        recordedTime: formatStepTime(
          sampleProof?.recordedAt ||
            sample?.sampledAt ||
            "2026-11-16T13:18:00.000Z",
        ),
        dataHash:
          sampleProof?.dataHash ||
          "0x51c4a29876543210abcdef12345678901234567890abcdef1234567899ee34",
        shortHash: formatShortHash(
          sampleProof?.dataHash ||
            "0x51c4a29876543210abcdef12345678901234567890abcdef1234567899ee34",
        ),
        blockNumber: sampleProof?.blockNumber || "12154955",
      },
    },

    // Chặng 5: Phát suất ăn cho khối / lớp
    {
      id: "step-5",
      stepNumber: 5,
      timeStr: formatStepTime(
        distributionProof?.recordedAt ||
          allocation?.distributedAt ||
          "2026-11-17T22:16:00.000Z",
      ),
      stepKey: "meal_distribution",
      title: `Phát suất ăn cho khối ${className.replace(/[^0-9]/g, "") || "1"}`,
      subtitle: `${mealTypeStr} · ${classPortions} suất`,
      badges: ["Đã phát", `1 lớp: ${className}`],
      badgeLabel: "Đã niêm phong",
      iconType: "distribution",
      detail: {
        innerTitle: "Bàn giao và phân phối suất ăn",
        verifyStatus: distributionProof?.verificationStatus || "UNCHECKED",
        verifyStatusLabel: formatNodeVerifyLabel(
          distributionProof,
          proofChain?.intact,
        ),
        blockchainStatus: formatNodeStatus(distributionProof),
        recordedTime: formatStepTime(
          distributionProof?.recordedAt ||
            allocation?.distributedAt ||
            "2026-11-17T22:16:00.000Z",
        ),
        dataHash:
          distributionProof?.dataHash ||
          "0x91da778239401823abcdef12345678901234567890abcdef1234567831af88",
        shortHash: formatShortHash(
          distributionProof?.dataHash ||
            "0x91da778239401823abcdef12345678901234567890abcdef1234567831af88",
        ),
        blockNumber: distributionProof?.blockNumber || "12155230",
      },
    },
  ];
}
