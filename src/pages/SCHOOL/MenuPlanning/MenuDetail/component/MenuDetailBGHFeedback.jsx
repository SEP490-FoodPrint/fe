import React from "react"
import styles from "./MenuDetailBGHFeedback.module.scss"

export default function MenuDetailBGHFeedback({ menu, onEdit }) {
  if (!menu) return null

  if (menu.status === "REVISION_REQUESTED") {
    return (
      <div className={styles.alertRevision}>
        <div className={styles.alertHeader}>
          <div className={styles.alertTitleGroup}>
            <span className={`material-symbols-outlined ${styles.alertIconRevision}`}>report_problem</span>
            <div className={styles.alertTextGroup}>
              <h3 className={styles.alertTitle}>Ban Giám Hiệu yêu cầu chỉnh sửa thực đơn</h3>
              <span className={styles.alertTime}>Ghi nhận lúc: 08:45 ngày 25/10/2026 • Người đánh giá: ThS. Trần Đình Hưng (Hiệu phó)</span>
            </div>
          </div>
          {onEdit && (
            <button type="button" className={styles.btnActionRevision} onClick={onEdit}>
              <span className="material-symbols-outlined text-[16px]">edit</span>
              <span>Chỉnh sửa ngay theo phản hồi</span>
            </button>
          )}
        </div>
        <div className={styles.alertBody}>
          <p className={styles.alertComment}>
            <strong>Ý kiến chỉ đạo của BGH:</strong> {menu.feedback || "Cần rà soát định lượng, điều chỉnh nhóm học sinh dị ứng và cân đối lại lượng gia vị dầu mỡ theo tiêu chuẩn."}
          </p>
        </div>
      </div>
    )
  }

  if (menu.status === "APPROVED") {
    return (
      <div className={styles.alertApproved}>
        <div className={styles.alertHeader}>
          <div className={styles.alertTitleGroup}>
            <span className={`material-symbols-outlined ${styles.alertIconApproved}`}>verified</span>
            <div className={styles.alertTextGroup}>
              <h3 className={styles.alertTitleApproved}>Thực đơn đã được Ban Giám Hiệu phê duyệt chính thức</h3>
              <span className={styles.alertTime}>Phê duyệt lúc: 09:15 ngày 25/10/2026 • Người ký duyệt: TS. Lê Quang Vinh (Hiệu trưởng)</span>
            </div>
          </div>
        </div>
        <div className={styles.alertBody}>
          <p className={styles.alertCommentApproved}>
            <strong>Nội dung phê duyệt:</strong> {menu.feedback || "Thực đơn đảm bảo tiêu chuẩn dinh dưỡng học đường, định lượng cân bằng, đồng ý phương án suất ăn thay thế cho học sinh dị ứng."}
          </p>
        </div>
      </div>
    )
  }

  if (menu.status === "PENDING_APPROVAL") {
    return (
      <div className={styles.alertPending}>
        <div className={styles.alertHeader}>
          <div className={styles.alertTitleGroup}>
            <span className={`material-symbols-outlined ${styles.alertIconPending}`}>hourglass_top</span>
            <div className={styles.alertTextGroup}>
              <h3 className={styles.alertTitlePending}>Hồ sơ thực đơn đang chờ Ban Giám Hiệu phê duyệt</h3>
              <span className={styles.alertTime}>Đã gửi duyệt lúc: 14:30 ngày 24/10/2026 bởi BS. Nguyễn Thu Trang</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.alertDraft}>
      <div className={styles.alertHeader}>
        <div className={styles.alertTitleGroup}>
          <span className={`material-symbols-outlined ${styles.alertIconDraft}`}>edit_note</span>
          <div className={styles.alertTextGroup}>
            <h3 className={styles.alertTitleDraft}>Thực đơn đang ở trạng thái Bản nháp (DRAFT)</h3>
            <span className={styles.alertTime}>Vui lòng hoàn tất kiểm tra thành phần chính, gia vị và đối soát dị ứng trước khi gửi BGH duyệt.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

