import React from "react"
import styles from "./MenuDishesTable.module.scss"
import { INGREDIENT_CATEGORIES, LINKED_SUPPLIERS, ALL_INGREDIENTS } from "../mockMenuData"

export default function MenuDishesTable({
  dishes,
  onUpdateDish,
  onAddDishRow,
  onRemoveDish
}) {
  // Lấy danh sách NCC theo phân loại nguyên liệu đã chọn
  const getSuppliersByCategory = (category) => {
    if (!category) return []
    return LINKED_SUPPLIERS.filter(sup => sup.categories.includes(category))
  }

  // Lấy danh sách nguyên liệu theo NCC và phân loại
  const getIngredientsBySupplier = (supplierId, category) => {
    if (!supplierId || !category) return []
    return ALL_INGREDIENTS.filter(ing => ing.supplierId === supplierId && ing.category === category)
  }

  // Lấy thông tin chi tiết nguyên liệu đã chọn
  const getSelectedIngredient = (ingredientId) => {
    return ALL_INGREDIENTS.find(i => i.id === ingredientId) || null
  }

  // Xử lý đổi phân loại nguyên liệu
  const handleCategoryChange = (dishId, newCategory) => {
    const suppliers = getSuppliersByCategory(newCategory)
    const firstSupplier = suppliers.length > 0 ? suppliers[0].id : ""
    const ingredients = getIngredientsBySupplier(firstSupplier, newCategory)
    const firstIngredient = ingredients.length > 0 ? ingredients[0].id : ""
    const ingObj = ingredients.length > 0 ? ingredients[0] : null

    onUpdateDish(dishId, {
      ingredientCategory: newCategory,
      supplierId: firstSupplier,
      ingredientId: firstIngredient,
      portionQty: ingObj?.defaultQty || 50,
      unit: ingObj?.unit || "g"
    })
  }

  // Xử lý đổi NCC
  const handleSupplierChange = (dishId, newSupplierId, currentCategory) => {
    const ingredients = getIngredientsBySupplier(newSupplierId, currentCategory)
    const firstIngredient = ingredients.length > 0 ? ingredients[0].id : ""
    const ingObj = ingredients.length > 0 ? ingredients[0] : null

    onUpdateDish(dishId, {
      supplierId: newSupplierId,
      ingredientId: firstIngredient,
      portionQty: ingObj?.defaultQty || 50,
      unit: ingObj?.unit || "g"
    })
  }

  // Xử lý đổi nguyên liệu cụ thể
  const handleIngredientChange = (dishId, newIngredientId) => {
    const ingObj = getSelectedIngredient(newIngredientId)
    onUpdateDish(dishId, {
      ingredientId: newIngredientId,
      portionQty: ingObj?.defaultQty || 50,
      unit: ingObj?.unit || "g"
    })
  }

  return (
    <div className={styles.tableCard}>
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <span className={`material-symbols-outlined ${styles.headerIcon}`}>restaurant</span>
          <div>
            <h2 className={styles.cardTitle}>Món ăn trong thực đơn</h2>
            <p className={styles.cardSubtitle}>
              Tên món nhập tự do theo thực tế; Thành phần chính chọn theo 3 cấp: <strong>Phân loại → Nhà cung cấp liên kết → Nguyên liệu</strong>.
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
                Thành phần chính (Phân loại → NCC → Nguyên liệu) & Đối soát dị ứng
              </th>
              <th className={styles.thQty}>Định lượng / Suất</th>
              <th className={styles.thAction}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((dish, index) => {
              const suppliers = getSuppliersByCategory(dish.ingredientCategory)
              const ingredients = getIngredientsBySupplier(dish.supplierId, dish.ingredientCategory)
              const selectedIng = getSelectedIngredient(dish.ingredientId)
              const hasAllergyConflict = Boolean(selectedIng?.allergen)

              return (
                <tr key={dish.id} className={`${styles.dishRow} ${hasAllergyConflict ? styles.rowConflict : ""}`}>
                  {/* STT */}
                  <td className={styles.tdOrder}>
                    <span className={styles.orderNumber}>{index + 1}</span>
                  </td>

                  {/* Tên món ăn (Tự nhập text) - Trong DB dishes không có cột category */}
                  <td className={styles.tdDishName}>
                    <input
                      type="text"
                      className={styles.dishNameInput}
                      value={dish.name}
                      onChange={(e) => onUpdateDish(dish.id, { name: e.target.value })}
                      placeholder="Nhập tên món ăn..."
                    />
                  </td>

                  {/* Thành phần chính chọn theo 3 bước: Phân loại -> NCC -> Nguyên liệu */}
                  <td className={styles.tdIngredientFlow}>
                    <div className={styles.cascadingSelectors}>
                      {/* Bước 1: Chọn Phân loại nguyên liệu */}
                      <div className={styles.selectorCol}>
                        <label className={styles.miniLabel}>1. Phân loại:</label>
                        <div className={styles.selectWrapper}>
                          <select
                            className={styles.compactSelect}
                            value={dish.ingredientCategory || ""}
                            onChange={(e) => handleCategoryChange(dish.id, e.target.value)}
                          >
                            <option value="">-- Phân loại --</option>
                            {INGREDIENT_CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                          <span className={`material-symbols-outlined ${styles.selectChevron}`}>expand_more</span>
                        </div>
                      </div>

                      {/* Bước 2: Chọn Nhà cung cấp liên kết */}
                      <div className={styles.selectorCol}>
                        <label className={styles.miniLabel}>2. Nhà cung cấp:</label>
                        <div className={styles.selectWrapper}>
                          <select
                            className={styles.compactSelect}
                            value={dish.supplierId || ""}
                            onChange={(e) => handleSupplierChange(dish.id, e.target.value, dish.ingredientCategory)}
                            disabled={!dish.ingredientCategory}
                          >
                            <option value="">-- Chọn NCC --</option>
                            {suppliers.map(sup => (
                              <option key={sup.id} value={sup.id}>{sup.name}</option>
                            ))}
                          </select>
                          <span className={`material-symbols-outlined ${styles.selectChevron}`}>expand_more</span>
                        </div>
                      </div>

                      {/* Bước 3: Chọn Nguyên liệu sạch (KHÔNG hiện sẵn cảnh báo ở select) */}
                      <div className={styles.selectorColWide}>
                        <label className={styles.miniLabel}>3. Nguyên liệu:</label>
                        <div className={styles.selectWrapper}>
                          <select
                            className={`${styles.compactSelect} ${hasAllergyConflict ? styles.selectWarning : ""}`}
                            value={dish.ingredientId || ""}
                            onChange={(e) => handleIngredientChange(dish.id, e.target.value)}
                            disabled={!dish.supplierId}
                          >
                            <option value="">-- Chọn nguyên liệu --</option>
                            {ingredients.map(ing => (
                              /* Tên nguyên liệu sạch sẽ, không hiện sẵn cảnh báo dị ứng trong option */
                              <option key={ing.id} value={ing.id}>
                                {ing.name}
                              </option>
                            ))}
                          </select>
                          <span className={`material-symbols-outlined ${styles.selectChevron}`}>expand_more</span>
                        </div>
                      </div>
                    </div>

                    {/* Kiểm tra dị ứng CHỈ HIỆN KHI ĐÃ CHỌN XONG NGUYÊN LIỆU */}
                    {selectedIng && (
                      <div className={styles.allergyCheckResult}>
                        {hasAllergyConflict ? (
                          <div className={styles.allergyAlertBox}>
                            <span className={`material-symbols-outlined ${styles.alertIcon}`}>warning</span>
                            <div className={styles.alertTextWrap}>
                              <strong className={styles.alertTitle}>
                                Xung đột dị ứng: {selectedIng.allergyWarning}
                              </strong>
                              <span className={styles.alertSub}>
                                → Đã tự động kích hoạt tạo món ăn thay thế ở mục Bố trí suất ăn riêng bên dưới
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className={styles.safeBox}>
                            <span className={`material-symbols-outlined ${styles.safeIcon}`}>check_circle</span>
                            <span>An toàn: Không có học sinh dị ứng thành phần này</span>
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
