import React from "react"
import styles from "./MenuDishesTable.module.scss"
import { LINKED_SUPPLIERS, ALL_INGREDIENTS } from "../mockMenuData"

// Helper icon cho phân loại
const getCategoryIcon = (cat) => {
  switch (cat) {
    case "Thịt & Gia cầm": return "lunch_dining"
    case "Thủy hải sản": return "set_meal"
    case "Rau củ quả": return "eco"
    case "Trứng gia cầm": return "egg"
    case "Tinh bột & Ngũ cốc": return "grain"
    default: return "restaurant"
  }
}

export default function MenuDishesTable({
  dishes,
  onUpdateDish,
  onAddDishRow,
  onRemoveDish,
  onOpenPicker
}) {
  return (
    <div className={styles.tableCard}>
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <span className={`material-symbols-outlined ${styles.headerIcon}`}>restaurant</span>
          <div>
            <h2 className={styles.cardTitle}>Món ăn trong thực đơn</h2>
            <p className={styles.cardSubtitle}>
              Tên món ăn nhập tự do. Thành phần chính chọn qua Popup lọc theo: <strong>Phân loại → Nhà cung cấp liên kết → Nguyên liệu</strong>.
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
              <th className={styles.thDishName}>Tên món ăn (Tự do nhập text)</th>
              <th className={styles.thIngredientFlow}>
                Thành phần chính (Từ NCC liên kết) & Đối soát dị ứng
              </th>
              <th className={styles.thQty}>Định lượng / Suất</th>
              <th className={styles.thAction}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((dish, index) => {
              const selectedIng = ALL_INGREDIENTS.find(i => i.id === dish.ingredientId) || null
              const supplier = selectedIng ? LINKED_SUPPLIERS.find(s => s.id === selectedIng.supplierId) : null
              const hasAllergyConflict = Boolean(selectedIng?.allergen)

              return (
                <tr key={dish.id} className={`${styles.dishRow} ${hasAllergyConflict ? styles.rowConflict : ""}`}>
                  {/* STT */}
                  <td className={styles.tdOrder}>
                    <span className={styles.orderNumber}>{index + 1}</span>
                  </td>

                  {/* Tên món ăn (Tự do nhập text) */}
                  <td className={styles.tdDishName}>
                    <input
                      type="text"
                      className={styles.dishNameInput}
                      value={dish.name}
                      onChange={(e) => onUpdateDish(dish.id, { name: e.target.value })}
                      placeholder="Nhập tên món ăn..."
                    />
                  </td>

                  {/* Thành phần chính chọn qua Popup & Đối soát dị ứng */}
                  <td className={styles.tdIngredientFlow}>
                    {!selectedIng ? (
                      /* Trường hợp chưa chọn nguyên liệu */
                      <button
                        type="button"
                        className={styles.pickIngredientBtn}
                        onClick={() => onOpenPicker(dish.id)}
                      >
                        <span className="material-symbols-outlined">add_circle_outline</span>
                        <span>Chọn nguyên liệu từ NCC liên kết (Phân loại → NCC → Nguyên liệu)</span>
                      </button>
                    ) : (
                      /* Trường hợp đã chọn nguyên liệu */
                      <div className={styles.selectedIngredientWrap}>
                        <div className={styles.ingredientInfoBox}>
                          <div className={styles.ingLeft}>
                            <div className={styles.iconCircle}>
                              <span className={`material-symbols-outlined ${styles.ingIcon}`}>
                                {getCategoryIcon(selectedIng.category)}
                              </span>
                            </div>
                            <div className={styles.ingDetails}>
                              <div className={styles.ingNameRow}>
                                <strong className={styles.ingName}>{selectedIng.name}</strong>
                                <span className={styles.categoryTag}>{selectedIng.category}</span>
                              </div>
                              <div className={styles.supplierRow}>
                                <span className={`material-symbols-outlined ${styles.verifyIcon}`}>verified</span>
                                <span className={styles.supplierName}>
                                  {supplier?.name || "NCC liên kết"}
                                </span>
                                {supplier?.badge && (
                                  <span className={styles.badgeTag}>{supplier.badge}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            className={styles.changeBtn}
                            onClick={() => onOpenPicker(dish.id)}
                            title="Thay đổi nguyên liệu khác"
                          >
                            <span className="material-symbols-outlined">swap_horiz</span>
                            <span>Thay đổi</span>
                          </button>
                        </div>

                        {/* Kiểm tra dị ứng: CHỈ HIỆN KHI ĐÃ CHỌN XONG NGUYÊN LIỆU */}
                        {hasAllergyConflict ? (
                          <div className={styles.allergyAlertBox}>
                            <span className={`material-symbols-outlined ${styles.alertIcon}`}>warning</span>
                            <div className={styles.alertTextWrap}>
                              <strong className={styles.alertTitle}>
                                Cảnh báo dị ứng: {selectedIng.allergyWarning}
                              </strong>
                              <span className={styles.alertSub}>
                                → Bắt buộc bố trí suất ăn riêng thay thế (đã tự động kích hoạt bên dưới)
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className={styles.safeBox}>
                            <span className={`material-symbols-outlined ${styles.safeIcon}`}>check_circle</span>
                            <span>An toàn: Không phát hiện học sinh dị ứng thành phần này</span>
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Định lượng / Suất */}
                  <td className={styles.tdQty}>
                    <div className={styles.qtyGroup}>
                      <input
                        type="number"
                        min="1"
                        className={styles.qtyInput}
                        value={dish.portionQty}
                        onChange={(e) => onUpdateDish(dish.id, { portionQty: Number(e.target.value) || 0 })}
                      />
                      <select
                        className={styles.unitSelect}
                        value={dish.unit}
                        onChange={(e) => onUpdateDish(dish.id, { unit: e.target.value })}
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

      {/* Footer bảng */}
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
