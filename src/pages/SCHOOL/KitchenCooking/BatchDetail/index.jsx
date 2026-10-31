import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import ROUTER from "src/router/ROUTER"
import BatchDetailHeader from "./component/BatchDetailHeader"
import BatchInfoCard from "./component/BatchInfoCard"
import BatchIngredientsCard from "./component/BatchIngredientsCard"
import BatchCookingResultCard from "./component/BatchCookingResultCard"
import BatchTimelineCard from "./component/BatchTimelineCard"
import BatchAuditCard from "./component/BatchAuditCard"
import BatchActionsCard from "./component/BatchActionsCard"
import ConfirmBatchModal from "./component/ConfirmBatchModal"
import DeleteBatchModal from "./component/DeleteBatchModal"
import styles from "./index.module.scss"

const INITIAL_BATCH_DATA = {
  id: "CB-20241110-001",
  code: "CB-20241110-001",
  status: "DRAFT", // DRAFT | CONFIRMED | COMPLETED
  dishName: "Thịt heo kho cút nước dừa",
  dishCategory: "Món mặn chính",
  menuDate: "10/11/2024",
  mealType: "Bữa trưa",
  servingTime: "11:15",
  plannedPortions: 1250,
  actualPortions: null,
  variance: null,
  method: "SEPARATE", // SEPARATE | COMMON
  createdBy: "Nguyễn Văn Vận",
  createdAt: "10/11/2024 07:15",
  completedAt: null
}

const INITIAL_INGREDIENTS = [
  {
    id: 1,
    name: "Thịt ba chỉ heo tươi",
    lotCode: "LOT-HEO-892",
    plannedQty: "50.0",
    actualQty: null,
    unit: "kg",
    expiryDate: "12/11/2024",
    expiryNote: "Còn 2 ngày",
    noteType: "warning"
  },
  {
    id: 2,
    name: "Trứng cút tươi sạch",
    lotCode: "LOT-CUT-224",
    plannedQty: "1.462",
    actualQty: null,
    unit: "quả",
    expiryDate: "25/11/2024",
    expiryNote: "Còn 15 ngày",
    noteType: "default"
  },
  {
    id: 3,
    name: "Nước dừa xiêm nguyên chất",
    lotCode: "LOT-DUA-018",
    plannedQty: "46.8",
    actualQty: null,
    unit: "lít",
    expiryDate: "12/11/2024",
    expiryNote: "Bảo quản lạnh",
    noteType: "info"
  },
  {
    id: 4,
    name: "Gia vị kho tổng hợp tiêu chuẩn",
    lotCode: "LOT-GVI-045",
    plannedQty: "2.46",
    actualQty: null,
    unit: "kg",
    expiryDate: "30/12/2024",
    expiryNote: "Đóng gói niêm phong",
    noteType: "default"
  }
]

export default function KitchenBatchDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [batchData, setBatchData] = useState({
    ...INITIAL_BATCH_DATA,
    code: id || INITIAL_BATCH_DATA.code
  })

  const [ingredients, setIngredients] = useState(INITIAL_INGREDIENTS)

  const [auditData, setAuditData] = useState({
    createdBy: "Nguyễn Văn Vận (Bếp chính)",
    createdAt: "10/11/2024 07:15",
    confirmedBy: null,
    confirmedAt: null,
    completedBy: null,
    completedAt: null
  })

  // Modal states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // Xử lý xác nhận phương án
  const handleConfirmBatch = () => {
    setIsConfirmOpen(false)
    setBatchData((prev) => ({
      ...prev,
      status: "CONFIRMED"
    }))
    setAuditData((prev) => ({
      ...prev,
      confirmedBy: "Nguyễn Văn Vận (Bếp trưởng cơ sở)",
      confirmedAt: "10/11/2024 08:05"
    }))
  }

  // Xử lý ghi nhận nấu xong & lưu mẫu
  const handleCompleteBatch = () => {
    setBatchData((prev) => ({
      ...prev,
      status: "COMPLETED",
      actualPortions: 1248,
      variance: "-2 suất (0.16%)",
      completedAt: "10:25"
    }))
    setIngredients((prev) =>
      prev.map((ing) => ({
        ...ing,
        actualQty: ing.plannedQty
      }))
    )
    setAuditData((prev) => ({
      ...prev,
      completedBy: "Trần Thị Mai (Tổ trưởng ra khay)",
      completedAt: "10/11/2024 10:25"
    }))
  }

  // Xử lý xóa lô
  const handleDeleteBatch = () => {
    setIsDeleteOpen(false)
    navigate(ROUTER.SCHOOL_KITCHEN_BATCHES)
  }

  return (
    <div className={styles.batchDetailPage}>
      {/* 1. Header Trang */}
      <BatchDetailHeader batchData={batchData} />

      {/* 2. Main Content Grid (8 Cols Left - 4 Cols Right trên Desktop, Stack trên Mobile) */}
      <div className={styles.contentGrid}>
        {/* CỘT TRÁI (~70% / 8 Cols Desktop) */}
        <div className={styles.leftCol}>
          {/* Thẻ 1: Thông tin lô chế biến */}
          <BatchInfoCard batchData={batchData} />

          {/* Thẻ 2: Nguyên liệu sử dụng */}
          <BatchIngredientsCard ingredients={ingredients} />

          {/* Thẻ 3: Kết quả chế biến */}
          <BatchCookingResultCard batchData={batchData} />
        </div>

        {/* CỘT PHẢI (~30% / 4 Cols Desktop) */}
        <div className={styles.rightCol}>
          {/* Thẻ 1 Cột Phải: Tiến trình chế biến */}
          <BatchTimelineCard status={batchData.status} />

          {/* Thẻ 2 Cột Phải: Theo dõi kiểm toán */}
          <BatchAuditCard auditData={auditData} />

          {/* Thẻ 3 Cột Phải: Thao tác nghiệp vụ */}
          <BatchActionsCard
            status={batchData.status}
            onOpenConfirmModal={() => setIsConfirmOpen(true)}
            onOpenDeleteModal={() => setIsDeleteOpen(true)}
            onOpenCompleteModal={handleCompleteBatch}
          />
        </div>
      </div>

      {/* 3. Modals */}
      <ConfirmBatchModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmBatch}
        batchData={batchData}
      />

      <DeleteBatchModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteBatch}
        batchCode={batchData.code}
      />
    </div>
  )
}

