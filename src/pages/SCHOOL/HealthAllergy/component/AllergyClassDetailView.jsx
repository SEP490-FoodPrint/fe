import React from "react"
import PropTypes from "prop-types"
import {
  ArrowLeft,
  School,
  Calendar,
  UserCheck,
  AlertCircle,
  Clock,
  ShieldCheck,
  Tag,
} from "lucide-react"
import styles from "./AllergyClassDetailView.module.scss"

export default function AllergyClassDetailView({ classData, onBack }) {
  if (!classData) return null

  const allergies = classData.allergies || []
  const formatNumber = (num) => (num < 10 ? `0${num}` : `${num}`)

  return (
    <div className={styles.detailWrapper}>
      {/* 1. Header & Navigation */}
      <div className={styles.topHeader}>
        <div className={styles.breadcrumbAndTitle}>
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <button
              type="button"
              className={styles.breadcrumbLink}
              onClick={onBack}
            >
              Thông tin dị ứng
            </button>
            <span className={styles.separator}>/</span>
            <span className={styles.currentCrumb}>Chi tiết dị ứng</span>
          </nav>
          <div className={styles.headingRow}>
            <h1 className={styles.title}>Chi tiết dị ứng theo lớp</h1>
            <span className={styles.classBadge}>{classData.className}</span>
            <span className={styles.yearBadge}>Năm học {classData.academicYear}</span>
          </div>
        </div>

        <button
          type="button"
          className={styles.backBtn}
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          <span>Quay lại</span>
        </button>
      </div>

      {/* 2. Class Information (Gọn gàng, vừa đủ thông tin cốt lõi) */}
      <div className={styles.classInfoCard}>
        <div className={styles.infoCol}>
          <div className={styles.iconCircle}>
            <School size={18} />
          </div>
          <div className={styles.infoText}>
            <span className={styles.infoLabel}>Lớp học</span>
            <span className={styles.infoValue}>
              {classData.className} — Khối {classData.grade}
            </span>
          </div>
        </div>

        <div className={styles.infoDivider}></div>

        <div className={styles.infoCol}>
          <div className={styles.iconCircle}>
            <Calendar size={18} />
          </div>
          <div className={styles.infoText}>
            <span className={styles.infoLabel}>Năm học</span>
            <span className={styles.infoValue}>{classData.academicYear}</span>
          </div>
        </div>

        {classData.homeroomTeacher && (
          <>
            <div className={styles.infoDivider}></div>
            <div className={styles.infoCol}>
              <div className={styles.iconCircle}>
                <UserCheck size={18} />
              </div>
              <div className={styles.infoText}>
                <span className={styles.infoLabel}>Giáo viên thu thập</span>
                <span className={styles.infoValue}>{classData.homeroomTeacher}</span>
              </div>
            </div>
          </>
        )}

        <div className={styles.infoDivider}></div>

        <div className={styles.infoCol}>
          <div className={`${styles.iconCircle} ${styles.alertIconCircle}`}>
            <AlertCircle size={18} />
          </div>
          <div className={styles.infoText}>
            <span className={styles.infoLabel}>Nguyên liệu ghi nhận</span>
            <span className={`${styles.infoValue} ${styles.alertValue}`}>
              {formatNumber(allergies.length)} loại
            </span>
          </div>
        </div>
      </div>

      {/* 3. Allergy Information (Bảng hiển thị trực quan, làm nổi bật số lượng) */}
      <div className={styles.allergySection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Danh sách nguyên liệu ghi nhận dị ứng</h2>
          <span className={styles.badgeReadonly}>
            <ShieldCheck size={14} />
            Dữ liệu tổng hợp theo lớp
          </span>
        </div>

        {allergies.length === 0 ? (
          <div className={styles.emptyCard}>
            <p>Lớp hiện tại không có ghi nhận nguyên liệu dị ứng nào.</p>
          </div>
        ) : (
          <div className={styles.tableCard}>
            <table className={styles.allergyTable}>
              <thead>
                <tr>
                  <th style={{ width: "30%" }}>Tên nguyên liệu</th>
                  <th style={{ width: "25%" }}>Nhóm nguyên liệu</th>
                  <th style={{ width: "25%" }}>Số lượng học sinh bị ảnh hưởng</th>
                  <th style={{ width: "20%" }}>Cập nhật gần nhất</th>
                </tr>
              </thead>
              <tbody>
                {allergies.map((alg) => (
                  <tr key={alg.id}>
                    {/* Tên nguyên liệu */}
                    <td>
                      <div className={styles.ingredientNameRow}>
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
                        {alg.category}
                      </span>
                    </td>

                    {/* Số lượng học sinh bị ảnh hưởng (Làm nổi bật trực quan) */}
                    <td>
                      <div className={styles.countWrap}>
                        <span className={styles.countBadge}>
                          {formatNumber(alg.affectedCount)} học sinh
                        </span>
                      </div>
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
        )}

        {/* Thẻ hiển thị trên Mobile (Responsive) */}
        <div className={styles.mobileAllergyCards}>
          {allergies.map((alg) => (
            <div key={alg.id} className={styles.mobileCard}>
              <div className={styles.mobileCardHeader}>
                <span className={styles.mobileIngredientName}>{alg.ingredientName}</span>
                <span className={styles.countBadge}>
                  {formatNumber(alg.affectedCount)} học sinh
                </span>
              </div>
              <div className={styles.mobileMetaRow}>
                <span className={styles.mobileMetaLabel}>Nhóm nguyên liệu:</span>
                <span className={styles.mobileMetaVal}>{alg.category}</span>
              </div>
              <div className={styles.mobileMetaRow}>
                <span className={styles.mobileMetaLabel}>Cập nhật gần nhất:</span>
                <span className={styles.mobileMetaVal}>{alg.updatedAt || classData.updatedAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Ghi chú tóm tắt nghiệp vụ (Ngắn gọn, rõ ràng, không thừa thãi) */}
      <div className={styles.compactNoteBox}>
        <ShieldCheck size={16} className={styles.noteIcon} />
        <span className={styles.noteText}>
          Dữ liệu dị ứng được tổng hợp theo lớp phục vụ đối soát nguyên liệu khi kiểm duyệt thực đơn. Hệ thống không lưu trữ thông tin danh tính cá nhân của học sinh.
        </span>
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
