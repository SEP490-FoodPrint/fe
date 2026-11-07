import React from "react"
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined"
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined"
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined"
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined"
import styles from "./AllergyClassCardView.module.scss"

export default function AllergyClassCardView({
  classes,
  onOpenDetail,
  onOpenEdit,
}) {
  if (!classes || classes.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyIconWrap}>
          <ShieldOutlinedIcon className={styles.emptyIcon} />
        </div>
        <h3 className={styles.emptyTitle}>Không tìm thấy hồ sơ dị ứng phù hợp</h3>
        <p className={styles.emptyDesc}>
          Thử điều chỉnh lại từ khóa tìm kiếm hoặc chọn lại bộ lọc Khối, Dị nguyên, Mức độ rủi ro.
        </p>
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
    <div className={styles.cardGrid}>
      {classes.map((cls) => {
        const hasHighRisk = cls.allergies.some((a) => a.severity === "HIGH")

        return (
          <div
            key={cls.id}
            className={`${styles.classCard} ${hasHighRisk ? styles.hasHighRisk : ""}`}
          >
            {/* Header thẻ lớp */}
            <div className={styles.cardHeader}>
              <div className={styles.titleCol}>
                <div className={styles.nameRow}>
                  <h3 className={styles.className}>{cls.className}</h3>
                  <span className={styles.gradeTag}>Khối {cls.grade}</span>
                  {cls.status === "VERIFIED" ? (
                    <span className={styles.verifiedTag}>✓ Đã thẩm định</span>
                  ) : (
                    <span className={styles.pendingTag}>Chờ thẩm định</span>
                  )}
                </div>
                <span className={styles.boardingMeta}>
                  Sĩ số: {cls.totalStudents} hs • {cls.boardingStudents} suất bán trú
                </span>
              </div>

              <div className={styles.allergyCountPill}>
                <span className={styles.countNum}>{cls.totalAllergyStudents}</span>
                <span className={styles.countTxt}>học sinh dị ứng</span>
              </div>
            </div>

            {/* Thông tin GVCN */}
            <div className={styles.teacherBar}>
              <div className={styles.teacherInfo}>
                <PersonOutlinedIcon className={styles.barIcon} />
                <span className={styles.teacherName}>{cls.homeroomTeacher}</span>
              </div>
              <a
                href={`tel:${cls.teacherPhone}`}
                className={styles.phoneLink}
                title={`Gọi ngay cho ${cls.homeroomTeacher}`}
              >
                <PhoneInTalkOutlinedIcon className={styles.phoneIcon} />
                <span>{cls.teacherPhone}</span>
              </a>
            </div>

            {/* Danh sách các dị nguyên của lớp */}
            <div className={styles.allergySection}>
              <div className={styles.allergyList}>
                {cls.allergies.map((allergy) => {
                  const badge = getSeverityBadge(allergy.severity)
                  return (
                    <div key={allergy.id} className={styles.allergyItemBox}>
                      <div className={styles.itemHeader}>
                        <div className={styles.allergenInfo}>
                          <strong className={styles.allergenName}>
                            {allergy.allergenName}
                          </strong>
                          <span className={styles.affectedPill}>
                            {allergy.affectedCount} học sinh
                          </span>
                        </div>
                        <span className={`${styles.severityBadge} ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>

                      <div className={styles.ingredientRow}>
                        <span className={styles.subLabel}>Nguyên liệu gây dị ứng:</span>
                        <div className={styles.ingTags}>
                          {allergy.ingredients.map((ing, i) => (
                            <span key={i} className={styles.ingTag}>
                              {ing}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className={styles.symptomsRow}>
                        <span className={styles.subLabel}>Triệu chứng lâm sàng:</span>
                        <span className={styles.symptomsText}>{allergy.symptoms}</span>
                      </div>

                      {allergy.recommendedAlternative && (
                        <div className={styles.kitchenAdviceBox}>
                          <RestaurantOutlinedIcon className={styles.kitchenIcon} />
                          <div className={styles.kitchenTextWrap}>
                            <span className={styles.kitchenLabel}>Món thay thế gợi ý:</span>
                            <span className={styles.kitchenValue}>
                              {allergy.recommendedAlternative}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Footer thẻ lớp: Thao tác & thời gian */}
            <div className={styles.cardFooter}>
              <span className={styles.updateTimestamp}>
                Cập nhật: {cls.lastUpdated}
              </span>

              <div className={styles.cardActions}>
                <button
                  type="button"
                  className={styles.viewDetailBtn}
                  onClick={() => onOpenDetail(cls)}
                  title="Xem chi tiết y bạ & quy trình sơ cứu khẩn cấp"
                >
                  <MedicalServicesOutlinedIcon className={styles.actionIcon} />
                  <span>Y bạ chi tiết</span>
                </button>

                <button
                  type="button"
                  className={styles.editBtn}
                  onClick={() => onOpenEdit(cls)}
                  title="Cập nhật hoặc thêm dị ứng cho lớp này"
                >
                  <EditOutlinedIcon className={styles.actionIcon} />
                  <span>Cập nhật</span>
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
