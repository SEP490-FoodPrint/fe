import React from "react"
import PropTypes from "prop-types"
import { School, Calendar, Users, Eye } from "lucide-react"
import styles from "./AllergyMobileCards.module.scss"

export default function AllergyMobileCards({ classList, onSelectClass }) {
  return (
    <div className={styles.mobileCardList}>
      {classList.map((cls) => {
        const allergies = cls.allergies || []
        const totalAffected = allergies.reduce(
          (sum, alg) => sum + (alg.affectedCount || 0),
          0
        )
        const ingredientNames = allergies.map((a) => a.ingredientName).join(", ")

        return (
          <div key={cls.id} className={styles.classCard}>
            {/* Header: Class Name, Year & Action icon */}
            <div className={styles.cardHeader}>
              <div className={styles.classTitleGroup}>
                <School size={16} className={styles.iconPrimary} />
                <h3 className={styles.className}>{cls.className}</h3>
              </div>
              <div className={styles.headerRight}>
                <span className={styles.yearPill}>
                  <Calendar size={11} />
                  <span>{cls.academicYear}</span>
                </span>
                <button
                  type="button"
                  className={styles.iconActionBtn}
                  onClick={() => onSelectClass(cls)}
                  title={`Xem chi tiết ${cls.className}`}
                  aria-label={`Xem chi tiết ${cls.className}`}
                >
                  <Eye size={16} />
                </button>
              </div>
            </div>

            {/* Allergens & Affected count: Thuần chữ, bỏ nền và viền bo */}
            <div className={styles.allergiesSection}>
              <div className={styles.ingredientRow}>
                <span className={styles.sectionLabel}>Nguyên liệu dị ứng:</span>
                <span className={styles.ingredientText}>{ingredientNames}</span>
              </div>
              <div className={styles.affectedRow}>
                <span className={styles.sectionLabel}>Học sinh ảnh hưởng:</span>
                <span className={styles.countText}>
                  <Users size={12} />
                  <span>{totalAffected}</span>
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

AllergyMobileCards.propTypes = {
  classList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      className: PropTypes.string.isRequired,
      academicYear: PropTypes.string.isRequired,
      allergies: PropTypes.array.isRequired,
    })
  ).isRequired,
  onSelectClass: PropTypes.func.isRequired,
}
