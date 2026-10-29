import React from "react"
import { useNavigate } from "react-router-dom"
import ROUTER from "src/router/ROUTER"
import KitchenSidebar from "../component/KitchenSidebar"
import KitchenHeader from "../component/KitchenHeader"
import KitchenFooter from "../component/KitchenFooter"
import CookingBatchesKPI from "./CookingBatchesKPI"
import CookingBatchesFilter from "./CookingBatchesFilter"
import CookingBatchesTable from "./CookingBatchesTable"
import SampleReminderBanner from "./SampleReminderBanner"
import RoleSwitcher from "src/components/Common/RoleSwitcher"
import styles from "./index.module.scss"

/**
 * CookingBatches - Màn hình Quản lý Lô / Mẻ Chế Biến (Nhân viên Bếp)
 * Chuẩn hóa 100% theo bản thiết kế Google Stitch:
 * - Left Sidebar xanh ngọc #0A8066 với Logo chính thức
 * - Top Header xanh nhạt #EDF7F0 dính cố định
 * - 4 Thẻ KPI thống kê tiến độ nấu & lưu mẫu
 * - Dải bộ lọc dàn ngang (Tìm kiếm, Ngày, Bữa ăn, Phương thức, Trạng thái)
 * - Bảng dữ liệu mẻ chế biến kèm phân tách Nấu chung vs Nấu riêng (dị ứng)
 * - Khối nhắc nhở quy chuẩn lưu mẫu thực phẩm 24h
 * - Footer nghiệp vụ
 */
function CookingBatches() {
  return (
    <div className={styles.pageShell}>
      {/* 1. Left Sidebar Xanh #0A8066 */}
      <KitchenSidebar />

      {/* 2. Main Canvas bên phải (ml-64 = 256px) */}
      <div className={styles.mainCanvas}>
        <KitchenHeader />

        <main className={styles.mainContent}>
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
        </main>

        <KitchenFooter />
      </div>

      {/* Nút đổi vai trò nổi để test */}
      <RoleSwitcher />
    </div>
  )
}

export default CookingBatches
