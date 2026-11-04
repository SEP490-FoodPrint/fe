import React from "react"
import QuickAccessCards from "./component/QuickAccessCards"
import PendingTasksSection from "./component/PendingTasksSection"
import RecentCookingBatches from "./component/RecentCookingBatches"
import RecentMealAllocations from "./component/RecentMealAllocations"
import styles from "./index.module.scss"

/**
 * KitchenCooking - Giao diện Bảng điều khiển Nhân viên Bếp (FoodPrint)
 * Tối ưu theo phản hồi Mentor:
 * - Trực quan, ít chữ, tập trung vào thao tác chính
 * - Thân thiện với màn hình điện thoại di động
 */
function KitchenCooking() {
  return (
    <div className={styles.dashboardContainer}>
      {/* Section A: Tiêu đề & Tag ca làm việc */}
      <div className={styles.titleSection}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Vận hành Bếp ăn</h1>
          <span className={styles.todayBadge}>Ca nấu hôm nay</span>
        </div>
      </div>

      {/* Section B: Truy cập nhanh (4 Cards) */}
      <QuickAccessCards />

      {/* Section C: Công việc cần xử lý hôm nay */}
      <PendingTasksSection />

      {/* Section D: Hoạt động gần đây */}
      <div className={styles.tablesGrid}>
        <RecentCookingBatches />
        <RecentMealAllocations />
      </div>
    </div>
  )
}

export default KitchenCooking
