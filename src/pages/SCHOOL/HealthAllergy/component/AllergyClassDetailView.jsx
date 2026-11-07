import React from "react"
import PropTypes from "prop-types"
import {
  ArrowLeft,
  ShieldAlert,
  School,
  Verified,
  Info,
  Users,
  ShieldCheck,
  Eye,
  UtensilsCrossed,
  Soup,
  Shield,
  FileCheck2,
  Lock,
} from "lucide-react"
import styles from "./AllergyClassDetailView.module.scss"

export default function AllergyClassDetailView({ classData, onBack }) {
  if (!classData) return null

  const allergies = classData.allergies || []
  const totalAllergiesCount = allergies.length
  // Tính tổng số lượt học sinh ghi nhận trong lớp này
  const totalAffectedStudentsInClass = allergies.reduce(
    (sum, item) => sum + (item.affectedCount || 0),
    0
  )

  const formatNumber = (num) => (num < 10 ? `0${num}` : `${num}`)

  return (
    <div className={styles.detailContainer}>
      {/* 1. Top Navigation & Breadcrumbs */}
      <div className={styles.topNavSection}>
        <div className={styles.breadcrumbAndTitle}>
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <button
              type="button"
              className={styles.breadcrumbLink}
              onClick={onBack}
            >
              <ShieldAlert size={16} />
              <span>Thông tin dị ứng</span>
            </button>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span className={styles.breadcrumbCurrent}>Chi tiết dị ứng theo lớp</span>
          </nav>

          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>Chi tiết dị ứng theo lớp</h1>
            <span className={styles.classPill}>
              <span className={styles.pulsingDot}></span>
              {classData.className} — Khối {classData.grade}
            </span>
            <span className={styles.yearPill}>
              Năm học {classData.academicYear}
            </span>
          </div>
        </div>

        <div>
          <button
            type="button"
            className={styles.backButtonTop}
            onClick={onBack}
          >
            <ArrowLeft size={18} />
            <span>Quay lại danh sách</span>
          </button>
        </div>
      </div>

      {/* 2. Class Summary & Meta Highlights (Bento Grid) */}
      <div className={styles.bentoGrid}>
        {/* Main Class Profile Card (8 cols) */}
        <div className={styles.profileCard}>
          <div>
            <div className={styles.profileHeader}>
              <div className={styles.schoolInfoGroup}>
                <div className={styles.schoolIconWrap}>
                  <School size={24} />
                </div>
                <div className={styles.schoolTextGroup}>
                  <h2 className={styles.classNameBig}>{classData.className}</h2>
                  <span className={styles.schoolSubName}>
                    {classData.schoolName || "Trường THCS & Tiểu học Đoàn Thị Điểm"}
                  </span>
                </div>
              </div>
              <span className={styles.badgeLookupMode}>Chế độ tra cứu</span>
            </div>

            <div className={styles.metaGrid}>
              <div className={styles.metaBox}>
                <span className={styles.metaLabel}>Cấp khối</span>
                <span className={styles.metaMainVal}>Khối {classData.grade}</span>
                <span className={styles.metaSubVal}>Bậc Tiểu học</span>
              </div>
              <div className={styles.metaBox}>
                <span className={styles.metaLabel}>Vị trí phòng</span>
                <span className={styles.metaMainVal}>
                  {classData.roomLocation || `Phòng ${classData.grade}02`}
                </span>
                <span className={styles.metaSubVal}>
                  {classData.roomBuilding || "Tầng 3, Dãy A"}
                </span>
              </div>
              <div className={styles.metaBox}>
                <span className={styles.metaLabel}>Niên khóa</span>
                <span className={styles.metaMainVal}>{classData.academicYear}</span>
                <span className={styles.metaSubVal}>{classData.semester || "Học kỳ 1"}</span>
              </div>
              <div className={styles.metaBox}>
                <span className={styles.metaLabel}>Tình trạng hồ sơ</span>
                <span className={`${styles.metaMainVal} ${styles.verifiedColor}`}>
                  <Verified size={16} />
                  {classData.profileStatus || "Chuẩn hóa"}
                </span>
                <span className={styles.metaSubVal}>
                  {classData.verificationStatus || "Đã đối chiếu BGH"}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.profileFooterNote}>
            <Info size={16} className={styles.infoIcon} />
            <span>
              Dữ liệu phi danh tính: Phục vụ giám sát độc quyền danh mục nguyên liệu phục vụ ăn bán trú.
            </span>
          </div>
        </div>

        {/* Aggregate Statistic Card (4 cols) */}
        <div className={styles.statsCard}>
          {/* Decorative Backdrop Geometry */}
          <div className={styles.decorCircle1}></div>
          <div className={styles.decorCircle2}></div>

          <div className={styles.statsContent}>
            <div className={styles.statsHeader}>
              <span className={styles.statsSubtitle}>Thống kê lớp học</span>
              <FileCheck2 size={20} className={styles.statsIconHeader} />
            </div>
            <span className={styles.statsPrompt}>Tổng số nguyên liệu ghi nhận:</span>
            <div className={styles.statsBigValueRow}>
              <span className={styles.statsBigNum}>
                {formatNumber(totalAllergiesCount)}
              </span>
              <span className={styles.statsBigUnit}>loại nguyên liệu</span>
            </div>
          </div>

          <div className={styles.statsBottomBanner}>
            <div className={styles.usersIconWrap}>
              <Users size={18} />
            </div>
            <div className={styles.usersTextGroup}>
              <span className={styles.usersLabel}>Tổng học sinh ghi nhận</span>
              <span className={styles.usersVal}>
                {formatNumber(totalAffectedStudentsInClass)} học sinh
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Operational Protocol Banner */}
      <div className={styles.protocolBanner}>
        <div className={styles.protocolLeft}>
          <div className={styles.protocolIconWrap}>
            <ShieldCheck size={22} />
          </div>
          <div className={styles.protocolTextGroup}>
            <span className={styles.protocolTitle}>
              Chính sách bảo mật y tế &amp; Quy định rà soát
            </span>
            <p className={styles.protocolDesc}>
              Hệ thống loại bỏ hoàn toàn danh tính cá nhân. Mọi điều phối bếp ăn tuân theo phân bổ mã lớp và định mức an toàn dinh dưỡng nhóm.
            </p>
          </div>
        </div>
        <div className={styles.protocolRight}>
          <span className={styles.badgeViewOnly}>
            <Eye size={15} />
            Chỉ xem hồ sơ
          </span>
        </div>
      </div>

      {/* 4. Allergy Information Detail Cards */}
      <div className={styles.allergySection}>
        <div className={styles.sectionHeadingRow}>
          <div className={styles.sectionTitleGroup}>
            <div className={styles.accentBar}></div>
            <h2 className={styles.sectionHeading}>
              Danh sách nguyên liệu ghi nhận dị ứng trong lớp
            </h2>
          </div>
          <span className={styles.itemCountText}>
            Hiển thị {formatNumber(totalAllergiesCount)}/{formatNumber(totalAllergiesCount)} bản ghi
          </span>
        </div>

        {/* Danh sách các nguyên liệu dị ứng */}
        {allergies.map((alg) => (
          <div key={alg.id} className={styles.ingredientCard}>
            {/* Upper Card Info */}
            <div className={styles.upperCardRow}>
              <div className={styles.ingredientMainInfo}>
                <div className={styles.ingredientIconWrap}>
                  <UtensilsCrossed size={28} />
                </div>
                <div className={styles.ingredientDetails}>
                  <div className={styles.ingredientTitleWrap}>
                    <h3 className={styles.ingredientName}>{alg.ingredientName}</h3>
                    <span className={styles.codePill}>
                      Mã NL: {alg.ingredientCode || "ING-NUT-004"}
                    </span>
                    <span className={styles.datePill}>
                      Cập nhật: {alg.updatedAt}
                    </span>
                  </div>
                  <div className={styles.categoryRow}>
                    <span className={styles.categoryLabel}>Nhóm nguyên liệu:</span>
                    <span className={styles.categoryValue}>{alg.category}</span>
                  </div>
                </div>
              </div>

              {/* Affected Count Visual Highlight */}
              <div className={styles.affectedCountBox}>
                <div className={styles.countTextWrap}>
                  <span className={styles.countMainLabel}>Số lượng học sinh ảnh hưởng</span>
                  <span className={styles.countRatio}>
                    Tỷ lệ trong lớp: {alg.affectedCount} / {classData.totalStudents || 34} học sinh
                  </span>
                </div>
                <div className={styles.countBadgeSquare}>
                  <span className={styles.squareNumber}>{formatNumber(alg.affectedCount)}</span>
                  <span className={styles.squareUnit}>H.Sinh</span>
                </div>
              </div>
            </div>

            {/* Ingredient Attributes & Specification Table (3 cols) */}
            <div className={styles.attributesGrid}>
              <div className={styles.attrItem}>
                <span className={styles.attrLabel}>Nguồn gốc nguyên liệu phổ biến</span>
                <span className={styles.attrMainVal}>
                  {alg.commonSources || "Hạt khô, dầu đậu phộng, bơ đậu phộng"}
                </span>
                <span className={styles.attrSubVal}>
                  {alg.commonSourcesDetail || "Thường có trong các loại sốt chấm, bánh nướng"}
                </span>
              </div>
              <div className={styles.attrItem}>
                <span className={styles.attrLabel}>Định mức thay thế an toàn</span>
                <span className={`${styles.attrMainVal} ${styles.safeValColor}`}>
                  {alg.safeSubstitutes || "Hạt hướng dương, hạt bí ngô đã kiểm định"}
                </span>
                <span className={styles.attrSubVal}>
                  {alg.safeSubstitutesDetail || "Đã được chứng nhận trong danh mục nhà trường"}
                </span>
              </div>
              <div className={styles.attrItem}>
                <span className={styles.attrLabel}>Trạng thái xác thực</span>
                <span className={styles.attrMainVal}>
                  <span className={styles.greenDot}></span>
                  {alg.verificationNote || "Hồ sơ y tế đầu năm hoàn tất"}
                </span>
                <span className={styles.attrSubVal}>
                  {alg.verificationSubnote || "Xác nhận phối hợp giữa GVCN & Phụ huynh"}
                </span>
              </div>
            </div>

            {/* Operational Kitchen Note Callout */}
            <div className={styles.kitchenCallout}>
              <div className={styles.kitchenIconWrap}>
                <Soup size={18} />
              </div>
              <div className={styles.kitchenContent}>
                <span className={styles.kitchenTitle}>
                  Ghi chú điều phối bếp (Operational note cho việc lên thực đơn)
                </span>
                <p className={styles.kitchenText}>
                  {alg.kitchenNote ||
                    `Cần đối soát và loại trừ ${alg.ingredientName} khi lên thực đơn hoặc phân bổ suất ăn cho ${classData.className}. Đối với khay ăn định suất phục vụ tại phòng ăn số 2, nhân viên phục vụ bếp cần gắn thẻ đánh dấu riêng biệt nhằm đảm bảo an toàn tuyệt đối cho bàn ăn ${classData.className}.`}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 5. Historical & Compliance Safety Notice Box */}
      <div className={styles.complianceNoticeBox}>
        <div className={styles.shieldIconWrap}>
          <Shield size={24} />
        </div>
        <div className={styles.complianceContent}>
          <h4 className={styles.complianceTitle}>Hộp lưu ý an toàn dinh dưỡng học đường</h4>
          <p className={styles.complianceDesc}>
            Thông tin tổng hợp được cập nhật từ hồ sơ đầu năm học do Ban Giám Hiệu và Phụ huynh phối hợp khai báo. Nhân viên y tế sử dụng thông tin này làm căn cứ rà soát danh sách món ăn khi kiểm duyệt thực đơn hàng tuần và kiểm tra nguồn thực phẩm tươi sống tại kho tiếp nhận của bếp ăn trung tâm.
          </p>
          <div className={styles.compliancePillsRow}>
            <span className={styles.compliancePill}>
              <Verified size={13} />
              Quy chuẩn QCVN 12-1:2011/BYT
            </span>
            <span className={styles.complianceSeparator}>•</span>
            <span className={styles.compliancePill}>
              <ShieldCheck size={13} />
              Lưu mẫu thức ăn 24 giờ bắt buộc
            </span>
            <span className={styles.complianceSeparator}>•</span>
            <span className={styles.compliancePill}>
              <FileCheck2 size={13} />
              Đồng bộ với phân hệ Quản lý Nhà cung cấp
            </span>
          </div>
        </div>
      </div>

      {/* 6. Bottom Action Footer (Read-Only) */}
      <div className={styles.bottomFooter}>
        <div className={styles.lockNotice}>
          <Lock size={16} className={styles.lockIcon} />
          <span>
            Dữ liệu lưu trữ bảo mật bởi Phòng Y tế trường học. Mọi sửa đổi thông tin cần thông qua biên bản cập nhật hồ sơ y bạ BGH.
          </span>
        </div>
        <button
          type="button"
          className={styles.backButtonBottom}
          onClick={onBack}
        >
          <ArrowLeft size={18} />
          <span>Quay lại danh sách lớp</span>
        </button>
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
    schoolName: PropTypes.string,
    roomLocation: PropTypes.string,
    roomBuilding: PropTypes.string,
    semester: PropTypes.string,
    totalStudents: PropTypes.number,
    profileStatus: PropTypes.string,
    verificationStatus: PropTypes.string,
    allergies: PropTypes.array.isRequired,
  }).isRequired,
  onBack: PropTypes.func.isRequired,
}
