import React from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
} from "@mui/material";
import { X, ShieldCheck, AlertCircle, Scale, Building2 } from "lucide-react";
import styles from "./DishIngredientsModal.module.scss";

function DishIngredientsModal({ open, onClose, dish }) {
  if (!dish) return null;

  // Món từ cả hai cột dùng chung modal. allergyGroup quyết định có hiện thông tin nhóm dị ứng.
  const isAlternative = Boolean(dish.allergyGroup);
  const ingredients = Array.isArray(dish.ingredients) ? dish.ingredients : [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        className: styles.dialogPaper,
      }}
    >
      {/* Header Modal */}
      <DialogTitle className={styles.dialogHeader}>
        <div className={styles.headerInfo}>
          <div className={styles.titleRow}>
            <Typography variant="h3" className={styles.dishTitle}>
              {dish.name}
            </Typography>
            {isAlternative ? (
              <span className={styles.badgeAlternative}>
                Món thay thế dị ứng
              </span>
            ) : (
              <span className={styles.badgeStandard}>
                Món ăn chính tiêu chuẩn
              </span>
            )}
          </div>
          <div className={styles.metaRow}>
            {dish.portion && (
              <span className={styles.portionBadge}>
                <Scale size={14} />
                <span>Khẩu phần: {dish.portion}</span>
              </span>
            )}
            {dish.category && (
              <span className={styles.categoryBadge}>{dish.category}</span>
            )}
          </div>
        </div>

        <IconButton
          aria-label="Đóng popup"
          onClick={onClose}
          className={styles.closeBtn}
          size="small"
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent className={styles.dialogContent}>
        {/* Banner thông tin an toàn dinh dưỡng / Dị ứng */}
        {isAlternative ? (
          <div className={styles.allergyBanner}>
            <AlertCircle size={20} className={styles.allergyIcon} />
            <div>
              <p className={styles.bannerTitle}>
                Suất ăn thay thế cho nhóm: <strong>{dish.allergyGroup}</strong>
              </p>
            </div>
          </div>
        ) : (
          <></>
        )}

        {/* Bảng phân rã nguyên liệu thành phần */}
        <div className={styles.tableSection}>
          <Typography variant="subtitle2" className={styles.tableSectionTitle}>
            Bảng thành phần nguyên liệu & nguồn gốc xuất xứ:
          </Typography>

          {ingredients.length === 0 ? (
            <div className={styles.emptyIngredients}>
              <span>Chưa có dữ liệu phân rã chi tiết cho món ăn này.</span>
            </div>
          ) : (
            <div className={styles.tableResponsive}>
              <table className={styles.ingredientTable}>
                <thead>
                  <tr>
                    <th>Tên nguyên liệu</th>
                    <th>Định lượng / suất</th>
                    <th>Nhóm thực phẩm</th>
                    <th>Nhà cung cấp & Tiêu chuẩn</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map((ing, idx) => (
                    <tr key={ing.id || idx}>
                      <td className={styles.tdName}>
                        <span className={styles.ingName}>{ing.name}</span>
                        {ing.note && (
                          <span className={styles.ingNote}>{ing.note}</span>
                        )}
                      </td>
                      <td className={styles.tdPortion}>
                        <span className={styles.portionPill}>
                          {ing.portion || "-"}
                        </span>
                      </td>
                      <td className={styles.tdCategory}>
                        <span className={styles.categoryPill}>
                          {ing.category || "Thực phẩm"}
                        </span>
                      </td>
                      <td className={styles.tdSupplier}>
                        <div className={styles.supplierBox}>
                          <Building2
                            size={14}
                            className={styles.supplierIcon}
                          />
                          <span>
                            {ing.supplierName || "HTX Nông sản an toàn"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

DishIngredientsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  dish: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    portion: PropTypes.string,
    category: PropTypes.string,
    allergyGroup: PropTypes.string,
    ingredients: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        portion: PropTypes.string,
        category: PropTypes.string,
        supplierName: PropTypes.string,
        note: PropTypes.string,
      }),
    ),
  }),
};

DishIngredientsModal.defaultProps = {
  dish: null,
};

export default DishIngredientsModal;
