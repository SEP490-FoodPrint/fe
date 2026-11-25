import InlineError from "src/components/InlineError"
import React, { useState, useMemo, useEffect } from "react"
import FilterMultiSelect from "./FilterMultiSelect"
import styles from "./IngredientPickerModal.module.scss"
import MenuService from "src/services/MenuService"

export default function IngredientPickerModal({
  isOpen,
  onClose,
  selectedIngredientIds = [],
  onToggleIngredient,
  dishContextName = "",
  onlySafe = false,
  providedIngredients,
}) {
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedSupplierIds, setSelectedSupplierIds] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [ALL_INGREDIENTS, setIngredients] = useState([])
  const [catalogError, setCatalogError] = useState("")
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (!isOpen) return
    if (providedIngredients) {
      setIngredients(providedIngredients)
      setCatalogError("")
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    setCatalogError("")
    MenuService.getIngredientOptions("main")
      .then(result => { if (active) setIngredients(result.data) })
      .catch(error => { if (active) { setIngredients([]); setCatalogError(error.message) } })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [isOpen, providedIngredients])
  const INGREDIENT_CATEGORIES = useMemo(() => [...new Set(ALL_INGREDIENTS.map(item => item.category).filter(Boolean))], [ALL_INGREDIENTS])
  const LINKED_SUPPLIERS = useMemo(() => {
    const suppliers = new Map()
    ALL_INGREDIENTS.forEach(item => {
      if (!item.supplierId) return
      const supplier = suppliers.get(item.supplierId) || { id: item.supplierId, name: item.supplierName, categories: [] }
      if (item.category && !supplier.categories.includes(item.category)) supplier.categories.push(item.category)
      suppliers.set(item.supplierId, supplier)
    })
    return [...suppliers.values()]
  }, [ALL_INGREDIENTS])

  // Danh sách NCC theo phân loại đang chọn
  const availableSuppliers = useMemo(() => {
    if (selectedCategories.length === 0) return LINKED_SUPPLIERS
    return LINKED_SUPPLIERS.filter(sup => sup.categories.some(cat => selectedCategories.includes(cat)))
  }, [selectedCategories, LINKED_SUPPLIERS])

  // Lựa chọn của ô lọc kèm số nguyên liệu
  const categoryOptions = INGREDIENT_CATEGORIES.map(cat => ({
    id: cat,
    name: cat,
    count: ALL_INGREDIENTS.filter(ing => ing.category === cat).length,
  }))
  const supplierOptions = availableSuppliers.map(sup => ({
    id: sup.id,
    name: sup.name,
    count: ALL_INGREDIENTS.filter(ing =>
      ing.supplierId === sup.id &&
      (selectedCategories.length === 0 || selectedCategories.includes(ing.category)),
    ).length,
  }))

  // Lọc nguyên liệu theo các tiêu chí (Phân loại -> NCC -> Search text)
  const filteredIngredients = useMemo(() => {
    return ALL_INGREDIENTS.filter(ing => {
      // Nếu chỉ lấy nguyên liệu an toàn (cho món thay thế)
      if (onlySafe && ing.allergen) return false

      // Lọc theo phân loại
      if (selectedCategories.length > 0 && !selectedCategories.includes(ing.category)) return false

      // Lọc theo NCC
      if (selectedSupplierIds.length > 0 && !selectedSupplierIds.includes(ing.supplierId)) return false

      // Tìm kiếm theo tên
      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase().trim()
        const matchName = ing.name.toLowerCase().includes(term)
        const matchCat = ing.category?.toLowerCase().includes(term)
        if (!matchName && !matchCat) return false
      }

      return true
    })
  }, [selectedCategories, selectedSupplierIds, searchTerm, onlySafe, ALL_INGREDIENTS])

  // Reset bộ lọc
  const handleResetFilters = () => {
    setSelectedCategories([])
    setSelectedSupplierIds([])
    setSearchTerm("")
  }

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        {loading && <p role="status">Đang tải nguyên liệu từ nhà cung cấp liên kết…</p>}
        <InlineError messages={catalogError} />
        {/* Header Modal */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleWrap}>
            <span className={`material-symbols-outlined ${styles.headerIcon}`}>inventory_2</span>
            <div>
              <h2 className={styles.modalTitle}>Chọn nguyên liệu từ Nhà cung cấp liên kết</h2>
              <p className={styles.modalSubtitle}>
                {dishContextName ? (
                  <>Áp dụng cho món: <strong>{dishContextName}</strong> (Có thể chọn nhiều nguyên liệu chính)</>
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

        {/* Bộ lọc: Phân loại, Nhà cung cấp, Tìm kiếm */}
        <div className={styles.secondaryFilterBar}>
          <div className={styles.supplierFilterCol}>
            <label className={styles.filterLabel} htmlFor="ingredient-picker-category">1. Phân loại nguyên liệu:</label>
            <FilterMultiSelect
              id="ingredient-picker-category"
              options={categoryOptions}
              value={selectedCategories}
              onChange={(value) => {
                setSelectedCategories(value)
                setSelectedSupplierIds([]) // Reset NCC khi đổi phân loại
              }}
              allLabel={`Tất cả phân loại (${categoryOptions.length})`}
              unit="loại"
            />
          </div>

          {/* Lọc theo NCC */}
          <div className={styles.supplierFilterCol}>
            <label className={styles.filterLabel} htmlFor="ingredient-picker-supplier">2. Nhà cung cấp liên kết:</label>
            <FilterMultiSelect
              id="ingredient-picker-supplier"
              options={supplierOptions}
              value={selectedSupplierIds}
              onChange={setSelectedSupplierIds}
              allLabel={`Tất cả NCC (${supplierOptions.length})`}
              unit="NCC"
            />
          </div>

          {/* Ô Tìm kiếm nhanh */}
          <div className={styles.searchCol}>
            <label className={styles.filterLabel}>3. Tìm kiếm tên nguyên liệu:</label>
            <div className={styles.searchInputWrap}>
              <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Ví dụ: thịt heo, rau cải..."
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
          {(selectedCategories.length > 0 || selectedSupplierIds.length > 0 || searchTerm) && (
            <div className={styles.resultInfoBar}>
              <div className={styles.activeFilters}>
                {[
                  ...categoryOptions
                    .filter(option => selectedCategories.includes(option.id))
                    .map(option => ({
                      ...option,
                      remove: () => {
                        setSelectedCategories(current => current.filter(id => id !== option.id))
                        setSelectedSupplierIds([])
                      },
                    })),
                  ...supplierOptions
                    .filter(option => selectedSupplierIds.includes(option.id))
                    .map(option => ({
                      ...option,
                      remove: () => setSelectedSupplierIds(current => current.filter(id => id !== option.id)),
                    })),
                ].map(option => (
                  <button
                    key={option.id}
                    type="button"
                    className={styles.filterTag}
                    title={option.name}
                    aria-label={`Bỏ lọc ${option.name}`}
                    onClick={option.remove}
                  >
                    <span className={styles.filterTagName}>{option.name}</span>
                    <span aria-hidden="true">×</span>
                  </button>
                ))}
              </div>
              <button type="button" className={styles.resetBtn} onClick={handleResetFilters}>
                <span className="material-symbols-outlined">restart_alt</span>
                <span>Đặt lại bộ lọc</span>
              </button>
            </div>
          )}

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
                const isSelected = selectedIngredientIds.includes(ing.id)

                return (
                  <div
                    key={ing.id}
                    className={`${styles.ingredientCard} ${isSelected ? styles.cardSelected : ""}`}
                    onClick={() => onToggleIngredient(ing)}
                  >
                    <div className={styles.cardContent}>
                      <div className={styles.cardHeaderRow}>
                        <h4 className={styles.ingredientName}>{ing.name}</h4>
                        {isSelected && (
                          <span className={styles.currentBadge}>
                            <span className="material-symbols-outlined">check_circle</span>
                            Đã chọn
                          </span>
                        )}
                      </div>

                      <div className={styles.tagsRow}>
                        <span className={styles.categoryBadge}>{ing.category}</span>
                        {supplier && (
                          <span className={styles.supplierBadge}>
                            <span className="material-symbols-outlined">verified</span>
                            {supplier.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={styles.actionCol}>
                      <button
                        type="button"
                        aria-label={`${isSelected ? "Bỏ chọn" : "Thêm"} ${ing.name}`}
                        title={isSelected ? "Bỏ chọn" : "Thêm"}
                        className={`${styles.pickBtn} ${isSelected ? styles.pickBtnActive : ""}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleIngredient(ing)
                        }}
                      >
                        {isSelected ? "−" : "+"}
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
            <span>Có thể chọn nhiều nguyên liệu cho 1 món.</span>
          </div>
          <button type="button" className={styles.doneBtn} onClick={onClose}>
            <span>Hoàn tất ({selectedIngredientIds.length})</span>
          </button>
        </div>
      </div>
    </div>
  )
}
