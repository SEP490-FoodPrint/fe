import React from "react"
import PropTypes from "prop-types"
import { Building2, ClipboardCheck, MessageSquareWarning, ShieldAlert, TrendingDown, TrendingUp } from "lucide-react"
import styles from "./KpiGrid.module.scss"

const icons = { menu: ClipboardCheck, complaint: MessageSquareWarning, supplier: Building2, safety: ShieldAlert }

function KpiGrid({ items }) {
  return (
    <section className={styles.grid} aria-label="Chỉ số vận hành chính">
      {items.map((item, index) => {
        const Icon = icons[item.type]
        const positive = item.type === "supplier" || item.type === "safety"
        return (
          <article className={`${styles.card} ${styles[item.type]}`} key={item.type}>
            <div className={styles.topRow}><div className={styles.icon}><Icon size={21} /></div><span className={styles.index}>0{index + 1}</span></div>
            <p className={styles.label}>{item.label}</p>
            <div className={styles.metric}><strong>{String(item.value).padStart(2, "0")}</strong><span>{item.unit}</span></div>
            <div className={styles.footer}>
              <span>{item.note}</span>
              <small className={positive ? styles.positive : styles.attention}>{positive ? <TrendingDown size={13} /> : <TrendingUp size={13} />}{item.trend}</small>
            </div>
          </article>
        )
      })}
    </section>
  )
}

KpiGrid.propTypes = { items: PropTypes.arrayOf(PropTypes.object).isRequired }
export default KpiGrid
