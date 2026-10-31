import React from "react"
import { ClipboardCheck, Hourglass, CheckCircle2, AlertCircle, Timer } from "lucide-react"
import styles from "./BatchCookingResultCard.module.scss"

export default function BatchCookingResultCard({ batchData }) {
  const isDraft = batchData.status === "DRAFT"
  const isConfirmed = batchData.status === "CONFIRMED"
  const isCompleted = batchData.status === "COMPLETED"

  return (
    <section className={styles.resultCard}>
      {/* Header Thẻ */}
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.iconBox}>
            <ClipboardCheck size={18} />
          </div>
          <h2 className={styles.cardTitle}>Kết quả chế biến</h2>
        </div>
      </div>

      {/* Trạng thái banner */}
      {isDraft && (
        <div className={`${styles.statusBanner} ${styles.bannerDraft}`}>
          <div className={styles.bannerIconBox}>
            <Hourglass size={20} />
          </div>
          <div className={styles.bannerContent}>
            <h3 className={styles.bannerTitle}>Chưa tiến hành chế biến</h3>
            <p className={styles.bannerDesc}>
              Lô chế biến đang ở bước lập phương án. Số suất thực tế và thời điểm hoàn thành sẽ được ghi nhận sau khi lô được phê duyệt và nấu xong tại bếp.
            </p>
          </div>
        </div>
      )}

      {isConfirmed && (
        <div className={`${styles.statusBanner} ${styles.bannerConfirmed}`}>
          <div className={styles.bannerIconBox}>
            <Timer size={20} />
          </div>
          <div className={styles.bannerContent}>
            <h3 className={styles.bannerTitle}>Đã duyệt phương án - Sẵn sàng nấu</h3>
            <p className={styles.bannerDesc}>
              Định lượng và lô nguyên liệu đã được khóa. Nhân viên bếp thực hiện nấu và tiến hành cân đo ra khay để cập nhật số suất thực tế.
            </p>
          </div>
        </div>
      )}

      {isCompleted && (
        <div className={`${styles.statusBanner} ${styles.bannerCompleted}`}>
          <div className={styles.bannerIconBox}>
            <CheckCircle2 size={20} />
          </div>
          <div className={styles.bannerContent}>
            <h3 className={styles.bannerTitle}>Đã hoàn thành chế biến</h3>
            <p className={styles.bannerDesc}>
              Món ăn đã ra khay đủ số lượng, nhiệt độ tâm món đạt chuẩn an toàn thực phẩm và đã lưu mẫu kiểm thực 24h.
            </p>
          </div>
        </div>
      )}

      {/* Đối chiếu chỉ số số suất (Grid 2x2 Mobile / 4 Cols Desktop) */}
      <div className={styles.kpiGrid}>
        {/* KPI 1 */}
        <div className={styles.kpiBox}>
          <span className={styles.kpiLabel}>Số suất dự kiến</span>
          <span className={styles.kpiValueBold}>{batchData.plannedPortions.toLocaleString("vi-VN")}</span>
          <span className={styles.kpiSub}>suất định lượng</span>
        </div>

        {/* KPI 2 */}
        <div className={styles.kpiBox}>
          <span className={styles.kpiLabel}>Số suất thực tế</span>
          <span className={`${styles.kpiValueBold} ${!batchData.actualPortions ? styles.mutedVal : styles.primaryVal}`}>
            {batchData.actualPortions ? batchData.actualPortions.toLocaleString("vi-VN") : "—"}
          </span>
          <span className={styles.kpiSub}>
            {batchData.actualPortions ? "suất thành phẩm" : "Chưa ghi nhận"}
          </span>
        </div>

        {/* KPI 3 */}
        <div className={styles.kpiBox}>
          <span className={styles.kpiLabel}>Chênh lệch</span>
          <span className={`${styles.kpiValueBold} ${!batchData.variance ? styles.mutedVal : ""}`}>
            {batchData.variance || "—"}
          </span>
          <span className={styles.kpiSub}>
            {batchData.variance ? "Hao hụt sơ chế" : "Chờ đối soát"}
          </span>
        </div>

        {/* KPI 4 */}
        <div className={styles.kpiBox}>
          <span className={styles.kpiLabel}>Thời điểm hoàn thành</span>
          <span className={`${styles.kpiTimeText} ${!batchData.completedAt ? styles.mutedVal : ""}`}>
            {batchData.completedAt || "—"}
          </span>
          <span className={styles.kpiSub}>
            {batchData.completedAt ? "Hoàn tất ra khay" : "Chưa ghi nhận"}
          </span>
        </div>
      </div>
    </section>
  )
}

