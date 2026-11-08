import React, { useState } from "react"
import { FlaskConical, X, ShieldCheck, Check, Clock } from "lucide-react"
import styles from "./RetainedSampleModal.module.scss"

export default function RetainedSampleModal({
  isOpen,
  onClose,
  onConfirm,
  batchData = {},
  loading = false,
}) {
  const [quantity, setQuantity] = useState("150")
  const [unit, setUnit] = useState("g")
  const [storageLocation, setStorageLocation] = useState("Tủ lưu mẫu Bếp 01 - Ngăn A")
  const [errorMsg, setErrorMsg] = useState("")

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const num = Number(quantity)
    if (isNaN(num) || num <= 0) {
      setErrorMsg("Lượng mẫu lưu phải là số dương hợp lệ.")
      return
    }
    if (num < 100) {
      setErrorMsg("Quy định lưu mẫu tối thiểu từ 100g hoặc 100ml trở lên.")
      return
    }
    if (!storageLocation.trim()) {
      setErrorMsg("Vui lòng ghi rõ vị trí tủ lưu mẫu thực phẩm.")
      return
    }

    setErrorMsg("")
    onConfirm({
      quantity: String(num),
      unit,
      storageLocation: storageLocation.trim(),
      sampledAt: new Date().toISOString(),
    })
  }

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleWrap}>
            <div className={styles.iconCircle}>
              <FlaskConical size={22} />
            </div>
            <div>
              <h3 className={styles.modalTitle}>Lưu mẫu thực phẩm 24h</h3>
              <p className={styles.modalSub}>Niêm phong lưu mẫu phục vụ kiểm thực an toàn thực phẩm</p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
            disabled={loading}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {/* Tóm tắt thông tin lô */}
            <div className={styles.batchBriefBox}>
              <div className={styles.briefRow}>
                <span className={styles.briefLabel}>Món ăn:</span>
                <span className={styles.briefValueBold}>{batchData.dishName || "—"}</span>
              </div>
              <div className={styles.briefRow}>
                <span className={styles.briefLabel}>Mã lô chế biến:</span>
                <span className={styles.briefValueMono}>{batchData.code || "—"}</span>
              </div>
            </div>

            {/* Form Fields */}
            <div className={styles.formGrid}>
              <div className={styles.formRow}>
                <div className={styles.formGroup} style={{ flex: 2 }}>
                  <label htmlFor="sample-quantity" className={styles.formLabel}>
                    Lượng mẫu lưu <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    id="sample-quantity"
                    type="number"
                    step="1"
                    min="100"
                    className={styles.inputField}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label htmlFor="sample-unit" className={styles.formLabel}>
                    Đơn vị <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <select
                    id="sample-unit"
                    className={styles.selectField}
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    disabled={loading}
                  >
                    <option value="g">g (gam)</option>
                    <option value="ml">ml (mililit)</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="sample-location" className={styles.formLabel}>
                  Vị trí tủ lưu mẫu <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  id="sample-location"
                  type="text"
                  maxLength={255}
                  className={styles.inputField}
                  placeholder="Ví dụ: Tủ lưu mẫu Bếp 01 - Ngăn A"
                  value={storageLocation}
                  onChange={(e) => setStorageLocation(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Thời điểm lấy mẫu tự động */}
            <div className={styles.autoTimeBox}>
              <Clock size={16} className={styles.autoTimeIcon} />
              <div className={styles.autoTimeContent}>
                <span className={styles.autoTimeLabel}>Thời điểm lấy mẫu:</span>
                <span className={styles.autoTimeValue}>
                  Tự động ghi nhận lúc ấn nút (Khoảng {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })})
                </span>
              </div>
            </div>

            {errorMsg && (
              <div style={{ color: "#dc2626", fontSize: "0.8125rem", fontWeight: 500 }}>
                {errorMsg}
              </div>
            )}

            {/* Hướng dẫn quy định ATTP */}
            <div className={styles.guidelineBox}>
              <ShieldCheck size={18} className={styles.guidelineIcon} />
              <p className={styles.guidelineText}>
                Mẫu thức ăn được niêm phong và bảo quản ở nhiệt độ 2°C – 8°C tối thiểu 24 giờ kể từ khi lấy mẫu theo đúng quy định kiểm thực 3 bước của Bộ Y tế.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={styles.btnConfirm}
              disabled={loading}
            >
              <Check size={16} />
              <span>{loading ? "Đang lưu mẫu…" : "Niêm phong lưu mẫu"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
