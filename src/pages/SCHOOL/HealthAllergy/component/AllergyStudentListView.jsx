import React from "react"
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined"
import MedicationLiquidOutlinedIcon from "@mui/icons-material/MedicationLiquidOutlined"
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined"
import styles from "./AllergyStudentListView.module.scss"

export default function AllergyStudentListView({
  students,
  onOpenDetail,
  onOpenEdit,
  onDeleteStudent,
}) {
  if (!students || students.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <ShieldOutlinedIcon className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>Không tìm thấy học sinh nào phù hợp</h3>
        <p className={styles.emptyDesc}>
          Thử đổi từ khóa tìm kiếm hoặc bấm nút "Đặt lại" để xem toàn bộ danh sách.
        </p>
      </div>
    )
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
    <div className={styles.tableCard}>
      <div className={styles.tableResponsive}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th style={{ width: "40px", textAlign: "center" }}>STT</th>
              <th style={{ width: "170px" }}>Học sinh</th>
              <th style={{ width: "100px" }}>Lớp</th>
              <th style={{ width: "190px" }}>GVCN & Số điện thoại</th>
              <th>Món / Nguyên liệu dị ứng</th>
              <th>Biểu hiện khi ăn phải</th>
              <th style={{ width: "110px", textAlign: "center" }}>Mức độ</th>
              <th>Lưu ý suất riêng gửi Bếp</th>
              <th style={{ width: "110px", textAlign: "right" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {students.map((stu, index) => {
              const badge = getSeverityBadge(stu.severity)

              return (
                <tr key={stu.id} className={styles.tableRow}>
                  <td style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "12px" }}>
                    {index + 1}
                  </td>

                  <td>
                    <div className={styles.studentCell}>
                      <span className={styles.studentName}>{stu.studentName}</span>
                      <div className={styles.studentMeta}>
                        <span className={styles.genderTag}>{stu.gender}</span>
                        {stu.hasEmergencyMedicine && (
                          <span
                            className={styles.medTag}
                            title={stu.emergencyMedicineNote || "Có thuốc dự phòng gửi Y tế"}
                          >
                            <MedicationLiquidOutlinedIcon className={styles.medIcon} />
                            Có thuốc
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className={styles.classCell}>
                      <span className={styles.className}>{stu.className}</span>
                      <span className={styles.gradeMeta}>Khối {stu.grade}</span>
                    </div>
                  </td>

                  <td>
                    <div className={styles.teacherCell}>
                      <span className={styles.teacherName}>{stu.homeroomTeacher}</span>
                      <a href={`tel:${stu.teacherPhone}`} className={styles.phoneLink}>
                        <PhoneInTalkOutlinedIcon className={styles.pIcon} />
                        <span>{stu.teacherPhone}</span>
                      </a>
                    </div>
                  </td>

                  <td>
                    <div className={styles.allergenCell}>
                      <strong className={styles.allergenName}>{stu.allergenName}</strong>
                      <span className={styles.categoryBadge}>{stu.allergenCategory}</span>
                    </div>
                  </td>

                  <td>
                    <p className={styles.symptomsText} title={stu.symptoms}>
                      {stu.symptoms}
                    </p>
                  </td>

                  <td style={{ textAlign: "center" }}>
                    <span className={`${styles.riskBadge} ${badge.className}`}>
                      {badge.label}
                    </span>
                  </td>

                  <td>
                    <div className={styles.dietaryCell}>
                      <span className={styles.dietaryText}>{stu.dietaryNote}</span>
                    </div>
                  </td>

                  <td style={{ textAlign: "right" }}>
                    <div className={styles.actionsCell}>
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => onOpenDetail(stu)}
                        title="Xem đầy đủ phiếu dị ứng của học sinh"
                      >
                        <VisibilityOutlinedIcon />
                      </button>

                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => onOpenEdit(stu)}
                        title="Sửa thông tin"
                      >
                        <EditOutlinedIcon />
                      </button>

                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.delBtn}`}
                        onClick={() => onDeleteStudent(stu.id, stu.studentName)}
                        title="Xóa học sinh này khỏi danh sách"
                      >
                        <DeleteOutlineOutlinedIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

