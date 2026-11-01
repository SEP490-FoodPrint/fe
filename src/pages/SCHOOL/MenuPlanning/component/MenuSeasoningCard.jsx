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
              Cán bộ Y tế quy định định lượng gia vị cho mỗi suất ăn. Hệ thống tự động tính toán tổng lượng Bếp cần sử dụng cho toàn bữa.
            </p>
          </div>
        </div>
        <span className={styles.rolePill}>
          <span className="material-symbols-outlined">rule</span>
          Quy chuẩn định lượng dinh dưỡng
        </span>
      </div>

      <div className={styles.seasoningGrid}>
        {seasonings.map((seas) => {
          // Tính tổng nhu cầu cho toàn bữa ăn
          const totalRaw = (seas.portionQty || 0) * portionCount
          let totalDisplay = ""
          if (seas.unit === "ml") {
            const liters = (totalRaw / 1000).toFixed(2).replace(/\.?0+$/, "")
            totalDisplay = `${liters} lít`
          } else if (seas.unit === "g") {
            const kgs = (totalRaw / 1000).toFixed(2).replace(/\.?0+$/, "")
            totalDisplay = `${kgs} kg`
          } else {
            totalDisplay = `${totalRaw} ${seas.unit}`
          }

          return (
            <div key={seas.id} className={styles.itemCard}>
              <div className={styles.itemHead}>
                <span className={styles.itemName}>{seas.name}</span>
                <span className={styles.unitBadge}>{seas.unit}</span>
              </div>

              <div className={styles.portionInputGroup}>
                <label className={styles.inputLabel}>Định lượng / suất ăn:</label>
                <div className={styles.inputControlWrap}>
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
                  <span className={styles.inputUnitText}>{seas.unit}/suất</span>
                </div>
              </div>

              <div className={styles.totalCalcBox}>
                <span className={styles.totalLabel}>Tổng nhu cầu ({portionCount} suất):</span>
                <strong className={styles.totalValue}>{totalDisplay}</strong>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
