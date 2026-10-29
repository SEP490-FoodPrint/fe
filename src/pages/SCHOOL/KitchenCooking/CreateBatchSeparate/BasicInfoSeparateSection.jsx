import React, { useState, useRef, useEffect } from "react"
import styles from "./BasicInfoSeparateSection.module.scss"

const DISH_OPTIONS = [
  {
    id: "dish-1",
    name: "Thịt heo kho nước dừa",
    type: "Món mặn chính • Giàu đạm, canxi",
  },
  {
    id: "dish-2",
    name: "Canh sườn hầm củ quả thập cẩm",
    type: "Món canh dinh dưỡng",
  },
  {
    id: "dish-3",
    name: "Đậu hũ non sốt thịt băm cà chua",
    type: "Món phụ / xào",
  },
  {
    id: "dish-4",
    name: "Thanh long ruột đỏ Bình Thuận",
    type: "Món tráng miệng",
  },
]

export default function BasicInfoSeparateSection() {
  const [selectedMeal, setSelectedMeal] = useState("lunch")
  const [selectedDish, setSelectedDish] = useState(DISH_OPTIONS[0])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const dropdownRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const filteredDishes = DISH_OPTIONS.filter((dish) =>
    dish.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleClear = (e) => {
    e.stopPropagation()
    setSelectedDish(null)
    setIsDropdownOpen(true)
  }

  return (
    <section className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleWithBadge}>
          <div className={styles.numberBadge}>1</div>
          <h2 className={styles.sectionTitle}>Thông tin cơ bản</h2>
        </div>
        <span className={styles.stepSubtitle}>
          Bước 1 / 3 — Định danh phiên nấu
        </span>
      </div>

      {/* Row 1: Ngày ăn & Bữa ăn */}
      <div className={styles.gridRow}>
        {/* Ngày ăn (Khóa) */}
        <div className={styles.formGroup}>
          <div className={styles.labelRow}>
            <label className={styles.label}>
              Ngày ăn / Ngày chế biến <span className={styles.requiredStar}>*</span>
            </label>
            <span className={styles.menuNotice}>
              Áp dụng thực đơn bán trú THCS
            </span>
          </div>

          <div className={styles.lockedField}>
            <div className={styles.lockedValue}>
              <span className="material-symbols-outlined">calendar_today</span>
              <span className={styles.lockedText}>
                26/10/2026 (Thứ Hai - Tuần 46)
              </span>
            </div>
            <span className="material-symbols-outlined">lock</span>
          </div>
        </div>

        {/* Bữa ăn phục vụ */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Bữa ăn <span className={styles.requiredStar}>*</span>
          </label>
          <div className={styles.selectWrapper}>
            <select
              className={styles.selectInput}
              value={selectedMeal}
              onChange={(e) => setSelectedMeal(e.target.value)}
            >
              <option value="lunch">Bữa trưa học đường (10:45 – 11:45)</option>
              <option value="snack">Bữa xế chiều (14:30 – 15:00)</option>
              <option value="breakfast">Bữa sáng bán trú (06:30 – 07:15)</option>
            </select>
            <span className={`material-symbols-outlined ${styles.selectIcon}`}>
              expand_more
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Món cần chế biến & Số suất dự kiến */}
      <div className={styles.gridRow}>
        {/* Món cần chế biến (Searchable Dropdown) */}
        <div className={styles.formGroup} ref={dropdownRef}>
          <div className={styles.labelRow}>
            <label className={styles.label}>
              Món cần chế biến <span className={styles.requiredStar}>*</span>
            </label>
            <span className={styles.subLabel}>Thực đơn ca sáng đã duyệt</span>
          </div>

          {/* Trigger Box */}
          <div
            className={`${styles.dropdownTrigger} ${
              isDropdownOpen ? styles.dropdownOpen : ""
            }`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className={styles.selectedContent}>
              <span className={`material-symbols-outlined ${styles.dishIcon}`}>
                soup_kitchen
              </span>
              <span className={styles.dishName}>
                {selectedDish ? selectedDish.name : "Chọn món cần chế biến..."}
              </span>
            </div>

            <div className={styles.triggerActions}>
              {selectedDish && (
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={handleClear}
                  title="Bỏ chọn"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
              <span className={`material-symbols-outlined ${styles.arrowIcon}`}>
                {isDropdownOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"}
              </span>
            </div>
          </div>

          {/* Flyout Menu */}
          {isDropdownOpen && (
            <div className={styles.dropdownPopup}>
              {/* Search field */}
              <div className={styles.searchBox}>
                <span className="material-symbols-outlined">search</span>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Tìm tên món trong thực đơn... (Esc)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Options list */}
              <div className={styles.itemsList}>
                {filteredDishes.map((dish) => {
                  const isSelected = selectedDish?.id === dish.id
                  return (
                    <div
                      key={dish.id}
                      className={`${styles.itemRow} ${
                        isSelected ? styles.itemSelected : ""
                      }`}
                      onClick={() => {
                        setSelectedDish(dish)
                        setIsDropdownOpen(false)
                        setSearchQuery("")
                      }}
                    >
                      <div className={styles.itemInfo}>
                        <span
                          className={
                            isSelected ? styles.selectedName : styles.regularName
                          }
                        >
                          {dish.name}
                        </span>
                        <span className={styles.dishMeta}>{dish.type}</span>
                      </div>

                      {isSelected ? (
                        <div className={styles.activeTag}>
                          <span className="material-symbols-outlined">check</span>
                          <span>Đang chọn</span>
                        </div>
                      ) : (
                        <span className={styles.chooseAction}>Chọn</span>
                      )}
                    </div>
                  )
                })}

                {filteredDishes.length === 0 && (
                  <div className={styles.emptyState}>
                    Không tìm thấy món phù hợp với "{searchQuery}"
                  </div>
                )}
              </div>

              {/* Dropdown Footer */}
              <div className={styles.dropdownFooter}>
                <span>Nguồn: Kế hoạch dinh dưỡng Tuần 46</span>
                <a href="#menu" className={styles.menuLink}>
                  <span>Xem toàn bộ thực đơn</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Số suất dự kiến */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Số suất dự kiến <span className={styles.requiredStar}>*</span>
          </label>
          <div className={styles.portionBox}>
            <div className={styles.portionValueRow}>
              <span className={styles.portionNumber}>1.250</span>
              <span className={styles.portionUnit}>suất học sinh</span>
            </div>
            <span className={`material-symbols-outlined ${styles.groupsIcon}`}>
              groups
            </span>
          </div>
          <p className={styles.portionNotice}>
            <span className="material-symbols-outlined">info</span>
            <span>
              Dữ liệu tự động tính từ 1.250 học sinh đăng ký bán trú khối 6, 7, 8 và 9.
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}
