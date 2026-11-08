import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { X, Edit3, AlertCircle, Check } from "lucide-react"
import styles from "./UpdateSampleModal.module.scss"

export default function UpdateSampleModal({
  open = false,
  sample = null,
  onClose,
  onSubmit,
  submitting = false,
}) {
  const [sampledAt, setSampledAt] = useState("")
  const [quantity, setQuantity] = useState("150")
  const [unit, setUnit] = useState("g")
  const [storageLocation, setStorageLocation] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    if (sample && open) {
      if (sample.sampledAt) {
        const d = new Date(sample.sampledAt)
        if (!isNaN(d.getTime())) {
          const pad = (n) => String(n).padStart(2, "0")
          setSampledAt(
            `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
          )
        }
      }
      setQuantity(sample.quantity || "150")
      setUnit(sample.unit || "g")
      setStorageLocation(sample.storageLocation || "")
      setErrorMsg("")
    }
  }, [sample, open])

  if (!open || !sample) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const qtyNum = Number(quantity)
    if (quantity && (isNaN(qtyNum) || qtyNum <= 0)) {
      setErrorMsg("Khối lượng mẫu phải là số dương hợp lệ.")
      return
    }

    setErrorMsg("")
    onSubmit({
      ...sample,
      sampledAt: new Date(sampledAt).toISOString(),
      quantity: quantity ? String(qtyNum) : sample.quantity,
      unit: unit || "g",
      storageLocation: storageLocation.trim() || sample.storageLocation,
    })
  }

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleWrap}>
            <div className={styles.iconCircle}>
              <Edit3 size={18} />
            </div>
            <div>
              <h3 className={styles.title}>Cập nhật thông tin mẫu lưu</h3>
              <p className={styles.subTitle}>
                SMP-{sample.id?.slice(0, 8).toUpperCase() || sample.id} • {sample.dishName}
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
            disabled={submitting}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {errorMsg && (
            <div className={styles.alertError}>
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Readonly Batch Info */}
          <div className={styles.readonlyBatchBox}>
            <div className={styles.batchInfoItem}>
              <span className={styles.batchLabel}>Mã mẻ nấu:</span>
              <span className={styles.batchValueMono}>{sample.batchCode || sample.cookingBatchId}</span>
            </div>
            <div className={styles.batchInfoItem}>
              <span className={styles.batchLabel}>Món ăn:</span>
              <span className={styles.batchValueBold}>{sample.dishName}</span>
            </div>
          </div>

          {/* Form Fields */}
          <div className={styles.formGrid}>
            <div className={styles.formGroupFull}>
              <label className={styles.label} htmlFor="edit-sample-time">
                Thời điểm lấy mẫu <span className={styles.required}>*</span>
              </label>
              <input
                id="edit-sample-time"
                type="datetime-local"
                className={styles.textInput}
                value={sampledAt}
                onChange={(e) => setSampledAt(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="edit-sample-qty">
                Khối lượng mẫu
              </label>
              <div className={styles.inputWithUnit}>
                <input
                  id="edit-sample-qty"
                  type="number"
                  min="50"
                  step="10"
                  className={styles.textInput}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  disabled={submitting}
                />
                <select
                  className={styles.unitSelect}
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  disabled={submitting}
                >
                  <option value="g">gam (g)</option>
                  <option value="ml">mililit (ml)</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="edit-sample-loc">
                Vị trí tủ lưu mẫu
              </label>
              <input
                id="edit-sample-loc"
                type="text"
                className={styles.textInput}
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          {/* Actions */}
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting}
            >
              <Check size={16} />
              <span>{submitting ? "Đang lưu..." : "Lưu thay đổi"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

UpdateSampleModal.propTypes = {
  open: PropTypes.bool.isRequired,
  sample: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
}
