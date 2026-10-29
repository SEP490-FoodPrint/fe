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
]

export default function BasicInfoSection() {
  const [selectedMeal, setSelectedMeal] = useState("lunch")
  const [selectedDish, setSelectedDish] = useState(DISH_OPTIONS[0])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [portions, setPortions] = useState("1.250")

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

  const filteredDishes = DISH_OPTIONS.filter((dish) =>
    dish.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleRow}>
          <span className="material-symbols-outlined">tune</span>
          <h2 className={styles.sectionTitle}>Thông tin phiên nấu</h2>
        </div>
        <span className={styles.autoTag}>
          <span className="material-symbols-outlined">sync</span>
          <span>Đồng bộ thực đơn Tuần 46</span>
        </span>
      </div>

      <div className={styles.gridRow}>
        {/* Cột 1: Ngày ăn */}
        <div className={styles.fieldItem}>
          <label className={styles.label}>
            <span className="material-symbols-outlined">calendar_today</span>
            <span>Ngày ăn</span>
            <span
              className="material-symbols-outlined"
              title="Đồng bộ tự động từ thực đơn đã duyệt tuần 46"
            >
              lock
            </span>
          </label>
          <div className={styles.lockedInput}>
            <span>26/10/2026 (Thứ Hai)</span>
            <span className="material-symbols-outlined">lock</span>
          </div>
        </div>

        {/* Cột 2: Bữa ăn */}
        <div className={styles.fieldItem}>
          <label className={styles.label}>
            <span className="material-symbols-outlined">schedule</span>
            <span>Bữa ăn</span>
          </label>
          <div className={styles.selectWrapper}>
            <select
              value={selectedMeal}
              onChange={(e) => setSelectedMeal(e.target.value)}
              className={styles.selectInput}
            >
              <option value="lunch">Bữa trưa (10:45 – 11:45)</option>
              <option value="afternoon">Bữa phụ chiều (14:30 – 15:00)</option>
              <option value="breakfast">Bữa sáng bán trú (06:30 – 07:30)</option>
            </select>
            <span className="material-symbols-outlined">expand_more</span>
          </div>
        </div>

        {/* Cột 3: Món cần chế biến */}
        <div className={styles.fieldItem} ref={dropdownRef}>
          <label className={styles.label}>
            <span className="material-symbols-outlined">skillet</span>
            <span>Món cần chế biến</span>
          </label>

          <div
            className={styles.customSelect}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className={styles.dishSelectedText}>
              {selectedDish?.name || "Chọn món ăn..."}
            </span>
            <div className={styles.iconControls}>
              {selectedDish && (
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedDish(null)
                    setIsDropdownOpen(true)
                  }}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
              <span className="material-symbols-outlined">expand_more</span>
            </div>
          </div>

          {isDropdownOpen && (
            <div className={styles.dropdownPanel}>
              <div className={styles.searchBox}>
                <span className="material-symbols-outlined">search</span>
                <input
                  type="text"
                  placeholder="Tìm kiếm món ăn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                  autoFocus
                />
              </div>
              <ul className={styles.dishList}>
                {filteredDishes.map((dish) => (
                  <li
                    key={dish.id}
                    className={`${styles.dishOption} ${
                      selectedDish?.id === dish.id ? styles.selected : ""
                    }`}
                    onClick={() => {
                      setSelectedDish(dish)
                      setIsDropdownOpen(false)
                      setSearchQuery("")
                    }}
                  >
                    <span className="material-symbols-outlined">
                      {dish.icon}
                    </span>
                    <div className={styles.dishOptionMeta}>
                      <span className={styles.dishOptionName}>{dish.name}</span>
                      <span className={styles.dishOptionType}>{dish.type}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Cột 4: Số suất */}
        <div className={styles.fieldItem}>
          <label className={styles.label}>
            <span className="material-symbols-outlined">groups</span>
            <span>Số suất dự kiến</span>
            <span
              className="material-symbols-outlined"
              title="Đề xuất theo sĩ số báo ăn bán trú"
            >
              info
            </span>
          </label>
          <div className={styles.inputWithSuffix}>
            <input
              type="text"
              value={portions}
              onChange={(e) => setPortions(e.target.value)}
              className={styles.portionsInput}
            />
            <span className={styles.suffix}>suất bán trú</span>
          </div>
        </div>
      </div>
    </section>
  )
}
