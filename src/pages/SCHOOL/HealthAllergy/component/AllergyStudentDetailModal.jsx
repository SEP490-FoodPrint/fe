import React, { useEffect } from "react"
import CloseIcon from "@mui/icons-material/Close"
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined"
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined"
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined"
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined"
import MedicationLiquidOutlinedIcon from "@mui/icons-material/MedicationLiquidOutlined"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import styles from "./AllergyStudentDetailModal.module.scss"

export default function AllergyStudentDetailModal({
  isOpen,
  onClose,
  student,
  onOpenEdit,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !student) return null

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "HIGH":
        return { label: "Nặng (Cần theo dõi sát)", className: styles.sevHigh }
      case "MEDIUM":
        return { label: "Mức độ Trung bình", className: styles.sevMedium }
      case "LOW":
        return { label: "Mức độ Nhẹ", className: styles.sevLow }
      default:
        return { label: "Theo dõi", className: styles.sevLow }
    }
  }

  const badge = getSeverityBadge(student.severity)

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.titleWrap}>
            <div className={styles.badgeRow}>
              <span className={styles.classBadge}>{student.className}</span>
              <span className={styles.gradeBadge}>Khối {student.grade}</span>
              <span className={`${styles.sevBadge} ${badge.className}`}>{badge.label}</span>
            </div>
            <h2 className={styles.studentTitle}>
              {student.studentName} ({student.gender})
            </h2>
          </div>

          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {/* Thông tin liên hệ GVCN & Gia đình */}
          <div className={styles.contactCard}>
            <div className={styles.contactCol}>
              <span className={styles.colLabel}>Giáo viên chủ nhiệm thu thập:</span>
              <div className={styles.teacherInfo}>
                <PersonOutlineOutlinedIcon className={styles.icon} />
                <strong>{student.homeroomTeacher}</strong>
              </div>
              <a href={`tel:${student.teacherPhone}`} className={styles.phoneLink}>
                <PhoneInTalkOutlinedIcon className={styles.pIcon} />
                <span>{student.teacherPhone}</span>
              </a>
            </div>

            <div className={styles.contactCol}>
              <span className={styles.colLabel}>Số điện thoại phụ huynh:</span>
              <div className={styles.parentInfo}>
                <strong>{student.parentPhone}</strong>
              </div>
              <span className={styles.reportTime}>Báo cáo ngày: {student.reportedDate}</span>
            </div>
          </div>

          {/* Chi tiết Dị ứng */}
          <div className={styles.sectionBox}>
            <h3 className={styles.sectionHeading}>
              <WarningAmberOutlinedIcon className={styles.secIcon} />
              Chi tiết Dị ứng Thực phẩm
            </h3>

            <div className={styles.fieldGrid}>
              <div className={styles.fieldItem}>
                <span className={styles.fLabel}>Món / Nguyên liệu dị ứng:</span>
                <strong className={styles.allergenVal}>{student.allergenName}</strong>
                <span className={styles.fCategory}>({student.allergenCategory})</span>
              </div>

              <div className={styles.fieldItemFull}>
                <span className={styles.fLabel}>Biểu hiện triệu chứng khi ăn phải:</span>
                <p className={styles.fText}>{student.symptoms}</p>
              </div>
            </div>
          </div>

          {/* Thuốc dự phòng (nếu có) */}
          {student.hasEmergencyMedicine && (
            <div className={styles.medicineBox}>
              <div className={styles.medHeader}>
                <MedicationLiquidOutlinedIcon className={styles.medIcon} />
                <strong>Thuốc dự phòng đã gửi tại Phòng Y tế trường:</strong>
              </div>
              <p className={styles.medText}>{student.emergencyMedicineNote}</p>
            </div>
          )}

          {/* Hướng dẫn Suất ăn riêng cho Bếp */}
          <div className={styles.kitchenBox}>
            <div className={styles.kitchenHeader}>
              <RestaurantOutlinedIcon className={styles.kIcon} />
              <strong>Lưu ý chuẩn bị suất ăn riêng gửi Bếp trưởng:</strong>
            </div>
            <p className={styles.kitchenText}>{student.dietaryNote}</p>
          </div>

          {/* Ghi chú của Giáo viên chủ nhiệm */}
          {student.teacherNotes && (
            <div className={styles.teacherNoteBox}>
              <span className={styles.tnLabel}>Ghi chú thêm từ Giáo viên:</span>
              <p className={styles.tnText}>"{student.teacherNotes}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.editBtn}
            onClick={() => {
              onClose()
              onOpenEdit(student)
            }}
          >
            <EditOutlinedIcon className={styles.btnIcon} />
            <span>Sửa thông tin học sinh này</span>
          </button>

          <button type="button" className={styles.closeActionBtn} onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

