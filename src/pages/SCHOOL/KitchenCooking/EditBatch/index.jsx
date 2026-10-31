import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import ROUTER from "src/router/ROUTER"
import EditBatchHeader from "./component/EditBatchHeader"
import BatchPolicyAndInfoCard from "./component/BatchPolicyAndInfoCard"
import IngredientsAllocationCard from "./component/IngredientsAllocationCard"
import BatchValidationAuditCard from "./component/BatchValidationAuditCard"
import EditBatchActionBar from "./component/EditBatchActionBar"
import SwapLotModal from "./component/SwapLotModal"
import RecipeDetailModal from "./component/RecipeDetailModal"
import styles from "./index.module.scss"

const INITIAL_BATCH = {
  code: "CB-20261023-01A",
  dishName: "Thịt gà kho",
  mealSession: "Bữa trưa — 11:15",
  date: "23/10/2026",
  school: "Bếp THCS Đoàn Thị Điểm",
  portions: 60,
  rule: "SEPARATE_BY_LOT",
  status: "UNCONFIRMED"
}

const INITIAL_MAIN_INGREDIENT = {
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
  warehouse: "Kho lạnh B1 (Dư +12.0 kg)",
  quantity: 6.0
}

const INITIAL_SUB_INGREDIENTS = [
  {
    id: 2,
    name: "Gừng tươi củ nhỏ",
    lotCode: "LOT-GUNG-102",
    supplier: "Nông trại Hải Dương • Định mức 5g/suất",
    cert: "Chứng nhận Rau an toàn Hải Dương",
    expiryDate: "30/10/2026",
    stock: 5.0,
    unit: "kg",
    warehouse: "Kho rau củ",
    quantity: 0.3
  },
  {
    id: 3,
    name: "Hành tím sạch",
    lotCode: "LOT-HANH-088",
    supplier: "VinaFresh • Định mức ~3.3g/suất",
    cert: "Chuỗi cung ứng thực phẩm an toàn",
    expiryDate: "15/11/2026",
    stock: 8.5,
    unit: "kg",
    warehouse: "Kho khô",
    quantity: 0.2
  },
  {
    id: 4,
    name: "Gia vị kho tổng hợp",
    lotCode: "LOT-GVI-045",
    supplier: "Masan Consumer • Nước mắm truyền thống, tiêu đen",
    cert: "ISO 22000 & HACCP Codex",
    expiryDate: "30/12/2026",
    stock: 20.0,
    unit: "kg",
    warehouse: "Kho bao bì kín",
    quantity: 0.5
  }
]

export default function EditBatch() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [batchData, setBatchData] = useState({
    ...INITIAL_BATCH,
    code: id || INITIAL_BATCH.code
  })

  const [mainIngredient, setMainIngredient] = useState(INITIAL_MAIN_INGREDIENT)
  const [subIngredients, setSubIngredients] = useState(INITIAL_SUB_INGREDIENTS)

  // Modals state
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false)
  const [targetSwapItem, setTargetSwapItem] = useState(null)
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mở modal thay lô
  const handleOpenSwapModal = (item) => {
    setTargetSwapItem(item)
    setIsSwapModalOpen(true)
  }

  // Xác nhận đổi lô nguyên liệu
  const handleConfirmSwap = (oldItem, newLot) => {
    if (oldItem.id === mainIngredient.id) {
      setMainIngredient((prev) => ({
        ...prev,
        lotName: newLot.lotName,
        lotCode: newLot.lotCode,
        supplier: newLot.supplier,
        cert: newLot.cert,
        certNote: newLot.certNote,
        expiryDate: newLot.expiryDate,
        expiryRemaining: newLot.expiryRemaining,
        stock: newLot.stock,
        warehouse: newLot.warehouse
      }))
    } else {
      setSubIngredients((prev) =>
        prev.map((sub) => {
          if (sub.id === oldItem.id) {
            return {
              ...sub,
              lotCode: newLot.lotCode,
              supplier: newLot.supplier,
              cert: newLot.cert,
              expiryDate: newLot.expiryDate,
              stock: newLot.stock,
              warehouse: newLot.warehouse
            }
          }
          return sub
        })
      )
    }
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
      // Thông báo và chuyển hướng
      navigate(`/school/kitchen-cooking/batches/${batchData.code}`)
    }, 400)
  }

  return (
    <div className={styles.editBatchPage}>
      {/* 1. Header Bar with Breadcrumb */}
      <EditBatchHeader batchCode={batchData.code} />

      {/* 2. Main Work Surface Container */}
      <div className={styles.mainContent}>
        {/* KHU VỰC 1: THÔNG TIN PHƯƠNG ÁN CHẾ BIẾN */}
        <BatchPolicyAndInfoCard batchData={batchData} />

        {/* KHU VỰC 2: NGUYÊN LIỆU SỬ DỤNG THEO ĐỊNH LƯỢNG */}
        <IngredientsAllocationCard
          mainIngredient={mainIngredient}
          subIngredients={subIngredients}
          onOpenRecipeModal={() => setIsRecipeModalOpen(true)}
          onOpenSwapModal={handleOpenSwapModal}
        />

        {/* KHU VỰC 3: KIỂM TRA PHƯƠNG ÁN & ĐỐI SOÁT DỮ LIỆU KHO */}
        <BatchValidationAuditCard
          portions={batchData.portions}
          totalLots={1 + subIngredients.length}
        />

        {/* KHU VỰC 4: THANH TÁC VỤ CỐ ĐỊNH CHÂN TRANG */}
        <EditBatchActionBar
          lastEdited="Hôm nay 06:40"
          lastEditor="Bếp trưởng Nguyễn Văn Vận"
          onCancel={handleCancel}
          onSave={handleSave}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* 3. MODALS */}
      <SwapLotModal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        targetItem={targetSwapItem}
        onConfirmSwap={handleConfirmSwap}
      />

      <RecipeDetailModal
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
        portions={batchData.portions}
      />
    </div>
  )
}

