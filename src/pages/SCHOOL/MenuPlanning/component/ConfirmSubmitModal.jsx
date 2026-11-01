import React from "react"
import styles from "./ConfirmSubmitModal.module.scss"

export default function ConfirmSubmitModal({
  isOpen,
  onClose,
  onConfirm,
  menuData,
  dishesCount,
  selectedAllergyOption,
  conflictCount
}) {
  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.headerIconWrapper}>
            <span className={`material-symbols-outlined ${styles.headerIcon}`}>send_and_archive</span>
          </div>
          <div>
            <h3 className={styles.modalTitle}>Xác nhận gửi duyệt thực đơn</h3>
            <p className={styles.modalSubtitle}>Hồ sơ sẽ được chuyển tới Ban Giám hiệu để thẩm định dinh dưỡng</p>
          </div>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.summaryBox}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Tên thực đơn:</span>
              <strong className={styles.summaryVal}>{menuData.name}</strong>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Ngày & Bữa ăn:</span>
              <strong className={styles.summaryVal}>
                {menuData.date} • {menuData.mealType === "LUNCH" ? "Bữa trưa" : "Bữa xế"}
              </strong>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Quy mô phục vụ:</span>
              <strong className={styles.summaryVal}>{menuData.portionCount} suất học sinh</strong>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Cơ cấu món ăn:</span>
              <strong className={styles.summaryVal}>{dishesCount} món ăn chính</strong>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Xử lý dị ứng:</span>
              <span className={styles.allergySummaryText}>
                {conflictCount > 0 ? (
                  selectedAllergyOption === "OPTION_2" ? (
                    <span className={styles.option2Pill}>
                      Phương án 2: Bố trí {conflictCount} suất ăn riêng
                    </span>
                  ) : (
                    <span className={styles.option1Pill}>
                      Phương án 1: Thay thế toàn bộ món
                    </span>
                  )
                ) : (
                  <span className={styles.safePill}>An toàn tuyệt đối</span>
                )}
              </span>
            </div>
          </div>

          <div className={styles.legalNote}>
            <span className={`material-symbols-outlined ${styles.noteIcon}`}>verified_user</span>
            <p>
              Sau khi Ban Giám hiệu duyệt (<strong>APPROVED</strong>), hệ thống sẽ tự động kích hoạt tạo Lô chế biến (<strong>CookingBatch</strong>) cho Bếp ăn thực hiện.
            </p>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            className={styles.submitBtn}
            onClick={onConfirm}
          >
            <span className="material-symbols-outlined">check_circle</span>
            <span>Xác nhận gửi duyệt</span>
          </button>
        </div>
      </div>
    </div>
  )
}

