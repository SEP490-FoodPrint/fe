import React from "react"
import styles from "./MenuDishesTable.module.scss"

export default function MenuDishesTable({
  dishes,
  onOpenAddModal,
  onRemoveDish,
  onUpdatePortionQty
}) {
  return (
    <div className={styles.tableCard}>
      <div className={styles.cardHeader}>
        <div className={styles.headerTitleGroup}>
          <div className={styles.titleWithIcon}>
            <span className={`material-symbols-outlined ${styles.headerIcon}`}>restaurant</span>
            <h2 className={styles.cardTitle}>Món ăn trong thực đơn</h2>
          </div>
          <span className={styles.dishCountBadge}>{dishes.length} món đã chọn</span>
        </div>
        <button
          type="button"
          className={styles.addDishBtn}
          onClick={onOpenAddModal}
        >
          <span className={`material-symbols-outlined ${styles.btnIcon}`}>add_circle</span>
          <span>Thêm món vào thực đơn</span>
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.dishTable}>
          <thead>
            <tr>
              <th className={styles.thDish}>Món ăn & Thể loại</th>
              <th className={styles.thIngredients}>Thành phần chính & Nguồn cung</th>
              <th className={styles.thPortion}>Định lượng / Suất</th>
              <th className={styles.thAction}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((dish, index) => {
              const isConflict = dish.hasAllergyConflict

              return (
                <tr key={dish.id} className={`${styles.tableRow} ${isConflict ? styles.rowConflict : ""}`}>
                  {/* Cột 1: Món ăn & thể loại */}
                  <td className={styles.tdDish}>
                    <div className={styles.dishInfo}>
                      <span className={styles.dishOrder}>{index + 1}.</span>
                      <div>
                        <div className={styles.dishName}>{dish.name}</div>
                        <span className={`${styles.categoryBadge} ${styles[dish.categoryType] || styles.defaultCategory}`}>
                          {dish.category}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Cột 2: Thành phần & NCC & Dị ứng */}
                  <td className={styles.tdIngredients}>
                    <div className={styles.ingredientsList}>
                      {dish.ingredients.map((ing) => (
                        <div key={ing.id} className={styles.ingredientRow}>
                          <span className={styles.ingBullet}>•</span>
                          <span className={styles.ingName}>{ing.name}</span>
                          <span className={styles.supplierTag}>({ing.supplier})</span>
                          <span className={styles.ingQty}>— {ing.portionQty} {ing.unit}/suất</span>
                        </div>
                      ))}
                    </div>

                    {/* Huy hiệu cảnh báo dị ứng */}
                    {isConflict ? (
                      <div className={styles.conflictBadge}>
                        <span className={`material-symbols-outlined ${styles.alertIcon}`}>warning</span>
                        <span>Xung đột: {dish.allergyCount} học sinh dị ứng {dish.allergenName} ({dish.allergyClasses?.join(", ")})</span>
                      </div>
                    ) : (
                      <div className={styles.safeBadge}>
                        <span className={`material-symbols-outlined ${styles.safeIcon}`}>check_circle</span>
                        <span>An toàn: Không ghi nhận xung đột dị ứng</span>
                      </div>
                    )}
                  </td>

                  {/* Cột 3: Định lượng / Suất */}
                  <td className={styles.tdPortion}>
                    <div className={styles.portionSummary}>
                      <span className={styles.portionText}>
                        {dish.ingredients.map(i => `${i.portionQty}${i.unit}`).join(" + ")}
                      </span>
                      <span className={styles.portionSubtext}>cho 1 suất chuẩn</span>
                    </div>
                  </td>

                  {/* Cột 4: Thao tác */}
                  <td className={styles.tdAction}>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => onRemoveDish(dish.id)}
                      title="Xóa món khỏi thực đơn"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

