import React from "react"
import PropTypes from "prop-types"
import { Eye, Clock, School, Calendar, UtensilsCrossed, Users } from "lucide-react"
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
              <th className={styles.thUpdated}>
                <span className={styles.thContent}>
                  <Clock size={13} />
                  <span>Cập nhật</span>
                </span>
              </th>
              <th className={styles.thAction}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {classList.map((cls) => {
              const allergies = cls.allergies || []

              return (
                <tr key={cls.id} className={styles.tableRow}>
                  {/* Cột 1: Lớp */}
                  <td className={styles.tdClass}>
                    <div className={styles.classInfo}>
                      <School size={16} className={styles.iconPrimary} />
                      <div className={styles.classNameGroup}>
                        <span className={styles.className}>{cls.className}</span>
                        <span className={styles.gradeBadge}>Khối {cls.grade}</span>
                      </div>
                    </div>
                  </td>

                  {/* Cột 2: Năm học */}
                  <td className={styles.tdYear}>
                    <span className={styles.yearText}>{cls.academicYear}</span>
                  </td>

                  {/* Cột 3: Nguyên liệu dị ứng */}
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

                  {/* Cột 4: Số lượng học sinh bị ảnh hưởng */}
                  <td className={styles.tdCount}>
                    {allergies.length === 1 ? (
                      <span className={styles.countBadge}>
                        <Users size={13} />
                        <span>{allergies[0].affectedCount} học sinh</span>
                      </span>
                    ) : (
                      <div className={styles.multiCountList}>
                        {allergies.map((alg) => (
                          <div key={alg.id} className={styles.multiCountItem}>
                            <span className={styles.multiIngName}>{alg.ingredientName}:</span>
                            <span className={styles.countBadgeSmall}>
                              <Users size={11} />
                              <span>{alg.affectedCount} hs</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Cột 5: Cập nhật gần nhất */}
                  <td className={styles.tdUpdated}>
                    <div className={styles.updatedCell}>
                      <Clock size={13} className={styles.clockIcon} />
                      <span>{allergies[0]?.updatedAt || cls.updatedAt}</span>
                    </div>
                  </td>

                  {/* Cột 6: Thao tác Xem chi tiết */}
                  <td className={styles.tdAction}>
                    <button
                      type="button"
                      className={styles.viewDetailBtn}
                      onClick={() => onSelectClass(cls)}
                      title={`Xem chi tiết dị ứng ${cls.className}`}
                    >
                      <Eye size={14} />
                      <span>Xem chi tiết</span>
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
      grade: PropTypes.number.isRequired,
      academicYear: PropTypes.string.isRequired,
      allergies: PropTypes.array.isRequired,
    })
  ).isRequired,
  onSelectClass: PropTypes.func.isRequired,
}
