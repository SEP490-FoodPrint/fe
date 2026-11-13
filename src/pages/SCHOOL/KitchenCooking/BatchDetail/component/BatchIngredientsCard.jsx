import React from "react"
import { Layers } from "lucide-react"
import styles from "./BatchIngredientsCard.module.scss"

export default function BatchIngredientsCard({ ingredients = [] }) {
  const hasIngredients = Array.isArray(ingredients) && ingredients.length > 0

  return (
    <section className={styles.ingredientsCard}>
      {/* Header Section */}
      <div className={styles.cardHeader}>
        <div className={styles.titleWrap}>
          <Layers size={16} className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>
            Nguyên liệu xuất kho ({ingredients.length})
          </h2>
        </div>
      </div>

      {!hasIngredients ? (
        /* Empty State tinh gọn, không render bảng trống */
        <div className={styles.emptyContainer}>
          <p className={styles.emptyText}>
            Lô chế biến chưa có thông tin lô nguyên liệu xuất kho.
          </p>
        </div>
      ) : (
        <>
          {/* 1. Desktop Table View (>= 640px) */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.thIndex}>#</th>
                  <th className={styles.thName}>Tên nguyên liệu</th>
                  <th className={styles.thLot}>Mã lô xuất kho</th>
                  <th className={styles.thQty}>Số lượng</th>
                  <th className={styles.thExpiry}>Hạn sử dụng (HSD)</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((item, index) => {
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
                })}
              </tbody>
            </table>
          </div>

          {/* 2. Mobile Card List (< 640px) */}
          <div className={styles.mobileCardList}>
            {ingredients.map((item, index) => {
              const qtyVal = item.quantity || item.plannedQty || "—"
              const unitVal = item.unit || "kg"
              return (
                <div key={item.id || index} className={styles.mobileItemCard}>
                  <div className={styles.mobileTopRow}>
                    <strong className={styles.mobileNameText}>{item.name}</strong>
                    <span className={styles.lotCode}>{item.lotCode || "—"}</span>
                  </div>
                  <div className={styles.mobileBottomRow}>
                    <div className={styles.mobileField}>
                      <span className={styles.fieldLabel}>Số lượng:</span>
                      <strong className={styles.qtyNumber}>{qtyVal} {unitVal}</strong>
                    </div>
                    <div className={styles.mobileField}>
                      <span className={styles.fieldLabel}>HSD:</span>
                      <span className={styles.expiryDate}>{item.expiryDate || "—"}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </section>
  )
}
