import React from "react";
import { Utensils, Check, Search, Info } from "lucide-react";
import styles from "./TraceabilityMenuDishes.module.scss";

export default function TraceabilityMenuDishes({
  dishes = [],
  activeDishId,
  onSelectDish,
}) {
  if (!dishes.length) return null;

  return (
    <section className={styles.menuSection}>
      <div className={styles.menuHeader}>
        <div className={styles.titleBox}>
          <Utensils size={18} className={styles.titleIcon} />
          <h2 className={styles.menuTitle}>Món ăn trong bữa</h2>
        </div>
      </div>

      <div className={styles.dishesGrid}>
        {dishes.map((dish) => {
          const isActive = dish.dishId === activeDishId;
          const totalBatches = dish.batches?.length ?? 0;
          const totalPortions = dish.batches?.reduce(
            (acc, b) => acc + (b.allocatedPortions || 0),
            0,
          );

          return (
            <div
              key={dish.dishId}
              className={`${styles.dishCard} ${isActive ? styles.dishCardActive : ""}`}
              onClick={() => onSelectDish(dish.dishId)}
              role="button"
              tabIndex={0}
            >
              <div>
                <div className={styles.dishTop}>
                  <span className={styles.dishCategoryBadge}>
                    {dish.dishCategory || "Món ăn"}
                  </span>
                  {isActive && (
                    <div
                      className={styles.activeCheckIcon}
                      title="Đang xem truy xuất chi tiết"
                    >
                      <Check size={14} />
                    </div>
                  )}
                </div>

                <h3 className={styles.dishName}>{dish.dishName}</h3>
                <p className={styles.dishDesc}>
                  {totalPortions > 0
                    ? `Phân bổ ${totalPortions} suất (từ ${totalBatches} lô chế biến)`
                    : "Được chế biến đạt chuẩn tại bếp trường"}
                </p>
              </div>

              <div className={styles.dishFooter}>
                <Search size={14} />
                <span>
                  {isActive
                    ? "Đang chọn xem truy xuất"
                    : "Bấm để xem truy xuất"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.nutritionNote}>
        <Info size={14} />
        <span>
          Ghi chú: Bấm vào từng món ăn phía trên để xem các lô chế biến, mẫu lưu
          kiểm nghiệm và nguồn gốc nguyên liệu của món đó.
        </span>
      </div>
    </section>
  );
}
