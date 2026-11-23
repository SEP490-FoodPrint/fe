import React from "react";
import PropTypes from "prop-types";
import { Utensils, Info, AlertCircle } from "lucide-react";
import { Typography } from "@mui/material";
import DishTraceButton from "src/components/Traceability/DishTraceButton";
import styles from "./MealDishesTable.module.scss";

function MealDishesTable({
  lunchDishes,
  snackDishes,
  currentMealType,
  onSelectMealType,
  onOpenDishModal,
  onTraceDish,
}) {
  // Hai tab dùng chung một bảng và chọn danh sách từ dữ liệu page đã tải.
  const currentDishes = currentMealType === "LUNCH" ? lunchDishes : snackDishes;

  return (
    <div className={styles.cardContainer}>
      {/* Header Thẻ Thực Đơn */}
      <div className={styles.cardHeader}>
        <div className={styles.headerTop}>
          <div className={styles.titleWithIcon}>
            <Utensils size={18} className={styles.utensilsIcon} />
            <Typography variant="h3" className={styles.cardTitle}>
              Thực đơn bữa ăn học đường
            </Typography>
          </div>
          <span className={styles.selectTip}>
            Bấm tên món để xem nguyên liệu · bấm logo FoodPrint để truy xuất
            nguồn gốc món theo khối
          </span>
        </div>
      </div>

      {/* Tabs Chuyển Bữa: Bữa trưa chính & Bữa xế */}
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
          Bữa xế ({snackDishes.length} món)
        </button>
      </div>

      {/* Bảng Thực Đơn Tích Hợp 4 Cột: Món Chính & Món Thay Thế Dị Ứng */}
      <div className={styles.tableResponsive}>
        <table className={styles.dishTable}>
          <thead>
            <tr>
              <th className={styles.colMainDish}>Món ăn chính (Tiêu chuẩn)</th>
              <th className={styles.colPortion}>Định lượng / suất</th>
              <th className={styles.colAltDish}>
                Món ăn thay thế (Dành cho nhóm dị ứng)
              </th>
              <th className={styles.colAltPortion}>Định lượng / suất</th>
            </tr>
          </thead>
          <tbody>
            {currentDishes.map((dish) => {
              const alt = dish.alternativeDish;
              return (
                <tr key={dish.id} className={styles.tableRow}>
                  {/* Cột 1: Món ăn chính */}
                  <td className={styles.cellMainDish}>
                    <div className={styles.dishInfoWrapper}>
                      <div className={styles.dishNameRow}>
                        <DishTraceButton
                          dishName={dish.name}
                          disabled={!onTraceDish}
                          onClick={() => onTraceDish && onTraceDish(dish)}
                        />
                        <button
                          type="button"
                          className={styles.dishLink}
                          onClick={() =>
                            onOpenDishModal && onOpenDishModal(dish)
                          }
                          title="Bấm để xem chi tiết nguyên liệu món ăn này"
                        >
                          <span className={styles.dishName}>{dish.name}</span>
                          <Info size={13} className={styles.infoIcon} />
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Cột 2: Định lượng món chính */}
                  <td className={styles.cellPortion}>
                    <span className={styles.portionBadge}>
                      {dish.portion
                        ? String(dish.portion).replace(/\s*\/\s*suất$/i, "")
                        : "-"}
                    </span>
                  </td>

                  {/* Món thay thế mở cùng modal với món chính, bằng dữ liệu của món được bấm. */}
                  <td className={styles.cellAltDish}>
                    {alt ? (
                      <div className={styles.altInfoWrapper}>
                        <div className={styles.dishNameRow}>
                          <DishTraceButton
                            size="sm"
                            dishName={alt.name}
                            disabled={!onTraceDish}
                            onClick={() => onTraceDish && onTraceDish(alt)}
                          />
                          <button
                            type="button"
                            className={styles.altDishLink}
                            onClick={() =>
                              onOpenDishModal && onOpenDishModal(alt)
                            }
                            title="Bấm để xem chi tiết nguyên liệu món thay thế"
                          >
                            <span className={styles.altDishName}>
                              {alt.name}
                            </span>
                            <Info size={13} className={styles.infoIcon} />
                          </button>
                        </div>
                        {alt.allergyGroup && (
                          <div className={styles.allergyTag}>
                            <AlertCircle
                              size={13}
                              className={styles.allergyIcon}
                            />
                            <span>
                              Dành cho nhóm dị ứng:{" "}
                              <strong>{alt.allergyGroup}</strong>
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className={styles.sharedDishNote}>
                        Không cần thay thế
                      </span>
                    )}
                  </td>

                  {/* Cột 4: Định lượng món thay thế */}
                  <td className={styles.cellAltPortion}>
                    {alt ? (
                      <span className={styles.altPortionBadge}>
                        {alt.portion
                          ? String(alt.portion).replace(/\s*\/\s*suất$/i, "")
                          : "-"}
                      </span>
                    ) : (
                      <span className={styles.dashText}>-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

MealDishesTable.propTypes = {
  lunchDishes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      portion: PropTypes.string,
      mainIngredientsText: PropTypes.string,
      alternativeDish: PropTypes.object,
    }),
  ),
  snackDishes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      portion: PropTypes.string,
      mainIngredientsText: PropTypes.string,
      alternativeDish: PropTypes.object,
    }),
  ),
  currentMealType: PropTypes.oneOf(["LUNCH", "AFTERNOON"]).isRequired,
  onSelectMealType: PropTypes.func.isRequired,
  onOpenDishModal: PropTypes.func.isRequired,
  onTraceDish: PropTypes.func,
};

MealDishesTable.defaultProps = {
  lunchDishes: [],
  snackDishes: [],
  onTraceDish: null,
};

export default MealDishesTable;
