import React from "react"
import PropTypes from "prop-types"
import { School, Layers } from "lucide-react"
import styles from "./AllergyKPICards.module.scss"

export default function AllergyKPICards({ summary }) {
  const { totalClasses = 0, totalIngredients = 0 } = summary || {}
  const formatNumber = (num) => (num < 10 ? `0${num}` : `${num}`)

  return (
    <div className={styles.statsRow}>
      {/* KPI 1: Số lớp có ghi nhận dị ứng */}
      <div className={styles.statCard}>
        <div className={styles.statIconWrap}>
          <School size={20} className={styles.iconSchool} />
        </div>
        <div className={styles.statContent}>
          <div className={styles.statValueRow}>
            <span className={styles.statNum}>{formatNumber(totalClasses)}</span>
            <span className={styles.statUnit}>lớp</span>
          </div>
          <span className={styles.statLabel}>Số lớp có ghi nhận dị ứng</span>
        </div>
      </div>

      {/* KPI 2: Số loại nguyên liệu được ghi nhận dị ứng */}
      <div className={styles.statCard}>
        <div className={styles.statIconWrap}>
          <Layers size={20} className={styles.iconIngredient} />
        </div>
        <div className={styles.statContent}>
          <div className={styles.statValueRow}>
            <span className={styles.statNum}>{formatNumber(totalIngredients)}</span>
            <span className={styles.statUnit}>loại</span>
          </div>
          <span className={styles.statLabel}>Số loại nguyên liệu dị ứng</span>
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
