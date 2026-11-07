import React from "react"
import PropTypes from "prop-types"
import { School, Clock, Eye, ArrowRight } from "lucide-react"
import styles from "./AllergyMobileCards.module.scss"

export default function AllergyMobileCards({ classList, onSelectClass }) {
  return (
    <div className={styles.mobileCardList}>
      {classList.map((cls) => {
        const allergies = cls.allergies || []

        return (
          <div key={cls.id} className={styles.classCard}>
            {/* Header: Class Name, Grade, Year */}
            <div className={styles.cardHeader}>
              <div className={styles.classTitleGroup}>
                <div className={styles.classIcon}>
                  <School size={18} />
                </div>
                <div>
                  <h3 className={styles.className}>{cls.className}</h3>
                  <span className={styles.gradeSubtitle}>
                    Khối {cls.grade} • {cls.academicYear}
                  </span>
                </div>
              </div>
              <span className={styles.countSummaryPill}>
                {allergies.length} loại NL
              </span>
            </div>

            {/* Allergens & Affected count */}
            <div className={styles.allergiesSection}>
              <span className={styles.sectionLabel}>Nguyên liệu & Số lượng ảnh hưởng:</span>
              <div className={styles.allergiesList}>
                {allergies.map((alg) => (
                  <div key={alg.id} className={styles.allergyItemRow}>
                    <div className={styles.allergenBadge}>
                      <span className={styles.badgeDot}></span>
                      <span className={styles.allergenName}>{alg.ingredientName}</span>
                    </div>
                    <span className={styles.affectedCountBadge}>
                      {alg.affectedCount < 10 ? `0${alg.affectedCount}` : alg.affectedCount} học sinh
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer with Last updated & Detail action */}
            <div className={styles.cardFooter}>
              <div className={styles.updatedWrap}>
                <Clock size={12} className={styles.clockIcon} />
                <span>{allergies[0]?.updatedAt || cls.updatedAt}</span>
              </div>
              <button
                type="button"
                className={styles.detailBtn}
                onClick={() => onSelectClass(cls)}
              >
                <span>Xem chi tiết</span>
                <ArrowRight size={14} />
              </button>
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
      grade: PropTypes.number.isRequired,
      academicYear: PropTypes.string.isRequired,
      allergies: PropTypes.array.isRequired,
    })
  ).isRequired,
  onSelectClass: PropTypes.func.isRequired,
}

