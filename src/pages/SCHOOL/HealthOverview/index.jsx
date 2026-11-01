import React from "react"
import HealthHeader from "./component/HealthHeader"
import HealthKPICards from "./component/HealthKPICards"
import HealthPendingTasksTable from "./component/HealthPendingTasksTable"
import HealthRecentMenus from "./component/HealthRecentMenus"
import HealthAllergyByClass from "./component/HealthAllergyByClass"
import styles from "./index.module.scss"

/**
 * HealthOverview - Màn hình Bảng điều khiển / Tổng quan dành riêng cho Nhân viên Y tế
 * Thiết kế chuẩn UI/UX Pro Max, đồng bộ theo Design System của FoodPrint:
 * 1. Header: Breadcrumb, tiêu đề trang, mô tả và nhãn ngày tháng
 * 2. Section A: 4 Thẻ KPI chỉ số hoạt động chính
 * 3. Section B: Bảng công việc cần xử lý
 * 4. Section C: Bố cục 2 cột (Thực đơn gần đây 60% & Thông tin dị ứng theo lớp 40%)
 */
export default function HealthOverview() {
  return (
    <div className={styles.healthOverviewContainer}>
      <div className={styles.contentWrap}>
        {/* Header trang */}
        <HealthHeader />

        {/* Khu vực A: 4 Thẻ KPI */}
        <HealthKPICards />

        {/* Khu vực B: Bảng công việc cần xử lý */}
        <HealthPendingTasksTable />

        {/* Khu vực C: Bố cục 2 cột ngang */}
        <div className={styles.twoColumnGrid}>
          <div className={styles.leftCol}>
            <HealthRecentMenus />
          </div>
          <div className={styles.rightCol}>
            <HealthAllergyByClass />
          </div>
        </div>
      </div>
    </div>
  )
}

