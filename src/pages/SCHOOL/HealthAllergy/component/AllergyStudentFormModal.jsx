import React, { useState, useEffect } from "react"
import CloseIcon from "@mui/icons-material/Close"
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined"
import { SCHOOL_CLASSES_MASTER, ALLERGEN_OPTIONS } from "../mockAllergyData"
import notice from "src/components/Notice"
import styles from "./AllergyStudentFormModal.module.scss"

const EMPTY_STUDENT_FORM = {
  studentName: "",
  gender: "Nam",
  className: "Lớp 1A",
  grade: "1",
  homeroomTeacher: "Cô Nguyễn Thị Mai",
  teacherPhone: "0912.456.789",
  allergenName: "Tôm sú, Cua biển",
  allergenCategory: "Thủy hải sản",
  symptoms: "",
  severity: "HIGH",
  dietaryNote: "Suất ăn riêng: Đổi sang thịt heo nạc rim, không dùng chung chảo rán.",
  parentPhone: "",
  teacherNotes: "",
  hasEmergencyMedicine: false,
  emergencyMedicineNote: "",
}

export default function AllergyStudentFormModal({
  isOpen,
  onClose,
  initialData,
  onSave,
}) {
  const isEdit = Boolean(initialData)
  const [formData, setFormData] = useState(EMPTY_STUDENT_FORM)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData })
    } else {
      setFormData({
        ...EMPTY_STUDENT_FORM,
        symptoms: "Nổi mẩn ngứa quanh miệng và cổ sau ăn.",
      })
    }
    setErrors({})
  }, [initialData, isOpen])

  if (!isOpen) return null

  // Khi chọn lớp khác -> Tự động cập nhật Khối và GVCN
  const handleClassChange = (selectedClassName) => {
    const foundClass = SCHOOL_CLASSES_MASTER.find((c) => c.name === selectedClassName)
    if (foundClass) {
      setFormData((prev) => ({
        ...prev,
        className: foundClass.name,
        grade: foundClass.grade,
        homeroomTeacher: foundClass.teacherName,
        teacherPhone: foundClass.teacherPhone,
      }))
    }
  }

  const validate = () => {
    const errs = {}
    if (!formData.studentName.trim()) errs.studentName = "Vui lòng nhập họ tên học sinh"
    if (!formData.allergenName.trim()) errs.allergenName = "Vui lòng nhập món/nguyên liệu dị ứng"
    if (!formData.symptoms.trim()) errs.symptoms = "Vui lòng nhập biểu hiện triệu chứng"

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) {
      notice({ msg: "Vui lòng hoàn thiện các trường thông tin bắt buộc", isSuccess: false })
      return
    }

    const payload = {
      ...formData,
      id: initialData?.id || `stu-${Date.now()}`,
      reportedDate: initialData?.reportedDate || new Date().toISOString().split("T")[0],
    }

    onSave(payload)
    notice({
      msg: isEdit
        ? `Đã cập nhật thông tin dị ứng cho em ${payload.studentName} thành công`
        : `Đã thêm hồ sơ dị ứng cho em ${payload.studentName} (${payload.className}) thành công`,
      isSuccess: true,
    })
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.titleWrap}>
            <h2 className={styles.modalTitle}>
              {isEdit ? `Cập nhật thông tin dị ứng: ${formData.studentName}` : "Thêm thông tin Dị ứng Học sinh mới"}
            </h2>
            <p className={styles.modalDesc}>
              Thông tin do Giáo viên chủ nhiệm thu thập từ gia đình học sinh, chuyển đến bộ phận Y tế & Bếp ăn.
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Đóng biểu mẫu">
            <CloseIcon />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.scrollArea}>
            {/* Khối 1: Thông tin học sinh & Lớp học */}
            <div className={styles.sectionBlock}>
              <h3 className={styles.secTitle}>1. Thông tin Học sinh & Giáo viên chủ nhiệm</h3>

              <div className={styles.gridRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    Họ và tên học sinh <span className={styles.req}>*</span>
                  </label>
                  <input
                    type="text"
                    className={`${styles.input} ${errors.studentName ? styles.inputError : ""}`}
                    placeholder="VD: Nguyễn Minh An"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  />
                  {errors.studentName && <span className={styles.errorText}>{errors.studentName}</span>}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Giới tính</label>
                  <select
                    className={styles.select}
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Thuộc Lớp</label>
                  <select
                    className={styles.select}
                    value={formData.className}
                    onChange={(e) => handleClassChange(e.target.value)}
                  >
                    {SCHOOL_CLASSES_MASTER.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.teacherName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.gridRowTwo}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Giáo viên chủ nhiệm phụ trách (Tự động)</label>
                  <input
                    type="text"
                    className={`${styles.input} ${styles.readOnlyInput}`}
                    readOnly
                    value={`${formData.homeroomTeacher} (${formData.teacherPhone})`}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Số điện thoại phụ huynh</label>
                  <input
                    type="tel"
                    className={styles.input}
                    placeholder="VD: 0903.111.222 (Mẹ em An)"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Khối 2: Chi tiết dị ứng */}
            <div className={styles.sectionBlock}>
              <h3 className={styles.secTitle}>2. Món dị ứng, Biểu hiện & Mức độ</h3>

              <div className={styles.gridRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    Món / Nguyên liệu gây dị ứng <span className={styles.req}>*</span>
                  </label>
                  <input
                    type="text"
                    className={`${styles.input} ${errors.allergenName ? styles.inputError : ""}`}
                    placeholder="VD: Tôm sú, Cua đồng, Đậu phộng..."
                    value={formData.allergenName}
                    onChange={(e) => setFormData({ ...formData, allergenName: e.target.value })}
                  />
                  {errors.allergenName && <span className={styles.errorText}>{errors.allergenName}</span>}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Nhóm Dị nguyên</label>
                  <select
                    className={styles.select}
                    value={formData.allergenCategory}
                    onChange={(e) => setFormData({ ...formData, allergenCategory: e.target.value })}
                  >
                    <option value="Thủy hải sản">Thủy hải sản</option>
                    <option value="Hạt & Khô">Hạt & Đậu phộng / Lạc</option>
                    <option value="Trứng gia cầm">Trứng gia cầm</option>
                    <option value="Sữa & Chế phẩm">Sữa & Chế phẩm sữa</option>
                    <option value="Tinh bột">Tinh bột / Gluten</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Mức độ cảnh báo</label>
                  <select
                    className={styles.select}
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  >
                    <option value="HIGH">🔴 Nặng (Nguy cơ sưng môi, khó thở)</option>
                    <option value="MEDIUM">🟡 Trung bình (Mề đay, đau bụng)</option>
                    <option value="LOW">🔵 Nhẹ (Mẩn ngứa thoáng qua)</option>
                  </select>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  Biểu hiện triệu chứng khi ăn phải <span className={styles.req}>*</span>
                </label>
                <textarea
                  rows={2}
                  className={`${styles.textarea} ${errors.symptoms ? styles.inputError : ""}`}
                  placeholder="Mô tả cụ thể triệu chứng phụ huynh/cô giáo đã báo (VD: Nổi mề đay đỏ quanh miệng, ngứa nhiều sau khi ăn 15 phút...)"
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                />
                {errors.symptoms && <span className={styles.errorText}>{errors.symptoms}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Lưu ý chuẩn bị suất ăn riêng gửi Bếp</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="VD: Suất ăn riêng: Đổi sang thịt heo rim hoặc thịt gà, không chiên chung chảo tôm."
                  value={formData.dietaryNote}
                  onChange={(e) => setFormData({ ...formData, dietaryNote: e.target.value })}
                />
              </div>

              {/* Thuốc gửi phòng y tế */}
              <div className={styles.medicineCheckRow}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.hasEmergencyMedicine}
                    onChange={(e) =>
                      setFormData({ ...formData, hasEmergencyMedicine: e.target.checked })
                    }
                  />
                  <span>Học sinh có thuốc chống dị ứng gửi tại Phòng Y tế trường</span>
                </label>

                {formData.hasEmergencyMedicine && (
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Tên thuốc & vị trí lưu tại tủ y tế (VD: Siro Desloratadine 5ml, Bút tiêm dị ứng...)"
                    value={formData.emergencyMedicineNote}
                    onChange={(e) =>
                      setFormData({ ...formData, emergencyMedicineNote: e.target.value })
                    }
                  />
                )}
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Ghi chú thêm từ Giáo viên chủ nhiệm</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="VD: Phụ huynh đã nộp giấy khám của bệnh viện đầu năm học."
                  value={formData.teacherNotes}
                  onChange={(e) => setFormData({ ...formData, teacherNotes: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Hủy bỏ
            </button>
            <button type="submit" className={styles.saveBtn}>
              <SaveOutlinedIcon className={styles.saveIcon} />
              <span>{isEdit ? "Lưu thay đổi" : "Lưu học sinh này"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

