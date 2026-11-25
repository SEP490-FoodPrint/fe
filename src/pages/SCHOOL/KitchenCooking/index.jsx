import React from "react"
import QuickAccessCards from "./component/QuickAccessCards"
import PendingTasksSection from "./component/PendingTasksSection"
import RecentCookingBatches from "./component/RecentCookingBatches"
import RecentMealAllocations from "./component/RecentMealAllocations"
import styles from "./index.module.scss"

/**
 * Bảng điều khiển Nhân viên Bếp.
 * Điện thoại: lối tắt → việc hôm nay → lô → phân bổ.
 * Máy tính: việc hôm nay là cột chính, lối tắt và phân bổ ở cột phụ.
 */
function KitchenCooking() {
  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.titleSection}>
        <h1 className={styles.title}>Vận hành Bếp ăn</h1>
        <p className={styles.today}>{today}</p>
      </header>

      <div className={styles.layout}>
        <div className={styles.quick}>
          <QuickAccessCards />
        </div>
        <div className={styles.tasks}>
          <PendingTasksSection />
        </div>
        <div className={styles.batches}>
          <RecentCookingBatches />
        </div>
        <div className={styles.allocations}>
          <RecentMealAllocations />
        </div>
      </div>
    </div>
  )
}

export default KitchenCooking
