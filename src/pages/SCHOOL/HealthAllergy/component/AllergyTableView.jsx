import React from "react"
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined"
import styles from "./AllergyTableView.module.scss"

export default function AllergyTableView({
  classes,
  onOpenDetail,
  onOpenEdit,
}) {
  if (!classes || classes.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <ShieldOutlinedIcon className={styles.emptyIcon} />
        <p>Không có dữ liệu lớp học phù hợp với bộ lọc hiện tại.</p>
      </div>
    )
  }

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "HIGH":
        return { label: "Nguy cơ cao", className: styles.severityHigh }
      case "MEDIUM":
        return { label: "Trung bình", className: styles.severityMedium }
      case "LOW":
        return { label: "Nhẹ", className: styles.severityLow }
      default:
        return { label: "Theo dõi", className: styles.severityLow }
    }
  }

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableResponsive}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th style={{ width: "130px" }}>Lớp & Khối</th>
              <th style={{ width: "160px" }}>GVCN & Liên hệ</th>
              <th>Dị nguyên & Nguyên liệu cảnh báo</th>
              <th style={{ width: "120px", textAlign: "center" }}>Số ca dị ứng</th>
              <th style={{ width: "130px" }}>Rủi ro cao nhất</th>
              <th>Khuyến nghị Bếp & Suất thay thế</th>
              <th style={{ width: "120px" }}>Trạng thái</th>
              <th style={{ width: "130px", textAlign: "right" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((cls) => {
              const maxSeverity = cls.allergies.some((a) => a.severity === "HIGH")
                ? "HIGH"
                : cls.allergies.some((a) => a.severity === "MEDIUM")
                ? "MEDIUM"
                : "LOW"
              const badge = getSeverityBadge(maxSeverity)

              return (
                <tr key={cls.id} className={styles.tableRow}>
                  <td>
                    <div className={styles.classCell}>
                      <span className={styles.className}>{cls.className}</span>
                      <span className={styles.gradeMeta}>Khối {cls.grade} • {cls.boardingStudents} suất BT</span>
                    </div>
                  </td>

                  <td>
                    <div className={styles.teacherCell}>
                      <span className={styles.teacherName}>{cls.homeroomTeacher}</span>
                      <a href={`tel:${cls.teacherPhone}`} className={styles.phoneText}>
                        <PhoneInTalkOutlinedIcon className={styles.phoneIcon} />
                        <span>{cls.teacherPhone}</span>
                      </a>
                    </div>
                  </td>

                  <td>
                    <div className={styles.allergenCell}>
                      {cls.allergies.map((a, i) => (
                        <div key={i} className={styles.allergenGroup}>
                          <span className={styles.allergenTag}>
                            {a.allergenName} ({a.affectedCount} hs)
                          </span>
                          <span className={styles.ingList}>
                            {a.ingredients.join(", ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>

                  <td style={{ textAlign: "center" }}>
                    <span className={styles.portionCountPill}>
                      {cls.totalAllergyStudents} suất
                    </span>
                  </td>

                  <td>
                    <span className={`${styles.riskPill} ${badge.className}`}>
                      {badge.label}
                    </span>
                  </td>

                  <td>
                    <div className={styles.adviceCell}>
                      {cls.allergies.map((a, i) => (
                        <span key={i} className={styles.adviceText}>
                          • {a.recommendedAlternative || "Thực đơn tiêu chuẩn riêng"}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td>
                    {cls.status === "VERIFIED" ? (
                      <span className={styles.statusVerified}>✓ Đã duyệt</span>
                    ) : (
                      <span className={styles.statusPending}>Chờ duyệt</span>
                    )}
                  </td>

                  <td style={{ textAlign: "right" }}>
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => onOpenDetail(cls)}
                        title="Xem Y bạ chi tiết & Sơ cứu"
                      >
                        <VisibilityOutlinedIcon />
                      </button>

                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => onOpenEdit(cls)}
                        title="Chỉnh sửa ghi nhận"
                      >
                        <EditOutlinedIcon />
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

