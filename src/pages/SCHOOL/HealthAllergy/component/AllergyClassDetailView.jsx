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
  ShieldAlert,
  Eye,
} from "lucide-react"
import styles from "./AllergyClassDetailView.module.scss"

export default function AllergyClassDetailView({ classData, onBack }) {
  if (!classData) return null

  const allergies = classData.allergies || []

  return (
    <div className={styles.detailWrapper}>
      {/* 1. Header & Điều hướng */}
      <div className={styles.headerBar}>
        <div className={styles.headerLeft}>
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <button
              type="button"
              className={styles.breadcrumbLink}
              onClick={onBack}
            >
              <ShieldAlert size={14} className={styles.breadIcon} />
              <span>Thông tin dị ứng</span>
            </button>
            <span className={styles.breadSep}>/</span>
            <span className={styles.breadCurrent}>
              <Eye size={14} className={styles.breadIcon} />
              <span>Chi tiết dị ứng</span>
            </span>
          </nav>

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

      {/* 3. Bảng Danh sách nguyên liệu dị ứng (Bỏ viền bo, bỏ nền, bỏ icon ở nguyên liệu dị ứng - chỉ để chữ) */}
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
            {/* Desktop / Tablet Table: Thuần chữ, không nền, không viền bo bên trong cells */}
            <div className={styles.tableResponsive}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {/* Bỏ icon ở Nguyên liệu dị ứng */}
                    <th style={{ width: "45%" }}>
                      <span>Tên nguyên liệu</span>
                    </th>
                    <th style={{ width: "35%" }}>
                      <span>Nhóm nguyên liệu</span>
                    </th>
                    <th style={{ width: "20%" }}>
                      <span className={styles.thContent}>
                        <Users size={13} />
                        <span>Học sinh ảnh hưởng</span>
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allergies.map((alg) => (
                    <tr key={alg.id}>
                      {/* Tên nguyên liệu: Thuần chữ, không icon, không nền bo */}
                      <td>
                        <span className={styles.ingredientName}>{alg.ingredientName}</span>
                      </td>

                      {/* Nhóm nguyên liệu: Thuần chữ, không icon, không nền bo */}
                      <td>
                        <span className={styles.categoryText}>{alg.category}</span>
                      </td>

                      {/* Học sinh ảnh hưởng: Thuần số, không nền, không viền */}
                      <td>
                        <span className={styles.countText}>{alg.affectedCount}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Thuần chữ, gọn gàng */}
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
        ingredientCode: PropTypes.string,
        category: PropTypes.string.isRequired,
        affectedCount: PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
  onBack: PropTypes.func.isRequired,
}
