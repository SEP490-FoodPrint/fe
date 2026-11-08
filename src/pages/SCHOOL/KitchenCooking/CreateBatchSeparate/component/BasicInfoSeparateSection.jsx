import React, { useState, useRef, useEffect } from "react";
import {
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
  Users,
  Clock,
} from "lucide-react";
import styles from "./BasicInfoSeparateSection.module.scss";

export const SEPARATE_DISH_OPTIONS = [
  {
    id: "dish-1",
    name: "Thịt heo kho nước dừa",
    type: "Món mặn chính • Giàu đạm, canxi",
    icon: Beef,
    portionStandard: 1250,
  },
  {
    id: "dish-2",
    name: "Canh sườn hầm củ quả thập cẩm",
    type: "Món canh • Bổ sung vitamin, chất xơ",
    icon: Soup,
    portionStandard: 1250,
  },
  {
    id: "dish-3",
    name: "Cơm gạo ST25 dẻo thơm",
    type: "Món cơm / Tinh bột sạch",
    icon: Utensils,
    portionStandard: 1250,
  },
  {
    id: "dish-4",
    name: "Thanh long ruột đỏ Bình Thuận",
    type: "Tráng miệng • Trái cây tươi",
    icon: Apple,
    portionStandard: 1250,
  },
];

export default function BasicInfoSeparateSection({
  selectedDish,
  setSelectedDish,
  portions = 1250,
  setPortions,
  selectedMeal = "lunch",
  setSelectedMeal,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  const today = new Date();
  const dayNames = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  const dayOfWeek = dayNames[today.getDay()];
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  const todayDateStr = `${dayOfWeek}, ${dd}/${mm}/${yyyy}`;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredDishes = SEPARATE_DISH_OPTIONS.filter((dish) =>
    dish.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleClearSelection = (e) => {
    e.stopPropagation();
    setSelectedDish(null);
    setIsDropdownOpen(true);
  };

  const handleSelectDish = (dish) => {
    setSelectedDish(dish);
    if (dish.portionStandard && setPortions) {
      setPortions(dish.portionStandard);
    }
    setIsDropdownOpen(false);
  };

  const DishIcon = selectedDish?.icon || Utensils;

  return (
    <section className={styles.sectionContainer}>
      {/* 1. Dải thông tin phiên nấu hôm nay (Nắm bắt thông tin trong 1 giây) */}
      <div className={styles.sessionBar}>
        <div className={styles.sessionItem}>
          <div className={styles.sessionItemHeader}>
            <Calendar size={14} className={styles.sessionIcon} />
            <span className={styles.sessionLabel}>Ngày chế biến</span>
          </div>
          <div className={styles.sessionValRow}>
            <span className={styles.sessionVal}>{todayDateStr}</span>
            <span className={styles.todayBadge}>Hôm nay</span>
          </div>
        </div>

        <div className={styles.sessionItem}>
          <div className={styles.sessionItemHeader}>
            <Clock size={14} className={styles.sessionIcon} />
            <span className={styles.sessionLabel}>Bữa ăn phục vụ</span>
          </div>
          <div className={styles.selectWrapper}>
            <select
              className={styles.selectInput}
              value={selectedMeal}
              onChange={(e) => setSelectedMeal?.(e.target.value)}
              aria-label="Chọn bữa ăn phục vụ"
            >
              <option value="lunch">Bữa trưa học đường (11:30 – 12:30)</option>
              <option value="afternoon">Bữa phụ chiều (15:00 – 15:30)</option>
              <option value="breakfast">Bữa sáng bán trú (06:45 – 07:30)</option>
            </select>
            <ChevronDown size={15} className={styles.selectArrow} aria-hidden="true" />
          </div>
        </div>

        <div className={styles.sessionItem}>
          <div className={styles.sessionItemHeader}>
            <Users size={14} className={styles.sessionIcon} />
            <span className={styles.sessionLabel}>Số suất ăn</span>
          </div>
          <div className={styles.sessionValRow}>
            <span className={styles.portionVal}>
              {Number.isFinite(portions) ? portions.toLocaleString("vi-VN") : "—"}{" "}
              <span className={styles.unitText}>suất</span>
            </span>
            <span className={styles.lockBadge}>Theo điểm danh</span>
          </div>
        </div>
      </div>

      <div className={styles.divider} />

      {/* 2. Thao tác chính: Chọn món ăn cần chế biến */}
      <div className={styles.dishSelectGroup} ref={dropdownRef}>
        <div className={styles.dishLabelRow}>
          <label className={styles.mainLabel} htmlFor="dish-dropdown-separate">
            Món ăn cần chế biến
          </label>
          <span className={styles.menuSourceHint}>
            Thực đơn hôm nay ({SEPARATE_DISH_OPTIONS.length} món)
          </span>
        </div>

        <div
          id="dish-dropdown-separate"
          className={`${styles.dropdownTrigger} ${
            isDropdownOpen ? styles.dropdownOpen : ""
          } ${selectedDish ? styles.triggerSelected : ""}`}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          role="button"
          tabIndex={0}
          aria-label="Chọn món cần chế biến"
          aria-expanded={isDropdownOpen}
        >
          <div className={styles.selectedContent}>
            <div className={`${styles.dishIconBox} ${selectedDish ? styles.iconBoxActive : ""}`}>
              <DishIcon size={18} />
            </div>
            <div className={styles.selectedTextWrap}>
              <span className={selectedDish ? styles.dishNameActive : styles.dishNamePlaceholder}>
                {selectedDish ? selectedDish.name : "Bấm vào đây để chọn món ăn cần chế biến..."}
              </span>
              {selectedDish && (
                <span className={styles.dishTypeSub}>{selectedDish.type}</span>
              )}
            </div>
          </div>

          <div className={styles.triggerActions}>
            {selectedDish && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={handleClearSelection}
                title="Chọn lại món khác"
                aria-label="Xóa món đã chọn"
              >
                <X size={15} />
              </button>
            )}
            {isDropdownOpen ? (
              <ChevronUp size={18} className={styles.arrowIcon} />
            ) : (
              <ChevronDown size={18} className={styles.arrowIcon} />
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
                placeholder="Tìm nhanh tên món ăn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>

            <div className={styles.itemsList} role="listbox">
              {filteredDishes.length === 0 ? (
                <div className={styles.emptySearch}>Không tìm thấy món ăn phù hợp</div>
              ) : (
                filteredDishes.map((dish) => {
                  const isSelected = selectedDish?.id === dish.id;
                  const ItemIcon = dish.icon;
                  return (
                    <div
                      key={dish.id}
                      className={`${styles.itemRow} ${
                        isSelected ? styles.itemSelected : ""
                      }`}
                      onClick={() => handleSelectDish(dish)}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className={styles.itemInfo}>
                        <div
                          className={`${styles.itemIconWrap} ${
                            isSelected ? styles.itemIconWrapActive : ""
                          }`}
                        >
                          <ItemIcon size={16} />
                        </div>
                        <div className={styles.textContainer}>
                          <span className={styles.itemName}>{dish.name}</span>
                          <span className={styles.itemMeta}>{dish.type}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 size={16} className={styles.checkIcon} />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
