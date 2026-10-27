import React, { useState } from "react"
import PropTypes from "prop-types"
import { AlertTriangle, CheckCircle2, X } from "lucide-react"
import notice from "src/components/Notice"
import styles from "./AllergyNoticeModal.module.scss"

function AllergyNoticeModal({ isOpen, onClose, schoolName }) {
  const [formData, setFormData] = useState({
    studentName: "",
    className: "",
    allergyIngredient: "",
    severityLevel: "HIGH",
    parentPhone: "",
    note: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!formData.studentName || !formData.className || !formData.allergyIngredient) {
      notice({
        msg: "Vui lòng điền đủ Tên học sinh, Lớp và Nguyên liệu dị ứng!",
        isSuccess: false,
      })
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      notice({
        msg: `Đã gửi cảnh báo dị ứng cho học sinh ${formData.studentName} đến Phòng Y tế & Bếp ăn thành công!`,
        isSuccess: true,
      })
      onClose()
    }, 600)
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={styles.iconBox}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className={styles.title}>Báo Dị Ứng Thực Phẩm Học Sinh</h3>
              <span className={styles.subtitle}>{schoolName || "Bộ phận Y tế Bán trú"}</span>
            </div>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.alertNote}>
            <p>
              Thông tin sẽ được chuyển trực tiếp đến <strong>Bếp ăn bán trú</strong> và{" "}
              <strong>Phòng Y tế</strong> trước giờ phân chia suất ăn để chuẩn bị khẩu phần ăn thay thế.
            </p>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Họ và tên học sinh <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                placeholder="VD: Nguyễn Tuấn Anh"
                value={formData.studentName}
                onChange={e => handleChange("studentName", e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Lớp học <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                placeholder="VD: 2A1"
                value={formData.className}
                onChange={e => handleChange("className", e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Thực phẩm / Nguyên liệu gây dị ứng <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              placeholder="VD: Đậu phộng (lạc), Tôm, Cua, Sữa bò tươi..."
              value={formData.allergyIngredient}
              onChange={e => handleChange("allergyIngredient", e.target.value)}
              required
            />
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Số điện thoại phụ huynh</label>
              <input
                type="tel"
                className={styles.input}
                placeholder="VD: 0912 345 678"
                value={formData.parentPhone}
                onChange={e => handleChange("parentPhone", e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Mức độ phản ứng</label>
              <select
                className={styles.select}
                value={formData.severityLevel}
                onChange={e => handleChange("severityLevel", e.target.value)}
              >
                <option value="CRITICAL">Nghiêm trọng (Sốc / Khó thở)</option>
                <option value="HIGH">Cao (Nổi mề đay / Đau bụng)</option>
                <option value="MILD">Nhẹ (Ngứa nhẹ / Dị ứng da)</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Ghi chú đặc biệt cho Bếp ăn</label>
            <textarea
              className={styles.textarea}
              rows={2}
              placeholder="Lưu ý cụ thể về thức ăn thay thế mong muốn..."
              value={formData.note}
              onChange={e => handleChange("note", e.target.value)}
            />
          </div>

          {/* Footer Actions */}
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Hủy bỏ
            </button>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? "Đang gửi..." : "Gửi thông tin cho Y tế & Bếp"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

AllergyNoticeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  schoolName: PropTypes.string,
}

export default AllergyNoticeModal
