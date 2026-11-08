import React from "react";
import {
  Calendar,
  ChevronDown,
  Clock,
  Users,
} from "lucide-react";
import styles from "./BasicInfoSeparateSection.module.scss";

export const INITIAL_SEPARATE_DISHES = [
  // --- BỮA TRƯA ---
  {
    id: "dish-1",
    mealType: "lunch",
    mealName: "Bữa trưa",
    name: "Thịt heo kho nước dừa",
    portionStandard: 1250,
    isBatchCreated: false,
    batchCode: "LÔ-THK-01 & 02",
  },
  {
    id: "dish-2",
    mealType: "lunch",
    mealName: "Bữa trưa",
    name: "Canh sườn hầm củ quả thập cẩm",
    portionStandard: 1250,
    isBatchCreated: false,
    batchCode: "LÔ-CSH-01",
  },
  {
    id: "dish-3",
    mealType: "lunch",
    mealName: "Bữa trưa",
    name: "Cơm gạo ST25 dẻo thơm",
    portionStandard: 1250,
    isBatchCreated: true,
    batchCode: "LÔ-COM-01",
  },
  {
    id: "dish-4",
    mealType: "lunch",
    mealName: "Bữa trưa",
    name: "Thanh long ruột đỏ Bình Thuận",
    portionStandard: 1250,
    isBatchCreated: false,
    batchCode: "LÔ-TL-01",
  },

  // --- BỮA PHỤ CHIỀU ---
  {
    id: "dish-5",
    mealType: "afternoon",
    mealName: "Bữa phụ chiều",
    name: "Bánh bao hấp nhân thịt xá xíu",
    portionStandard: 1250,
    isBatchCreated: false,
    batchCode: "LÔ-BB-01",
  },
  {
    id: "dish-6",
    mealType: "afternoon",
    mealName: "Bữa phụ chiều",
    name: "Sữa chua tiệt trùng Ba Vì",
    portionStandard: 1250,
    isBatchCreated: true,
    batchCode: "LÔ-SC-01",
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

  const lunchDishes = dishes.filter((d) => d.mealType === "lunch");
  const afternoonDishes = dishes.filter((d) => d.mealType === "afternoon");

  const lunchCreated = lunchDishes.filter((d) => d.isBatchCreated).length;
  const afternoonCreated = afternoonDishes.filter((d) => d.isBatchCreated).length;

  const handleSelectDish = (dish) => {
    setSelectedDish(dish);
    if (dish.mealType && setSelectedMeal) {
      setSelectedMeal(dish.mealType);
    }
    if (dish.portionStandard && setPortions) {
      setPortions(dish.portionStandard);
    }
  };

  const handleMealSelectChange = (newMeal) => {
    setSelectedMeal?.(newMeal);
    const targetGroup = newMeal === "afternoon" ? afternoonDishes : lunchDishes;
    const candidate = targetGroup.find((d) => !d.isBatchCreated) || targetGroup[0];
    if (candidate) {
      handleSelectDish(candidate);
    }
  };

  return (
    <section className={styles.sectionContainer}>
      {/* 1. Dải thông tin phiên nấu hôm nay */}
      <div className={styles.sessionBar}>
        <div className={styles.sessionItem}>
          <div className={styles.sessionItemHeader}>
            <Calendar size={13} className={styles.sessionIcon} />
            <span className={styles.sessionLabel}>Ngày chế biến</span>
          </div>
          <div className={styles.sessionValRow}>
            <span className={styles.sessionVal}>{todayDateStr}</span>
            <span className={styles.todayBadge}>Hôm nay</span>
          </div>
        </div>

        <div className={styles.sessionItem}>
          <div className={styles.sessionItemHeader}>
            <Clock size={13} className={styles.sessionIcon} />
            <span className={styles.sessionLabel}>Ca ăn đang xem</span>
          </div>
          <div className={styles.selectWrapper}>
            <select
              className={styles.selectInput}
              value={selectedMeal}
              onChange={(e) => handleMealSelectChange(e.target.value)}
              aria-label="Chọn ca ăn"
            >
              <option value="lunch">Bữa trưa học đường (11:00)</option>
              <option value="afternoon">Bữa phụ chiều (14:30)</option>
            </select>
            <ChevronDown size={14} className={styles.selectArrow} aria-hidden="true" />
          </div>
        </div>

        <div className={styles.sessionItem}>
          <div className={styles.sessionItemHeader}>
            <Users size={13} className={styles.sessionIcon} />
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

      {/* 2. Thực đơn chia đôi 2 cột (Bữa trưa & Bữa xế): Cực kỳ tinh gọn, không icon, không cột loại/suất */}
      <div className={styles.splitMenuContainer}>
        {/* CỘT TRÁI: BỮA TRƯA */}
        <div className={styles.mealColumn}>
          <div className={styles.columnHeader}>
            <div className={styles.columnTitleWrap}>
              <span className={styles.columnTitle}>Bữa trưa</span>
              <span className={styles.timeTag}>11:00</span>
            </div>
            <span className={styles.progressTag}>
              Đã tạo: <strong>{lunchCreated}/{lunchDishes.length}</strong>
            </span>
          </div>

          <table className={styles.dishTable}>
            <thead>
              <tr>
                <th scope="col">Tên món ăn</th>
                <th scope="col" style={{ width: "110px", textAlign: "center" }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {lunchDishes.map((dish) => {
                const isSelected = selectedDish?.id === dish.id;
                const isCreated = dish.isBatchCreated;
                return (
                  <tr
                    key={dish.id}
                    className={`${styles.dishRow} ${isSelected ? styles.rowSelected : ""}`}
                    onClick={() => handleSelectDish(dish)}
                  >
                    <td className={styles.dishNameCell}>
                      <span className={styles.dishName}>{dish.name}</span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {isCreated ? (
                        <span className={styles.statusCreated}>
                          {dish.batchCode || "Đã tạo"}
                        </span>
                      ) : (
                        <span className={styles.statusPending}>
                          Chưa tạo
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* CỘT PHẢI: BỮA PHỤ CHIỀU */}
        <div className={styles.mealColumn}>
          <div className={styles.columnHeader}>
            <div className={styles.columnTitleWrap}>
              <span className={styles.columnTitle}>Bữa phụ chiều</span>
              <span className={styles.timeTag}>14:30</span>
            </div>
            <span className={styles.progressTag}>
              Đã tạo: <strong>{afternoonCreated}/{afternoonDishes.length}</strong>
            </span>
          </div>

          <table className={styles.dishTable}>
            <thead>
              <tr>
                <th scope="col">Tên món ăn</th>
                <th scope="col" style={{ width: "110px", textAlign: "center" }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {afternoonDishes.map((dish) => {
                const isSelected = selectedDish?.id === dish.id;
                const isCreated = dish.isBatchCreated;
                return (
                  <tr
                    key={dish.id}
                    className={`${styles.dishRow} ${isSelected ? styles.rowSelected : ""}`}
                    onClick={() => handleSelectDish(dish)}
                  >
                    <td className={styles.dishNameCell}>
                      <span className={styles.dishName}>{dish.name}</span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {isCreated ? (
                        <span className={styles.statusCreated}>
                          {dish.batchCode || "Đã tạo"}
                        </span>
                      ) : (
                        <span className={styles.statusPending}>
                          Chưa tạo
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
