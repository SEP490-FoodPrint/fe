import React from "react"
import PropTypes from "prop-types"
import { School, Layers, CheckCircle2 } from "lucide-react"
import styles from "./AllergyKPICards.module.scss"

export default function AllergyKPICards({ summary }) {
  const { totalClasses = 0, totalIngredients = 0 } = summary || {}

  const formatNumber = (num) => (num < 10 ? `0${num}` : `${num}`)

  return (
    <div className={styles.kpiGrid}>
      {/* KPI 1: Số lớp có ghi nhận dị ứng */}
      <div className={styles.kpiCard}>
        <div className={styles.kpiHeader}>
          <div className={`${styles.iconWrap} ${styles.iconWrapSchool}`}>
            <School size={22} />
          </div>
          <span className={styles.kpiBadge}>Dữ liệu theo lớp</span>
        </div>
        <div className={styles.kpiBody}>
          <span className={styles.kpiLabel}>Số lớp có ghi nhận dị ứng</span>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiValue}>{formatNumber(totalClasses)}</span>
            <span className={styles.kpiUnit}>lớp học</span>
          </div>
        </div>
        <div className={styles.kpiFooter}>
          <CheckCircle2 size={14} className={styles.footerIcon} />
          <span>Tổng hợp từ phiếu thu thập y bạ đầu năm</span>
        </div>
      </div>

      {/* KPI 2: Số loại nguyên liệu được ghi nhận dị ứng */}
      <div className={styles.kpiCard}>
        <div className={styles.kpiHeader}>
          <div className={`${styles.iconWrap} ${styles.iconWrapIngredient}`}>
            <Layers size={22} />
          </div>
          <span className={styles.kpiBadge}>Danh mục nguyên liệu</span>
        </div>
        <div className={styles.kpiBody}>
          <span className={styles.kpiLabel}>Số loại nguyên liệu được ghi nhận</span>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiValue}>{formatNumber(totalIngredients)}</span>
            <span className={styles.kpiUnit}>loại nguyên liệu</span>
          </div>
        </div>
        <div className={styles.kpiFooter}>
          <CheckCircle2 size={14} className={styles.footerIcon} />
          <span>Căn cứ cảnh báo khi lập và phê duyệt thực đơn</span>
        </div>
      </div>
    </div>
  )
}

AllergyKPICards.propTypes = {
  summary: PropTypes.shape({
    totalClasses: PropTypes.number,
    totalIngredients: PropTypes.number,
  }),
}
