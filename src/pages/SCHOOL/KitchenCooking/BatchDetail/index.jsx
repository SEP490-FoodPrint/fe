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
import InspectionSheetModal from "./component/InspectionSheetModal"
import CompleteBatchInspectionModal from "./component/CompleteBatchInspectionModal"
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
  portions: 1250,
  method: "SEPARATE", // SEPARATE | COMMON
  createdBy: "Nguyễn Văn Vận",
  createdAt: "10/11/2024 07:15",
  completedAt: null,
  inspectionData: null
}

const INITIAL_INGREDIENTS = [
  {
    id: 1,
    name: "Thịt ba chỉ heo tươi",
    lotCode: "LOT-HEO-892",
    quantity: "50.0",
    unit: "kg",
    expiryDate: "12/11/2024",
    expiryNote: "Còn 2 ngày",
    noteType: "warning"
  },
  {
    id: 2,
    name: "Trứng cút tươi sạch",
    lotCode: "LOT-CUT-224",
    quantity: "1.462",
    unit: "quả",
    expiryDate: "25/11/2024",
    expiryNote: "Còn 15 ngày",
    noteType: "default"
  },
  {
    id: 3,
    name: "Nước dừa xiêm nguyên chất",
    lotCode: "LOT-DUA-018",
    quantity: "46.8",
    unit: "lít",
    expiryDate: "12/11/2024",
    expiryNote: "Bảo quản lạnh",
    noteType: "info"
  },
  {
    id: 4,
    name: "Gia vị kho tổng hợp tiêu chuẩn",
    lotCode: "LOT-GVI-045",
    quantity: "2.46",
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
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

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

  // Xử lý mở popup nghiệm thu kiểm thực khi bấm hoàn thành
  const handleOpenCompleteModal = () => {
    setIsCompleteModalOpen(true)
  }

  // Xử lý lưu kết quả nghiệm thu kiểm thực 3 bước (Phương án B: JSONB)
  const handleConfirmInspection = (inspectionRecord) => {
    setIsCompleteModalOpen(false)
    setBatchData((prev) => ({
      ...prev,
      status: "COMPLETED",
      completedAt: inspectionRecord.inspectedTime || "10:25",
      inspectionData: inspectionRecord
    }))
    
    setAuditData((prev) => ({
      ...prev,
      completedBy: inspectionRecord.inspectedBy || "Nguyễn Văn Vận (Bếp chính)",
      completedAt: inspectionRecord.inspectedAt || "10/11/2024 10:25"
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
          <BatchTimelineCard status={batchData.status}
            batchCode={batchData.code} />

          {/* Thẻ 2 Cột Phải: Theo dõi kiểm toán */}
          <BatchAuditCard auditData={auditData} />

          {/* Thẻ 3 Cột Phải: Thao tác nghiệp vụ */}
          <BatchActionsCard
            status={batchData.status}
            batchCode={batchData.code}
            dishName={batchData.dishName}
            onOpenConfirmModal={() => setIsConfirmOpen(true)}
            onOpenDeleteModal={() => setIsDeleteOpen(true)}
            onOpenCompleteModal={handleOpenCompleteModal}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
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

      <CompleteBatchInspectionModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        onConfirm={handleConfirmInspection}
        batchData={batchData}
      />

      <InspectionSheetModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        batchData={batchData}
        ingredients={ingredients}
        auditData={auditData}
      />
    </div>
  )
}
