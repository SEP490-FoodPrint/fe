import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, FileDown, Clock } from "lucide-react"
import ROUTER from "src/router/ROUTER"
import CookingBatchesKPI from "./CookingBatchesKPI"
import CookingBatchesFilter from "./CookingBatchesFilter"
import CookingBatchesTable from "./CookingBatchesTable"
import SampleReminderBanner from "./SampleReminderBanner"
import styles from "./index.module.scss"

/**
 * CookingBatches - Màn hình Quản lý Lô / Mẻ Chế Biến (Nhân viên Bếp)
 * Chuẩn hóa Mobile-First & UI/UX Pro Max:
 * - Kế thừa MainLayout dùng chung (Sidebar xanh #0A8066 + DashboardHeader)
 * - Header Trang: Tiêu đề + Nút Tạo mẻ mới
 * - 4 Ô KPI dạng ngói compact 2 cột trên mobile
 * - Dải Filter Chips vuốt ngang mượt mà
 * - Bảng thích ứng: Desktop giữ bảng, Mobile chuyển thành Thẻ 2 hàng mật độ cao (~60px)
 * - Nút Tạo mẻ ghim đáy màn hình (Sticky Bottom CTA) cho ngón tay cái thao tác 1 tay
 */
function CookingBatches() {
  const navigate = useNavigate()
  const [filterChip, setFilterChip] = useState("ALL")
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className={styles.batchesContainer}>
      {/* 1. Header Trang: Tiêu đề + Badge ca ăn + Nút thao tác Desktop */}
      <div className={styles.pageHeader}>
        <div className={styles.titleWrap}>
          <h1 className={styles.title}>Quản lý mẻ chế biến</h1>
          <div className={styles.shiftBadge}>
            <span className={styles.pulseDot} />
            <Clock size={13} className={styles.clockIcon} />
            <span>Ca trưa (11:15)</span>
          </div>
        </div>

        {/* Action buttons (Desktop) */}
        <div className={styles.actionBtns}>
          <button type="button" className={styles.exportBtn} title="Xuất báo cáo danh sách mẻ">
            <FileDown size={16} />
            <span>Xuất báo cáo</span>
          </button>

          <button
            type="button"
            className={styles.createBtn}
            onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_BATCH_CREATE)}
          >
            <Plus size={18} />
            <span>Tạo mẻ nấu mới</span>
          </button>
        </div>
      </div>

      {/* 2. Nhắc nhở lưu mẫu thanh mảnh */}
      <SampleReminderBanner />

      {/* 3. 4 Ô KPI Mật độ cao (2 cột compact trên mobile) */}
      <CookingBatchesKPI />

      {/* 4. Dải Bộ Lọc (Search box + Filter Chips cuộn ngang) */}
      <CookingBatchesFilter
        activeQuickFilter={filterChip}
        onQuickFilterChange={(chipId) => setFilterChip(chipId)}
        onFilterChange={({ searchTerm: term }) => setSearchTerm(term)}
      />

      {/* 5. Bảng / Thẻ Dữ Liệu Lô Chế Biến */}
      <CookingBatchesTable filterChip={filterChip} searchTerm={searchTerm} />

      {/* 6. Nút Tạo mẻ ghim đáy màn hình cho Mobile (Thumb-friendly Sticky CTA) */}
      <div className={styles.mobileStickyBar}>
        <button
          type="button"
          className={styles.mobileCreateBtn}
          onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_BATCH_CREATE)}
        >
          <Plus size={19} />
          <span>Tạo mẻ nấu mới</span>
        </button>
      </div>
    </div>
  )
}

export default CookingBatches
