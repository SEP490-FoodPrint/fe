import React, { useState, useEffect, useCallback } from "react"
import { getNutritionOverviewData } from "src/services/HealthOverviewService"
import HealthHeader from "./component/HealthHeader"
import HealthKPICards from "./component/HealthKPICards"
import HealthPendingTasksTable from "./component/HealthPendingTasksTable"
import HealthAllergyByClass from "./component/HealthAllergyByClass"
import styles from "./index.module.scss"

/**
 * HealthOverview - Màn hình Tổng quan dành cho Chuyên viên Y tế / Dinh dưỡng học đường
 * Dữ liệu 100% từ API thật, loại bỏ toàn bộ mock data:
 * 1. Header: Tiêu đề, ngày làm việc, nút tác vụ nhanh "Tạo thực đơn tuần"
 * 2. 3 Thẻ chỉ số hoạt động cốt lõi (KPIs):
 *    - Thực đơn cần xử lý: menu REVISION_REQUIRED + DRAFT
 *    - Giao hàng chờ kiểm tra: delivery canInspect / PENDING_APPROVAL / ARRIVED
 *    - Cảnh báo dị ứng theo lớp: số lớp có học sinh dị ứng
 * 3. Bố cục 2 cột vận hành cân xứng:
 *    - Trái (65%): Bảng công việc cần xử lý hôm nay (Pending Tasks)
 *    - Phải (35%): Cảnh báo dị ứng theo lớp (Allergy Alerts by Class)
 */
export default function HealthOverview() {
  const [data, setData] = useState({
    kpis: {
      menusTodoCount: null,
      deliveriesPendingCount: null,
      allergyClassCount: null,
    },
    tasks: [],
    allergyClasses: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [revision, setRevision] = useState(0)

  const loadData = useCallback(() => {
    const controller = new AbortController()
    setLoading(true)
    setError("")

    getNutritionOverviewData({ signal: controller.signal })
      .then(res => {
        if (!controller.signal.aborted) {
          setData({
            kpis: res.kpis,
            tasks: res.tasks,
            allergyClasses: res.allergyClasses,
          })
          if (res.errors) {
            setError(res.errors)
          }
        }
      })
      .catch(err => {
        if (!controller.signal.aborted) {
          setError(
            err.message || "Không thể tải dữ liệu tổng quan y tế học đường.",
          )
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [])

  useEffect(() => {
    return loadData()
  }, [loadData, revision])

  const handleRetry = () => {
    setRevision(prev => prev + 1)
  }

  return (
    <div className={styles.healthOverviewContainer}>
      <div className={styles.contentWrap}>
        {/* Header trang */}
        <HealthHeader />

        {/* Khu vực 1: 3 Thẻ chỉ số cốt lõi */}
        <HealthKPICards
          allergyClassCount={data.kpis.allergyClassCount}
          menusTodoCount={data.kpis.menusTodoCount}
          deliveriesPendingCount={data.kpis.deliveriesPendingCount}
          loading={loading}
        />

        {/* Khu vực 2: Bố cục 2 cột cân xứng */}
        <div className={styles.twoColumnGrid}>
          <div className={styles.leftCol}>
            <HealthPendingTasksTable
              tasks={data.tasks}
              loading={loading}
              error={error}
              onRetry={handleRetry}
            />
          </div>
          <div className={styles.rightCol}>
            <HealthAllergyByClass
              classList={data.allergyClasses}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
