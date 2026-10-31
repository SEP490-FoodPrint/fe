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
  FlaskConical,
  Printer
} from "lucide-react"
import ROUTER from "src/router/ROUTER"
import styles from "./BatchActionsCard.module.scss"

export default function BatchActionsCard({
  status = "DRAFT",
  batchCode = "CB-20261023-01A",
  dishName = "Thịt heo kho cút nước dừa",
  onOpenConfirmModal,
  onOpenDeleteModal,
  onOpenCompleteModal,
  onOpenPrintModal
}) {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isDraft = status === "DRAFT"
  const isConfirmed = status === "CONFIRMED"
  const isCompleted = status === "COMPLETED"

  const handleGoToSample = () => {
    navigate(
      `${ROUTER.SCHOOL_KITCHEN_SAMPLES}?batchCode=${batchCode}&dishName=${encodeURIComponent(
        dishName || ""
      )}`
    )
  }

  const handlePrint = () => {
    if (onOpenPrintModal) {
      onOpenPrintModal()
    } else {
      window.print()
    }
  }

  return (
    <>
      {/* 1. Desktop Actions Card (Cột phải) */}
      <section className={styles.actionsCard}>
        <div className={styles.cardHeader}>
          <Zap size={18} className={styles.headerIcon} />
          <h2 className={styles.cardTitle}>Thao tác nghiệp vụ</h2>
        </div>

        <div className={styles.btnStack}>
          {/* Nút 1: Xác nhận phương án (chỉ khi Draft) */}
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

          {/* Nút 2: Ghi nhận hoàn thành chế biến (khi đã xác nhận) */}
          {isConfirmed && (
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={onOpenCompleteModal}
            >
              <CookingPot size={17} />
              <span>Ghi nhận hoàn thành chế biến</span>
            </button>
          )}

          {/* Nút 3: Tiếp tục hiển thị ghi nhận mẫu lưu & In phiếu (khi đã hoàn thành chế biến) */}
          {isCompleted && (
            <div className={styles.sampleActionBlock}>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleGoToSample}
              >
                <FlaskConical size={18} />
                <span>Ghi nhận mẫu lưu</span>
              </button>

              <button
                type="button"
                className={styles.btnPrintSecondary}
                onClick={handlePrint}
              >
                <Printer size={16} />
                <span>In sổ kiểm thực 3 bước</span>
              </button>
            </div>
          )}

          {/* Các nút chỉnh sửa / xóa (chỉ khi Draft) */}
          {isDraft && (
            <>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => navigate(`/school/kitchen-cooking/batches/${batchCode}/edit`)}
                title="Chỉnh sửa phương án"
              >
                <Edit3 size={16} />
                <span>Chỉnh sửa lô chế biến</span>
              </button>

              <button
                type="button"
                className={styles.btnDanger}
                onClick={() => onOpenDeleteModal()}
                title="Xóa lô chế biến"
              >
                <Trash2 size={16} />
                <span>Xóa lô chế biến</span>
              </button>
            </>
          )}
        </div>

        {/* Chú thích an toàn FoodPrint */}
        <div className={styles.securityNote}>
          <Shield size={16} className={styles.shieldIcon} />
          <p className={styles.securityText}>
            {isCompleted
              ? "Lô chế biến đã hoàn tất ra khay. Bếp và cán bộ y tế tiến hành kiểm thực 3 bước theo đúng QĐ 1246/QĐ-BYT để hoàn tất hồ sơ pháp lý."
              : "Lô chế biến chỉ có thể chỉnh sửa hoặc xóa khi chưa được xác nhận phương án. Khi đã xác nhận, dữ liệu sẽ được khóa để đảm bảo an toàn truy xuất nguồn gốc."}
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
                        navigate(`/school/kitchen-cooking/batches/${batchCode}/edit`)
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
              <span>Ghi nhận hoàn thành chế biến</span>
            </button>
          )}

          {isCompleted && (
            <div className={styles.mobileCompletedActionWrap}>
              <button
                type="button"
                className={styles.mobilePrimaryBtn}
                onClick={handleGoToSample}
              >
                <FlaskConical size={18} />
                <span>Ghi nhận mẫu lưu</span>
              </button>
              <button
                type="button"
                className={styles.mobilePrintIconBtn}
                onClick={handlePrint}
                title="In phiếu kiểm thực & Lô mẻ"
                aria-label="In phiếu kiểm thực"
              >
                <Printer size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
