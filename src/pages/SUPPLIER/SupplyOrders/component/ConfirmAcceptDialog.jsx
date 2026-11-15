import React, { useEffect } from "react"
import PropTypes from "prop-types"
import { Button } from "@mui/material"
import { formatDateVi } from "src/services/SupplierOrderService"
import styles from "./ConfirmAcceptDialog.module.scss"

function ConfirmAcceptDialog({
  open,
  order,
  submitting = false,
  error = "",
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    if (!open) return undefined
    const handleKeyDown = event => {
      if (event.key === "Escape" && !submitting) {
        onCancel?.()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, submitting, onCancel])

  if (!open || !order) return null

  const itemCount = Array.isArray(order.items) ? order.items.length : 0

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget && !submitting) {
          onCancel?.()
        }
      }}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="accept-order-dialog-title"
      >
        <div className={styles.header}>
          <h2 id="accept-order-dialog-title" className={styles.title}>
            Xác nhận tiếp nhận đơn hàng
          </h2>
        </div>

        <div className={styles.body}>
          <p className={styles.description}>
            Sau khi tiếp nhận, trạng thái đơn hàng sẽ chuyển sang{" "}
            <strong>Đã tiếp nhận</strong> và thông báo lại cho nhà trường để chuẩn bị
            lịch giao nhận nguyên liệu.
          </p>

          <dl className={styles.summaryList}>
            <div className={styles.summaryRow}>
              <dt>Mã đơn hàng</dt>
              <dd>{order.requestNo || "—"}</dd>
            </div>
            <div className={styles.summaryRow}>
              <dt>Trường đặt hàng</dt>
              <dd>{order.schoolName}</dd>
            </div>
            <div className={styles.summaryRow}>
              <dt>Ngày giao dự kiến</dt>
              <dd>{formatDateVi(order.requestedDeliveryDate)}</dd>
            </div>
            <div className={styles.summaryRow}>
              <dt>Số lượng mặt hàng</dt>
              <dd>{`${itemCount} mặt hàng`}</dd>
            </div>
          </dl>

          {error && (
            <p className={styles.errorBanner} role="alert">
              {error}
            </p>
          )}
        </div>

        <div className={styles.footer}>
          <Button
            type="button"
            variant="outlined"
            color="primary"
            className={styles.actionBtn}
            disabled={submitting}
            onClick={onCancel}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="contained"
            color="primary"
            className={styles.actionBtn}
            disabled={submitting}
            onClick={onConfirm}
          >
            {submitting ? "Đang xác nhận..." : "Xác nhận tiếp nhận"}
          </Button>
        </div>
      </div>
    </div>
  )
}

ConfirmAcceptDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  order: PropTypes.object,
  submitting: PropTypes.bool,
  error: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
}

export default ConfirmAcceptDialog
