import React from "react"
import { ClipboardCheck, Hourglass, CheckCircle2, Timer } from "lucide-react"
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
            <h3 className={styles.bannerTitle}>Phương án tự động — Chờ bếp xác nhận</h3>
            <p className={styles.bannerDesc}>
              Hệ thống đã tự động tính toán số suất và lượng nguyên liệu cần dùng từ thực đơn đã duyệt và sĩ số báo ăn của GVCN. Nhân viên bếp chỉ cần xem xét và bấm "Xác nhận phương án".
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
            <h3 className={styles.bannerTitle}>Đã xác nhận phương án — Đang chế biến</h3>
            <p className={styles.bannerDesc}>
              Bếp đang tiến hành chế biến theo phương án đã phê duyệt. Sau khi hoàn tất ra khay và lưu mẫu, bấm "Ghi nhận nấu xong &amp; Lưu mẫu".
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
            <h3 className={styles.bannerTitle}>Đã hoàn thành chế biến &amp; Lưu mẫu</h3>
            <p className={styles.bannerDesc}>
              Món ăn đã ra khay theo đúng sĩ số chốt và đã lưu mẫu kiểm thực 24h theo đúng quy chuẩn an toàn thực phẩm.
            </p>
          </div>
        </div>
      )}

      {/* Chỉ số vận hành (Grid 2x2 Mobile / 4 Cols Desktop - Mỗi chỉ số 1 giá trị duy nhất) */}
      <div className={styles.kpiGrid}>
        {/* KPI 1: Số suất chế biến */}
        <div className={styles.kpiBox}>
          <span className={styles.kpiLabel}>Số suất chế biến</span>
          <span className={`${styles.kpiValueBold} ${styles.primaryVal}`}>
            {(batchData.portions || 1250).toLocaleString("vi-VN")}
          </span>
          <span className={styles.kpiSub}>suất (Khớp sĩ số GVCN)</span>
        </div>

        {/* KPI 2: Chế độ chế biến */}
        <div className={styles.kpiBox}>
          <span className={styles.kpiLabel}>Chế độ chế biến</span>
          <span className={styles.kpiValueBold}>
            {batchData.method === "SEPARATE" ? "Nấu riêng 1:1" : "Nấu chung"}
          </span>
          <span className={styles.kpiSub}>Cấu hình BGH</span>
        </div>

        {/* KPI 3: Trạng thái quy trình */}
        <div className={styles.kpiBox}>
          <span className={styles.kpiLabel}>Trạng thái quy trình</span>
          <span
            className={`${styles.kpiValueBold} ${
              isCompleted ? styles.successVal : isConfirmed ? styles.warningVal : styles.draftVal
            }`}
          >
            {isCompleted ? "Đã nấu xong" : isConfirmed ? "Đang chế biến" : "Chờ xác nhận"}
          </span>
          <span className={styles.kpiSub}>Kiểm thực bếp</span>
        </div>

        {/* KPI 4: Thời điểm hoàn thành */}
        <div className={styles.kpiBox}>
          <span className={styles.kpiLabel}>Thời điểm hoàn thành</span>
          <span className={`${styles.kpiTimeText} ${!batchData.completedAt ? styles.mutedVal : ""}`}>
            {batchData.completedAt || "—"}
          </span>
          <span className={styles.kpiSub}>
            {batchData.completedAt ? "Đã lưu mẫu 24h" : "Chưa hoàn tất"}
          </span>
        </div>
      </div>
    </section>
  )
}
