import React from "react";
import PropTypes from "prop-types";
import { Utensils } from "lucide-react";
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
      {/* Header thu gọn */}
      <div className={styles.cardHeader}>
        <div className={styles.headerTop}>
          <div className={styles.titleWithIcon}>
            <Utensils size={18} className={styles.utensilsIcon} />
            <Typography variant="h3" className={styles.cardTitle}>
              Thực đơn bữa ăn
            </Typography>
          </div>
          <span className={styles.selectTip}>
            Bấm vào dòng món ăn để xem định lượng & kiểm thực nguyên liệu bên dưới
          </span>
        </div>
      </div>

      {/* Tabs chuyển bữa gọn gàng */}
      <div className={styles.mealTypeTabs}>
        <button
          type="button"
          className={`${styles.tabButton} ${
            currentMealType === "LUNCH" ? styles.tabButtonActive : ""
          }`}
          onClick={() => onSelectMealType("LUNCH")}
        >
          Bữa trưa chính ({lunchDishes.length} món)
        </button>
        <button
          type="button"
          className={`${styles.tabButton} ${
            currentMealType === "AFTERNOON" ? styles.tabButtonActive : ""
          }`}
          onClick={() => onSelectMealType("AFTERNOON")}
        >
          Bữa phụ chiều ({snackDishes.length} món)
        </button>
      </div>

      {/* Danh sách món ăn dạng Bảng không border (chỉ add padding + border khi active) */}
      <div className={styles.compactDishTable} role="table" aria-label="Danh sách món ăn thực đơn">
        {currentDishes.map((dish) => {
          const isSelected = dish.id === selectedDishId;
          const ingredientsBrief =
            dish.mainIngredientsText ||
            (Array.isArray(dish.ingredients) && dish.ingredients.length > 0
              ? dish.ingredients.map((i) => i.name).join(", ")
              : "");

          return (
            <div
              key={dish.id}
              className={`${styles.tableRow} ${
                isSelected ? styles.tableRowActive : ""
              }`}
              onClick={() => onSelectDish(dish.id)}
              role="row"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onSelectDish(dish.id);
                }
              }}
            >
              {/* Cột Tên món + Nguyên liệu chính nghiêng mờ */}
              <div className={styles.cellMain}>
                <span
                  className={`${styles.dishName} ${
                    isSelected ? styles.dishNameActive : ""
                  }`}
                >
                  {dish.name}
                </span>

                {ingredientsBrief && (
                  <span
                    className={styles.ingredientsBrief}
                    title={ingredientsBrief}
                  >
                    ({ingredientsBrief})
                  </span>
                )}
              </div>

              {/* Cột Định lượng trên 1 suất ăn */}
              {dish.portion && (
                <div className={styles.cellPortion}>
                  <span
                    className={`${styles.portionText} ${
                      isSelected ? styles.portionTextActive : ""
                    }`}
                  >
                    {dish.portion}
                  </span>
                </div>
              )}
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
      mainIngredientsText: PropTypes.string,
      portion: PropTypes.string,
      ingredients: PropTypes.array,
    }),
  ),
  snackDishes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      mainIngredientsText: PropTypes.string,
      portion: PropTypes.string,
      ingredients: PropTypes.array,
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
