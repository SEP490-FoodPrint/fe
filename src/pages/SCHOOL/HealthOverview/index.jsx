import React from "react"
import HealthHeader from "./component/HealthHeader"
import HealthKPICards from "./component/HealthKPICards"
import HealthPendingTasksTable from "./component/HealthPendingTasksTable"
import HealthAllergyByClass from "./component/HealthAllergyByClass"
import styles from "./index.module.scss"

/**
 * HealthOverview - Màn hình Tổng quan dành cho Chuyên viên Y tế học đường
 * Thiết kế tinh gọn, tối giản, loại bỏ hoàn toàn các phần tử thừa & trùng lặp:
 * 1. Header: Tiêu đề, ngày làm việc, nút tác vụ nhanh "Tạo thực đơn tuần"
 * 2. 3 Thẻ chỉ số hoạt động cốt lõi (KPIs)
 * 3. Bố cục 2 cột vận hành cân xứng:
 *    - Trái (65%): Bảng công việc cần xử lý hôm nay (Pending Tasks)
 *    - Phải (35%): Cảnh báo dị ứng theo lớp (Allergy Alerts by Class)
 */
export default function HealthOverview() {
  return (
    <div className={styles.healthOverviewContainer}>
      <div className={styles.contentWrap}>
        {/* Header trang */}
        <HealthHeader />

        {/* Khu vực 1: 3 Thẻ chỉ số cốt lõi */}
        <HealthKPICards />

        {/* Khu vực 2: Bố cục 2 cột cân xứng */}
        <div className={styles.twoColumnGrid}>
          <div className={styles.leftCol}>
            <HealthPendingTasksTable />
          </div>
          <div className={styles.rightCol}>
            <HealthAllergyByClass />
          </div>
        </div>
      </div>
    </div>
  )
}
