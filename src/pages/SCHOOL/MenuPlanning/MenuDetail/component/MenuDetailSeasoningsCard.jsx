import React from "react"
import styles from "./MenuDetailSeasoningsCard.module.scss"

export default function MenuDetailSeasoningsCard({ seasonings = [], portionCount = 210 }) {
  // Chuẩn hóa danh sách gia vị
  const normalizedSeasonings = (seasonings && seasonings.length > 0 ? seasonings : [
    "Dầu thực vật Neptune 100% nguyên chất",
    "Nước mắm cá cơm Phú Quốc 40N",
    "Muối tinh I-ốt Visalco",
    "Hạt nêm Knorr thịt thăn xương ống"
  ]).map((s, idx) => {
    if (typeof s === "string") {
      const defaultQtys = [5, 3, 2, 2]
      const defaultUnits = ["ml", "ml", "g", "g"]
      return {
        id: `seas-${idx}`,
        name: s,
        portionQty: defaultQtys[idx % defaultQtys.length],
        unit: defaultUnits[idx % defaultUnits.length]
      }
    }
    return s
  })

  // Tính tổng nhu cầu
  const calculateTotal = (qty, unit, count) => {
    const total = qty * count
    if (unit === "g" && total >= 1000) {
      return `${(total / 1000).toFixed(2)} kg`
    }
    if (unit === "ml" && total >= 1000) {
      return `${(total / 1000).toFixed(2)} lít`
    }
    return `${total.toLocaleString()} ${unit}`
  }

  return (
    <div className={styles.seasoningsCard}>
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <span className={`material-symbols-outlined ${styles.headerIcon}`}>soup_kitchen</span>
          <div>
            <h2 className={styles.cardTitle}>Gia vị sử dụng (Kho nguyên liệu nhà trường)</h2>
            <p className={styles.cardSubtitle}>
              Danh mục gia vị chuẩn do Bộ phận Quản lý nguyên liệu & Kho nhập. Định lượng tính cho ca {portionCount} suất.
            </p>
          </div>
        </div>
        <div className={styles.warehouseTag}>
          <span className="material-symbols-outlined text-[15px] text-[#0a8066]">warehouse</span>
          <span>Kho Vinschool Food Standard</span>
        </div>
      </div>

      <div className={styles.seasoningsGrid}>
        {normalizedSeasonings.map((s, idx) => {
          const totalDemand = calculateTotal(s.portionQty, s.unit, portionCount)

          return (
            <div key={idx} className={styles.seasoningItem}>
              <div className={styles.itemHeader}>
                <span className={styles.seasoningName}>{s.name}</span>
                <span className={styles.portionQtyBadge}>
                  {s.portionQty} {s.unit}/suất
                </span>
              </div>
              <div className={styles.itemFooter}>
                <span className={styles.demandLabel}>Tổng nhu cầu ca:</span>
                <span className={styles.demandValue}>{totalDemand}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
