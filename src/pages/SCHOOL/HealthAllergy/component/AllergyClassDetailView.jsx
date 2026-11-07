import React from "react"
import PropTypes from "prop-types"
import {
  ArrowLeft,
  School,
  Calendar,
  UserCheck,
  AlertTriangle,
  UtensilsCrossed,
  Tag,
  Users,
  Clock,
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
      {/* 1. Header & Breadcrumb */}
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
              <span>{classData.className} — Khối {classData.grade}</span>
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

      {/* 2. Class Information Bar (FoodPrint Summary Bar chuẩn) */}
      <div className={styles.summaryBar}>
        <div className={styles.summaryCol}>
          <span className={styles.summaryLabel}>Lớp học</span>
          <div className={styles.summaryValueRow}>
            <School size={16} className={styles.iconPrimary} />
            <span className={styles.summaryValue}>
              {classData.className} — Khối {classData.grade}
            </span>
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
          <span className={styles.summaryLabel}>Nguyên liệu ghi nhận</span>
          <div className={styles.summaryValueRow}>
            <AlertTriangle size={16} className={styles.iconWarning} />
            <span className={`${styles.summaryValue} ${styles.warningValue}`}>
              {allergies.length} loại nguyên liệu
            </span>
          </div>
        </div>
      </div>

      {/* 3. Bảng Danh sách nguyên liệu dị ứng */}
      <div className={styles.tableCard}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <UtensilsCrossed size={16} className={styles.iconPrimary} />
            <h2 className={styles.cardTitle}>Danh sách nguyên liệu dị ứng</h2>
          </div>
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
                    <th style={{ width: "30%" }}>
                      <span className={styles.thContent}>
                        <UtensilsCrossed size={13} />
                        <span>Tên nguyên liệu</span>
                      </span>
                    </th>
                    <th style={{ width: "25%" }}>
                      <span className={styles.thContent}>
                        <Tag size={13} />
                        <span>Nhóm nguyên liệu</span>
                      </span>
                    </th>
                    <th style={{ width: "25%" }}>
                      <span className={styles.thContent}>
                        <Users size={13} />
                        <span>Số lượng học sinh bị ảnh hưởng</span>
                      </span>
                    </th>
                    <th style={{ width: "20%" }}>
                      <span className={styles.thContent}>
                        <Clock size={13} />
                        <span>Cập nhật gần nhất</span>
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allergies.map((alg) => (
                    <tr key={alg.id}>
                      {/* Tên nguyên liệu */}
                      <td>
                        <div className={styles.ingredientCell}>
                          <UtensilsCrossed size={14} className={styles.ingCellIcon} />
                          <span className={styles.ingredientName}>{alg.ingredientName}</span>
                          {alg.ingredientCode && (
                            <span className={styles.codeTag}>{alg.ingredientCode}</span>
                          )}
                        </div>
                      </td>

                      {/* Nhóm nguyên liệu */}
                      <td>
                        <span className={styles.categoryBadge}>
                          <Tag size={12} />
                          <span>{alg.category}</span>
                        </span>
                      </td>

                      {/* Số lượng học sinh bị ảnh hưởng */}
                      <td>
                        <span className={styles.countBadge}>
                          <Users size={13} />
                          <span>{alg.affectedCount} học sinh</span>
                        </span>
                      </td>

                      {/* Cập nhật gần nhất */}
                      <td>
                        <div className={styles.dateCell}>
                          <Clock size={13} className={styles.clockIcon} />
                          <span>{alg.updatedAt || classData.updatedAt}</span>
                        </div>
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
                    <div className={styles.mobileIngName}>
                      <UtensilsCrossed size={15} className={styles.iconPrimary} />
                      <span>{alg.ingredientName}</span>
                    </div>
                    <span className={styles.countBadge}>
                      <Users size={12} />
                      <span>{alg.affectedCount} hs</span>
                    </span>
                  </div>
                  <div className={styles.mobileMetaRow}>
                    <span className={styles.metaLabel}>Nhóm:</span>
                    <span className={styles.categoryBadge}>
                      <Tag size={11} />
                      <span>{alg.category}</span>
                    </span>
                  </div>
                  <div className={styles.mobileMetaRow}>
                    <span className={styles.metaLabel}>Cập nhật:</span>
                    <span className={styles.dateCell}>
                      <Clock size={12} className={styles.clockIcon} />
                      <span>{alg.updatedAt || classData.updatedAt}</span>
                    </span>
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
    grade: PropTypes.number.isRequired,
    academicYear: PropTypes.string.isRequired,
    homeroomTeacher: PropTypes.string,
    updatedAt: PropTypes.string,
    allergies: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        ingredientName: PropTypes.string.isRequired,
        ingredientCode: PropTypes.string,
        category: PropTypes.string.isRequired,
        affectedCount: PropTypes.number.isRequired,
        updatedAt: PropTypes.string,
      })
    ).isRequired,
  }).isRequired,
  onBack: PropTypes.func.isRequired,
}
