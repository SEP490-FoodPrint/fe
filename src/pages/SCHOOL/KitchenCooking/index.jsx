import React from "react"
import QuickAccessCards from "./component/QuickAccessCards"
import PendingTasksSection from "./component/PendingTasksSection"
import RecentCookingBatches from "./component/RecentCookingBatches"
import RecentMealAllocations from "./component/RecentMealAllocations"
import styles from "./index.module.scss"

/**
 * KitchenCooking - Giao diện Bảng điều khiển Nhân viên Bếp (FoodPrint)
 * Hoạt động bên trong khung MainLayout dùng chung của dự án:
 * - Đồng bộ 100% Sidebar và Header từ main
 * - Section A: Tiêu đề & Giới thiệu
 * - Section B: 4 Thẻ truy cập nhanh (Quick Access Cards)
 * - Section C: Công việc cần xử lý hôm nay (Pending Tasks)
 * - Section D: Hoạt động gần đây (Recent Batches & Allocations)
 */
function KitchenCooking() {
  return (
    <div className={styles.dashboardContainer}>
      {/* Section A: Tiêu đề & Tổng quan */}
      <div className={styles.titleSection}>
        <h1 className={styles.title}>Vận hành Bếp ăn</h1>
        <p className={styles.subtitle}>
          Theo dõi tiến độ chế biến, phân bổ khẩu phần theo lớp và ghi nhận lưu mẫu thực phẩm trong ngày.
        </p>
      </div>

      {/* Section B: Truy cập nhanh (4 Cards) */}
      <QuickAccessCards />

      {/* Section C: Công việc cần xử lý hôm nay */}
      <PendingTasksSection />

      {/* Section D: Hoạt động gần đây (2 Bảng dữ liệu song song) */}
      <div className={styles.tablesGrid}>
        <RecentCookingBatches />
        <RecentMealAllocations />
      </div>
    </div>
  )
}

export default KitchenCooking
