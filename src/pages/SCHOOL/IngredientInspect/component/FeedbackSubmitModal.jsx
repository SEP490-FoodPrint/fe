import React, { useState } from "react"
import PropTypes from "prop-types"
import {
  X,
  Send,
  AlertTriangle,
  Info,
  CheckCircle2,
  FileText,
  Building,
  Calendar,
} from "lucide-react"
import styles from "./FeedbackSubmitModal.module.scss"

export default function FeedbackSubmitModal({
  delivery,
  initialLotId = "",
  onClose,
  onSubmitFeedback,
}) {
  // Tập hợp danh sách các lô có trong delivery này
  const availableLots = []
  delivery.deliveryItems?.forEach((item) => {
    item.ingredientLots?.forEach((lot) => {
      availableLots.push({
        lotId: lot.id,
        lotCode: lot.lotCode,
        ingredientName: item.ingredientName,
        label: `${item.ingredientName} — Lô: ${lot.lotCode}`,
      })
    })
  })

  // State form
  const [selectedLotId, setSelectedLotId] = useState(initialLotId || "")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  // State xác nhận
  const [isConfirming, setIsConfirming] = useState(false)

  // Format date
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
    if (!title.trim()) {
      setErrorMsg("Vui lòng nhập tiêu đề phản hồi.")
      return
    }
    if (!description.trim()) {
      setErrorMsg("Vui lòng nhập nội dung chi tiết phản hồi.")
      return
    }
    setErrorMsg("")
    setIsConfirming(true)
  }

  const handleFinalConfirm = () => {
    const chosenLot = availableLots.find((l) => l.lotId === selectedLotId)

    const newFeedback = {
      id: `fb-${Date.now()}`,
      deliveryId: delivery.id,
      deliveryNo: delivery.deliveryNo,
      supplierId: delivery.supplierId,
      supplierName: delivery.supplierName,
      ingredientLotId: chosenLot ? chosenLot.lotId : null,
      lotCode: chosenLot ? chosenLot.lotCode : null,
      ingredientName: chosenLot ? chosenLot.ingredientName : "Toàn bộ chuyến giao",
      submittedByUserId: "c28e8442-4623-5d32-a96e-1e2f80e96a73",
      submittedByName: "BS. Nguyễn Thu Trang",
      submittedByRole: "Chuyên viên Y tế học đường",
      title: title.trim(),
      description: description.trim(),
      status: "SUBMITTED",
      supplierResponse: null,
      respondedByUserId: null,
      respondedByName: null,
      respondedAt: null,
      createdAt: new Date().toISOString(),
    }

    onSubmitFeedback(newFeedback)
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.titleCol}>
            <h2 className={styles.modalTitle}>Gửi phản hồi chất lượng nguyên liệu</h2>
            <p className={styles.modalDesc}>
              Gửi thông tin về vấn đề chất lượng nguyên liệu đến nhà cung cấp để được kiểm tra và phản hồi.
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
        </div>

        {/* Form Body */}
        <form onSubmit={handlePreSubmit} className={styles.form}>
          {errorMsg && (
            <div className={styles.errorAlert}>
              <AlertTriangle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Chọn Lô nguyên liệu */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="lotSelect">
              Nguyên liệu / Lô liên quan <span className={styles.optional}>(tùy chọn)</span>
            </label>
            <select
              id="lotSelect"
              className={styles.select}
              value={selectedLotId}
              onChange={(e) => setSelectedLotId(e.target.value)}
            >
              <option value="">Toàn bộ chuyến giao — Không chọn lô cụ thể</option>
              {availableLots.map((item) => (
                <option key={item.lotId} value={item.lotId}>
                  {item.label}
                </option>
              ))}
            </select>
            <span className={styles.fieldHelp}>
              Nếu vấn đề chỉ phát sinh trên một lô hàng cụ thể, vui lòng chọn mã lô để nhà cung cấp dễ đối chiếu.
            </span>
          </div>

          {/* 2. Tiêu đề phản hồi */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="titleInput">
              Tiêu đề phản hồi <span className={styles.required}>*</span>
            </label>
            <input
              id="titleInput"
              type="text"
              className={styles.input}
              placeholder="Ví dụ: Nhãn lô cà rốt khó đọc, Bao bì gạo cần kiểm tra mép dán..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
            />
          </div>

          {/* 3. Nội dung phản hồi */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="descInput">
              Nội dung chi tiết <span className={styles.required}>*</span>
            </label>
            <textarea
              id="descInput"
              className={styles.textarea}
              rows={4}
              placeholder="Mô tả cụ thể hiện trạng tem nhãn, bao bì hoặc tình trạng nguyên liệu để nhà cung cấp kiểm tra đối soát..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              className={styles.submitBtn}
            >
              <Send size={15} />
              <span>Gửi phản hồi</span>
            </button>
          </div>
        </form>

        {/* Confirmation Overlay (Popup xác nhận khi bấm Gửi) */}
        {isConfirming && (
          <div className={styles.confirmOverlay}>
            <div className={styles.confirmBox}>
              <div className={styles.confirmIconWrap}>
                <AlertTriangle size={24} className={styles.confirmIcon} />
              </div>

              <h3 className={styles.confirmTitle}>Xác nhận gửi phản hồi chất lượng</h3>
              <p className={styles.confirmDesc}>
                Phản hồi sẽ được gửi trực tiếp đến <strong>{delivery.supplierName}</strong> và chuyển sang trạng thái <strong>Đang chờ phản hồi (SUBMITTED)</strong>. Bạn sẽ không thể chỉnh sửa hoặc xóa nội dung sau khi gửi.
              </p>

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
                  className={styles.confirmSubmitBtn}
                  onClick={handleFinalConfirm}
                >
                  Xác nhận gửi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

FeedbackSubmitModal.propTypes = {
  delivery: PropTypes.object.isRequired,
  initialLotId: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSubmitFeedback: PropTypes.func.isRequired,
}

