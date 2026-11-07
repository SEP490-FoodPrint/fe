import React from "react";
import PropTypes from "prop-types";
import { CheckCircle2, Utensils } from "lucide-react";
import { Typography } from "@mui/material";
import styles from "./MealDishesList.module.scss";

function MealDishesList({
  lunchDishes,
  snackDishes,
  currentMealType,
  onSelectMealType,
  selectedDishId,
  onSelectDish,
}) {
  const currentDishes = currentMealType === "LUNCH" ? lunchDishes : snackDishes;

  return (
    <div className={styles.cardContainer}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.headerTop}>
          <div className={styles.titleWithIcon}>
            <Utensils size={18} className={styles.utensilsIcon} />
            <Typography variant="h3" className={styles.cardTitle}>
              Thực đơn bữa ăn
            </Typography>
          </div>
          <span className={styles.selectTip}>Chọn món</span>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.mealTypeTabs}>
        <button
          type="button"
          className={`${styles.tabButton} ${
            currentMealType === "LUNCH" ? styles.tabButtonActive : ""
          }`}
          onClick={() => onSelectMealType("LUNCH")}
        >
          Bữa trưa chính ({lunchDishes.length})
        </button>
        <button
          type="button"
          className={`${styles.tabButton} ${
            currentMealType === "AFTERNOON" ? styles.tabButtonActive : ""
          }`}
          onClick={() => onSelectMealType("AFTERNOON")}
        >
          Bữa phụ chiều ({snackDishes.length})
        </button>
      </div>

      {/* List */}
      <div className={styles.dishList}>
        {currentDishes.map((dish) => {
          const isSelected = dish.id === selectedDishId;
          return (
            <div
              key={dish.id}
              className={`${styles.dishItem} ${
                isSelected ? styles.dishItemActive : ""
              }`}
              onClick={() => onSelectDish(dish.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onSelectDish(dish.id);
                }
              }}
            >
              <div className={styles.dishInfo}>
                <span
                  className={`${styles.dishName} ${
                    isSelected ? styles.dishNameActive : ""
                  }`}
                >
                  {dish.name}
                </span>
                {isSelected && (
                  <span className={styles.selectedStatus}>
                    <CheckCircle2 size={13} />
                    <span>Đang chọn</span>
                  </span>
                )}
              </div>
              <span
                className={`${styles.portionBadge} ${
                  isSelected ? styles.portionBadgeActive : ""
                }`}
              >
                {dish.portion}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

MealDishesList.propTypes = {
  lunchDishes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      portion: PropTypes.string,
    }),
  ),
  snackDishes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      portion: PropTypes.string,
    }),
  ),
  currentMealType: PropTypes.oneOf(["LUNCH", "AFTERNOON"]).isRequired,
  onSelectMealType: PropTypes.func.isRequired,
  selectedDishId: PropTypes.string,
  onSelectDish: PropTypes.func.isRequired,
};

MealDishesList.defaultProps = {
  lunchDishes: [],
  snackDishes: [],
  selectedDishId: "",
};

export default MealDishesList;
