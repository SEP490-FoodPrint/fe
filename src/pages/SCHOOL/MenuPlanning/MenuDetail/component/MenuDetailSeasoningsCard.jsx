import React from "react"
import styles from "./MenuDetailSeasoningsCard.module.scss"

export default function MenuDetailSeasoningsCard({ seasonings = [] }) {
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

  return (
    <div className={styles.seasoningsCard}>
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <span className={`material-symbols-outlined ${styles.headerIcon}`}>soup_kitchen</span>
          <div>
            <h2 className={styles.cardTitle}>Gia vị sử dụng (Kho nguyên liệu nhà trường)</h2>
            <p className={styles.cardSubtitle}>
              Danh mục gia vị chuẩn do Bộ phận Quản lý nguyên liệu & Kho nhập. Định lượng theo một suất ăn.
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
          return (
            <div key={idx} className={styles.seasoningItem}>
              <div className={styles.itemHeader}>
                <span className={styles.seasoningName}>{s.name}</span>
                <span className={styles.portionQtyBadge}>
                  {s.portionQty} {s.unit}/suất
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
