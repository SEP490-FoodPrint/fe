import React from "react";
import PropTypes from "prop-types";
import { QrCode, ShieldCheck } from "lucide-react";
import { Typography } from "@mui/material";
import styles from "./DishIngredientsDetail.module.scss";

function DishIngredientsDetail({ selectedDish, onTraceIngredient }) {
  const dishName = selectedDish?.name || "Món ăn đang chọn";
  const ingredients = selectedDish?.ingredients || [];

  return (
    <div className={styles.detailCard}>
      {/* Header */}
      <div className={styles.headerArea}>
        <div className={styles.headerTopRow}>
          <div className={styles.titleWithBadges}>
            <Typography variant="h3" className={styles.mainTitle}>
              Thành phần nguyên liệu
            </Typography>
            <p className={styles.countBadge}>
              {ingredients.length} nguyên liệu
            </p>
          </div>
          <div className={styles.currentDishPill}>{dishName}</div>
        </div>
        <p className={styles.headerDescription}>
          Danh sách nguyên liệu định lượng cho mỗi khẩu phần học sinh theo chuẩn
          thực đơn đã phê duyệt.
        </p>
      </div>

      {/* Ingredient Rows */}
      {ingredients.length === 0 ? (
        <div className={styles.emptyIngredients}>
          Đang cập nhật danh mục nguyên liệu định lượng cho món này.
        </div>
      ) : (
        <div className={styles.ingredientList}>
          {ingredients.map((ing) => (
            <div key={ing.id} className={styles.ingredientRow}>
              <div className={styles.ingredientMainInfo}>
                <div className={styles.nameTagRow}>
                  <span className={styles.ingredientName}>{ing.name}</span>
                  <span className={styles.categoryTag}>
                    Nhóm: {ing.category}
                  </span>
                </div>
                <span className={styles.portionText}>
                  Định lượng mỗi khẩu phần: <strong>{ing.portion}</strong>
                </span>
              </div>

              <div className={styles.actionArea}>
                <button
                  type="button"
                  className={styles.traceButton}
                  onClick={() => onTraceIngredient && onTraceIngredient(ing)}
                >
                  <QrCode size={14} />
                  <span>Truy xuất nguồn gốc</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

DishIngredientsDetail.propTypes = {
  selectedDish: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    ingredients: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        category: PropTypes.string,
        portion: PropTypes.string,
      }),
    ),
  }),
  onTraceIngredient: PropTypes.func,
};

DishIngredientsDetail.defaultProps = {
  selectedDish: null,
  onTraceIngredient: () => {},
};

export default DishIngredientsDetail;
