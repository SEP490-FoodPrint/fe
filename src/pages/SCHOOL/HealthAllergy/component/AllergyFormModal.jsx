import React, { useState, useEffect } from "react"
import CloseIcon from "@mui/icons-material/Close"
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined"
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined"
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined"
import { ALLERGEN_CATEGORIES, SCHOOL_GRADES } from "../mockAllergyData"
import notice from "src/components/Notice"
import styles from "./AllergyFormModal.module.scss"

const EMPTY_ALLERGY_ROW = {
  id: "",
  allergenId: "SEAFOOD_SHELL",
  allergenName: "Giáp xác & Hải sản có vỏ",
  ingredientsStr: "Tôm sú, Cua đồng",
  affectedCount: 1,
  severity: "HIGH",
  symptoms: "",
  emergencyPlan: "",
  kitchenNote: "Không dùng chung chảo rán, dụng cụ múc hoặc dầu ăn đã chiên nguyên liệu này.",
  recommendedAlternative: "",
}

export default function AllergyFormModal({
  isOpen,
  onClose,
  initialData,
  onSave,
}) {
  const isEdit = Boolean(initialData)

  const [formData, setFormData] = useState({
    className: "Lớp 1C",
    grade: "1",
    totalStudents: 38,
    boardingStudents: 38,
    homeroomTeacher: "",
    teacherPhone: "",
    status: "VERIFIED",
    allergies: [{ ...EMPTY_ALLERGY_ROW, id: "temp-1" }],
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        allergies: initialData.allergies.map((a, idx) => ({
          ...a,
          id: a.id || `temp-${idx}`,
          ingredientsStr: Array.isArray(a.ingredients) ? a.ingredients.join(", ") : a.ingredients || "",
        })),
      })
    } else {
      setFormData({
        className: "Lớp 1C",
        grade: "1",
        totalStudents: 38,
        boardingStudents: 38,
        homeroomTeacher: "Cô Trần Bích Loan",
        teacherPhone: "0912.888.999",
        status: "VERIFIED",
        allergies: [
          {
            ...EMPTY_ALLERGY_ROW,
            id: `temp-${Date.now()}`,
            symptoms: "Nổi mẩn ngứa, đỏ da vùng cổ sau ăn.",
            emergencyPlan: "Rửa sạch tay miệng, uống siro chống dị ứng tại phòng Y tế.",
            recommendedAlternative: "Thịt heo nạc rim ngũ vị",
          },
        ],
      })
    }
    setErrors({})
  }, [initialData, isOpen])

  if (!isOpen) return null

  const handleAddAllergyRow = () => {
    setFormData((prev) => ({
      ...prev,
      allergies: [
        ...prev.allergies,
        {
          ...EMPTY_ALLERGY_ROW,
          id: `temp-${Date.now()}`,
        },
      ],
    }))
  }

  const handleRemoveAllergyRow = (index) => {
    if (formData.allergies.length <= 1) {
      notice({ msg: "Mỗi lớp phải có tối thiểu 1 bản ghi dị ứng", isSuccess: false })
      return
    }
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index),
    }))
  }

  const handleAllergyFieldChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.allergies]
      updated[index] = { ...updated[index], [field]: value }

      if (field === "allergenId") {
        const found = ALLERGEN_CATEGORIES.find((c) => c.id === value)
        if (found) {
          updated[index].allergenName = found.name
          updated[index].severity = found.severityDefault
          if (!updated[index].ingredientsStr) {
            updated[index].ingredientsStr = found.commonIngredients.join(", ")
          }
        }
      }

      return { ...prev, allergies: updated }
    })
  }

  const validate = () => {
    const errs = {}
    if (!formData.className.trim()) errs.className = "Vui lòng nhập tên lớp"
    if (!formData.homeroomTeacher.trim()) errs.homeroomTeacher = "Vui lòng nhập tên GVCN"
    if (!formData.teacherPhone.trim()) errs.teacherPhone = "Vui lòng nhập số điện thoại GVCN"

    formData.allergies.forEach((a, i) => {
      if (!a.ingredientsStr.trim()) {
        errs[`allergy_${i}_ing`] = "Vui lòng liệt kê nguyên liệu cần tránh"
      }
      if (!a.affectedCount || Number(a.affectedCount) < 1) {
        errs[`allergy_${i}_count`] = "Số lượng phải >= 1"
      }
    })

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
      id: initialData?.id || `ca-${Date.now()}`,
      totalStudents: Number(formData.totalStudents) || 35,
      boardingStudents: Number(formData.boardingStudents) || 35,
      lastUpdated: new Date().toISOString().split("T")[0],
      updatedBy: isEdit
        ? `${formData.homeroomTeacher} & Ths.Bs Trần Thu Trang (Y tế cập nhật)`
        : `Ths.Bs Trần Thu Trang (Cán bộ Y tế)`,
      allergies: formData.allergies.map((a) => ({
        ...a,
        affectedCount: Number(a.affectedCount) || 1,
        ingredients: a.ingredientsStr
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      })),
      totalAllergyStudents: formData.allergies.reduce(
        (sum, a) => sum + (Number(a.affectedCount) || 1),
        0
      ),
    }

    onSave(payload)
    notice({
      msg: isEdit
        ? `Đã cập nhật hồ sơ dị ứng cho ${payload.className} thành công`
        : `Đã thêm mới hồ sơ dị ứng cho ${payload.className} thành công`,
      isSuccess: true,
    })
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.titleWrap}>
            <h2 className={styles.modalTitle}>
              {isEdit ? `Chỉnh sửa Hồ sơ Dị ứng: ${formData.className}` : "Ghi nhận Dị ứng Học đường mới cho Lớp"}
            </h2>
            <p className={styles.modalDesc}>
              Thông tin sẽ được đồng bộ trực tiếp vào hệ thống đối soát thực đơn tuần và phiếu giao cho Bếp ăn.
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Đóng biểu mẫu">
            <CloseIcon />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.scrollArea}>
            {/* Khối 1: Thông tin Lớp & GVCN */}
            <div className={styles.formSection}>
              <h3 className={styles.sectionHeading}>1. Thông tin Lớp học & Giáo viên chủ nhiệm</h3>

              <div className={styles.gridRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    Tên Lớp <span className={styles.req}>*</span>
                  </label>
                  <input
                    type="text"
                    className={`${styles.input} ${errors.className ? styles.inputError : ""}`}
                    placeholder="VD: Lớp 1C"
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  />
                  {errors.className && <span className={styles.errorText}>{errors.className}</span>}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Thuộc Khối</label>
                  <select
                    className={styles.select}
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  >
                    {SCHOOL_GRADES.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Tổng suất Bán trú</label>
                  <input
                    type="number"
                    min="1"
                    className={styles.input}
                    value={formData.boardingStudents}
                    onChange={(e) => setFormData({ ...formData, boardingStudents: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.gridRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    Giáo viên chủ nhiệm phụ trách <span className={styles.req}>*</span>
                  </label>
                  <input
                    type="text"
                    className={`${styles.input} ${errors.homeroomTeacher ? styles.inputError : ""}`}
                    placeholder="VD: Cô Trần Bích Loan"
                    value={formData.homeroomTeacher}
                    onChange={(e) => setFormData({ ...formData, homeroomTeacher: e.target.value })}
                  />
                  {errors.homeroomTeacher && (
                    <span className={styles.errorText}>{errors.homeroomTeacher}</span>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    Số điện thoại GVCN <span className={styles.req}>*</span>
                  </label>
                  <input
                    type="tel"
                    className={`${styles.input} ${errors.teacherPhone ? styles.inputError : ""}`}
                    placeholder="VD: 0912.888.999"
                    value={formData.teacherPhone}
                    onChange={(e) => setFormData({ ...formData, teacherPhone: e.target.value })}
                  />
                  {errors.teacherPhone && (
                    <span className={styles.errorText}>{errors.teacherPhone}</span>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Trạng thái Thẩm định</label>
                  <select
                    className={styles.select}
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="VERIFIED">✓ Đã thẩm định Y tế</option>
                    <option value="PENDING_VERIFY">Chờ thẩm định / Hồ sơ bổ sung</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Khối 2: Danh sách các dị nguyên của lớp */}
            <div className={styles.formSection}>
              <div className={styles.sectionHeaderBetween}>
                <h3 className={styles.sectionHeading}>
                  2. Danh mục Dị nguyên & Suất ăn riêng ({formData.allergies.length} dị nguyên)
                </h3>
                <button
                  type="button"
                  className={styles.addRowBtn}
                  onClick={handleAddAllergyRow}
                >
                  <AddCircleOutlineOutlinedIcon className={styles.addIcon} />
                  <span>+ Thêm dị nguyên khác</span>
                </button>
              </div>

              <div className={styles.allergyRowList}>
                {formData.allergies.map((allergy, idx) => (
                  <div key={allergy.id} className={styles.allergyFormBox}>
                    <div className={styles.boxTop}>
                      <span className={styles.itemSeq}>Dị nguyên #{idx + 1}</span>
                      {formData.allergies.length > 1 && (
                        <button
                          type="button"
                          className={styles.deleteRowBtn}
                          onClick={() => handleRemoveAllergyRow(idx)}
                          title="Xóa mục dị nguyên này"
                        >
                          <DeleteOutlineOutlinedIcon className={styles.delIcon} />
                          <span>Xóa</span>
                        </button>
                      )}
                    </div>

                    <div className={styles.gridRow}>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Nhóm Dị nguyên chính</label>
                        <select
                          className={styles.select}
                          value={allergy.allergenId}
                          onChange={(e) =>
                            handleAllergyFieldChange(idx, "allergenId", e.target.value)
                          }
                        >
                          {ALLERGEN_CATEGORIES.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className={styles.inputGroup}>
                        <label className={styles.label}>
                          Số học sinh bị dị ứng <span className={styles.req}>*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="40"
                          className={styles.input}
                          value={allergy.affectedCount}
                          onChange={(e) =>
                            handleAllergyFieldChange(idx, "affectedCount", e.target.value)
                          }
                        />
                      </div>

                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Mức độ rủi ro</label>
                        <select
                          className={styles.select}
                          value={allergy.severity}
                          onChange={(e) =>
                            handleAllergyFieldChange(idx, "severity", e.target.value)
                          }
                        >
                          <option value="HIGH">🔴 Nguy cơ cao / Sốc phản vệ</option>
                          <option value="MEDIUM">🟡 Mức độ Trung bình</option>
                          <option value="LOW">🔵 Mức độ Nhẹ / Đầy hơi</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>
                        Nguyên liệu cụ thể cần tránh (phân tách bởi dấu phẩy){" "}
                        <span className={styles.req}>*</span>
                      </label>
                      <input
                        type="text"
                        className={`${styles.input} ${
                          errors[`allergy_${idx}_ing`] ? styles.inputError : ""
                        }`}
                        placeholder="VD: Tôm sú, Cua đồng, Ghẹ biển, Tép"
                        value={allergy.ingredientsStr}
                        onChange={(e) =>
                          handleAllergyFieldChange(idx, "ingredientsStr", e.target.value)
                        }
                      />
                    </div>

                    <div className={styles.gridRowTwo}>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Triệu chứng lâm sàng ghi nhận</label>
                        <textarea
                          rows={2}
                          className={styles.textarea}
                          placeholder="Mô tả triệu chứng khi tiếp xúc dị nguyên (VD: Mề đay cấp, ngứa họng, sưng môi...)"
                          value={allergy.symptoms}
                          onChange={(e) =>
                            handleAllergyFieldChange(idx, "symptoms", e.target.value)
                          }
                        />
                      </div>

                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Phác đồ sơ cứu Y tế tại trường</label>
                        <textarea
                          rows={2}
                          className={styles.textarea}
                          placeholder="Quy trình xử trí nhanh & vị trí thuốc lưu dự phòng..."
                          value={allergy.emergencyPlan}
                          onChange={(e) =>
                            handleAllergyFieldChange(idx, "emergencyPlan", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className={styles.gridRowTwo}>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Yêu cầu bắt buộc đối với Bếp ăn</label>
                        <input
                          type="text"
                          className={styles.input}
                          placeholder="VD: Dụng cụ riêng, không chiên cùng chảo dầu..."
                          value={allergy.kitchenNote}
                          onChange={(e) =>
                            handleAllergyFieldChange(idx, "kitchenNote", e.target.value)
                          }
                        />
                      </div>

                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Món thay thế gợi ý cho suất riêng</label>
                        <input
                          type="text"
                          className={styles.input}
                          placeholder="VD: Thịt heo nạc rim ngũ vị, Gà áp chảo mè..."
                          value={allergy.recommendedAlternative}
                          onChange={(e) =>
                            handleAllergyFieldChange(
                              idx,
                              "recommendedAlternative",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Hủy bỏ
            </button>
            <button type="submit" className={styles.saveBtn}>
              <SaveOutlinedIcon className={styles.saveIcon} />
              <span>{isEdit ? "Lưu thay đổi" : "Lưu hồ sơ mới"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
