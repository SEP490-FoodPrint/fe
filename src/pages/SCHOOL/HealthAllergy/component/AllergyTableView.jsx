import React from "react"
import PropTypes from "prop-types"
import { Eye, School, Calendar, UtensilsCrossed, Users } from "lucide-react"
import styles from "./AllergyTableView.module.scss"

export default function AllergyTableView({ classList, onSelectClass }) {
  return (
    <div className={styles.tableCard}>
      <div className={styles.tableResponsive}>
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
                <span className={styles.thContent}>
                  <UtensilsCrossed size={13} />
                  <span>Nguyên liệu dị ứng</span>
                </span>
              </th>
              <th className={styles.thCount}>
                <span className={styles.thContent}>
                  <Users size={13} />
                  <span>Học sinh ảnh hưởng</span>
                </span>
              </th>
              <th className={styles.thAction}>
                <span className={styles.thActionText}>Thao tác</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {classList.map((cls) => {
              const allergies = cls.allergies || []
              // Đếm số học sinh ảnh hưởng
              const totalAffected = allergies.reduce(
                (sum, alg) => sum + (alg.affectedCount || 0),
                0
              )

              return (
                <tr key={cls.id} className={styles.tableRow}>
                  {/* Cột 1: Lớp (Bỏ khối lớp theo DB) */}
                  <td className={styles.tdClass}>
                    <div className={styles.classInfo}>
                      <School size={15} className={styles.iconPrimary} />
                      <span className={styles.className}>{cls.className}</span>
                    </div>
                  </td>

                  {/* Cột 2: Năm học */}
                  <td className={styles.tdYear}>
                    <span className={styles.yearText}>{cls.academicYear}</span>
                  </td>

                  {/* Cột 3: Nguyên liệu dị ứng (Badge bo nhẹ) */}
                  <td className={styles.tdIngredients}>
                    <div className={styles.chipsContainer}>
                      {allergies.map((alg) => (
                        <span key={alg.id} className={styles.allergenChip}>
                          <UtensilsCrossed size={12} className={styles.chipIcon} />
                          <span>{alg.ingredientName}</span>
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Cột 4: Học sinh ảnh hưởng (Chỉ đếm số, không liệt kê rõ) */}
                  <td className={styles.tdCount}>
                    <span className={styles.countBadge}>
                      <Users size={12} />
                      <span>{totalAffected}</span>
                    </span>
                  </td>

                  {/* Cột 5: Thao tác (Chuyển thành Icon Button) */}
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
