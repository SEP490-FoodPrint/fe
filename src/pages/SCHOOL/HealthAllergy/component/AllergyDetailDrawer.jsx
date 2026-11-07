import React, { useEffect } from "react"
import CloseIcon from "@mui/icons-material/Close"
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined"
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined"
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined"
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined"
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined"
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import styles from "./AllergyDetailDrawer.module.scss"

export default function AllergyDetailDrawer({
  isOpen,
  onClose,
  classData,
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

  if (!isOpen || !classData) return null

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "HIGH":
        return { label: "Nguy cơ cao / Sốc phản vệ", className: styles.sevHigh }
      case "MEDIUM":
        return { label: "Mức độ Trung bình", className: styles.sevMedium }
      case "LOW":
        return { label: "Mức độ Nhẹ", className: styles.sevLow }
      default:
        return { label: "Theo dõi y tế", className: styles.sevLow }
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className={styles.drawerHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.classBadgeWrap}>
              <span className={styles.badgeGrade}>Khối {classData.grade}</span>
              <h2 className={styles.drawerTitle}>{classData.className}</h2>
              {classData.status === "VERIFIED" ? (
                <span className={styles.verifiedTag}>
                  <VerifiedUserOutlinedIcon className={styles.tagIcon} />
                  Đã thẩm định y tế
                </span>
              ) : (
                <span className={styles.pendingTag}>Chờ duyệt hồ sơ</span>
              )}
            </div>
            <p className={styles.headerSubtitle}>
              Sĩ số: {classData.totalStudents} học sinh • {classData.boardingStudents} suất bán trú •{" "}
              <strong>{classData.totalAllergyStudents} học sinh có hồ sơ dị ứng</strong>
            </p>
          </div>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng bảng chi tiết"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Drawer Body */}
        <div className={styles.drawerBody}>
          {/* Thông tin liên hệ GVCN */}
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>
              <PersonOutlinedIcon className={styles.secIcon} />
              Giáo viên chủ nhiệm phụ trách
            </h3>
            <div className={styles.teacherRow}>
              <div className={styles.teacherDetails}>
                <span className={styles.name}>{classData.homeroomTeacher}</span>
                <span className={styles.phoneLabel}>Điện thoại liên hệ khẩn:</span>
              </div>
              <a href={`tel:${classData.teacherPhone}`} className={styles.phoneBtn}>
                <PhoneInTalkOutlinedIcon className={styles.pIcon} />
                <span>{classData.teacherPhone}</span>
              </a>
            </div>
          </div>

          {/* Chi tiết từng dị nguyên */}
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>
              <MedicalServicesOutlinedIcon className={styles.secIcon} />
              Hồ sơ Dị nguyên & Phác đồ sơ cứu ({classData.allergies.length} dị nguyên)
            </h3>

            <div className={styles.allergyDetailList}>
              {classData.allergies.map((a) => {
                const badge = getSeverityBadge(a.severity)
                return (
                  <div key={a.id} className={styles.detailCard}>
                    <div className={styles.cardTop}>
                      <div>
                        <h4 className={styles.allergenTitle}>{a.allergenName}</h4>
                        <span className={styles.affectedSub}>
                          Số ca bị ảnh hưởng: <strong>{a.affectedCount} học sinh</strong>
                        </span>
                      </div>
                      <span className={`${styles.sevPill} ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className={styles.fieldBlock}>
                      <span className={styles.fieldLabel}>Nguyên liệu cụ thể cần tránh:</span>
                      <div className={styles.tagWrap}>
                        {a.ingredients.map((ing, idx) => (
                          <span key={idx} className={styles.ingChip}>
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className={styles.fieldBlock}>
                      <span className={styles.fieldLabel}>Triệu chứng lâm sàng & Tiền sử:</span>
                      <p className={styles.fieldValue}>{a.symptoms}</p>
                    </div>

                    <div className={`${styles.fieldBlock} ${styles.emergencyBlock}`}>
                      <div className={styles.alertHeader}>
                        <WarningAmberOutlinedIcon className={styles.alertIcon} />
                        <span className={styles.emergencyLabel}>Phác đồ sơ cứu khẩn cấp của Y tế:</span>
                      </div>
                      <p className={styles.emergencyValue}>{a.emergencyPlan}</p>
                    </div>

                    <div className={`${styles.fieldBlock} ${styles.kitchenBlock}`}>
                      <div className={styles.kitchenHeader}>
                        <RestaurantOutlinedIcon className={styles.kIcon} />
                        <span className={styles.kitchenHeadLabel}>Yêu cầu bắt buộc đối với Bếp ăn:</span>
                      </div>
                      <p className={styles.kitchenValue}>{a.kitchenNote}</p>

                      {a.recommendedAlternative && (
                        <div className={styles.alternativeBox}>
                          <span className={styles.altLabel}>Gợi ý món thay thế suất riêng:</span>
                          <strong className={styles.altDish}>{a.recommendedAlternative}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Lịch sử thẩm định */}
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>
              <VerifiedUserOutlinedIcon className={styles.secIcon} />
              Thông tin xác thực & Thẩm định
            </h3>
            <div className={styles.auditInfo}>
              <div className={styles.auditRow}>
                <span className={styles.aLabel}>Lần cập nhật gần nhất:</span>
                <span className={styles.aVal}>{classData.lastUpdated}</span>
              </div>
              <div className={styles.auditRow}>
                <span className={styles.aLabel}>Người ghi nhận & Duyệt y bạ:</span>
                <span className={styles.aVal}>{classData.updatedBy}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className={styles.drawerFooter}>
          <button
            type="button"
            className={styles.editActionBtn}
            onClick={() => {
              onClose()
              onOpenEdit(classData)
            }}
          >
            <EditOutlinedIcon className={styles.btnIcon} />
            <span>Chỉnh sửa hồ sơ lớp {classData.className}</span>
          </button>

          <button
            type="button"
            className={styles.closeActionBtn}
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
