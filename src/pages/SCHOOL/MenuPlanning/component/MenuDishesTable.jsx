import React from "react"
import styles from "./MenuDishesTable.module.scss"
import { LINKED_SUPPLIERS } from "../mockMenuData"

const CATEGORIES = [
  "Món mặn",
  "Món mặn phụ",
  "Món canh",
  "Món xào / rau",
  "Cơm / Tinh bột",
  "Tráng miệng"
]

export default function MenuDishesTable({
  dishes,
  onUpdateDish,
  onAddDishRow,
  onRemoveDish
}) {
  // Tìm thông tin nguyên liệu từ id
  const getIngredientInfo = (ingredientId) => {
    for (const sup of LINKED_SUPPLIERS) {
      const found = sup.ingredients.find(i => i.id === ingredientId)
      if (found) return { ...found, supplierName: sup.name }
    }
    return null
  }

  return (
    <div className={styles.tableCard}>
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <span className={`material-symbols-outlined ${styles.headerIcon}`}>restaurant</span>
          <div>
            <h2 className={styles.cardTitle}>Món ăn trong thực đơn</h2>
            <p className={styles.cardSubtitle}>
              Tự nhập tên món ăn và chọn thành phần chính từ danh sách Nhà cung cấp đã liên kết với trường.
            </p>
          </div>
        </div>
        <button
          type="button"
          className={styles.addDishBtn}
          onClick={onAddDishRow}
        >
          <span className="material-symbols-outlined">add_circle</span>
          <span>Thêm món vào thực đơn</span>
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.dishTable}>
          <thead>
            <tr>
              <th className={styles.thOrder}>STT</th>
              <th className={styles.thDishName}>Tên món ăn (Tự nhập) & Phân loại</th>
              <th className={styles.thIngredient}>Thành phần chính (NCC liên kết) & Kiểm tra dị ứng</th>
              <th className={styles.thQty}>Định lượng / Suất</th>
              <th className={styles.thAction}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((dish, index) => {
              const ingInfo = getIngredientInfo(dish.ingredientId)
              const hasAllergy = Boolean(ingInfo?.allergen)

              return (
                <tr key={dish.id} className={`${styles.dishRow} ${hasAllergy ? styles.rowConflict : ""}`}>
                  {/* STT */}
                  <td className={styles.tdOrder}>
                    <span className={styles.orderNumber}>{index + 1}</span>
                  </td>

                  {/* Tên món ăn (Tự nhập text) + Phân loại */}
                  <td className={styles.tdDishName}>
                    <div className={styles.dishNameBlock}>
                      <input
                        type="text"
                        className={styles.dishNameInput}
                        value={dish.name}
                        onChange={(e) => onUpdateDish(dish.id, "name", e.target.value)}
                        placeholder="Nhập tên món ăn..."
                      />
                      <select
                        className={styles.categorySelect}
                        value={dish.category}
                        onChange={(e) => onUpdateDish(dish.id, "category", e.target.value)}
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </td>

                  {/* Thành phần chính chọn từ NCC liên kết & Cảnh báo dị ứng ngay lúc tạo */}
                  <td className={styles.tdIngredient}>
                    <div className={styles.ingredientBlock}>
                      <div className={styles.selectWrapper}>
                        <select
                          className={`${styles.ingredientSelect} ${hasAllergy ? styles.selectWarning : ""}`}
                          value={dish.ingredientId}
                          onChange={(e) => onUpdateDish(dish.id, "ingredientId", e.target.value)}
                        >
                          <option value="">-- Chọn thành phần chính từ NCC liên kết --</option>
                          {LINKED_SUPPLIERS.map(sup => (
                            <optgroup key={sup.id} label={`🏢 ${sup.name} (${sup.badge})`}>
                              {sup.ingredients.map(ing => (
                                <option key={ing.id} value={ing.id}>
                                  {ing.name} {ing.allergen ? `[⚠️ Chứa dị nguyên ${ing.allergen}]` : ""}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <span className={`material-symbols-outlined ${styles.selectChevron}`}>expand_more</span>
                      </div>

                      {/* Hiển thị nhà cung cấp đang cấp */}
                      {ingInfo && (
                        <div className={styles.supplierTagRow}>
                          <span className={styles.supplierPill}>
                            <span className="material-symbols-outlined">storefront</span>
                            NCC: {ingInfo.supplierName}
                          </span>
                        </div>
                      )}

                      {/* Kiểm tra dị ứng ngay lúc chọn nguyên liệu */}
                      {hasAllergy ? (
                        <div className={styles.allergyAlertPill}>
                          <span className={`material-symbols-outlined ${styles.alertIcon}`}>warning</span>
                          <div className={styles.alertTextGroup}>
                            <strong className={styles.alertTitle}>
                              Xung đột: {ingInfo.allergyWarning}
                            </strong>
                            <span className={styles.alertHint}>
                              → Đã đưa vào cấu hình Bố trí suất ăn riêng bên dưới
                            </span>
                          </div>
                        </div>
                      ) : (
                        ingInfo && (
                          <div className={styles.safePill}>
                            <span className={`material-symbols-outlined ${styles.safeIcon}`}>check_circle</span>
                            <span>An toàn: Không có học sinh dị ứng thành phần này</span>
                          </div>
                        )
                      )}
                    </div>
                  </td>

                  {/* Định lượng / Suất */}
                  <td className={styles.tdQty}>
                    <div className={styles.qtyGroup}>
                      <input
                        type="number"
                        min="1"
                        className={styles.qtyInput}
                        value={dish.portionQty}
                        onChange={(e) => onUpdateDish(dish.id, "portionQty", Number(e.target.value) || 0)}
                      />
                      <select
                        className={styles.unitSelect}
                        value={dish.unit}
                        onChange={(e) => onUpdateDish(dish.id, "unit", e.target.value)}
                      >
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="ml">ml</option>
                        <option value="quả">quả</option>
                        <option value="cái">cái</option>
                      </select>
                      <span className={styles.portionLabel}>/suất</span>
                    </div>
                  </td>

                  {/* Thao tác */}
                  <td className={styles.tdAction}>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => onRemoveDish(dish.id)}
                      title="Xóa món khỏi thực đơn"
                    >
                      <span className="material-symbols-outlined">delete_outline</span>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer bảng: Nút thêm món */}
      <div className={styles.tableFooter}>
        <button
          type="button"
          className={styles.addInlineBtn}
          onClick={onAddDishRow}
        >
          <span className="material-symbols-outlined">add</span>
          <span>Thêm món ăn khác vào thực đơn</span>
        </button>
      </div>
    </div>
  )
}
