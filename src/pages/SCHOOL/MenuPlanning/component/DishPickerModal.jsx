import React, { useState, useMemo } from "react"
import { Utensils, Search, Plus, Check, AlertTriangle, X, Truck } from "lucide-react"
import styles from "./DishPickerModal.module.scss"
import {
  DISH_CATEGORIES,
  CATALOG_SUPPLIERS,
  getStoredDishCatalog,
  saveDishToCatalog,
} from "../dishCatalogData"

export default function DishPickerModal({
  isOpen,
  onClose,
  onSelectDishes,
  currentMealType = "LUNCH",
  singleSelect = false,
  initialSelectedIds = [],
}) {
  const [catalog, setCatalog] = useState(getStoredDishCatalog)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("ALL")
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds)

  // Form thêm món mới vào kho
  const [showAddForm, setShowAddForm] = useState(false)
  const [newDishForm, setNewDishForm] = useState({
    name: "",
    category: "MAIN_DISH",
    portionQty: 60,
    unit: "g",
    supplierId: "sup-cp",
    allergen: "",
  })

  // Lọc danh sách món ăn theo category & keyword
  const filteredDishes = useMemo(() => {
    return catalog.filter((dish) => {
      // Lọc danh mục
      if (selectedCategory !== "ALL" && dish.category !== selectedCategory) {
        return false
      }
      // Tìm kiếm từ khóa
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase()
        const matchName = dish.name?.toLowerCase().includes(kw)
        const matchIng = dish.ingredientNames?.some((ing) =>
          ing.toLowerCase().includes(kw)
        )
        const matchAllergen = dish.allergen?.toLowerCase().includes(kw)
        return matchName || matchIng || matchAllergen
      }
      return true
    })
  }, [catalog, selectedCategory, searchKeyword])

  if (!isOpen) return null

  const handleToggleDish = (dish) => {
    if (singleSelect) {
      onSelectDishes([dish])
      onClose()
      return
    }

    setSelectedIds((prev) => {
      if (prev.includes(dish.id)) {
        return prev.filter((id) => id !== dish.id)
      } else {
        return [...prev, dish.id]
      }
    })
  }

  const handleConfirmMultiSelect = () => {
    const pickedDishes = catalog.filter((d) => selectedIds.includes(d.id))
    onSelectDishes(pickedDishes)
    onClose()
  }

  // Thêm món ăn mới vào Master Data
  const handleCreateNewDish = (e) => {
    e.preventDefault()
    if (!newDishForm.name.trim()) return

    const categoryObj = DISH_CATEGORIES.find(
      (c) => c.key === newDishForm.category
    )
    const newEntry = {
      name: newDishForm.name.trim(),
      category: newDishForm.category,
      categoryLabel: categoryObj?.label || "Món ăn",
      portionQty: Number(newDishForm.portionQty) || 50,
      unit: newDishForm.unit || "g",
      allergen: newDishForm.allergen?.trim() || null,
      mealType:
        newDishForm.category === "AFTERNOON" ? "AFTERNOON" : "LUNCH",
      ingredientNames: [newDishForm.name.trim()],
    }

    const updated = saveDishToCatalog(newEntry)
    setCatalog(updated)
    setShowAddForm(false)
    setNewDishForm({
      name: "",
      category: "MAIN_DISH",
      portionQty: 60,
      unit: "g",
      allergen: "",
    })

    // Tự động chọn món vừa tạo
    const createdDish = updated[0]
    if (singleSelect) {
      onSelectDishes([createdDish])
      onClose()
    } else {
      setSelectedIds((prev) => [...prev, createdDish.id])
    }
  }

  const getTagClass = (category) => {
    switch (category) {
      case "RICE_STARCH":
        return styles.tagRice
      case "MAIN_DISH":
        return styles.tagMain
      case "VEGETABLE":
        return styles.tagVeg
      case "SOUP":
        return styles.tagSoup
      case "AFTERNOON":
        return styles.tagAfternoon
      case "ALLERGY_SUBSTITUTE":
        return styles.tagSubstitute
      default:
        return ""
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleGroup}>
            <div className={styles.headerIconBox}>
              <Utensils size={18} />
            </div>
            <div>
              <h3 className={styles.modalTitle}>Kho món ăn học đường (Master Data)</h3>
              <p className={styles.modalSubtitle}>
                Chọn món ăn dinh dưỡng đã định lượng sẵn để thêm vào thực đơn (Gạo là món ăn chính)
              </p>
            </div>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} title="Đóng popup">
            <X size={18} />
          </button>
        </div>

        {/* Toolbar: Tìm kiếm & Thêm món mới vào kho */}
        <div className={styles.toolbarRow}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Tìm theo tên món, nguyên liệu, dị ứng (ví dụ: Cơm, Tôm, Trứng, Canh...)"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              autoFocus
            />
          </div>

          <button
            type="button"
            className={styles.createDishBtn}
            onClick={() => setShowAddForm((v) => !v)}
          >
            <Plus size={15} />
            <span>{showAddForm ? "Hủy nhập món mới" : "Thêm món mới vào kho"}</span>
          </button>
        </div>

        {/* Form thêm món mới vào Master Data (nếu trường có món riêng) */}
        {showAddForm && (
          <form className={styles.addCustomForm} onSubmit={handleCreateNewDish}>
            <div className={styles.formGrid}>
              <input
                type="text"
                className={styles.formInput}
                placeholder="Tên món ăn mới (ví dụ: Canh rau ngót thịt nạc)..."
                value={newDishForm.name}
                onChange={(e) =>
                  setNewDishForm({ ...newDishForm, name: e.target.value })
                }
                required
              />
              <select
                className={styles.formInput}
                value={newDishForm.category}
                onChange={(e) =>
                  setNewDishForm({ ...newDishForm, category: e.target.value })
                }
              >
                {DISH_CATEGORIES.filter((c) => c.key !== "ALL").map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <div style={{ display: "flex", gap: "6px" }}>
                <input
                  type="number"
                  className={styles.formInput}
                  style={{ width: "70px" }}
                  placeholder="Định lượng"
                  value={newDishForm.portionQty}
                  onChange={(e) =>
                    setNewDishForm({
                      ...newDishForm,
                      portionQty: e.target.value,
                    })
                  }
                  min="1"
                />
                <select
                  className={styles.formInput}
                  style={{ width: "60px" }}
                  value={newDishForm.unit}
                  onChange={(e) =>
                    setNewDishForm({ ...newDishForm, unit: e.target.value })
                  }
                >
                  <option value="g">g</option>
                  <option value="ml">ml</option>
                </select>
              </div>
            </div>
            <div className={styles.formActions}>
              <input
                type="text"
                className={styles.formInput}
                style={{ flex: 1 }}
                placeholder="Cảnh báo dị ứng nếu có (ví dụ: Hải sản, Trứng, Sữa bò... hoặc bỏ trống)"
                value={newDishForm.allergen}
                onChange={(e) =>
                  setNewDishForm({ ...newDishForm, allergen: e.target.value })
                }
              />
              <button type="submit" className={styles.confirmBtn}>
                Lưu vào kho
              </button>
            </div>
          </form>
        )}

        {/* Category Tabs */}
        <div className={styles.categoryTabs}>
          {DISH_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.key
            return (
              <button
                key={cat.key}
                type="button"
                className={`${styles.categoryTab} ${
                  isActive ? styles.tabActive : ""
                }`}
                onClick={() => setSelectedCategory(cat.key)}
              >
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>

        {/* Danh sách thẻ món ăn */}
        <div className={styles.modalBody}>
          {filteredDishes.length === 0 ? (
            <div className={styles.emptyState}>
              <Utensils size={36} className={styles.emptyIcon} />
              <p>Không tìm thấy món ăn nào phù hợp với từ khóa "{searchKeyword}"</p>
            </div>
          ) : (
            <div className={styles.dishesGrid}>
              {filteredDishes.map((dish) => {
                const isSelected = selectedIds.includes(dish.id)
                return (
                  <div
                    key={dish.id}
                    className={`${styles.dishCard} ${
                      isSelected ? styles.cardSelected : ""
                    }`}
                    onClick={() => handleToggleDish(dish)}
                  >
                    <div className={styles.cardTop}>
                      <h4 className={styles.dishName}>{dish.name}</h4>
                      <div
                        className={`${styles.checkIndicator} ${
                          isSelected ? styles.checkActive : ""
                        }`}
                      >
                        {isSelected && <Check size={12} />}
                      </div>
                    </div>

                    <div className={styles.cardMetaRow}>
                      <span
                        className={`${styles.categoryTag} ${getTagClass(
                          dish.category
                        )}`}
                      >
                        {dish.categoryLabel || "Món ăn"}
                      </span>
                      <span className={styles.portionBadge}>
                        {dish.portionQty} {dish.unit} / suất
                      </span>
                    </div>

                    {dish.supplierName && (
                      <div className={styles.supplierRow} title={"NCC: " + dish.supplierName}>
                        <Truck size={11} className={styles.supplierIcon} />
                        <span>NCC: {dish.supplierName}</span>
                      </div>
                    )}
                    {dish.allergen && (
                      <div className={styles.allergenWarning}>
                        <AlertTriangle size={11} className={styles.warningIcon} />
                        <span>Dị ứng: {dish.allergen}</span>
                      </div>
                    )}

                    {dish.description && (
                      <p className={styles.dishDesc}>{dish.description}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {!singleSelect && (
          <div className={styles.modalFooter}>
            <div className={styles.selectionCount}>
              Đã chọn: <strong>{selectedIds.length}</strong> món ăn
            </div>
            <div className={styles.footerActions}>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>
                Hủy bỏ
              </button>
              <button
                type="button"
                className={styles.confirmBtn}
                disabled={selectedIds.length === 0}
                onClick={handleConfirmMultiSelect}
              >
                Thêm {selectedIds.length > 0 ? `${selectedIds.length} món ` : ""}vào thực đơn
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

