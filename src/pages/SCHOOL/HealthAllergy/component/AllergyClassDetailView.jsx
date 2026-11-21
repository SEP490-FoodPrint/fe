import React from "react"
import { classAffectedStudents, classAllergyGroups } from "src/services/AllergyService"
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
  // Nhóm dị ứng: mỗi nhóm là các nguyên liệu một nhóm học sinh cùng tránh + số học sinh của nhóm
  const groups = classAllergyGroups(allergies)

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

        <div className={styles.summaryDivider}></div>

        <div className={styles.summaryCol}>
          <span className={styles.summaryLabel}>Học sinh dị ứng</span>
          <div className={styles.summaryValueRow}>
            <Users size={16} className={styles.iconWarning} />
            <span className={`${styles.summaryValue} ${styles.warningValue}`}>
              {classAffectedStudents(allergies)} học sinh
            </span>
          </div>
        </div>
      </div>

      {/* 3. Bảng Danh sách nguyên liệu dị ứng (Thuần chữ, Học sinh ảnh hưởng căn giữa) */}
      <div className={styles.tableCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Nhóm dị ứng của lớp</h2>
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
                    <th style={{ width: "12%" }}>
                      <span>Nhóm</span>
                    </th>
                    <th style={{ width: "68%" }}>
                      <span>Nguyên liệu cùng tránh</span>
                    </th>
                    <th style={{ width: "20%", textAlign: "center" }}>
                      <span>Số học sinh</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => (
                    <tr key={group.groupNo}>
                      <td>
                        <span className={styles.categoryText}>Nhóm {group.groupNo}</span>
                      </td>
                      <td>
                        {group.items.map((item) => (
                          <div key={item.ingredientEntryId}>
                            <span className={styles.ingredientName}>{item.name}</span>
                            {item.supplierName && (
                              <span className={styles.categoryText}>{` · ${item.supplierName}`}</span>
                            )}
                          </div>
                        ))}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className={styles.ingredientName}>{group.count}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className={styles.mobileList}>
              {groups.map((group) => (
                <div key={group.groupNo} className={styles.mobileItem}>
                  <div className={styles.mobileItemHeader}>
                    <span className={styles.mobileIngName}>
                      {group.items.map((item) => item.name).join(" + ")}
                    </span>
                  </div>
                  <div className={styles.mobileMetaRow}>
                    <span className={styles.metaLabel}>Nhóm {group.groupNo} · Số học sinh:</span>
                    <span className={styles.categoryText}>{group.count}</span>
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
        groupNo: PropTypes.number,
        ingredientName: PropTypes.string.isRequired,
        category: PropTypes.string,
        supplierName: PropTypes.string,
        affectedCount: PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
  onBack: PropTypes.func.isRequired,
}
