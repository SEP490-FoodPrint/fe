import React from "react"
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined"
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import MedicationLiquidOutlinedIcon from "@mui/icons-material/MedicationLiquidOutlined"
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined"
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined"
import styles from "./AllergyClassGroupedView.module.scss"

export default function AllergyClassGroupedView({
  groupedClasses,
  onOpenDetail,
  onOpenEdit,
}) {
  if (!groupedClasses || groupedClasses.length === 0) {
    return null
  }

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "HIGH":
        return { label: "Nặng", className: styles.sevHigh }
      case "MEDIUM":
        return { label: "Trung bình", className: styles.sevMedium }
      case "LOW":
        return { label: "Nhẹ", className: styles.sevLow }
      default:
        return { label: "Theo dõi", className: styles.sevLow }
    }
  }

  return (
    <div className={styles.groupedContainer}>
      {groupedClasses.map((group) => {
        const hasHighRisk = group.students.some((s) => s.severity === "HIGH")

        return (
          <div
            key={group.className}
            className={`${styles.classGroupCard} ${hasHighRisk ? styles.hasHighRisk : ""}`}
          >
            {/* Header Lớp */}
            <div className={styles.groupHeader}>
              <div className={styles.classInfoCol}>
                <div className={styles.nameRow}>
                  <h3 className={styles.className}>{group.className}</h3>
                  <span className={styles.gradeTag}>Khối {group.grade}</span>
                </div>

                <div className={styles.teacherBar}>
                  <div className={styles.teacherMeta}>
                    <PersonOutlineOutlinedIcon className={styles.icon} />
                    <span>GVCN: <strong>{group.homeroomTeacher}</strong></span>
                  </div>
                  <span className={styles.dot}>•</span>
                  <a href={`tel:${group.teacherPhone}`} className={styles.phoneLink}>
                    <PhoneInTalkOutlinedIcon className={styles.phoneIcon} />
                    <span>{group.teacherPhone}</span>
                  </a>
                </div>
              </div>

              <div className={styles.countBadge}>
                <span className={styles.countNumber}>{group.students.length}</span>
                <span className={styles.countText}>học sinh dị ứng</span>
              </div>
            </div>

            {/* Danh sách học sinh trong lớp này */}
            <div className={styles.studentsGrid}>
              {group.students.map((stu) => {
                const badge = getSeverityBadge(stu.severity)

                return (
                  <div key={stu.id} className={styles.studentCard}>
                    <div className={styles.cardTop}>
                      <div className={styles.stuBasic}>
                        <h4 className={styles.stuName}>{stu.studentName}</h4>
                        <span className={styles.stuGender}>{stu.gender}</span>
                        {stu.hasEmergencyMedicine && (
                          <span
                            className={styles.medPill}
                            title={stu.emergencyMedicineNote || "Có thuốc dự phòng tại trường"}
                          >
                            <MedicationLiquidOutlinedIcon className={styles.medIcon} />
                            Có thuốc
                          </span>
                        )}
                      </div>

                      <span className={`${styles.sevBadge} ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className={styles.allergenInfoRow}>
                      <span className={styles.allergenLabel}>Dị ứng:</span>
                      <strong className={styles.allergenValue}>{stu.allergenName}</strong>
                      <span className={styles.categoryPill}>{stu.allergenCategory}</span>
                    </div>

                    <div className={styles.symptomsRow}>
                      <span className={styles.rowLabel}>Biểu hiện:</span>
                      <p className={styles.symptomsText}>{stu.symptoms}</p>
                    </div>

                    <div className={styles.dietaryRow}>
                      <RestaurantOutlinedIcon className={styles.dietIcon} />
                      <div className={styles.dietTextWrap}>
                        <span className={styles.dietLabel}>Lưu ý Bếp ăn:</span>
                        <span className={styles.dietVal}>{stu.dietaryNote}</span>
                      </div>
                    </div>

                    <div className={styles.cardBottom}>
                      <span className={styles.reportedDate}>
                        Báo ngày: {stu.reportedDate}
                      </span>

                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.detailBtn}
                          onClick={() => onOpenDetail(stu)}
                          title="Xem đầy đủ phiếu dị ứng của học sinh"
                        >
                          <VisibilityOutlinedIcon />
                          <span>Chi tiết</span>
                        </button>

                        <button
                          type="button"
                          className={styles.editBtn}
                          onClick={() => onOpenEdit(stu)}
                          title="Sửa thông tin"
                        >
                          <EditOutlinedIcon />
                          <span>Sửa</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

