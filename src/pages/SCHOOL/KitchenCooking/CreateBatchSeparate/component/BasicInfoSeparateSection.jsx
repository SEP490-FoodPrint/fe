import React, { useState, useRef, useEffect } from "react"
import {
  Lock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Beef,
  Soup,
  Utensils,
  Apple,
  CheckCircle2,
  Search,
  X,
  Minus,
  Plus
} from "lucide-react"
import styles from "./BasicInfoSeparateSection.module.scss"

const DISH_OPTIONS = [
  {
    id: "dish-1",
    name: "Thịt heo kho nước dừa",
    type: "Món mặn chính • Giàu đạm, canxi",
    icon: Beef,
  },
  {
    id: "dish-2",
    name: "Canh sườn hầm củ quả thập cẩm",
    type: "Món canh dinh dưỡng",
    icon: Soup,
  },
  {
    id: "dish-3",
    name: "Đậu hũ non sốt thịt băm cà chua",
    type: "Món phụ / xào",
    icon: Utensils,
  },
  {
    id: "dish-4",
    name: "Thanh long ruột đỏ Bình Thuận",
    type: "Món tráng miệng",
    icon: Apple,
  },
]

export default function BasicInfoSeparateSection() {
  const [selectedMeal, setSelectedMeal] = useState("lunch")
  const [selectedDish, setSelectedDish] = useState(DISH_OPTIONS[0])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [portions, setPortions] = useState(1250)

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

  const handleClearSelection = (e) => {
    e.stopPropagation()
    setSelectedDish(null)
    setIsDropdownOpen(true)
  }

  const handleAdjustPortions = (delta) => {
    setPortions((prev) => Math.max(10, prev + delta))
  }

  const DishIcon = selectedDish?.icon || Utensils

  return (
    <section className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleWithBadge}>
          <div className={styles.numberBadge}>1</div>
          <div>
            <h2 className={styles.sectionTitle}>1. Thông tin cơ bản</h2>
            <p className={styles.sectionSubtitle}>
              Bắt buộc — Ca ăn, thực đơn và số lượng học sinh phục vụ
            </p>
          </div>
        </div>
        <span className={styles.requiredTag}>Bắt buộc</span>
      </div>

      {/* Row 1: Ngày ăn & Bữa ăn */}
      <div className={styles.gridRow}>
        {/* Ngày ăn (Khóa) */}
        <div className={styles.formGroup}>
          <div className={styles.labelRow}>
            <label className={styles.label}>Ngày ăn / Chế biến</label>
            <span className={styles.lockHint} title="Đồng bộ tự động từ thực đơn">
              <Lock size={12} />
              <span>Đã khóa theo thực đơn</span>
            </span>
          </div>

          <div className={styles.lockedField}>
            <div className={styles.lockedValue}>
              <Calendar size={15} className={styles.calIcon} />
              <div className={styles.dateMeta}>
                <span className={styles.lockedDate}>26/10/2026</span>
                <span className={styles.lockedSub}>• Thứ Hai (Tuần 46)</span>
              </div>
            </div>
            <span className={styles.lockedBadge}>Khóa</span>
          </div>
        </div>

        {/* Bữa ăn phục vụ */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Bữa ăn phục vụ</label>
          <div className={styles.selectWrapper}>
            <select
              className={styles.selectInput}
              value={selectedMeal}
              onChange={(e) => setSelectedMeal(e.target.value)}
              aria-label="Chọn bữa ăn phục vụ"
            >
              <option value="lunch">Bữa trưa học đường (10:45 – 11:45)</option>
              <option value="afternoon">Bữa phụ chiều (14:30 – 15:00)</option>
              <option value="breakfast">Bữa sáng bán trú (06:45 – 07:30)</option>
            </select>
            <ChevronDown size={16} className={styles.selectArrow} aria-hidden="true" />
          </div>
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
            role="button"
            tabIndex={0}
            aria-label="Chọn món cần chế biến"
            aria-expanded={isDropdownOpen}
          >
            <div className={styles.selectedContent}>
              <div className={styles.dishIconBox}>
                <DishIcon size={16} />
              </div>
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
                  aria-label="Xóa món đã chọn"
                >
                  <X size={14} />
                </button>
              )}
              {isDropdownOpen ? (
                <ChevronUp size={16} className={styles.arrowIcon} />
              ) : (
                <ChevronDown size={16} className={styles.arrowIcon} />
              )}
            </div>
          </div>

          {/* Dropdown Menu Popup */}
          {isDropdownOpen && (
            <div className={styles.dropdownPopup}>
              <div className={styles.searchBox}>
                <Search size={15} className={styles.searchIcon} />
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Tìm tên món trong thực đơn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>

              <div className={styles.itemsList} role="listbox">
                {filteredDishes.map((dish) => {
                  const isSelected = selectedDish?.id === dish.id
                  const ItemIcon = dish.icon
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
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className={styles.itemInfo}>
                        <div
                          className={`${styles.iconWrap} ${
                            isSelected ? styles.iconWrapActive : ""
                          }`}
                        >
                          {isSelected ? (
                            <CheckCircle2 size={16} className={styles.checkIcon} />
                          ) : (
                            <ItemIcon size={16} />
                          )}
                        </div>
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

        {/* Số suất dự kiến với nút tăng giảm nhanh */}
        <div className={styles.formGroup}>
          <div className={styles.labelRow}>
            <label className={styles.label}>Số suất dự kiến</label>
            <span className={styles.rosterHint}>Sĩ số điểm danh: 1.250</span>
          </div>

          <div className={styles.stepperWrapper}>
            <button
              type="button"
              className={styles.stepBtn}
              onClick={() => handleAdjustPortions(-50)}
              aria-label="Giảm 50 suất"
            >
              <Minus size={15} />
              <span>50</span>
            </button>

            <div className={styles.inputInner}>
              <input
                type="number"
                className={styles.portionInput}
                value={portions}
                onChange={(e) => setPortions(Number(e.target.value) || 0)}
                aria-label="Số suất dự kiến"
              />
              <span className={styles.unitSuffix}>suất ăn</span>
            </div>

            <button
              type="button"
              className={styles.stepBtn}
              onClick={() => handleAdjustPortions(50)}
              aria-label="Tăng 50 suất"
            >
              <Plus size={15} />
              <span>50</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
