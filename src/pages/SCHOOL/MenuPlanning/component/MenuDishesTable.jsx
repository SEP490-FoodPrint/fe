import React from "react"
import styles from "./MenuDishesTable.module.scss"

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
  dishes = [],
  onUpdateDish,
  onAddDishRow,
  onRemoveDish,
  onOpenPicker,
  onRemoveIngredientFromDish,
  onOpenDishPicker,
}) {
  return (
    <div className={styles.tableCard}>
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <span className={`material-symbols-outlined ${styles.headerIcon}`}>restaurant</span>
          <div>
            <h2 className={styles.cardTitle}>Món ăn trong thực đơn</h2>
            <p className={styles.cardSubtitle}>
              Chọn món từ <strong>Danh sách món ăn học đường</strong> (đã định lượng sẵn theo suất).
            </p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.addDishBtn}
            onClick={() => onOpenDishPicker && onOpenDishPicker(null)}
            title="Mở danh sách món ăn để chọn món"
          >
            <span className="material-symbols-outlined">add_circle</span>
            <span>+ Chọn món từ Danh sách món ăn</span>
          </button>
        </div>
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
            {dishes.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "30px 14px", color: "#64748b" }}>
                  Chưa có món ăn nào trong ca này. Hãy bấm <strong>"+ Chọn món từ Danh sách món ăn"</strong> để bắt đầu.
                </td>
              </tr>
            ) : (
              dishes.map((dish, index) => {
                // Hỗ trợ mảng nhiều nguyên liệu
                const ingredientIds = dish.ingredientIds || (dish.ingredientId ? [dish.ingredientId] : [])
                const selectedIngs = ingredientIds
                  .map(id => dish.ingredientDetails?.find(i => i.id === id))
                  .filter(Boolean)

                // Kiểm tra dị ứng trên tất cả các nguyên liệu đã chọn hoặc trên chính dish.allergen
                const conflictIngs = selectedIngs.filter(i => Boolean(i.allergen))
                const hasAllergyConflict = conflictIngs.length > 0 || Boolean(dish.allergen)

                return (
                  <tr key={dish.id} className={`${styles.dishRow} ${hasAllergyConflict ? styles.rowConflict : ""}`}>
                    {/* STT */}
                    <td className={styles.tdOrder}>
                      <span className={styles.orderNumber}>{index + 1}</span>
                    </td>

                    {/* Tên món ăn: Chọn từ Kho món ăn (KHÔNG NHẬP TEXT TỰ DO) */}
                    <td className={styles.tdDishName}>
                      {dish.name ? (
                        <div className={styles.dishPickedCard}>
                          <div className={styles.dishTitleRow}>
                            <strong className={styles.dishPickedName}>{dish.name}</strong>
                            <button
                              type="button"
                              className={styles.changeDishBtn}
                              onClick={() => onOpenDishPicker && onOpenDishPicker(dish.id)}
                              title="Đổi sang món khác trong kho"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>sync</span>
                              <span>Đổi</span>
                            </button>
                          </div>
                          {dish.categoryLabel && (
                            <span className={styles.categoryPill}>{dish.categoryLabel}</span>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          className={styles.pickDishBtn}
                          onClick={() => onOpenDishPicker && onOpenDishPicker(dish.id)}
                        >
                          <span className="material-symbols-outlined">add_circle_outline</span>
                          <span>Chọn món từ Kho</span>
                        </button>
                      )}
                    </td>

                    {/* Thành phần chính & Đối soát dị ứng */}
                    <td className={styles.tdIngredientFlow}>
                      {selectedIngs.length === 0 ? (
                        <button
                          type="button"
                          className={styles.pickIngredientBtn}
                          onClick={() => onOpenPicker(dish.id)}
                        >
                          <span className="material-symbols-outlined">add_circle_outline</span>
                          <span>Chọn nguyên liệu từ NCC liên kết</span>
                        </button>
                      ) : (
                        <div className={`${styles.ingUnifiedCard} ${hasAllergyConflict ? styles.cardConflict : styles.cardSafe}`}>
                          <div className={styles.ingTopRow}>
                            <div className={styles.ingChipsContainer}>
                              {selectedIngs.map((ing) => {
                                const supplier = ing.supplierName ? { name: ing.supplierName } : null
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
                                        <span className={styles.supplierName}>{supplier?.name || ing.supplierName || "NCC"}</span>
                                        {supplier?.badge && (
                                          <span className={styles.supplierBadge}>{supplier.badge}</span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Nút xóa nguyên liệu */}
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

                            <button
                              type="button"
                              className={styles.iconChangeBtn}
                              onClick={() => onOpenPicker(dish.id)}
                              title="Thay đổi / Thêm nguyên liệu"
                              aria-label="Thay đổi nguyên liệu"
                            >
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                          </div>

                          {/* Cảnh báo dị ứng */}
                          {hasAllergyConflict && (
                            <div className={styles.ingConflictBanner}>
                              <div className={styles.conflictLeft}>
                                <span className={`material-symbols-outlined ${styles.warnIcon}`}>warning</span>
                                <span>
                                  {dish.allergen
                                    ? `Món chứa dị nguyên: ${dish.allergen}`
                                    : `Chứa dị nguyên: ${conflictIngs.map(i => i.allergen).join(", ")}`}
                                </span>
                              </div>
                              <span className={styles.conflictStudentsTag}>Cần suất ăn riêng</span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Định lượng / Suất */}
                    <td className={styles.tdQty}>
                      {(dish.ingredientStandards || []).map((line, lineIndex) => (
                      <div key={line.ingredientId} className={styles.qtyControlGroup}>
                        <span>{dish.ingredientDetails?.find(item => item.id === line.ingredientId)?.name || "Nguyên liệu"}</span>
                        <input
                          type="number"
                          className={styles.qtyInput}
                          value={line.quantityPerPortion ?? ""}
                          aria-label={`Định lượng ${dish.ingredientDetails?.find(item => item.id === line.ingredientId)?.name || "nguyên liệu"} mỗi suất`}
                          onChange={(e) => onUpdateDish(dish.id, { ingredientStandards: dish.ingredientStandards.map((item, index) => index === lineIndex ? { ...item, quantityPerPortion: e.target.value } : item) })}
                          min="0.001"
                          step="0.001"
                        />
                        <span className={styles.unitBadge}>{line.unit} / suất</span>
                      </div>
                      ))}
                    </td>

                    {/* Thao tác xóa */}
                    <td className={styles.tdAction}>
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => onRemoveDish(dish.id)}
                        title="Xóa món ăn"
                      >
                        <span className="material-symbols-outlined">delete_outline</span>
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
