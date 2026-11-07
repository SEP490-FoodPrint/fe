import React, { useState } from "react"
import PropTypes from "prop-types"
import {
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Building,
  Calendar,
  Package,
} from "lucide-react"
import styles from "./DeliveryApprovalModal.module.scss"

export default function DeliveryApprovalModal({
  delivery,
  onClose,
  onSubmitApproval,
}) {
  // Lấy danh sách tóm tắt mặt hàng
  const itemsSummary = delivery.deliveryItems
    ?.map((item) => `${item.ingredientName} (${item.actualQuantity} ${item.unit})`)
    .join(", ")

  // State quyết định & lý do
  const [decision, setDecision] = useState("APPROVE")
  const [reason, setReason] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  // State popup xác nhận bước 2
  const [isConfirming, setIsConfirming] = useState(false)

  // Format date helper
  const formatDate = (isoString) => {
    if (!isoString) return "--"
    try {
      const d = new Date(isoString)
      return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
    } catch {
      return "--"
    }
  }

  const handlePreSubmit = (e) => {
    e.preventDefault()

    // Bắt buộc nhập lý do nếu từ chối
    if (decision === "REJECT" && !reason.trim()) {
      setErrorMsg("Vui lòng nhập rõ lý do từ chối tiếp nhận đợt giao này (ví dụ: có mùi lạ, dập nát, thiếu tem kiểm dịch...).")
      return
    }

    setErrorMsg("")
    setIsConfirming(true)
  }

  const handleFinalConfirm = () => {
    onSubmitApproval(decision, reason.trim())
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.titleCol}>
            <div className={styles.headerBadge}>
              <ShieldCheck size={14} />
              <span>Kiểm thực Giao nhận Bước 1</span>
            </div>
            <h2 className={styles.modalTitle}>Đánh giá & Phê duyệt Giao nhận Nguyên liệu</h2>
            <p className={styles.modalDesc}>
              Cán bộ Y tế kiểm tra cảm quan, an toàn vệ sinh và ra quyết định tiếp nhận hoặc từ chối đợt giao hàng.
            </p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng form"
          >
            <X size={18} />
          </button>
        </div>

        {/* Read-only Context Information */}
        <div className={styles.contextCard}>
          <div className={styles.contextItem}>
            <span className={styles.contextLabel}>Mã giao hàng:</span>
            <span className={styles.contextValueHighlight}>{delivery.deliveryNo}</span>
          </div>
          <div className={styles.contextItem}>
            <span className={styles.contextLabel}>Nhà cung cấp:</span>
            <span className={styles.contextValue}>{delivery.supplierName}</span>
          </div>
          <div className={styles.contextItem}>
            <span className={styles.contextLabel}>Ngày giao:</span>
            <span className={styles.contextValue}>
              {formatDate(delivery.expectedArrivalAt || delivery.arrivedAt)}
            </span>
          </div>
          <div className={`${styles.contextItem} ${styles.fullWidthItem}`}>
            <span className={styles.contextLabel}>Mặt hàng giao:</span>
            <span className={styles.contextValue}>{itemsSummary || "Chưa có danh sách mặt hàng"}</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handlePreSubmit} className={styles.form}>
          {errorMsg && (
            <div className={styles.errorAlert}>
              <AlertTriangle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Chọn Quyết định Kiểm thực: APPROVE vs REJECT */}
          <div className={styles.decisionGroup}>
            <label className={styles.decisionGroupLabel}>
              Quyết định kiểm thực của Cán bộ Y tế <span className={styles.required}>*</span>
            </label>

            <div className={styles.decisionCards}>
              {/* Card 1: Duyệt đạt chuẩn */}
              <button
                type="button"
                className={`${styles.decisionCard} ${styles.approveCard} ${
                  decision === "APPROVE" ? styles.selectedApprove : ""
                }`}
                onClick={() => {
                  setDecision("APPROVE")
                  setErrorMsg("")
                }}
              >
                <div className={styles.cardRadioCircle}>
                  <CheckCircle2 size={18} />
                </div>
                <div className={styles.cardTitle}>Duyệt tiếp nhận (Đạt chuẩn ATTP)</div>
              </button>

              {/* Card 2: Từ chối tiếp nhận */}
              <button
                type="button"
                className={`${styles.decisionCard} ${styles.rejectCard} ${
                  decision === "REJECT" ? styles.selectedReject : ""
                }`}
                onClick={() => {
                  setDecision("REJECT")
                }}
              >
                <div className={styles.cardRadioCircle}>
                  <XCircle size={18} />
                </div>
                <div className={styles.cardTitle}>Từ chối tiếp nhận (Không đạt chuẩn)</div>
              </button>
            </div>
          </div>

          {/* 2. Nhập Lý do / Nhận xét */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="reasonInput">
              {decision === "REJECT" ? (
                <>
                  Lý do từ chối tiếp nhận <span className={styles.required}>* (Bắt buộc)</span>
                </>
              ) : (
                <>
                  Nhận xét kiểm thực cảm quan <span className={styles.optional}>(tùy chọn)</span>
                </>
              )}
            </label>
            <textarea
              id="reasonInput"
              className={`${styles.textarea} ${decision === "REJECT" ? styles.rejectTextarea : ""}`}
              rows={4}
              placeholder={
                decision === "REJECT"
                  ? "Ghi rõ lý do không đạt (ví dụ: Thịt tươi có mùi chua, rau muống dập nát >20%, xe vận chuyển không bật lạnh, thiếu chứng nhận kiểm dịch...)"
                  : "Ghi chú thêm về nhiệt độ thùng xe (VD: 4°C), ngoại quan tươi ngon, bao bì sạch sẽ..."
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {/* Footer Actions */}
          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`${styles.submitBtn} ${
                decision === "REJECT" ? styles.submitRejectBtn : styles.submitApproveBtn
              }`}
            >
              {decision === "REJECT" ? (
                <>
                  <XCircle size={16} />
                  <span>Xác nhận Từ chối</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Xác nhận Phê duyệt</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Confirmation Step Overlay */}
        {isConfirming && (
          <div className={styles.confirmOverlay}>
            <div className={styles.confirmBox}>
              <div
                className={`${styles.confirmIconWrap} ${
                  decision === "REJECT" ? styles.confirmIconReject : styles.confirmIconApprove
                }`}
              >
                {decision === "REJECT" ? (
                  <AlertTriangle size={24} />
                ) : (
                  <CheckCircle2 size={24} />
                )}
              </div>

              <h3 className={styles.confirmTitle}>
                {decision === "REJECT"
                  ? "Xác nhận TỪ CHỐI đợt giao hàng?"
                  : "Xác nhận PHÊ DUYỆT đợt giao hàng?"}
              </h3>

              <p className={styles.confirmDesc}>
                {decision === "REJECT" ? (
                  <>
                    Đợt giao hàng <strong>{delivery.deliveryNo}</strong> sẽ bị chuyển sang trạng thái{" "}
                    <strong className={styles.dangerText}>Bị từ chối (REJECTED)</strong>. Nhà cung cấp và các bên liên quan sẽ nhận được thông báo biên bản này.
                  </>
                ) : (
                  <>
                    Ghi nhận kết quả đánh giá <strong className={styles.successText}>ĐẠT CHUẨN</strong> từ Cán bộ Y tế cho chuyến giao{" "}
                    <strong>{delivery.deliveryNo}</strong>. Biên bản sẽ được lưu vào lịch sử kiểm thực giao nhận.
                  </>
                )}
              </p>

              <div className={styles.confirmWarningNote}>
                Lưu ý: Quyết định kiểm thực sau khi xác nhận sẽ được lưu chính thức và không thể sửa đổi.
              </div>

              <div className={styles.confirmActions}>
                <button
                  type="button"
                  className={styles.confirmCancelBtn}
                  onClick={() => setIsConfirming(false)}
                >
                  Kiểm tra lại
                </button>
                <button
                  type="button"
                  className={`${styles.confirmSubmitBtn} ${
                    decision === "REJECT" ? styles.confirmRejectBtn : styles.confirmApproveBtn
                  }`}
                  onClick={handleFinalConfirm}
                >
                  {decision === "REJECT" ? "Đồng ý Từ chối" : "Đồng ý Phê duyệt"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

DeliveryApprovalModal.propTypes = {
  delivery: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmitApproval: PropTypes.func.isRequired,
}
