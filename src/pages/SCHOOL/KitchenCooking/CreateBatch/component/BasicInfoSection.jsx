import React, { useState, useEffect } from "react";
import {
  Calendar,
  ChevronDown,
  Beef,
  Soup,
  Utensils,
  Apple,
  CheckCircle2,
  Clock,
  Users,
  Search,
  Filter,
} from "lucide-react";
import styles from "./BasicInfoSection.module.scss";

export const INITIAL_DISHES = [
  // --- BỮA TRƯA (LUNCH) ---
  {
    id: "dish-1",
    mealType: "lunch",
    mealName: "Bữa trưa",
    name: "Thịt heo kho nước dừa",
    type: "Món mặn chính • Giàu đạm",
    icon: Beef,
    portionStandard: 1250,
    isBatchCreated: false,
    batchCode: "LÔ-THK-01",
    ingredients: [
      { code: "LOT-HEO-892", name: "Thịt ba chỉ heo tươi", amount: "50.0 kg" },
      { code: "LOT-HEO-893", name: "Thịt ba chỉ heo tươi", amount: "35.5 kg" },
      { code: "LOT-CUT-224", name: "Trứng cút tươi sạch", amount: "2.500 quả" },
      { code: "LOT-DUA-018", name: "Nước dừa tươi nguyên chất", amount: "80.0 lít" },
    ],
  },
  {
    id: "dish-2",
    mealType: "lunch",
    mealName: "Bữa trưa",
    name: "Canh sườn hầm củ quả thập cẩm",
    type: "Món canh • Vitamin, chất xơ",
    icon: Soup,
    portionStandard: 1250,
    isBatchCreated: false,
    batchCode: "LÔ-CSH-01",
    ingredients: [
      { code: "LOT-SUON-102", name: "Sườn non heo sạch", amount: "65.0 kg" },
      { code: "LOT-CQ-551", name: "Củ quả tươi thập cẩm (cà rốt, ngô, khoai tây)", amount: "45.0 kg" },
      { code: "LOT-HANH-088", name: "Hành hoa & ngò rí tươi", amount: "3.5 kg" },
    ],
  },
  {
    id: "dish-3",
    mealType: "lunch",
    mealName: "Bữa trưa",
    name: "Cơm gạo ST25 dẻo thơm",
    type: "Món cơm / Tinh bột sạch",
    icon: Utensils,
    portionStandard: 1250,
    isBatchCreated: true,
    batchCode: "LÔ-COM-01",
    ingredients: [
      { code: "LOT-GAO-304", name: "Gạo đặc sản ST25 Sóc Trăng", amount: "110.0 kg" },
    ],
  },
  {
    id: "dish-4",
    mealType: "lunch",
    mealName: "Bữa trưa",
    name: "Thanh long ruột đỏ Bình Thuận",
    type: "Tráng miệng • Trái cây tươi",
    icon: Apple,
    portionStandard: 1250,
    isBatchCreated: false,
    batchCode: "LÔ-TL-01",
    ingredients: [
      { code: "LOT-TL-092", name: "Thanh long ruột đỏ tươi", amount: "125.0 kg" },
    ],
  },

  // --- BỮA PHỤ CHIỀU (AFTERNOON) ---
  {
    id: "dish-5",
    mealType: "afternoon",
    mealName: "Bữa xế",
    name: "Bánh bao hấp nhân thịt xá xíu",
    type: "Bữa phụ chiều • Đạm, tinh bột",
    icon: Utensils,
    portionStandard: 1250,
    isBatchCreated: false,
    batchCode: "LÔ-BB-01",
    ingredients: [
      { code: "LOT-BOT-112", name: "Vỏ bánh bao lên men tự nhiên", amount: "1.250 cái" },
      { code: "LOT-HEO-892", name: "Thịt heo xay tươi làm nhân", amount: "45.0 kg" },
      { code: "LOT-MOC-042", name: "Mộc nhĩ & nấm hương sạch", amount: "8.5 kg" },
    ],
  },
  {
    id: "dish-6",
    mealType: "afternoon",
    mealName: "Bữa xế",
    name: "Sữa chua tiệt trùng Ba Vì ít đường",
    type: "Tráng miệng xế • Men vi sinh",
    icon: Apple,
    portionStandard: 1250,
    isBatchCreated: true,
    batchCode: "LÔ-SC-01",
    ingredients: [
      { code: "LOT-SUA-301", name: "Sữa chua Ba Vì 100g", amount: "1.250 hộp" },
    ],
  },
];

export const DISH_OPTIONS = INITIAL_DISHES;

export default function BasicInfoSection({
  dishes = INITIAL_DISHES,
  selectedDish,
  setSelectedDish,
  portions = 1250,
  setPortions,
  selectedMeal = "lunch",
  setSelectedMeal,
}) {
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'pending' | 'created'
  const [searchQuery, setSearchQuery] = useState("");

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

  // 1. Lọc món ăn theo ca ăn đã chọn
  const dishesByMeal = dishes.filter((dish) => {
    if (selectedMeal === "all") return true;
    return dish.mealType === selectedMeal;
  });

  // 2. Thống kê số lượng
  const totalInMeal = dishesByMeal.length;
  const createdInMeal = dishesByMeal.filter((d) => d.isBatchCreated).length;
  const pendingInMeal = totalInMeal - createdInMeal;

  // Số lượng theo từng ca ăn
  const lunchCount = dishes.filter((d) => d.mealType === "lunch").length;
  const afternoonCount = dishes.filter((d) => d.mealType === "afternoon").length;

  // 3. Lọc theo trạng thái và từ khóa tìm kiếm
  const displayedDishes = dishesByMeal.filter((dish) => {
    if (statusFilter === "pending" && dish.isBatchCreated) return false;
    if (statusFilter === "created" && !dish.isBatchCreated) return false;
    if (searchQuery.trim()) {
      return dish.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
    }
    return true;
  });

  // Tự động chuyển selectedDish sang món phù hợp khi đổi Ca ăn nếu món cũ không thuộc ca mới
  useEffect(() => {
    if (!selectedDish || (selectedMeal !== "all" && selectedDish.mealType !== selectedMeal)) {
      const firstCandidate =
        dishesByMeal.find((d) => !d.isBatchCreated) || dishesByMeal[0];
      if (firstCandidate) {
        setSelectedDish(firstCandidate);
        if (firstCandidate.portionStandard && setPortions) {
          setPortions(firstCandidate.portionStandard);
        }
      }
    }
  }, [selectedMeal, dishesByMeal]);

  const handleSelectDish = (dish) => {
    setSelectedDish(dish);
    if (dish.portionStandard && setPortions) {
      setPortions(dish.portionStandard);
    }
  };

  const handleMealChange = (newMeal) => {
    setSelectedMeal?.(newMeal);
  };

  return (
    <section className={styles.sectionContainer}>
      {/* 1. Dải thông tin phiên nấu hôm nay */}
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
              onChange={(e) => handleMealChange(e.target.value)}
              aria-label="Chọn bữa ăn phục vụ"
            >
              <option value="lunch">Bữa trưa học đường ({lunchCount} món)</option>
              <option value="afternoon">Bữa phụ chiều ({afternoonCount} món)</option>
              <option value="all">Tất cả ca trong ngày ({dishes.length} món)</option>
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

      {/* 2. Dải chọn món ăn & Bộ điều hướng Ca ăn + Lọc trạng thái khi có nhiều món */}
      <div className={styles.dishSelectionArea}>
        {/* Header: Tab ca ăn + Tiến độ */}
        <div className={styles.controlsHeader}>
          {/* Tabs chuyển nhanh Ca ăn (Trưa / Xế / Tất cả) */}
          <div className={styles.mealTabsRow} role="tablist" aria-label="Chọn ca ăn">
            <button
              type="button"
              role="tab"
              aria-selected={selectedMeal === "lunch"}
              className={`${styles.mealTabBtn} ${
                selectedMeal === "lunch" ? styles.mealTabActive : ""
              }`}
              onClick={() => handleMealChange("lunch")}
            >
              <span>🍱 Bữa trưa</span>
              <span className={styles.tabBadge}>{lunchCount}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={selectedMeal === "afternoon"}
              className={`${styles.mealTabBtn} ${
                selectedMeal === "afternoon" ? styles.mealTabActive : ""
              }`}
              onClick={() => handleMealChange("afternoon")}
            >
              <span>🥪 Bữa phụ chiều</span>
              <span className={styles.tabBadge}>{afternoonCount}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={selectedMeal === "all"}
              className={`${styles.mealTabBtn} ${
                selectedMeal === "all" ? styles.mealTabActive : ""
              }`}
              onClick={() => handleMealChange("all")}
            >
              <span>Tất cả cả ngày</span>
              <span className={styles.tabBadge}>{dishes.length}</span>
            </button>
          </div>

          {/* Tiến độ hoàn thành */}
          <div className={styles.progressBadge}>
            <span className={styles.progressDot} />
            <span>
              Tiến độ: <strong>{createdInMeal}/{totalInMeal}</strong> món đã tạo lô
            </span>
          </div>
        </div>

        {/* Bộ lọc trạng thái & Tìm kiếm nhanh khi có nhiều món */}
        <div className={styles.subFilterRow}>
          <div className={styles.statusPills}>
            <button
              type="button"
              className={`${styles.filterPill} ${
                statusFilter === "all" ? styles.filterPillActive : ""
              }`}
              onClick={() => setStatusFilter("all")}
            >
              Tất cả ({totalInMeal})
            </button>

            <button
              type="button"
              className={`${styles.filterPill} ${styles.pillPending} ${
                statusFilter === "pending" ? styles.filterPillActive : ""
              }`}
              onClick={() => setStatusFilter("pending")}
            >
              Chưa tạo lô ({pendingInMeal})
            </button>

            <button
              type="button"
              className={`${styles.filterPill} ${styles.pillCreated} ${
                statusFilter === "created" ? styles.filterPillActive : ""
              }`}
              onClick={() => setStatusFilter("created")}
            >
              Đã tạo ({createdInMeal})
            </button>
          </div>

          {totalInMeal > 3 && (
            <div className={styles.searchWrap}>
              <Search size={14} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Tìm nhanh tên món..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchField}
              />
            </div>
          )}
        </div>

        {/* Lưới thẻ món ăn tự co giãn thông minh (Responsive Auto-fill Grid) */}
        {displayedDishes.length === 0 ? (
          <div className={styles.emptyFilterBox}>
            <CheckCircle2 size={22} className={styles.emptyFilterIcon} />
            <div className={styles.emptyFilterText}>
              {statusFilter === "pending"
                ? "Tuyệt vời! Toàn bộ món ăn trong ca này đã được lập lô chế biến."
                : "Không tìm thấy món ăn phù hợp với bộ lọc."}
            </div>
            {statusFilter !== "all" && (
              <button
                type="button"
                className={styles.resetFilterBtn}
                onClick={() => setStatusFilter("all")}
              >
                Xem tất cả món
              </button>
            )}
          </div>
        ) : (
          <div
            className={styles.dishGrid}
            role="radiogroup"
            aria-label="Danh sách món ăn cần chế biến"
          >
            {displayedDishes.map((dish) => {
              const isSelected = selectedDish?.id === dish.id;
              const ItemIcon = dish.icon || Utensils;
              const isCreated = dish.isBatchCreated;

              return (
                <button
                  key={dish.id}
                  type="button"
                  className={`${styles.dishCard} ${
                    isSelected ? styles.dishCardActive : ""
                  } ${isCreated ? styles.dishCardCreated : ""}`}
                  onClick={() => handleSelectDish(dish)}
                  role="radio"
                  aria-checked={isSelected}
                >
                  <div className={styles.dishCardHeader}>
                    <div
                      className={`${styles.dishIconBox} ${
                        isSelected ? styles.iconBoxActive : ""
                      }`}
                    >
                      <ItemIcon size={16} />
                    </div>

                    <div className={styles.headerBadges}>
                      {selectedMeal === "all" && (
                        <span className={styles.mealTagSmall}>
                          {dish.mealName || "Ca ăn"}
                        </span>
                      )}
                      {isCreated ? (
                        <span
                          className={styles.statusBadgeCreated}
                          title={`Đã tạo mã lô ${dish.batchCode}`}
                        >
                          <CheckCircle2 size={12} />
                          <span>{dish.batchCode || "Đã tạo"}</span>
                        </span>
                      ) : (
                        <span
                          className={styles.statusBadgePending}
                          title="Chưa tạo lô chế biến"
                        >
                          <Clock size={12} />
                          <span>Chưa tạo</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.dishCardBody}>
                    <span className={styles.dishName}>{dish.name}</span>
                    <span className={styles.dishMeta}>{dish.type}</span>
                  </div>

                  {isSelected && (
                    <div className={styles.activeIndicator}>
                      <span>Đang chọn</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
