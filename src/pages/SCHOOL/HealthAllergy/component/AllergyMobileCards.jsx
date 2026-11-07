import React from "react"
import PropTypes from "prop-types"
import { School, Clock, Calendar, UtensilsCrossed, Users, Eye } from "lucide-react"
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
                <School size={18} className={styles.iconPrimary} />
                <div>
                  <h3 className={styles.className}>{cls.className}</h3>
                  <span className={styles.gradeSubtitle}>
                    Khối {cls.grade}
                  </span>
                </div>
              </div>
              <span className={styles.yearPill}>
                <Calendar size={11} />
                <span>{cls.academicYear}</span>
              </span>
            </div>

            {/* Allergens & Affected count */}
            <div className={styles.allergiesSection}>
              {allergies.map((alg) => (
                <div key={alg.id} className={styles.allergyItemRow}>
                  <div className={styles.allergenBadge}>
                    <UtensilsCrossed size={12} className={styles.chipIcon} />
                    <span className={styles.allergenName}>{alg.ingredientName}</span>
                  </div>
                  <span className={styles.affectedCountBadge}>
                    <Users size={12} />
                    <span>{alg.affectedCount} học sinh</span>
                  </span>
                </div>
              ))}
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
                <Eye size={13} />
                <span>Xem chi tiết</span>
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
