import React, { useState, useRef, useEffect } from "react"
import styles from "./BasicInfoSection.module.scss"

const DISH_OPTIONS = [
  {
    id: "dish-1",
    name: "Thịt heo kho nước dừa",
    type: "Món mặn chính • Giàu đạm, canxi",
    icon: "skillet",
  },
  {
    id: "dish-2",
    name: "Canh sườn hầm củ quả thập cẩm",
    type: "Món canh dinh dưỡng",
    icon: "soup_kitchen",
  },
  {
    id: "dish-3",
    name: "Đậu hũ non sốt thịt băm cà chua",
    type: "Món phụ / xào",
    icon: "restaurant",
  },
  {
    id: "dish-4",
    name: "Thanh long ruột đỏ Bình Thuận",
    type: "Món tráng miệng",
    icon: "nutrition",
  },
]

export default function BasicInfoSection() {
  const [selectedMeal, setSelectedMeal] = useState("lunch")
  const [selectedDish, setSelectedDish] = useState(DISH_OPTIONS[0])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [portions, setPortions] = useState("1.250")

  const dropdownRef = useRef(null)

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handle escape key
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

  const handleClearSelection = (e) => {
    e.stopPropagation()
    setSelectedDish(null)
    setIsDropdownOpen(true)
  }

  return (
    <section className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleWithBadge}>
          <div className={styles.numberBadge}>1</div>
          <div>
            <h2 className={styles.sectionTitle}>1. Thông tin cơ bản</h2>
            <p className={styles.sectionSubtitle}>
              Bắt buộc nhập — Thiết lập ca ăn, thực đơn và số lượng học sinh phục vụ
            </p>
          </div>
        </div>
        <span className={styles.requiredTag}>Bắt buộc</span>
      </div>

      {/* Row 1: Ngày ăn & Bữa ăn */}
      <div className={styles.gridRow}>
        {/* Ngày ăn (Khóa) */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            <span>Ngày ăn / Ngày chế biến</span>
            <span
              className={`material-symbols-outlined ${styles.lockIcon}`}
              title="Đồng bộ tự động từ thực đơn"
            >
              lock
            </span>
          </label>
          <div className={styles.lockedField}>
            <div className={styles.lockedValue}>
              <span className="material-symbols-outlined">calendar_today</span>
              <span className={styles.lockedText}>26/10/2026 (Thứ Hai — Tuần 46)</span>
            </div>
            <span className={styles.lockedBadge}>Đã khóa</span>
          </div>
          <span className={styles.helperText}>
            Đồng bộ tự động từ thực đơn đã duyệt tuần 46
          </span>
        </div>

        {/* Bữa ăn phục vụ */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Bữa ăn phục vụ</label>
          <div className={styles.selectWrapper}>
            <select
              className={styles.selectInput}
              value={selectedMeal}
              onChange={(e) => setSelectedMeal(e.target.value)}
            >
              <option value="lunch">Bữa trưa học đường (10:45 – 11:45)</option>
              <option value="afternoon">Bữa phụ chiều (14:30 – 15:00)</option>
              <option value="breakfast">Bữa sáng bán trú (06:45 – 07:30)</option>
            </select>
            <span className={`material-symbols-outlined ${styles.selectIcon}`}>
              expand_more
            </span>
          </div>
          <span className={styles.helperText}>
            Khung giờ chuẩn bị cho khối Tiểu học &amp; THCS
          </span>
        </div>
      </div>

      {/* Row 2: Món cần chế biến & Số suất dự kiến */}
      <div className={styles.gridRow}>
        {/* Món cần chế biến (Searchable Dropdown) */}
        <div className={styles.formGroup} ref={dropdownRef}>
          <label className={styles.label}>Món cần chế biến</label>
          <div
            className={`${styles.dropdownTrigger} ${
              isDropdownOpen ? styles.dropdownOpen : ""
            }`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className={styles.selectedContent}>
              <span className={`material-symbols-outlined ${styles.dishIcon}`}>
                {selectedDish ? selectedDish.icon : "restaurant_menu"}
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
                  onClick={handleClearSelection}
                  title="Xóa lựa chọn"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
              <span className={`material-symbols-outlined ${styles.arrowIcon}`}>
                {isDropdownOpen ? "expand_less" : "expand_more"}
              </span>
            </div>
          </div>

          {/* Dropdown Menu Popup */}
          {isDropdownOpen && (
            <div className={styles.dropdownPopup}>
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
                          className={`material-symbols-outlined ${
                            isSelected ? styles.selectedIcon : styles.itemIcon
                          }`}
                        >
                          {isSelected ? "check_circle" : dish.icon}
                        </span>
                        <div className={styles.textContainer}>
                          <span
                            className={
                              isSelected ? styles.selectedName : styles.regularName
                            }
                          >
                            {dish.name}
                          </span>
                          <span className={styles.dishMeta}>{dish.type}</span>
                        </div>
                      </div>

                      {isSelected ? (
                        <span className={styles.activeTag}>Đang chọn</span>
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
            </div>
          )}
        </div>

        {/* Số suất dự kiến */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Số suất dự kiến</label>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              className={styles.portionInput}
              value={portions}
              onChange={(e) => setPortions(e.target.value)}
            />
            <span className={styles.unitSuffix}>suất ăn</span>
          </div>
          <span className={styles.helperText}>
            Hệ thống tự động đề xuất dựa trên sĩ số điểm danh báo trước 24h
          </span>
        </div>
      </div>
    </section>
  )
}
