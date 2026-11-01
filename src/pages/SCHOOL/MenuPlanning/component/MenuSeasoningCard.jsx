import React from "react"
import styles from "./MenuSeasoningCard.module.scss"

export default function MenuSeasoningCard({
  seasonings,
  portionCount
}) {
  return (
    <div className={styles.seasoningCard}>
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <span className={`material-symbols-outlined ${styles.headerIcon}`}>inventory_2</span>
          <div>
            <h2 className={styles.cardTitle}>
              Gia vị dùng chung từ kho trường ({portionCount} suất)
            </h2>
            <p className={styles.cardSubtitle}>
              Khai báo chung cho toàn bữa ăn học đường (tính 1 lần theo tổng suất ăn, không nhân số lượng món).
            </p>
          </div>
        </div>
        <span className={styles.stockNoticePill}>Kho nội bộ trường</span>
      </div>

      <div className={styles.seasoningGrid}>
        {seasonings.map((seas) => {
          // Tính tổng nhu cầu
          const totalRaw = (seas.portionQty * portionCount)
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

          const isStockSufficient = seas.stockAvailable > 0

          return (
            <div key={seas.id} className={styles.itemCard}>
              <div className={styles.itemTop}>
                <span className={styles.itemName}>{seas.name}</span>
                <span className={`${styles.stockBadge} ${isStockSufficient ? styles.stockOk : styles.stockWarning}`}>
                  {isStockSufficient ? "Đủ tồn kho" : "Cần bổ sung"}
                </span>
              </div>

              <div className={styles.calcRow}>
                <div className={styles.calcCol}>
                  <span className={styles.label}>Định lượng:</span>
                  <span className={styles.val}>{seas.portionQty} {seas.unit}/suất</span>
                </div>
                <div className={styles.calcCol}>
                  <span className={styles.label}>Tổng nhu cầu:</span>
                  <span className={styles.valPrimary}>{totalDisplay}</span>
                </div>
              </div>

              <div className={styles.itemFooter}>
                <span className={styles.stockText}>
                  Khả dụng trong kho: <strong>{seas.stockAvailable} {seas.stockUnit}</strong>
                </span>
                <span className={styles.locationText}>{seas.warehouseLocation}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

