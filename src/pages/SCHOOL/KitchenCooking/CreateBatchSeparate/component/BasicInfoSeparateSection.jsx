import React from "react";
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
import styles from "./BasicInfoSeparateSection.module.scss";

export const INITIAL_SEPARATE_DISHES = [
  {
    id: "dish-1",
    name: "Thịt heo kho nước dừa",
    type: "Món mặn chính • Giàu đạm",
    icon: Beef,
    portionStandard: 1250,
    isBatchCreated: false,
    batchCode: "LÔ-THK-01 & 02",
  },
  {
    id: "dish-2",
    name: "Canh sườn hầm củ quả thập cẩm",
    type: "Món canh • Vitamin, chất xơ",
    icon: Soup,
    portionStandard: 1250,
    isBatchCreated: false,
    batchCode: "LÔ-CSH-01",
  },
  {
    id: "dish-3",
    name: "Cơm gạo ST25 dẻo thơm",
    type: "Món cơm / Tinh bột sạch",
    icon: Utensils,
    portionStandard: 1250,
    isBatchCreated: true,
    batchCode: "LÔ-COM-01",
  },
  {
    id: "dish-4",
    name: "Thanh long ruột đỏ Bình Thuận",
    type: "Tráng miệng • Trái cây tươi",
    icon: Apple,
    portionStandard: 1250,
    isBatchCreated: false,
    batchCode: "LÔ-TL-01",
  },
];

export const SEPARATE_DISH_OPTIONS = INITIAL_SEPARATE_DISHES;

export default function BasicInfoSeparateSection({
  dishes = INITIAL_SEPARATE_DISHES,
  selectedDish,
  setSelectedDish,
  portions = 1250,
  setPortions,
  selectedMeal = "lunch",
  setSelectedMeal,
}) {
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

  const createdCount = dishes.filter((d) => d.isBatchCreated).length;

  const handleSelectDish = (dish) => {
    setSelectedDish(dish);
    if (dish.portionStandard && setPortions) {
      setPortions(dish.portionStandard);
    }
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
              onChange={(e) => setSelectedMeal?.(e.target.value)}
              aria-label="Chọn bữa ăn phục vụ"
            >
              <option value="lunch">Bữa trưa học đường (11:00 – 12:30)</option>
              <option value="afternoon">Bữa phụ chiều (14:30 – 15:30)</option>
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

      {/* 2. Dải chọn món ăn & Trạng thái tạo lô */}
      <div className={styles.dishSelectionArea}>
        <div className={styles.dishHeaderRow}>
          <div className={styles.dishTitleLeft}>
            <label className={styles.mainLabel}>
              Món ăn cần tách lô
            </label>
            <span className={styles.menuSourceHint}>
              Thực đơn hôm nay ({dishes.length} món)
            </span>
          </div>

          <div className={styles.progressBadge}>
            <span className={styles.progressDot} />
            <span>
              Tiến độ: <strong>{createdCount}/{dishes.length}</strong> món đã tạo lô
            </span>
          </div>
        </div>

        {/* 4 Card món ăn chọn nhanh 1 chạm, nhảy giao diện tại chỗ */}
        <div className={styles.dishGrid} role="radiogroup" aria-label="Danh sách món ăn hôm nay">
          {dishes.map((dish) => {
            const isSelected = selectedDish?.id === dish.id;
            const ItemIcon = dish.icon || Utensils;
            const isCreated = dish.isBatchCreated;

            return (
              <button
                key={dish.id}
                type="button"
                className={`${styles.dishCard} ${isSelected ? styles.dishCardActive : ""} ${
                  isCreated ? styles.dishCardCreated : ""
                }`}
                onClick={() => handleSelectDish(dish)}
                role="radio"
                aria-checked={isSelected}
              >
                <div className={styles.dishCardHeader}>
                  <div className={`${styles.dishIconBox} ${isSelected ? styles.iconBoxActive : ""}`}>
                    <ItemIcon size={16} />
                  </div>
                  {isCreated ? (
                    <span className={styles.statusBadgeCreated} title={`Đã tạo mã lô ${dish.batchCode}`}>
                      <CheckCircle2 size={12} />
                      <span>{dish.batchCode || "Đã tạo"}</span>
                    </span>
                  ) : (
                    <span className={styles.statusBadgePending} title="Chưa tạo lô chế biến">
                      <Clock size={12} />
                      <span>Chưa tạo</span>
                    </span>
                  )}
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
      </div>
    </section>
  );
}
