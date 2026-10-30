import React from "react"
import CookingBatchesKPI from "./CookingBatchesKPI"
import CookingBatchesFilter from "./CookingBatchesFilter"
import CookingBatchesTable from "./CookingBatchesTable"
import SampleReminderBanner from "./SampleReminderBanner"
import styles from "./index.module.scss"

/**
 * CookingBatches - Màn hình Quản lý Lô / Mẻ Chế Biến (Nhân viên Bếp)
 * Hoạt động bên trong khung MainLayout chuẩn của dự án:
 * - Kế thừa Sidebar màu xanh #0A8066 và DashboardHeader
 * - Header Trang: Tiêu đề + Hành động
 * - 4 Thẻ KPI thống kê tiến độ nấu & lưu mẫu
 * - Dải bộ lọc (Tìm kiếm, Ngày, Bữa ăn, Phương thức, Trạng thái)
 * - Bảng / Thẻ dữ liệu mẻ chế biến
 * - Khối nhắc nhở quy chuẩn lưu mẫu thực phẩm 24h
 */
function CookingBatches() {
  return (
    <div className={styles.batchesContainer}>
      {/* Header Trang: Tiêu đề + Hành động */}
      <div className={styles.pageHeader}>
        <div className={styles.titleWrap}>
          <h1 className={styles.title}>Danh sách lô chế biến</h1>
          <div className={styles.shiftBadge}>
            <span className={styles.pulseDot} />
            <span>Ca trưa • Hôm nay</span>
          </div>
        </div>

        <div className={styles.actionBtns}>
          <button type="button" className={styles.exportBtn}>
            <span className="material-symbols-outlined">file_download</span>
            <span>Xuất báo cáo</span>
          </button>

          <button type="button" className={styles.createBtn}>
            <span className="material-symbols-outlined">add</span>
            <span>Tạo mẻ mới</span>
          </button>
        </div>
      </div>

      {/* 4 Thẻ KPI Thống Kê */}
      <CookingBatchesKPI />

      {/* Dải Bộ Lọc */}
      <CookingBatchesFilter />

      {/* Bảng Dữ Liệu Lô Chế Biến */}
      <CookingBatchesTable />

      {/* Khối Nhắc Quy Chuẩn Lưu Mẫu */}
      <SampleReminderBanner />
    </div>
  )
}

export default CookingBatches
