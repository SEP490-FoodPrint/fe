import React from "react"
import { Layers } from "lucide-react"
import styles from "./BatchIngredientsCard.module.scss"

export default function BatchIngredientsCard({ ingredients = [] }) {
  return (
    <section className={styles.ingredientsCard}>
      {/* Header Thẻ */}
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.iconBox}>
            <Layers size={17} />
          </div>
          <h2 className={styles.cardTitle}>Nguyên liệu xuất kho cho lô</h2>
        </div>
        <span className={styles.countBadge}>
          {ingredients.length} loại nguyên liệu
        </span>
      </div>

      {/* 1. Desktop Table View (>= 640px) */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thIndex}>#</th>
              <th className={styles.thName}>Tên nguyên liệu</th>
              <th className={styles.thLot}>Mã lô xuất kho</th>
              <th className={styles.thQty}>Định lượng sử dụng</th>
              <th className={styles.thExpiry}>Hạn sử dụng (HSD)</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.emptyCell}>
                  Chưa có thông tin chi tiết lô nguyên liệu hoặc lô chưa xuất kho.
                </td>
              </tr>
            ) : (
              ingredients.map((item, index) => {
                const qtyVal = item.quantity || item.plannedQty || "—"
                const unitVal = item.unit || "kg"
                return (
                  <tr key={item.id || index} className={styles.row}>
                    <td className={styles.tdIndex}>{index + 1}</td>
                    <td className={styles.tdName}>
                      <span className={styles.nameText}>{item.name}</span>
                    </td>
                    <td className={styles.tdLot}>
                      <span className={styles.lotCode}>{item.lotCode || "—"}</span>
                    </td>
                    <td className={styles.tdQty}>
                      <strong className={styles.qtyNumber}>{qtyVal}</strong>
                      <span className={styles.qtyUnit}>{unitVal}</span>
                    </td>
                    <td className={styles.tdExpiry}>
                      <span className={styles.expiryDate}>{item.expiryDate || "—"}</span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 2. Mobile Card List (< 640px) */}
      <div className={styles.mobileCardList}>
        {ingredients.length === 0 ? (
          <div className={styles.emptyCell}>
            Chưa có thông tin chi tiết lô nguyên liệu hoặc lô chưa xuất kho.
          </div>
        ) : (
          ingredients.map((item, index) => {
            const qtyVal = item.quantity || item.plannedQty || "—"
            const unitVal = item.unit || "kg"
            return (
              <div key={item.id || index} className={styles.mobileItemCard}>
                <div className={styles.mobileTopRow}>
                  <strong className={styles.mobileNameText}>{item.name}</strong>
                  <span className={styles.lotCode}>{item.lotCode}</span>
                </div>
                <div className={styles.mobileBottomRow}>
                  <div className={styles.mobileField}>
                    <span className={styles.fieldLabel}>Định lượng:</span>
                    <strong className={styles.qtyNumber}>{qtyVal} {unitVal}</strong>
                  </div>
                  <div className={styles.mobileField}>
                    <span className={styles.fieldLabel}>HSD:</span>
                    <span className={styles.expiryDate}>{item.expiryDate}</span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
