import React from "react"
import PropTypes from "prop-types"
import { Eye, School, Calendar, Users } from "lucide-react"
import styles from "./AllergyTableView.module.scss"

export default function AllergyTableView({ classList, onSelectClass }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.thClass}>
              <span className={styles.thContent}>
                <School size={13} />
                <span>Lớp</span>
              </span>
            </th>
            <th className={styles.thYear}>
              <span className={styles.thContent}>
                <Calendar size={13} />
                <span>Năm học</span>
              </span>
            </th>
            <th className={styles.thIngredients}>
              <span>Nguyên liệu dị ứng</span>
            </th>
            <th className={styles.thCount}>
              <span className={styles.thContentCenter}>
                <Users size={13} />
                <span>Học sinh ảnh hưởng</span>
              </span>
            </th>
            <th className={styles.thAction}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {classList.map((cls) => {
            const allergies = cls.allergies || []
            const totalAffected = allergies.reduce(
              (sum, alg) => sum + (alg.affectedCount || 0),
              0
            )
            const ingredientNames = allergies.map((a) => a.ingredientName).join(", ")

            return (
              <tr key={cls.id} className={styles.tableRow}>
                {/* Cột 1: Lớp */}
                <td className={styles.tdClass}>
                  <span className={styles.className}>{cls.className}</span>
                </td>

                {/* Cột 2: Năm học */}
                <td className={styles.tdYear}>
                  <span className={styles.yearText}>{cls.academicYear}</span>
                </td>

                {/* Cột 3: Nguyên liệu dị ứng (Thuần chữ) */}
                <td className={styles.tdIngredients}>
                  <span className={styles.ingredientText}>{ingredientNames}</span>
                </td>

                {/* Cột 4: Học sinh ảnh hưởng (Căn giữa ra giữa theo yêu cầu) */}
                <td className={styles.tdCount}>
                  <span className={styles.countText}>{totalAffected}</span>
                </td>

                {/* Cột 5: Thao tác (Icon button) */}
                <td className={styles.tdAction}>
                  <button
                    type="button"
                    className={styles.iconActionBtn}
                    onClick={() => onSelectClass(cls)}
                    title={`Xem chi tiết ${cls.className}`}
                    aria-label={`Xem chi tiết ${cls.className}`}
                  >
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

AllergyTableView.propTypes = {
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
