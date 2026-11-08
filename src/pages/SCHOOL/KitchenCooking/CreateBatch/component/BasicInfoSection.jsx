import React, { useState, useRef, useEffect, useMemo } from "react";
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
} from "lucide-react";
import styles from "./BasicInfoSection.module.scss";

export const DISH_OPTIONS = [
  {
    id: "dish-1",
    name: "Thịt heo kho nước dừa",
    type: "Món mặn chính • Giàu đạm, canxi",
    icon: Beef,
    portionStandard: 1250,
    ingredients: [
      {
        id: "ing-1",
        name: "Thịt ba chỉ heo tươi",
        supplier: "Hợp tác xã Nam Hà",
        totalRequired: "85.5 kg",
        portionNote: "1.250 suất",
        isMultiLot: true,
        statusText: "Đủ 85.5 / 85.5 kg",
        statusType: "success",
        lots: [
          {
            code: "LOT-HEO-892",
            exp: "12/11/2026",
            available: "50.0 kg",
            allocated: "50.0 kg",
          },
          {
            code: "LOT-HEO-893",
            exp: "13/11/2026",
            available: "60.0 kg",
            allocated: "35.5 kg",
          },
        ],
      },
      {
        id: "ing-2",
        name: "Trứng cút tươi sạch",
        supplier: "Trang trại Gia cầm Ba Vì",
        totalRequired: "2.500 quả",
        portionNote: "1.250 suất",
        isMultiLot: false,
        statusText: "Đủ 2.500 / 2.500 quả",
        statusType: "success",
        lots: [
          {
            code: "LOT-CUT-224",
            exp: "20/11/2026",
            available: "3.000 quả",
            allocated: "2.500 quả",
          },
        ],
      },
      {
        id: "ing-3",
        name: "Nước dừa tươi nguyên chất",
        supplier: "Công ty Nông sản Bến Tre",
        totalRequired: "80.0 lít",
        portionNote: "1.250 suất",
        isMultiLot: false,
        statusText: "Đủ 80.0 / 80.0 lít",
        statusType: "success",
        lots: [
          {
            code: "LOT-DUA-018",
            exp: "15/11/2026",
            available: "120.0 lít",
            allocated: "80.0 lít",
          },
        ],
      },
      {
        id: "ing-4",
        name: "Gia vị kho an toàn",
        supplier: "Tổng kho gia vị thực phẩm",
        totalRequired: "4.2 kg",
        portionNote: "1.250 suất",
        isMultiLot: false,
        statusText: "Đủ 4.2 / 4.2 kg",
        statusType: "success",
        lots: [
          {
            code: "LOT-GVI-045",
            exp: "30/12/2026",
            available: "15.0 kg",
            allocated: "4.2 kg",
          },
        ],
      },
    ],
  },
  {
    id: "dish-2",
    name: "Canh sườn hầm củ quả thập cẩm",
    type: "Món canh dinh dưỡng",
    icon: Soup,
    portionStandard: 1250,
    ingredients: [
      {
        id: "ing-201",
        name: "Sườn non heo sạch",
        supplier: "Công ty Thực phẩm Sạch Hà Nội",
        totalRequired: "65.0 kg",
        portionNote: "1.250 suất",
        isMultiLot: false,
        statusText: "Đủ 65.0 / 65.0 kg",
        statusType: "success",
        lots: [
          {
            code: "LOT-SUON-102",
            exp: "15/11/2026",
            available: "80.0 kg",
            allocated: "65.0 kg",
          },
        ],
      },
      {
        id: "ing-202",
        name: "Củ quả tươi thập cẩm",
        supplier: "HTX Rau Củ Quả Mộc Châu",
        totalRequired: "45.0 kg",
        portionNote: "1.250 suất",
        isMultiLot: false,
        statusText: "Đủ 45.0 / 45.0 kg",
        statusType: "success",
        lots: [
          {
            code: "LOT-CQ-551",
            exp: "10/11/2026",
            available: "50.0 kg",
            allocated: "45.0 kg",
          },
        ],
      },
    ],
  },
  {
    id: "dish-3",
    name: "Cơm gạo ST25 dẻo thơm",
    type: "Món chính • Năng lượng sạch",
    icon: Utensils,
    portionStandard: 1250,
    ingredients: [
      {
        id: "ing-301",
        name: "Gạo đặc sản ST25",
        supplier: "Tổng công ty Lương thực Miền Bắc",
        totalRequired: "95.0 kg",
        portionNote: "1.250 suất",
        isMultiLot: false,
        statusText: "Đủ 95.0 / 95.0 kg",
        statusType: "success",
        lots: [
          {
            code: "LOT-GAO-901",
            exp: "25/12/2026",
            available: "200.0 kg",
            allocated: "95.0 kg",
          },
        ],
      },
    ],
  },
  {
    id: "dish-4",
    name: "Thanh long ruột đỏ Bình Thuận",
    type: "Món tráng miệng",
    icon: Apple,
    portionStandard: 1250,
    ingredients: [
      {
        id: "ing-401",
        name: "Thanh long ruột đỏ VietGAP",
        supplier: "HTX Nông nghiệp Phan Thiết",
        totalRequired: "120.0 kg",
        portionNote: "1.250 suất",
        isMultiLot: false,
        statusText: "Đủ 120.0 / 120.0 kg",
        statusType: "success",
        lots: [
          {
            code: "LOT-TL-304",
            exp: "08/11/2026",
            available: "150.0 kg",
            allocated: "120.0 kg",
          },
        ],
      },
    ],
  },
];

export default function BasicInfoSection({
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

  const todayDateStr = useMemo(() => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredDishes = DISH_OPTIONS.filter((dish) =>
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
      <div className={styles.sectionHeader}>
        <div className={styles.titleWithBadge}>
          <div className={styles.numberBadge}>1</div>
          <div>
            <h2 className={styles.sectionTitle}>1. Thông tin phiên nấu</h2>
          </div>
        </div>
        <span className={styles.requiredTag}>Bắt buộc</span>
      </div>

      {/* Row 1: Ngày ăn & Bữa ăn */}
      <div className={styles.gridRow}>
        {/* Ngày ăn (Khóa theo thực đơn hôm nay) */}
        <div className={styles.formGroup}>
          <div className={styles.labelRow}>
            <label className={styles.label}>Ngày ăn / Chế biến</label>
            <span
              className={styles.lockHint}
              title="Đồng bộ tự động từ thực đơn đã duyệt"
            >
              <Lock size={12} />
              <span>Đã khóa theo thực đơn</span>
            </span>
          </div>

          <div className={styles.lockedField}>
            <div className={styles.lockedValue}>
              <Calendar size={15} className={styles.calIcon} />
              <div className={styles.dateMeta}>
                <span className={styles.lockedDate}>{todayDateStr}</span>
                <span className={styles.lockedSub}>• Hôm nay (Thực đơn đã duyệt)</span>
              </div>
            </div>
            <span className={styles.lockedBadge}>Đã duyệt</span>
          </div>
        </div>

        {/* Bữa ăn phục vụ */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Bữa ăn phục vụ</label>
          <div className={styles.selectWrapper}>
            <select
              className={styles.selectInput}
              value={selectedMeal}
              onChange={(e) => setSelectedMeal?.(e.target.value)}
              aria-label="Chọn bữa ăn phục vụ"
            >
              <option value="lunch">Bữa trưa học đường (11:00 – 12:30)</option>
              <option value="afternoon">Bữa phụ chiều (14:30 – 15:30)</option>
              <option value="breakfast">
                Bữa sáng bán trú (06:45 – 07:30)
              </option>
            </select>
            <ChevronDown
              size={16}
              className={styles.selectArrow}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* Row 2: Món cần chế biến & Số suất dự kiến */}
      <div className={styles.gridRow}>
        {/* Món cần chế biến (Searchable Dropdown + Quick Chips) */}
        <div className={styles.formGroup} ref={dropdownRef}>
          <label className={styles.label}>
            Món cần chế biến (Thực đơn hôm nay)
          </label>
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
                {selectedDish
                  ? selectedDish.name
                  : "-- Chọn món ăn trong thực đơn hôm nay --"}
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
                  placeholder="Tìm món trong thực đơn hôm nay..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>

              <div className={styles.itemsList} role="listbox">
                {filteredDishes.map((dish) => {
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
                          className={`${styles.iconWrap} ${
                            isSelected ? styles.iconWrapActive : ""
                          }`}
                        >
                          <ItemIcon size={16} />
                        </div>
                        <div className={styles.textContainer}>
                          <span
                            className={
                              isSelected
                                ? styles.selectedName
                                : styles.regularName
                            }
                          >
                            {dish.name}
                          </span>
                          <span className={styles.dishMeta}>{dish.type}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 size={16} className={styles.checkIcon} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Số suất ăn (Tự động từ điểm danh GVCN) */}
        <div className={styles.formGroup}>
          <div className={styles.labelRow}>
            <label className={styles.label} htmlFor="planned-portions-combine">Số suất ăn</label>
            <span
              className={styles.lockHint}
              title="Đối soát tự động từ điểm danh"
            >
              <Lock size={12} />
              <span>Chốt theo điểm danh</span>
            </span>
          </div>

          <div className={styles.inputInner}>
            <input
              id="planned-portions-combine"
              type="text"
              className={styles.portionInput}
              value={Number.isFinite(portions) ? portions.toLocaleString("vi-VN") : "—"}
              readOnly
              aria-readonly="true"
              aria-label="Số suất ăn"
            />
            <span className={styles.unitSuffix}>suất</span>
          </div>
        </div>
      </div>
    </section>
  );
}
