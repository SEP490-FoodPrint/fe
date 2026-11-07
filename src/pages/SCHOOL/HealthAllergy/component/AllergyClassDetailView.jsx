import React from "react"
import PropTypes from "prop-types"
import {
  ArrowLeft,
  School,
  Calendar,
  UserCheck,
  AlertTriangle,
  Users,
  ShieldCheck,
} from "lucide-react"
import styles from "./AllergyClassDetailView.module.scss"

export default function AllergyClassDetailView({ classData, onBack }) {
  if (!classData) return null

  const allergies = classData.allergies || []

  return (
    <div className={styles.detailWrapper}>
      {/* 1. Header & Điều hướng (Đã bỏ thanh breadcrumb theo yêu cầu) */}
      <div className={styles.headerBar}>
        <div className={styles.titleRow}>
          <h1 className={styles.pageTitle}>Chi tiết dị ứng theo lớp</h1>
          <span className={styles.classPill}>
            <School size={13} />
            <span>{classData.className}</span>
          </span>
          <span className={styles.yearPill}>
            <Calendar size={13} />
            <span>Năm học {classData.academicYear}</span>
          </span>
        </div>

        <button
          type="button"
          className={styles.backButton}
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          <span>Quay lại</span>
        </button>
      </div>

      {/* 2. Thanh tóm tắt thông tin lớp (Chuẩn FoodPrint) */}
      <div className={styles.summaryBar}>
        <div className={styles.summaryCol}>
          <span className={styles.summaryLabel}>Lớp học</span>
          <div className={styles.summaryValueRow}>
            <School size={16} className={styles.iconPrimary} />
            <span className={styles.summaryValue}>{classData.className}</span>
          </div>
        </div>

        <div className={styles.summaryDivider}></div>

        <div className={styles.summaryCol}>
          <span className={styles.summaryLabel}>Năm học</span>
          <div className={styles.summaryValueRow}>
            <Calendar size={16} className={styles.iconPrimary} />
            <span className={styles.summaryValue}>{classData.academicYear}</span>
          </div>
        </div>

        {classData.homeroomTeacher && (
          <>
            <div className={styles.summaryDivider}></div>
            <div className={styles.summaryCol}>
              <span className={styles.summaryLabel}>Giáo viên thu thập</span>
              <div className={styles.summaryValueRow}>
                <UserCheck size={16} className={styles.iconPrimary} />
                <span className={styles.summaryValue}>{classData.homeroomTeacher}</span>
              </div>
            </div>
          </>
        )}

        <div className={styles.summaryDivider}></div>

        <div className={styles.summaryCol}>
          <span className={styles.summaryLabel}>Số nguyên liệu dị ứng</span>
          <div className={styles.summaryValueRow}>
            <AlertTriangle size={16} className={styles.iconWarning} />
            <span className={`${styles.summaryValue} ${styles.warningValue}`}>
              {allergies.length} nguyên liệu
            </span>
          </div>
        </div>
      </div>

      {/* 3. Bảng Danh sách nguyên liệu dị ứng (Thuần chữ, Học sinh ảnh hưởng căn giữa) */}
      <div className={styles.tableCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Danh sách nguyên liệu dị ứng</h2>
          <span className={styles.readonlyBadge}>
            <ShieldCheck size={14} />
            <span>Dữ liệu tổng hợp theo lớp</span>
          </span>
        </div>

        {allergies.length === 0 ? (
          <div className={styles.emptyWrap}>
            <ShieldCheck size={28} className={styles.emptyIcon} />
            <p>Không có ghi nhận dị ứng nào cho lớp này.</p>
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table */}
            <div className={styles.tableResponsive}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: "45%" }}>
                      <span>Tên nguyên liệu</span>
                    </th>
                    <th style={{ width: "35%" }}>
                      <span>Nhóm nguyên liệu</span>
                    </th>
                    <th className={styles.thCount} style={{ width: "20%" }}>
                      <span className={styles.thContentCenter}>
                        <Users size={13} />
                        <span>Học sinh ảnh hưởng</span>
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allergies.map((alg) => (
                    <tr key={alg.id}>
                      {/* Tên nguyên liệu */}
                      <td>
                        <span className={styles.ingredientName}>{alg.ingredientName}</span>
                      </td>

                      {/* Nhóm nguyên liệu */}
                      <td>
                        <span className={styles.categoryText}>{alg.category}</span>
                      </td>

                      {/* Học sinh ảnh hưởng (Căn giữa ra giữa) */}
                      <td className={styles.tdCount}>
                        <span className={styles.countText}>{alg.affectedCount}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className={styles.mobileList}>
              {allergies.map((alg) => (
                <div key={alg.id} className={styles.mobileItem}>
                  <div className={styles.mobileItemHeader}>
                    <span className={styles.mobileIngName}>{alg.ingredientName}</span>
                    <span className={styles.countText}>{alg.affectedCount} hs</span>
                  </div>
                  <div className={styles.mobileMetaRow}>
                    <span className={styles.metaLabel}>Nhóm nguyên liệu:</span>
                    <span className={styles.categoryText}>{alg.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

AllergyClassDetailView.propTypes = {
  classData: PropTypes.shape({
    id: PropTypes.string.isRequired,
    className: PropTypes.string.isRequired,
    academicYear: PropTypes.string.isRequired,
    homeroomTeacher: PropTypes.string,
    allergies: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        ingredientName: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
        affectedCount: PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
  onBack: PropTypes.func.isRequired,
}
