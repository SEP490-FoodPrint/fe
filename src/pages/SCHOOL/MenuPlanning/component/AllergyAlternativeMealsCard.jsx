import React from "react"
import styles from "./AllergyAlternativeMealsCard.module.scss"
import { LINKED_SUPPLIERS, ALL_INGREDIENTS } from "../mockMenuData"

export default function AllergyAlternativeMealsCard({
  conflictDishes,
  portionCount,
  substituteDish,
  onChangeSubstituteDish
}) {
  const hasConflict = conflictDishes && conflictDishes.length > 0

  if (!hasConflict) {
    return (
      <div className={styles.safeContainer}>
        <div className={styles.safeLeft}>
          <span className={`material-symbols-outlined ${styles.safeIcon}`}>verified</span>
          <div>
            <h3 className={styles.safeTitle}>Bố trí suất ăn: 100% học sinh dùng thực đơn tiêu chuẩn</h3>
            <p className={styles.safeDesc}>
              Tất cả các món ăn đã chọn đều an toàn, không chứa dị nguyên thuộc hồ sơ sức khỏe của học sinh toàn trường.
            </p>
          </div>
        </div>
        <span className={styles.safeBadge}>Không cần suất riêng</span>
      </div>
    )
  }

  // Tổng hợp số suất dị ứng từ các món xung đột
  const totalAllergyPortions = conflictDishes.reduce((acc, d) => acc + (d.allergyCount || 12), 0)
  const standardPortions = Math.max(0, portionCount - totalAllergyPortions)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleWithIcon}>
          <span className={`material-symbols-outlined ${styles.headerIcon}`}>assignment_late</span>
          <div>
            <h3 className={styles.title}>
              Bố trí suất ăn riêng cho học sinh dị ứng ({totalAllergyPortions} suất)
            </h3>
            <p className={styles.subtitle}>
              Hệ thống bắt buộc chuẩn bị suất ăn thay thế riêng biệt cho các học sinh có hồ sơ dị ứng.
            </p>
          </div>
        </div>
        <span className={styles.tag}>Quy chuẩn an toàn học đường</span>
      </div>

      <div className={styles.mainGrid}>
        {/* Cột trái: Phân bổ số suất & Danh sách lớp bị ảnh hưởng */}
        <div className={styles.leftCol}>
          <div className={styles.portionSplitBox}>
            <div className={styles.portionRow}>
              <span className={styles.rowLabel}>Suất ăn tiêu chuẩn (Toàn trường):</span>
              <strong className={styles.stdPortionVal}>{standardPortions} suất</strong>
            </div>
            <div className={styles.portionRow}>
              <span className={styles.rowLabel}>Suất ăn riêng thay thế (Dị ứng):</span>
              <strong className={styles.allergyPortionVal}>{totalAllergyPortions} suất</strong>
            </div>
          </div>

          <div className={styles.conflictListBox}>
            <div className={styles.conflictListTitle}>
              <span className="material-symbols-outlined">group</span>
              <span>Chi tiết học sinh dị ứng theo lớp:</span>
            </div>
            {conflictDishes.map((dish) => (
              <div key={dish.id} className={styles.conflictClassItem}>
                <div className={styles.conflictDishName}>Món xung đột: <strong>{dish.name}</strong></div>
                <div className={styles.classChips}>
                  <span className={styles.classChip}>Lớp 1A: 4 HS</span>
                  <span className={styles.classChip}>Lớp 2B: 5 HS</span>
                  <span className={styles.classChip}>Lớp 3C: 3 HS</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cột phải: Form tạo món thay thế cho suất dị ứng */}
        <div className={styles.rightCol}>
          <div className={styles.substituteFormCard}>
            <div className={styles.formHead}>
              <span className={`material-symbols-outlined ${styles.formIcon}`}>fastfood</span>
              <h4 className={styles.formTitle}>Tạo món ăn thay thế cho {totalAllergyPortions} suất dị ứng</h4>
            </div>

            <div className={styles.formBody}>
              {/* Tên món thay thế (Tự nhập text) */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Tên món thay thế (Tự nhập) <span className={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.subInput}
                  value={substituteDish.name}
                  onChange={(e) => onChangeSubstituteDish("name", e.target.value)}
                  placeholder="Ví dụ: Thịt bò xào rau củ / Gà áp chảo sốt mật ong..."
                />
              </div>

              {/* Thành phần chính thay thế từ NCC liên kết */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Thành phần chính thay thế (NCC liên kết) <span className={styles.req}>*</span>
                </label>
                <div className={styles.selectWrapper}>
                  <select
                    className={styles.subSelect}
                    value={substituteDish.ingredientId}
                    onChange={(e) => onChangeSubstituteDish("ingredientId", e.target.value)}
                  >
                    <option value="">-- Chọn nguyên liệu thay thế an toàn --</option>
                    {LINKED_SUPPLIERS.map(sup => {
                      const safeIngredients = ALL_INGREDIENTS.filter(
                        ing => ing.supplierId === sup.id && !ing.allergen
                      )
                      if (safeIngredients.length === 0) return null

                      return (
                        <optgroup key={sup.id} label={`🏢 ${sup.name}`}>
                          {safeIngredients.map(ing => (
                            <option key={ing.id} value={ing.id}>
                              {ing.name} ({sup.name})
                            </option>
                          ))}
                        </optgroup>
                      )
                    })}
                  </select>
                  <span className={`material-symbols-outlined ${styles.chevronIcon}`}>expand_more</span>
                </div>
              </div>

              {/* Định lượng / suất */}
              <div className={styles.qtyRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Định lượng / suất</label>
                  <div className={styles.qtyInputs}>
                    <input
                      type="number"
                      min="1"
                      className={styles.qtyNumInput}
                      value={substituteDish.portionQty}
                      onChange={(e) => onChangeSubstituteDish("portionQty", Number(e.target.value) || 0)}
                    />
                    <select
                      className={styles.qtyUnitSelect}
                      value={substituteDish.unit}
                      onChange={(e) => onChangeSubstituteDish("unit", e.target.value)}
                    >
                      <option value="g">g</option>
                      <option value="ml">ml</option>
                      <option value="quả">quả</option>
                    </select>
                    <span className={styles.qtyPerPortionLabel}>/suất</span>
                  </div>
                </div>

                <div className={styles.subNotice}>
                  <span className={`material-symbols-outlined ${styles.tagIcon}`}>local_offer</span>
                  <span>Tem dán nhận diện: <strong>Màu vàng cam</strong> ghi rõ tên lớp</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
