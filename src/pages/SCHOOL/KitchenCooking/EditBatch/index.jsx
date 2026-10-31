import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import EditBatchHeader from "./component/EditBatchHeader"
import BatchPolicyAndInfoCard from "./component/BatchPolicyAndInfoCard"
import IngredientsAllocationCard from "./component/IngredientsAllocationCard"
import BatchValidationAuditCard from "./component/BatchValidationAuditCard"
import EditBatchActionBar from "./component/EditBatchActionBar"
import SwapLotModal from "./component/SwapLotModal"
import AddLotModal from "./component/AddLotModal"
import styles from "./index.module.scss"

/* ========================================================
   DỮ LIỆU MẪU CHUẨN PHƯƠNG ÁN A & B (HỆ THỐNG TỰ TÍNH TOÁN)
   ======================================================== */

// 1. Dữ liệu mẻ Nấu chung (COMBINE_LOTS: 100 suất, 2 lô gà phối trộn theo chuẩn FEFO)
const COMBINE_BATCH = {
  code: "CB-20261023-01",
  dishName: "Thịt gà kho",
  mealSession: "Bữa trưa — 11:15",
  date: "23/10/2026",
  school: "Bếp THCS Đoàn Thị Điểm",
  portions: 100,
  rule: "COMBINE_LOTS",
  status: "UNCONFIRMED"
}

// Logic FEFO: Lô A cận hạn (25/10) nhưng tồn chỉ còn đúng 6.0 kg,
// nên hệ thống vét sạch 6.0 kg của Lô A và tự động lấy tiếp 4.0 kg từ Lô B (tồn 12.0 kg)
const COMBINE_MAIN_LOTS_INITIAL = [
  {
    id: 101,
    lotIndex: 1,
    name: "Thịt gà ta làm sạch",
    lotName: "Lô thịt gà A",
    lotCode: "LOT-GA-01A",
    supplier: "HTX Nông nghiệp Sạch Ba Vì",
    cert: "VietGAP 3981/HTXBV",
    certNote: "Kiểm định thú y đạt chuẩn",
    expiryDate: "25/10/2026",
    expiryRemaining: "Còn 2 ngày",
    stock: 6.0,
    unit: "kg",
    quantity: 6.0,
    quotaPerPortion: "60g / suất"
  },
  {
    id: 102,
    lotIndex: 2,
    name: "Thịt gà ta làm sạch",
    lotName: "Lô thịt gà B",
    lotCode: "LOT-GA-01B",
    supplier: "Nông sản Sóc Sơn",
    cert: "VietGAP 2041/NSSS",
    certNote: "Chứng nhận VietGAP",
    expiryDate: "26/10/2026",
    expiryRemaining: "Còn 3 ngày",
    stock: 12.0,
    unit: "kg",
    quantity: 4.0,
    quotaPerPortion: "40g / suất"
  }
]

const COMBINE_SUB_INGREDIENTS_INITIAL = [
  {
    id: 2,
    name: "Gừng tươi củ nhỏ",
    lotCode: "LOT-GUNG-102",
    supplier: "Nông trại Hải Dương",
    cert: "Chứng nhận Rau an toàn Hải Dương",
    expiryDate: "30/10/2026",
    stock: 5.0,
    unit: "kg",
    quantity: 0.5,
    quotaPerPortion: "5g / suất"
  },
  {
    id: 3,
    name: "Hành tím sạch",
    lotCode: "LOT-HANH-088",
    supplier: "VinaFresh",
    cert: "Chuỗi cung ứng thực phẩm an toàn",
    expiryDate: "15/11/2026",
    stock: 8.5,
    unit: "kg",
    quantity: 0.35,
    quotaPerPortion: "3.5g / suất"
  },
  {
    id: 4,
    name: "Gia vị kho tổng hợp",
    lotCode: "LOT-GVI-045",
    supplier: "Masan Consumer",
    cert: "ISO 22000 & HACCP Codex",
    expiryDate: "30/12/2026",
    stock: 20.0,
    unit: "kg",
    quantity: 0.8,
    quotaPerPortion: "8g / suất"
  }
]

// 2. Dữ liệu mẻ Nấu riêng (SEPARATE_BY_LOT: 60 suất, 1 lô độc lập - Khóa số lượng)
const SEPARATE_BATCH = {
  code: "CB-20261023-01A",
  dishName: "Thịt gà kho",
  mealSession: "Bữa trưa — 11:15",
  date: "23/10/2026",
  school: "Bếp THCS Đoàn Thị Điểm",
  portions: 60,
  rule: "SEPARATE_BY_LOT",
  status: "UNCONFIRMED"
}

const SEPARATE_MAIN_INITIAL = {
  id: 1,
  name: "Thịt gà ta làm sạch",
  lotName: "Lô thịt gà A",
  lotCode: "LOT-GA-01A",
  supplier: "HTX Nông nghiệp Sạch Ba Vì",
  cert: "VietGAP 3981/HTXBV",
  certNote: "Kiểm định thú y đạt chuẩn",
  expiryDate: "25/10/2026",
  expiryRemaining: "Còn 2 ngày",
  stock: 18.0,
  unit: "kg",
  quantity: 6.0,
  quotaPerPortion: "100g / suất"
}

const SEPARATE_SUB_INITIAL = [
  {
    id: 2,
    name: "Gừng tươi củ nhỏ",
    lotCode: "LOT-GUNG-102",
    supplier: "Nông trại Hải Dương",
    cert: "Chứng nhận Rau an toàn Hải Dương",
    expiryDate: "30/10/2026",
    stock: 5.0,
    unit: "kg",
    quantity: 0.3,
    quotaPerPortion: "5g / suất"
  },
  {
    id: 3,
    name: "Hành tím sạch",
    lotCode: "LOT-HANH-088",
    supplier: "VinaFresh",
    cert: "Chuỗi cung ứng thực phẩm an toàn",
    expiryDate: "15/11/2026",
    stock: 8.5,
    unit: "kg",
    quantity: 0.2,
    quotaPerPortion: "3.3g / suất"
  },
  {
    id: 4,
    name: "Gia vị kho tổng hợp",
    lotCode: "LOT-GVI-045",
    supplier: "Masan Consumer",
    cert: "ISO 22000 & HACCP Codex",
    expiryDate: "30/12/2026",
    stock: 20.0,
    unit: "kg",
    quantity: 0.5,
    quotaPerPortion: "8.3g / suất"
  }
]

export default function EditBatch() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Xác định chế độ mặc định từ route param (nếu có hậu tố 'A'/'B' thì là Nấu riêng, ngược lại mặc định Nấu chung)
  const isInitialSeparate = id && (id.endsWith("A") || id.endsWith("B"))

  const [rule, setRule] = useState(isInitialSeparate ? "SEPARATE_BY_LOT" : "COMBINE_LOTS")
  const isCombineLots = rule === "COMBINE_LOTS"

  // Batch info state
  const [batchData, setBatchData] = useState(
    isInitialSeparate
      ? { ...SEPARATE_BATCH, code: id || SEPARATE_BATCH.code }
      : { ...COMBINE_BATCH, code: id || COMBINE_BATCH.code }
  )

  // Nấu chung state
  const [combineMainLots, setCombineMainLots] = useState(COMBINE_MAIN_LOTS_INITIAL)
  const [combineSubIngredients, setCombineSubIngredients] = useState(COMBINE_SUB_INGREDIENTS_INITIAL)

  // Nấu riêng state
  const [separateMain, setSeparateMain] = useState(SEPARATE_MAIN_INITIAL)
  const [separateSub, setSeparateSub] = useState(SEPARATE_SUB_INITIAL)

  // Modals state
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false)
  const [targetSwapItem, setTargetSwapItem] = useState(null)
  const [isAddLotModalOpen, setIsAddLotModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Toggle giữa Nấu chung & Nấu riêng
  const handleToggleRule = (newRule) => {
    setRule(newRule)
    if (newRule === "COMBINE_LOTS") {
      setBatchData({
        ...COMBINE_BATCH,
        code: id && !id.endsWith("A") ? id : "CB-20261023-01"
      })
    } else {
      setBatchData({
        ...SEPARATE_BATCH,
        code: id && id.endsWith("A") ? id : "CB-20261023-01A"
      })
    }
  }

  // Điều chỉnh số lượng từng lô phối trộn (Phương án 2)
  const handleQuantityChange = (lotId, rawValue) => {
    setCombineMainLots((prev) =>
      prev.map((lot) => {
        if (lot.id === lotId) {
          const numericVal = rawValue === "" ? "" : parseFloat(rawValue)
          const safePortions = batchData.portions || 100
          const quotaStr =
            numericVal !== "" && !isNaN(numericVal) && safePortions > 0
              ? `${Math.round((numericVal * 1000) / safePortions)}g / suất`
              : ""
          return {
            ...lot,
            quantity: rawValue,
            quotaPerPortion: quotaStr
          }
        }
        return lot
      })
    )
  }

  // Mở modal thay lô
  const handleOpenSwapModal = (item) => {
    setTargetSwapItem(item)
    setIsSwapModalOpen(true)
  }

  // Mở modal thêm lô phối trộn
  const handleOpenAddLotModal = () => {
    setIsAddLotModalOpen(true)
  }

  // Xác nhận đổi lô nguyên liệu
  const handleConfirmSwap = (oldItem, newLot) => {
    if (isCombineLots) {
      if (combineMainLots.some((lot) => lot.id === oldItem.id)) {
        setCombineMainLots((prev) =>
          prev.map((lot) => {
            if (lot.id === oldItem.id) {
              return {
                ...lot,
                lotName: newLot.lotName || lot.lotName,
                lotCode: newLot.lotCode,
                supplier: newLot.supplier,
                cert: newLot.cert,
                certNote: newLot.certNote || lot.certNote,
                expiryDate: newLot.expiryDate,
                expiryRemaining: newLot.expiryRemaining || "Còn hiệu lực",
                stock: newLot.stock
              }
            }
            return lot
          })
        )
      } else {
        setCombineSubIngredients((prev) =>
          prev.map((sub) => {
            if (sub.id === oldItem.id) {
              return {
                ...sub,
                lotCode: newLot.lotCode,
                supplier: newLot.supplier,
                cert: newLot.cert,
                expiryDate: newLot.expiryDate,
                stock: newLot.stock
              }
            }
            return sub
          })
        )
      }
    } else {
      if (oldItem.id === separateMain.id) {
        setSeparateMain((prev) => ({
          ...prev,
          lotName: newLot.lotName || prev.lotName,
          lotCode: newLot.lotCode,
          supplier: newLot.supplier,
          cert: newLot.cert,
          certNote: newLot.certNote || prev.certNote,
          expiryDate: newLot.expiryDate,
          expiryRemaining: newLot.expiryRemaining || "Còn hiệu lực",
          stock: newLot.stock
        }))
      } else {
        setSeparateSub((prev) =>
          prev.map((sub) => {
            if (sub.id === oldItem.id) {
              return {
                ...sub,
                lotCode: newLot.lotCode,
                supplier: newLot.supplier,
                cert: newLot.cert,
                expiryDate: newLot.expiryDate,
                stock: newLot.stock
              }
            }
            return sub
          })
        )
      }
    }
  }

  // Xác nhận thêm lô phối trộn mới (cho Nấu chung)
  const handleConfirmAddLot = (newLotCandidate) => {
    const newLotId = Date.now()
    const nextIndex = combineMainLots.length + 1
    const defaultQty = newLotCandidate.defaultQty || 2.0
    const safePortions = batchData.portions || 100
    const quotaStr =
      safePortions > 0 ? `${Math.round((defaultQty * 1000) / safePortions)}g / suất` : "20g / suất"

    const addedLot = {
      id: newLotId,
      lotIndex: nextIndex,
      name: "Thịt gà ta làm sạch",
      lotName: newLotCandidate.lotName,
      lotCode: newLotCandidate.lotCode,
      supplier: newLotCandidate.supplier,
      cert: newLotCandidate.cert,
      certNote: "Đạt chuẩn VietGAP",
      expiryDate: newLotCandidate.expiryDate,
      expiryRemaining: newLotCandidate.expiryRemaining || "Còn hiệu lực",
      stock: newLotCandidate.stock,
      unit: newLotCandidate.unit || "kg",
      quantity: defaultQty,
      quotaPerPortion: quotaStr
    }

    setCombineMainLots((prev) => [...prev, addedLot])
  }

  // Xóa lô phối trộn
  const handleRemoveLot = (target) => {
    const targetId = typeof target === "object" ? target?.id : target
    if (combineMainLots.length <= 1) return
    setCombineMainLots((prev) => {
      const filtered = prev.filter((lot) => lot.id !== targetId)
      return filtered.map((lot, idx) => ({
        ...lot,
        lotIndex: idx + 1
      }))
    })
  }

  // Hủy thay đổi -> quay lại chi tiết
  const handleCancel = () => {
    navigate(`/school/kitchen-cooking/batches/${batchData.code}`)
  }

  // Lưu cập nhật lô chế biến
  const handleSave = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      navigate(`/school/kitchen-cooking/batches/${batchData.code}`)
    }, 400)
  }

  const currentMainLots = isCombineLots ? combineMainLots : [separateMain]
  const currentSub = isCombineLots ? combineSubIngredients : separateSub
  const totalLotsCount = currentMainLots.length + currentSub.length

  // Validation tính toán cho Nấu chung
  const totalMainAllocated = combineMainLots.reduce(
    (acc, lot) => acc + (parseFloat(lot.quantity) || 0),
    0
  )
  const diffAmount = Number((totalMainAllocated - 10.0).toFixed(2))
  const isSumMatch = Math.abs(diffAmount) < 0.01
  const hasStockOverflow = combineMainLots.some(
    (lot) => (parseFloat(lot.quantity) || 0) > lot.stock
  )
  const hasInvalidQuantity = combineMainLots.some(
    (lot) => (parseFloat(lot.quantity) || 0) <= 0 || isNaN(parseFloat(lot.quantity))
  )
  const isValid = isCombineLots
    ? isSumMatch && !hasStockOverflow && !hasInvalidQuantity
    : true

  return (
    <div className={styles.editBatchPage}>
      {/* 1. Header Bar with Breadcrumb & Rule Switcher */}
      <EditBatchHeader
        batchCode={batchData.code}
        rule={batchData.rule}
        onToggleRule={handleToggleRule}
      />

      {/* 2. Main Work Surface Container */}
      <div className={styles.mainContent}>
        {/* KHU VỰC 1: THÔNG TIN PHƯƠNG ÁN CHẾ BIẾN */}
        <BatchPolicyAndInfoCard batchData={batchData} />

        {/* KHU VỰC 2: NGUYÊN LIỆU SỬ DỤNG (Nấu chung hoặc Nấu riêng) */}
        <IngredientsAllocationCard
          isCombineLots={isCombineLots}
          mainIngredient={separateMain}
          mainLots={combineMainLots}
          subIngredients={currentSub}
          onOpenSwapModal={handleOpenSwapModal}
          onOpenAddLotModal={handleOpenAddLotModal}
          onRemoveLot={handleRemoveLot}
          onQuantityChange={handleQuantityChange}
        />

        {/* KHU VỰC 3: KIỂM TRA PHƯƠNG ÁN & ĐỐI SOÁT DỮ LIỆU KHO */}
        <BatchValidationAuditCard
          totalLots={totalLotsCount}
          isCombineLots={isCombineLots}
          isValid={isValid}
          totalAllocated={totalMainAllocated}
          hasStockOverflow={hasStockOverflow}
          diffAmount={diffAmount}
        />

        {/* KHU VỰC 4: THANH TÁC VỤ CỐ ĐỊNH CHÂN TRANG */}
        <EditBatchActionBar
          lastEdited="Hôm nay 06:40"
          lastEditor="Bếp trưởng Nguyễn Văn Vận"
          onCancel={handleCancel}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          isSaveDisabled={!isValid}
        />
      </div>

      {/* 3. MODALS */}
      <SwapLotModal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        targetItem={targetSwapItem}
        onConfirmSwap={handleConfirmSwap}
      />

      <AddLotModal
        isOpen={isAddLotModalOpen}
        onClose={() => setIsAddLotModalOpen(false)}
        onConfirmAdd={handleConfirmAddLot}
        currentLotCodes={combineMainLots.map((l) => l.lotCode)}
      />
    </div>
  )
}
