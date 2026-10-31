import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Zap,
  CheckCircle2,
  Edit3,
  Trash2,
  Shield,
  CookingPot,
  MoreVertical,
  Check,
  AlertTriangle
} from "lucide-react"
import styles from "./BatchActionsCard.module.scss"

export default function BatchActionsCard({
  status = "DRAFT",
  onOpenConfirmModal,
  onOpenDeleteModal,
  onOpenCompleteModal
}) {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isDraft = status === "DRAFT"
  const isConfirmed = status === "CONFIRMED"
  const isCompleted = status === "COMPLETED"

  return (
    <>
      {/* 1. Desktop Actions Card (Cột phải) */}
      <section className={styles.actionsCard}>
        <div className={styles.cardHeader}>
          <Zap size={18} className={styles.headerIcon} />
          <h2 className={styles.cardTitle}>Thao tác nghiệp vụ</h2>
        </div>

        <div className={styles.btnStack}>
          {/* Nút 1: Xác nhận phương án / Ghi nhận hoàn thành */}
          {isDraft && (
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={onOpenConfirmModal}
            >
              <CheckCircle2 size={17} />
              <span>Xác nhận phương án</span>
            </button>
          )}

          {isConfirmed && (
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={onOpenCompleteModal}
            >
              <CookingPot size={17} />
              <span>Ghi nhận nấu xong &amp; Lưu mẫu</span>
            </button>
          )}

          {isCompleted && (
            <button
              type="button"
              className={styles.btnDisabled}
              disabled
            >
              <Check size={17} />
              <span>Đã hoàn tất quy trình</span>
            </button>
          )}

          {/* Nút 2: Chỉnh sửa lô chế biến */}
          <button
            type="button"
            className={`${styles.btnSecondary} ${!isDraft ? styles.btnDisabled : ""}`}
            disabled={!isDraft}
            onClick={() => isDraft && alert("Tính năng chỉnh sửa phương án đang được mở")}
            title={!isDraft ? "Không thể chỉnh sửa sau khi đã duyệt phương án" : "Chỉnh sửa phương án"}
          >
            <Edit3 size={16} />
            <span>Chỉnh sửa lô chế biến</span>
          </button>

          {/* Nút 3: Xóa lô chế biến */}
          <button
            type="button"
            className={`${styles.btnDanger} ${!isDraft ? styles.btnDisabled : ""}`}
            disabled={!isDraft}
            onClick={() => isDraft && onOpenDeleteModal()}
            title={!isDraft ? "Không thể xóa sau khi đã duyệt phương án" : "Xóa lô chế biến"}
          >
            <Trash2 size={16} />
            <span>Xóa lô chế biến</span>
          </button>
        </div>

        {/* Chú thích an toàn FoodPrint */}
        <div className={styles.securityNote}>
          <Shield size={16} className={styles.shieldIcon} />
          <p className={styles.securityText}>
            Lô chế biến chỉ có thể chỉnh sửa hoặc xóa khi chưa được xác nhận phương án. Khi đã xác nhận, dữ liệu sẽ được khóa để đảm bảo an toàn truy xuất nguồn gốc.
          </p>
        </div>
      </section>

      {/* 2. Mobile Sticky Bottom Bar (Hiện trên Mobile < 768px) */}
      <div className={styles.mobileStickyBar}>
        <div className={styles.mobileBarInner}>
          {isDraft && (
            <>
              <button
                type="button"
                className={styles.mobilePrimaryBtn}
                onClick={onOpenConfirmModal}
              >
                <CheckCircle2 size={18} />
                <span>Xác nhận phương án</span>
              </button>

              <div className={styles.mobileMenuAnchor}>
                <button
                  type="button"
                  className={styles.mobileMoreBtn}
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Thao tác khác"
                >
                  <MoreVertical size={20} />
                </button>

                {mobileMenuOpen && (
                  <div className={styles.mobileDropdownMenu}>
                    <button
                      type="button"
                      className={styles.mobileMenuItem}
                      onClick={() => {
                        setMobileMenuOpen(false)
                        alert("Mở tính năng chỉnh sửa phương án")
                      }}
                    >
                      <Edit3 size={16} />
                      <span>Chỉnh sửa</span>
                    </button>
                    <button
                      type="button"
                      className={`${styles.mobileMenuItem} ${styles.itemDanger}`}
                      onClick={() => {
                        setMobileMenuOpen(false)
                        onOpenDeleteModal()
                      }}
                    >
                      <Trash2 size={16} />
                      <span>Xóa lô</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {isConfirmed && (
            <button
              type="button"
              className={styles.mobilePrimaryBtn}
              onClick={onOpenCompleteModal}
            >
              <CookingPot size={18} />
              <span>Ghi nhận nấu xong &amp; Lưu mẫu</span>
            </button>
          )}

          {isCompleted && (
            <div className={styles.mobileCompletedBar}>
              <CheckCircle2 size={18} className={styles.doneIcon} />
              <span>Lô chế biến đã hoàn tất</span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

