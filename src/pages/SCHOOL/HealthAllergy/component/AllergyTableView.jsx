import React from "react"
import PropTypes from "prop-types"
import { Eye, Clock, School, AlertCircle } from "lucide-react"
import styles from "./AllergyTableView.module.scss"

export default function AllergyTableView({ classList, onSelectClass }) {
  return (
    <div className={styles.tableCard}>
      <div className={styles.tableResponsive}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thClass}>Lớp</th>
              <th className={styles.thYear}>Năm học</th>
              <th className={styles.thIngredients}>Nguyên liệu dị ứng</th>
              <th className={styles.thCount}>Số lượng học sinh bị ảnh hưởng</th>
              <th className={styles.thUpdated}>Cập nhật gần nhất</th>
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
                      <div className={styles.classAvatar}>
                        <School size={16} />
                      </div>
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

                  {/* Cột 3: Nguyên liệu dị ứng (Chips) */}
                  <td className={styles.tdIngredients}>
                    <div className={styles.chipsContainer}>
                      {allergies.map((alg) => (
                        <span key={alg.id} className={styles.allergenChip}>
                          <span className={styles.chipDot}></span>
                          {alg.ingredientName}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Cột 4: Số lượng học sinh bị ảnh hưởng */}
                  <td className={styles.tdCount}>
                    {allergies.length === 1 ? (
                      <div className={styles.singleCount}>
                        <span className={styles.countBadge}>
                          {allergies[0].affectedCount < 10
                            ? `0${allergies[0].affectedCount}`
                            : allergies[0].affectedCount}{" "}
                          học sinh
                        </span>
                      </div>
                    ) : (
                      <div className={styles.multiCountList}>
                        {allergies.map((alg) => (
                          <div key={alg.id} className={styles.multiCountItem}>
                            <span className={styles.multiIngName}>{alg.ingredientName}:</span>
                            <span className={styles.multiCountBadge}>
                              {alg.affectedCount < 10 ? `0${alg.affectedCount}` : alg.affectedCount} hs
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
                      <Eye size={15} />
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
