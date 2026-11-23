import React from "react";
import { Utensils, Check, Search, Info } from "lucide-react";
import styles from "./TraceabilityMenuDishes.module.scss";

const supplyLine = (dish) => {
  const suppliers = Array.isArray(dish.suppliers) ? dish.suppliers : [];
  const deliveries = suppliers.reduce(
    (n, s) => n + (Array.isArray(s.deliveries) ? s.deliveries.length : 0),
    0,
  );
  return suppliers.length
    ? `${suppliers.length} nhà cung cấp · ${deliveries} đơn giao`
    : "Chưa ghi nhận nguyên liệu xuất kho";
};

/** Món trong bữa của khối; bấm để chuyển món đang truy xuất. */
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

      <div className={styles.dishesGrid} role="tablist" aria-label="Chọn món để truy xuất">
        {dishes.map((dish) => {
          const isActive = dish.dishId === activeDishId;
          return (
            <div
              key={dish.dishId}
              className={`${styles.dishCard} ${isActive ? styles.dishCardActive : ""}`}
              onClick={() => onSelectDish(dish.dishId)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectDish(dish.dishId);
                }
              }}
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
            >
              <div>
                <div className={styles.dishTop}>
                  <span className={styles.dishCategoryBadge}>
                    {dish.dishCategory || "Món ăn"}
                  </span>
                  {isActive && (
                    <div className={styles.activeCheckIcon} title="Đang truy xuất món này">
                      <Check size={14} />
                    </div>
                  )}
                </div>

                <h3 className={styles.dishName}>{dish.dishName}</h3>
                <p className={styles.dishDesc}>{supplyLine(dish)}</p>
              </div>

              <div className={styles.dishFooter}>
                <Search size={14} />
                <span>{isActive ? "Đang truy xuất" : "Truy xuất món này"}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.nutritionNote}>
        <Info size={14} />
        <span>
          Bấm món khác để chuyển truy xuất: quy trình phục vụ, nhà cung cấp,
          mẫu lưu và xác thực blockchain sẽ cập nhật theo món.
        </span>
      </div>
    </section>
  );
}
