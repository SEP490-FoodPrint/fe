import { useEffect } from "react"
import { VisibilityOffOutlined, WarningAmberRounded } from "@mui/icons-material"
import styles from "../IngredientCatalog.module.scss"

const ConfirmHideDialog = ({
  open,
  ingredientName,
  onCancel,
  onConfirm,
  submitting = false,
  errorMessage = "",
}) => {
  useEffect(() => {
    if (!open) return undefined
    const handleKeyDown = event => {
      if (event.key === "Escape" && !submitting) {
        event.stopPropagation()
        onCancel?.()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onCancel, submitting])

  if (!open) return null

  const displayName = ingredientName || "nguyên liệu này"

  return (
    <div
      className={styles.modalBackdrop}
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget && !submitting) {
          onCancel?.()
        }
      }}
    >
      <div
        className={styles.confirmDialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-hide-ingredient-title"
        aria-describedby="confirm-hide-ingredient-desc"
      >
        <div className={styles.confirmContent}>
          <div className={styles.warningCircle} aria-hidden="true">
            <WarningAmberRounded className={styles.warningIcon} />
          </div>
          <h2 id="confirm-hide-ingredient-title" className={styles.confirmTitle}>
            Xác nhận ẩn nguyên liệu
          </h2>
          <p id="confirm-hide-ingredient-desc" className={styles.confirmBodyText}>
            {"Nguyên liệu "}
            <strong>{`"${displayName}"`}</strong>
            {" sẽ chuyển sang trạng thái "}
            <strong>Ngừng hoạt động (INACTIVE)</strong>
            {". Nguyên liệu này sẽ không còn xuất hiện trong danh sách chọn khi tạo lô hàng hoặc thực đơn mới, nhưng vẫn giữ nguyên dữ liệu lịch sử ở các lô hàng và thực đơn cũ."}
          </p>
          {errorMessage && (
            <p className={styles.fieldError} role="alert">
              {errorMessage}
            </p>
          )}
        </div>

        <div className={styles.confirmFooter}>
          <button
            type="button"
            className={styles.cancelHideBtn}
            onClick={onCancel}
            disabled={submitting}
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            className={styles.confirmHideBtn}
            onClick={onConfirm}
            disabled={submitting}
          >
            <VisibilityOffOutlined className={styles.btnIcon} />
            <span>{submitting ? "Đang ẩn..." : "Xác nhận ẩn"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmHideDialog
