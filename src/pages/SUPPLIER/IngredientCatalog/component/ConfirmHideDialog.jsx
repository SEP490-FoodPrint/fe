import { useEffect } from "react"
import {
  CheckCircleOutlineRounded,
  VisibilityOffOutlined,
  VisibilityOutlined,
  WarningAmberRounded,
} from "@mui/icons-material"
import { INGREDIENT_STATUS } from "src/services/SupplierIngredientService"
import styles from "../IngredientCatalog.module.scss"

const STATUS_CONFIRM_CONFIG = {
  [INGREDIENT_STATUS.INACTIVE]: {
    title: "Xác nhận ẩn nguyên liệu",
    statusLabel: "Ngừng hoạt động (INACTIVE)",
    detailText:
      ". Nguyên liệu này sẽ không còn xuất hiện trong danh sách chọn khi tạo lô hàng, đơn giao hàng hoặc thực đơn mới, nhưng vẫn giữ nguyên dữ liệu lịch sử trước đó.",
    confirmLabel: "Xác nhận ẩn",
    submittingLabel: "Đang ẩn...",
    circleClassName: styles.warningCircle,
    confirmBtnClassName: styles.confirmHideBtn,
    renderHeaderIcon: () => (
      <WarningAmberRounded className={styles.warningIcon} />
    ),
    renderActionIcon: () => (
      <VisibilityOffOutlined className={styles.confirmBtnIcon} />
    ),
  },
  [INGREDIENT_STATUS.ACTIVE]: {
    title: "Xác nhận mở lại nguyên liệu",
    statusLabel: "Đang hoạt động (ACTIVE)",
    detailText:
      ". Nguyên liệu này sẽ xuất hiện trở lại trong danh sách chọn khi tạo lô hàng, đơn giao hàng và thực đơn mới.",
    confirmLabel: "Xác nhận mở lại",
    submittingLabel: "Đang mở lại...",
    circleClassName: styles.activateCircle,
    confirmBtnClassName: styles.confirmActivateBtn,
    renderHeaderIcon: () => (
      <CheckCircleOutlineRounded className={styles.activateIcon} />
    ),
    renderActionIcon: () => (
      <VisibilityOutlined className={styles.confirmBtnIcon} />
    ),
  },
}

const ConfirmHideDialog = ({
  open,
  ingredientName,
  targetStatus = INGREDIENT_STATUS.INACTIVE,
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
  const config =
    STATUS_CONFIRM_CONFIG[targetStatus] ||
    STATUS_CONFIRM_CONFIG[INGREDIENT_STATUS.INACTIVE]

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
        aria-labelledby="confirm-ingredient-status-title"
        aria-describedby="confirm-ingredient-status-desc"
      >
        <div className={styles.confirmContent}>
          <div className={config.circleClassName} aria-hidden="true">
            {config.renderHeaderIcon()}
          </div>
          <h2
            id="confirm-ingredient-status-title"
            className={styles.confirmTitle}
          >
            {config.title}
          </h2>
          <p
            id="confirm-ingredient-status-desc"
            className={styles.confirmBodyText}
          >
            {"Nguyên liệu "}
            <strong>{`"${displayName}"`}</strong>
            {" sẽ chuyển sang trạng thái "}
            <strong>{config.statusLabel}</strong>
            {config.detailText}
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
            className={config.confirmBtnClassName}
            onClick={onConfirm}
            disabled={submitting}
          >
            {config.renderActionIcon()}
            <span>
              {submitting ? config.submittingLabel : config.confirmLabel}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmHideDialog
