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
} from "lucide-react";
import styles from "./BasicInfoSection.module.scss";

export const INITIAL_DISHES = [
  // --- BỮA TRƯA (LUNCH) ---
  {
    id: "dish-1",
    mealType: "lunch",
    mealName: "Trưa",
    name: "Thịt heo kho nước dừa",
    type: "Món mặn chính",
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
    mealName: "Trưa",
    name: "Canh sườn hầm củ quả thập cẩm",
    type: "Món canh dinh dưỡng",
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
    mealName: "Trưa",
    name: "Cơm gạo ST25 dẻo thơm",
    type: "Món cơm / Tinh bột",
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
    mealName: "Trưa",
    name: "Thanh long ruột đỏ Bình Thuận",
    type: "Tráng miệng trái cây",
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
    mealName: "Xế",
    name: "Bánh bao hấp nhân thịt xá xíu",
    type: "Món xế chiều",
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
    mealName: "Xế",
    name: "Sữa chua tiệt trùng Ba Vì",
    type: "Tráng miệng xế",
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
  const [onlyPending, setOnlyPending] = useState(false);

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

  // 1. Lọc món ăn theo ca ăn
  const dishesByMeal = dishes.filter((dish) => {
    if (selectedMeal === "all") return true;
    return dish.mealType === selectedMeal;
  });

  // 2. Thống kê
  const totalInMeal = dishesByMeal.length;
  const createdInMeal = dishesByMeal.filter((d) => d.isBatchCreated).length;
  const pendingInMeal = totalInMeal - createdInMeal;

  const lunchCount = dishes.filter((d) => d.mealType === "lunch").length;
  const afternoonCount = dishes.filter((d) => d.mealType === "afternoon").length;

  // 3. Lọc nếu bật "Chỉ hiện món chưa tạo"
  const displayedDishes = dishesByMeal.filter((dish) => {
    if (onlyPending) return !dish.isBatchCreated;
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

      {/* 2. Dải chọn món ăn tinh gọn - 1 hàng điều khiển duy nhất */}
      <div className={styles.dishSelectionArea}>
        <div className={styles.singleControlRow}>
          {/* Nhóm chuyển Ca ăn (Segmented Tabs tinh gọn) */}
          <div className={styles.mealTabsGroup} role="tablist" aria-label="Chọn ca ăn">
            <button
              type="button"
              role="tab"
              aria-selected={selectedMeal === "lunch"}
              className={`${styles.mealTab} ${
                selectedMeal === "lunch" ? styles.mealTabActive : ""
              }`}
              onClick={() => handleMealChange("lunch")}
            >
              <span>Bữa trưa</span>
              <span className={styles.tabCount}>{lunchCount}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={selectedMeal === "afternoon"}
              className={`${styles.mealTab} ${
                selectedMeal === "afternoon" ? styles.mealTabActive : ""
              }`}
              onClick={() => handleMealChange("afternoon")}
            >
              <span>Bữa phụ chiều</span>
              <span className={styles.tabCount}>{afternoonCount}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={selectedMeal === "all"}
              className={`${styles.mealTab} ${
                selectedMeal === "all" ? styles.mealTabActive : ""
              }`}
              onClick={() => handleMealChange("all")}
            >
              <span>Cả ngày</span>
              <span className={styles.tabCount}>{dishes.length}</span>
            </button>
          </div>

          {/* Bên phải: Nút lọc nhanh Chưa tạo + Tiến độ */}
          <div className={styles.rightFilterGroup}>
            <button
              type="button"
              className={`${styles.onlyPendingBtn} ${
                onlyPending ? styles.onlyPendingActive : ""
              }`}
              onClick={() => setOnlyPending(!onlyPending)}
              title="Nhấn để chỉ xem các món chưa tạo lô"
            >
              <Clock size={12} />
              <span>Chưa tạo: {pendingInMeal}</span>
            </button>

            <div className={styles.progressText}>
              <span className={styles.progressDot} />
              <span>
                Đã tạo: <strong>{createdInMeal}/{totalInMeal}</strong> món
              </span>
            </div>
          </div>
        </div>

        {/* Lưới thẻ món ăn: Đồng đều, chiều cao vừa vặn, phẳng phiu, dễ nhìn */}
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
                <div className={styles.cardTopRow}>
                  <div
                    className={`${styles.iconWrap} ${
                      isSelected ? styles.iconWrapActive : ""
                    }`}
                  >
                    <ItemIcon size={15} />
                  </div>

                  <div className={styles.topRightWrap}>
                    {selectedMeal === "all" && (
                      <span className={styles.mealBadgeSmall}>{dish.mealName}</span>
                    )}
                    {isCreated ? (
                      <span
                        className={styles.badgeCreated}
                        title={`Đã tạo mã lô ${dish.batchCode}`}
                      >
                        <CheckCircle2 size={11} />
                        <span>{dish.batchCode || "Đã tạo"}</span>
                      </span>
                    ) : (
                      <span
                        className={styles.badgePending}
                        title="Chưa tạo lô chế biến"
                      >
                        <Clock size={11} />
                        <span>Chưa tạo</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.cardContent}>
                  <span className={styles.dishName}>{dish.name}</span>
                  <span className={styles.dishCategory}>{dish.type}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
