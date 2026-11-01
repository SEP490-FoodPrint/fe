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
  onOpenPicker,
  onRemoveIngredientFromDish
}) {
  return (
    <div className={styles.tableCard}>
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <span className={`material-symbols-outlined ${styles.headerIcon}`}>restaurant</span>
          <div>
            <h2 className={styles.cardTitle}>Món ăn trong thực đơn</h2>

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
              <th className={styles.thDishName}>Tên món ăn</th>
              <th className={styles.thIngredientFlow}>
                Thành phần chính (NCC liên kết) & Đối soát dị ứng
              </th>
              <th className={styles.thQty}>Định lượng / Suất</th>
              <th className={styles.thAction}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((dish, index) => {
              // Hỗ trợ mảng nhiều nguyên liệu
              const ingredientIds = dish.ingredientIds || (dish.ingredientId ? [dish.ingredientId] : [])
              const selectedIngs = ingredientIds
                .map(id => ALL_INGREDIENTS.find(i => i.id === id))
                .filter(Boolean)

              // Kiểm tra dị ứng trên tất cả các nguyên liệu đã chọn
              const conflictIngs = selectedIngs.filter(i => Boolean(i.allergen))
              const hasAllergyConflict = conflictIngs.length > 0

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

                  {/* Thành phần chính (chọn được nhiều nguyên liệu) & Đối soát dị ứng */}
                  <td className={styles.tdIngredientFlow}>
                    {selectedIngs.length === 0 ? (
                      /* Trường hợp chưa có nguyên liệu nào */
                      <button
                        type="button"
                        className={styles.pickIngredientBtn}
                        onClick={() => onOpenPicker(dish.id)}
                      >
                        <span className="material-symbols-outlined">add_circle_outline</span>
                        <span>Chọn nguyên liệu từ NCC liên kết</span>
                      </button>
                    ) : (
                      /* Trường hợp đã chọn 1 hoặc nhiều nguyên liệu: Khối thống nhất */
                      <div className={`${styles.ingUnifiedCard} ${hasAllergyConflict ? styles.cardConflict : styles.cardSafe}`}>
                        <div className={styles.ingTopRow}>
                          <div className={styles.ingChipsContainer}>
                            {selectedIngs.map((ing) => {
                              const supplier = LINKED_SUPPLIERS.find(s => s.id === ing.supplierId)
                              return (
                                <div key={ing.id} className={styles.ingChipItem}>
                                  <div className={styles.iconBox}>
                                    <span className={`material-symbols-outlined ${styles.ingIcon}`}>
                                      {getCategoryIcon(ing.category)}
                                    </span>
                                  </div>
                                  <div className={styles.nameAndTags}>
                                    <div className={styles.titleWrap}>
                                      <strong className={styles.ingName}>{ing.name}</strong>
                                      <span className={styles.categoryBadge}>{ing.category}</span>
                                    </div>
                                    <div className={styles.supplierWrap}>
                                      <span className={`material-symbols-outlined ${styles.verifyIcon}`}>verified</span>
                                      <span className={styles.supplierName}>{supplier?.name || "NCC"}</span>
                                      {supplier?.badge && (
                                        <span className={styles.supplierBadge}>{supplier.badge}</span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Nút xóa nhanh nguyên liệu đơn lẻ */}
                                  <button
                                    type="button"
                                    className={styles.removeChipBtn}
                                    onClick={() => onRemoveIngredientFromDish && onRemoveIngredientFromDish(dish.id, ing.id)}
                                    title={`Xóa ${ing.name} khỏi món này`}
                                    aria-label="Xóa nguyên liệu"
                                  >
                                    <span className="material-symbols-outlined">close</span>
                                  </button>
                                </div>
                              )
                            })}
                          </div>

                          {/* Nút THAY ĐỔI / THÊM: CHỈ ĐỂ ICON CHO DỄ NHÌN theo yêu cầu */}
                          <button
                            type="button"
                            className={styles.iconChangeBtn}
                            onClick={() => onOpenPicker(dish.id)}
                            title="Thay đổi / Thêm nguyên liệu"
                            aria-label="Thay đổi nguyên liệu"
                          >
                            <span className="material-symbols-outlined">edit_note</span>
                          </button>
                        </div>

                        {/* Hàng đối soát dị ứng: CHỈ HIỆN KHI ĐÃ CHỌN XONG NGUYÊN LIỆU */}
                        <div className={styles.allergySection}>
                          {hasAllergyConflict ? (
                            <div className={styles.allergyBanner}>
                              <span className={`material-symbols-outlined ${styles.alertIcon}`}>warning</span>
                              <div className={styles.alertContent}>
                                <span className={styles.alertMainText}>
                                  <strong>Cảnh báo dị ứng ({conflictIngs.length} thành phần):</strong>{" "}
                                  {conflictIngs.map(ci => ci.allergyWarning || `${ci.name} (${ci.allergen})`).join(" • ")}
                                </span>
                                <span className={styles.alertSubText}>
                                  → Tự động kích hoạt tạo suất ăn riêng thay thế ở mục bên dưới
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className={styles.safeBanner}>
                              <span className={`material-symbols-outlined ${styles.safeIcon}`}>check_circle</span>
                              <span className={styles.safeText}>
                                An toàn: Không phát hiện học sinh dị ứng các thành phần này
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Định lượng / Suất */}
                  <td className={styles.tdQty}>
                    <div className={styles.qtyControlGroup}>
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

                  {/* Thao tác xóa món */}
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
