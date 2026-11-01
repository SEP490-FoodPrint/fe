import React, { useState, useMemo } from "react"
import styles from "./IngredientPickerModal.module.scss"
import { INGREDIENT_CATEGORIES, LINKED_SUPPLIERS, ALL_INGREDIENTS } from "../mockMenuData"

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

export default function IngredientPickerModal({
  isOpen,
  onClose,
  onSelectIngredient,
  currentIngredientId,
  dishContextName = "",
  onlySafe = false
}) {
  const [selectedCategory, setSelectedCategory] = useState("ALL")
  const [selectedSupplierId, setSelectedSupplierId] = useState("ALL")
  const [searchTerm, setSearchTerm] = useState("")

  // Danh sách NCC theo phân loại đang chọn
  const availableSuppliers = useMemo(() => {
    if (selectedCategory === "ALL") return LINKED_SUPPLIERS
    return LINKED_SUPPLIERS.filter(sup => sup.categories.includes(selectedCategory))
  }, [selectedCategory])

  // Lọc nguyên liệu theo các tiêu chí (Phân loại -> NCC -> Search text)
  const filteredIngredients = useMemo(() => {
    return ALL_INGREDIENTS.filter(ing => {
      // Nếu chỉ lấy nguyên liệu an toàn (cho món thay thế)
      if (onlySafe && ing.allergen) return false

      // Lọc theo phân loại
      if (selectedCategory !== "ALL" && ing.category !== selectedCategory) return false

      // Lọc theo NCC
      if (selectedSupplierId !== "ALL" && ing.supplierId !== selectedSupplierId) return false

      // Tìm kiếm theo tên
      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase().trim()
        const matchName = ing.name.toLowerCase().includes(term)
        const matchCat = ing.category.toLowerCase().includes(term)
        if (!matchName && !matchCat) return false
      }

      return true
    })
  }, [selectedCategory, selectedSupplierId, searchTerm, onlySafe])

  // Reset bộ lọc
  const handleResetFilters = () => {
    setSelectedCategory("ALL")
    setSelectedSupplierId("ALL")
    setSearchTerm("")
  }

  // Khi chọn 1 nguyên liệu
  const handlePick = (ing) => {
    onSelectIngredient(ing)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* Header Modal */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleWrap}>
            <span className={`material-symbols-outlined ${styles.headerIcon}`}>inventory_2</span>
            <div>
              <h2 className={styles.modalTitle}>Chọn nguyên liệu từ Nhà cung cấp liên kết</h2>
              <p className={styles.modalSubtitle}>
                {dishContextName ? (
                  <>Áp dụng cho món: <strong>{dishContextName}</strong></>
                ) : (
                  "Lựa chọn nguyên liệu theo Phân loại và Nhà cung cấp đã liên kết với trường"
                )}
                {onlySafe && <span className={styles.safeFilterTag}> • Lọc nguyên liệu an toàn</span>}
              </p>
            </div>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Tiêu chí Lọc 1: Thanh Phân loại nguyên liệu (Category Pills) */}
        <div className={styles.categoryTabsSection}>
          <span className={styles.filterSectionLabel}>1. Phân loại nguyên liệu:</span>
          <div className={styles.categoryPills}>
            <button
              type="button"
              className={`${styles.catPill} ${selectedCategory === "ALL" ? styles.catPillActive : ""}`}
              onClick={() => {
                setSelectedCategory("ALL")
                setSelectedSupplierId("ALL")
              }}
            >
              <span className="material-symbols-outlined">grid_view</span>
              <span>Tất cả phân loại</span>
              <span className={styles.countBadge}>{ALL_INGREDIENTS.length}</span>
            </button>
            {INGREDIENT_CATEGORIES.map(cat => {
              const count = ALL_INGREDIENTS.filter(i => i.category === cat).length
              return (
                <button
                  key={cat}
                  type="button"
                  className={`${styles.catPill} ${selectedCategory === cat ? styles.catPillActive : ""}`}
                  onClick={() => {
                    setSelectedCategory(cat)
                    setSelectedSupplierId("ALL") // Reset NCC khi đổi phân loại
                  }}
                >
                  <span className="material-symbols-outlined">{getCategoryIcon(cat)}</span>
                  <span>{cat}</span>
                  <span className={styles.countBadge}>{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tiêu chí Lọc 2: Chọn Nhà cung cấp & Ô Tìm kiếm text */}
        <div className={styles.secondaryFilterBar}>
          {/* Lọc theo NCC */}
          <div className={styles.supplierFilterCol}>
            <label className={styles.filterLabel}>2. Nhà cung cấp liên kết:</label>
            <div className={styles.selectWrap}>
              <select
                className={styles.supplierSelect}
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
              >
                <option value="ALL">
                  🏢 Tất cả NCC {selectedCategory !== "ALL" ? `cung cấp ${selectedCategory}` : "đang liên kết"} ({availableSuppliers.length})
                </option>
                {availableSuppliers.map(sup => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name} ({sup.badge})
                  </option>
                ))}
              </select>
              <span className={`material-symbols-outlined ${styles.selectChevron}`}>expand_more</span>
            </div>
          </div>

          {/* Ô Tìm kiếm nhanh */}
          <div className={styles.searchCol}>
            <label className={styles.filterLabel}>3. Tìm kiếm tên nguyên liệu:</label>
            <div className={styles.searchInputWrap}>
              <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Ví dụ: thịt heo, cá điêu hồng, rau cải, trứng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className={styles.clearSearchBtn}
                  onClick={() => setSearchTerm("")}
                >
                  <span className="material-symbols-outlined">clear</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Kết quả danh sách nguyên liệu */}
        <div className={styles.listContainer}>
          <div className={styles.resultInfoBar}>
            <span className={styles.resultCount}>
              Hiển thị <strong>{filteredIngredients.length}</strong> nguyên liệu đạt chuẩn
            </span>
            {(selectedCategory !== "ALL" || selectedSupplierId !== "ALL" || searchTerm) && (
              <button type="button" className={styles.resetBtn} onClick={handleResetFilters}>
                <span className="material-symbols-outlined">restart_alt</span>
                <span>Đặt lại bộ lọc</span>
              </button>
            )}
          </div>

          {filteredIngredients.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={`material-symbols-outlined ${styles.emptyIcon}`}>search_off</span>
              <p className={styles.emptyTitle}>Không tìm thấy nguyên liệu phù hợp</p>
              <p className={styles.emptySub}>
                Hãy thử chọn "Tất cả phân loại" hoặc "Tất cả NCC" để xem toàn bộ danh mục thực phẩm.
              </p>
              <button type="button" className={styles.resetEmptyBtn} onClick={handleResetFilters}>
                Xem tất cả nguyên liệu
              </button>
            </div>
          ) : (
            <div className={styles.ingredientGrid}>
              {filteredIngredients.map(ing => {
                const supplier = LINKED_SUPPLIERS.find(s => s.id === ing.supplierId)
                const isSelected = ing.id === currentIngredientId

                return (
                  <div
                    key={ing.id}
                    className={`${styles.ingredientCard} ${isSelected ? styles.cardSelected : ""}`}
                    onClick={() => handlePick(ing)}
                  >
                    <div className={styles.cardIconBox}>
                      <span className={`material-symbols-outlined ${styles.cardIcon}`}>
                        {getCategoryIcon(ing.category)}
                      </span>
                    </div>

                    <div className={styles.cardContent}>
                      <div className={styles.cardHeaderRow}>
                        <h4 className={styles.ingredientName}>{ing.name}</h4>
                        {isSelected && (
                          <span className={styles.currentBadge}>
                            <span className="material-symbols-outlined">check</span>
                            Đang chọn
                          </span>
                        )}
                      </div>

                      <div className={styles.tagsRow}>
                        <span className={styles.categoryBadge}>{ing.category}</span>
                        {supplier && (
                          <span className={styles.supplierBadge}>
                            <span className="material-symbols-outlined">verified</span>
                            {supplier.name} • {supplier.badge}
                          </span>
                        )}
                      </div>

                      <div className={styles.qtySuggestion}>
                        Định lượng gợi ý: <strong>{ing.defaultQty} {ing.unit}/suất</strong>
                      </div>
                    </div>

                    <div className={styles.actionCol}>
                      <button
                        type="button"
                        className={`${styles.pickBtn} ${isSelected ? styles.pickBtnActive : ""}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePick(ing)
                        }}
                      >
                        {isSelected ? "Đang dùng" : "Chọn"}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          <div className={styles.footerHelp}>
            <span className="material-symbols-outlined">info</span>
            <span>Hệ thống sẽ đối soát kiểm tra dị ứng tự động ngay sau khi nguyên liệu được chọn.</span>
          </div>
          <button type="button" className={styles.closeFooterBtn} onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

