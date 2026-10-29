import React from "react"
import KitchenSidebar from "./component/KitchenSidebar"
import KitchenHeader from "./component/KitchenHeader"
import KitchenFooter from "./component/KitchenFooter"
import QuickAccessCards from "./component/QuickAccessCards"
import PendingTasksSection from "./component/PendingTasksSection"
import RecentCookingBatches from "./component/RecentCookingBatches"
import RecentMealAllocations from "./component/RecentMealAllocations"
import RoleSwitcher from "src/components/Common/RoleSwitcher"
import styles from "./index.module.scss"

/**
 * KitchenCooking - Giao diện Bảng điều khiển Nhân viên Bếp (FoodPrint)
 * Hoàn toàn bám sát mẫu Stitch:
 * - Left Sidebar xanh ngọc #0A8066 cố định 256px
 * - Top Header xanh nhạt #EDF7F0 dính cố định
 * - Main Workplace nền #F3F9F5
 * - Section A: Title & Overview
 * - Section B: 4 Quick Cards
 * - Section C: Công việc cần xử lý hôm nay
 * - Section D: Hoạt động gần đây (2 bảng side-by-side)
 * - Footer #EDF7F0
 * - RoleSwitcher nổi phục vụ kiểm thử
 */
function KitchenCooking() {
  return (
    <div className={styles.pageShell}>
      {/* 1. Left Sidebar Xanh #0A8066 */}
      <KitchenSidebar />

      {/* 2. Main Canvas bên phải (ml-64 = 256px) */}
      <div className={styles.mainCanvas}>
        {/* Top Header */}
        <KitchenHeader />

        {/* Workplace Content */}
        <main className={styles.mainContent}>
          {/* Section A: Title & Overview */}
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Trang chủ nhân viên bếp</h1>
            <p className={styles.subtitle}>
              Theo dõi công việc chế biến, phân bổ suất ăn và kiểm tra nguyên liệu trong ngày.
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
        </main>

        {/* Footer */}
        <KitchenFooter />
      </div>

      {/* Floating Role Switcher */}
      <RoleSwitcher />
    </div>
  )
}

export default KitchenCooking
