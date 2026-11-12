import React from "react"
import styles from "./MenuDetailSeasoningsCard.module.scss"

export default function MenuDetailSeasoningsCard({ seasonings = [] }) {
  if (!seasonings || seasonings.length === 0) {
    return null
  }

  return (
    <div className={styles.seasoningsCard}>
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <span className={`material-symbols-outlined ${styles.headerIcon}`}>soup_kitchen</span>
          <div className={styles.titleWithBadge}>
            <h2 className={styles.cardTitle}>Định lượng gia vị / suất</h2>
            <span className={styles.countBadge}>{seasonings.length} loại</span>
          </div>
        </div>
      </div>

      <div className={styles.seasoningsGrid}>
        {seasonings.map((s, idx) => {
          const name = typeof s === "string" ? s : s.name
          const qty = typeof s === "object" ? s.portionQty || s.quantityPerPortion : null
          const unit = typeof s === "object" ? s.unit || "g" : ""

          return (
            <div key={s.id || idx} className={styles.seasoningItem}>
              <span className={styles.seasoningName}>{name}</span>
              {qty != null && (
                <span className={styles.portionQtyBadge}>
                  {qty} {unit} / suất
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
