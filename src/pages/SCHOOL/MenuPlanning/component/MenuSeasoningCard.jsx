import React from "react"
import styles from "./MenuSeasoningCard.module.scss"

export default function MenuSeasoningCard({
  seasonings,
  portionCount,
  onUpdateSeasoning
}) {
  return (
    <div className={styles.seasoningCard}>
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <span className={`material-symbols-outlined ${styles.headerIcon}`}>soup_kitchen</span>
          <div>
            <h2 className={styles.cardTitle}>
              Gia vị dùng chung cho bữa ăn ({portionCount} suất)
            </h2>
            <p className={styles.cardSubtitle}>
              Cán bộ Y tế thiết lập định lượng quy chuẩn cho 1 suất ăn học đường (dùng chung toàn bữa, không tính theo từng món).
            </p>
          </div>
        </div>
        <span className={styles.rolePill}>
          <span className="material-symbols-outlined">rule</span>
          Quy chuẩn theo suất
        </span>
      </div>

      <div className={styles.seasoningGrid}>
        {seasonings.map((seas) => {
          return (
            <div key={seas.id} className={styles.itemCard}>
              <div className={styles.itemTop}>
                <span className={styles.itemName}>{seas.name}</span>
                <span className={styles.unitBadge}>{seas.unit}</span>
              </div>

              <div className={styles.portionControl}>
                <span className={styles.controlLabel}>Định lượng:</span>
                <div className={styles.inputWrap}>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className={styles.portionInput}
                    value={seas.portionQty}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value)
                      onUpdateSeasoning && onUpdateSeasoning(seas.id, isNaN(val) ? 0 : val)
                    }}
                  />
                  <span className={styles.unitSuffix}>{seas.unit}/suất</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
