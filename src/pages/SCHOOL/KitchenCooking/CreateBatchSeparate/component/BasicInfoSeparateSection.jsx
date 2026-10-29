import React, { useState, useRef, useEffect } from "react"
import styles from "./BasicInfoSeparateSection.module.scss"

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

export default function BasicInfoSeparateSection() {
  const [selectedMeal, setSelectedMeal] = useState("lunch")
  const [selectedDish, setSelectedDish] = useState(DISH_OPTIONS[0])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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

  return (
    <section className={styles.compactCard}>
      <div className={styles.cardHeader}>
        <div className={styles.headerTitle}>
          <span className={`material-symbols-outlined ${styles.headerIcon}`}>
            tune
          </span>
          <span className={styles.titleText}>Thông tin phiên nấu</span>
        </div>
        <span className={styles.badgeSync}>
          <span className="material-symbols-outlined">sync</span>
          <span>Đồng bộ thực đơn Tuần 46</span>
        </span>
      </div>

      <div className={styles.gridFields}>
        {/* Field 1: Ngày ăn */}
        <div className={styles.fieldItem}>
          <label className={styles.label}>
            <span className="material-symbols-outlined">calendar_today</span>
            <span>Ngày ăn</span>
          </label>
          <div className={styles.lockedBox} title="Ngày ăn được khóa theo thực đơn đã duyệt">
            <span className={styles.boxText}>26/10/2026 (Thứ Hai)</span>
            <span className={`material-symbols-outlined ${styles.lockIcon}`}>
              lock
            </span>
          </div>
        </div>

        {/* Field 2: Bữa ăn */}
        <div className={styles.fieldItem}>
          <label className={styles.label}>
            <span className="material-symbols-outlined">schedule</span>
            <span>Bữa ăn</span>
          </label>
          <div className={styles.selectBox}>
            <select
              className={styles.selectInput}
              value={selectedMeal}
              onChange={(e) => setSelectedMeal(e.target.value)}
            >
              <option value="lunch">Bữa trưa (10:45 – 11:45)</option>
              <option value="snack">Bữa xế (14:30 – 15:00)</option>
              <option value="breakfast">Bữa sáng (06:30 – 07:15)</option>
            </select>
            <span className={`material-symbols-outlined ${styles.arrowIcon}`}>
              expand_more
            </span>
          </div>
        </div>

        {/* Field 3: Món cần chế biến */}
        <div className={styles.fieldItem} ref={dropdownRef}>
          <label className={styles.label}>
            <span className="material-symbols-outlined">skillet</span>
            <span>Món cần chế biến</span>
          </label>

          <div
            className={`${styles.triggerBox} ${
              isDropdownOpen ? styles.triggerActive : ""
            }`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className={styles.dishName}>
              {selectedDish ? selectedDish.name : "Chọn món..."}
            </span>
            <div className={styles.triggerIcons}>
              {selectedDish && (
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedDish(null)
                    setIsDropdownOpen(true)
                  }}
                  title="Bỏ chọn"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
              <span className="material-symbols-outlined">
                {isDropdownOpen ? "expand_less" : "expand_more"}
              </span>
            </div>
          </div>

          {/* Popup Dropdown */}
          {isDropdownOpen && (
            <div className={styles.flyoutMenu}>
              <div className={styles.searchRow}>
                <span className="material-symbols-outlined">search</span>
                <input
                  type="text"
                  placeholder="Tìm món trong thực đơn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>

              <div className={styles.optionsWrap}>
                {filteredDishes.map((dish) => {
                  const isSelected = selectedDish?.id === dish.id
                  return (
                    <div
                      key={dish.id}
                      className={`${styles.optionItem} ${
                        isSelected ? styles.optionActive : ""
                      }`}
                      onClick={() => {
                        setSelectedDish(dish)
                        setIsDropdownOpen(false)
                        setSearchQuery("")
                      }}
                    >
                      <div className={styles.optionInfo}>
                        <span className={styles.optionTitle}>{dish.name}</span>
                        <span className={styles.optionDesc}>{dish.type}</span>
                      </div>
                      {isSelected && (
                        <span className={`material-symbols-outlined ${styles.checkIcon}`}>
                          check
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Field 4: Số suất dự kiến */}
        <div className={styles.fieldItem}>
          <label className={styles.label}>
            <span className="material-symbols-outlined">groups</span>
            <span>Số suất dự kiến</span>
            <span
              className={`material-symbols-outlined ${styles.infoIcon}`}
              title="Dữ liệu tự động tính từ 1.250 học sinh đăng ký bán trú khối 6, 7, 8 và 9"
            >
              info
            </span>
          </label>
          <div className={styles.portionDisplay}>
            <span className={styles.portionVal}>1.250</span>
            <span className={styles.portionUnit}>suất bán trú</span>
          </div>
        </div>
      </div>
    </section>
  )
}
