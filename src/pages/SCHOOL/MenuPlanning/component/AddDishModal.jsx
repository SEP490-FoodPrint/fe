import React, { useState } from "react"
import styles from "./AddDishModal.module.scss"
import { DISH_REPOSITORY } from "../mockMenuData"

const CATEGORIES = [
  { id: "ALL", label: "Tất cả" },
  { id: "Món mặn", label: "Món mặn" },
  { id: "Món canh", label: "Món canh" },
  { id: "Món mặn phụ", label: "Món mặn phụ" },
  { id: "Tráng miệng", label: "Tráng miệng" }
]

export default function AddDishModal({
  isOpen,
  onClose,
  onSelectDish
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("ALL")

  if (!isOpen) return null

  const filteredDishes = DISH_REPOSITORY.filter((dish) => {
    const matchCat = selectedCategory === "ALL" || dish.category === selectedCategory
    const matchSearch =
      dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dish.ingredientsText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dish.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleBlock}>
            <span className={`material-symbols-outlined ${styles.headerIcon}`}>restaurant_menu</span>
            <h3 className={styles.modalTitle}>Chọn món ăn vào thực đơn</h3>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng popup"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className={styles.filterSection}>
          <div className={styles.searchBox}>
            <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Tìm theo tên món, nguyên liệu, nhà cung cấp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => setSearchTerm("")}
              >
                <span className="material-symbols-outlined">backspace</span>
              </button>
            )}
          </div>

          <div className={styles.categoryPills}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`${styles.pillBtn} ${selectedCategory === cat.id ? styles.activePill : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dish List */}
        <div className={styles.dishList}>
          {filteredDishes.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={`material-symbols-outlined ${styles.emptyIcon}`}>search_off</span>
              <p>Không tìm thấy món ăn phù hợp với từ khóa</p>
            </div>
          ) : (
            filteredDishes.map((dish) => (
              <div key={dish.id} className={styles.dishCard}>
                <div className={styles.dishInfo}>
                  <div className={styles.dishTop}>
                    <h4 className={styles.dishName}>{dish.name}</h4>
                    <span className={styles.categoryTag}>{dish.category}</span>
                  </div>
                  <p className={styles.dishDesc}>{dish.description}</p>
                  <div className={styles.metaRow}>
                    <span className={styles.supplierText}>
                      NCC liên kết: <strong>{dish.supplierName}</strong>
                    </span>
                    <span className={styles.dotSep}>•</span>
                    <span className={styles.ingText}>{dish.ingredientsText}</span>
                  </div>
                  {dish.allergenAlert && (
                    <div className={styles.allergenBadge}>
                      <span className="material-symbols-outlined">warning</span>
                      <span>{dish.allergenAlert}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className={styles.selectBtn}
                  onClick={() => onSelectDish(dish)}
                >
                  <span className="material-symbols-outlined">add</span>
                  <span>Chọn món</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

