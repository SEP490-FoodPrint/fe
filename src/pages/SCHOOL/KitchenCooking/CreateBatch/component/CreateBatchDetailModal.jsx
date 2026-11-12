import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  X,
  Check,
  CookingPot,
  Layers,
  Users,
  Clock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import styles from "./CreateBatchDetailModal.module.scss";

export default function CreateBatchDetailModal({
  open,
  onClose,
  dish,
  onConfirmCreate,
  submitting = false,
  onViewBatchDetail,
}) {
  if (!dish) return null;

  const isCreated = Boolean(dish.isBatchCreated);
  const ingredients = dish.ingredients || [];
  const mealLabel =
    dish.mealType === "afternoon" || dish.mealType === "AFTERNOON"
      ? "Bữa xế"
      : "Bữa trưa";

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="batch-detail-dialog-title"
      classes={{ paper: styles.dialogPaper }}
    >
      <DialogTitle id="batch-detail-dialog-title" className={styles.dialogTitle}>
        <div className={styles.titleLeft}>
          <div className={styles.dishIconWrap}>
            <CookingPot size={20} className={styles.dishIcon} />
          </div>
          <div className={styles.titleTextWrap}>
            <h2 className={styles.dishHeading}>{dish.name}</h2>
            <div className={styles.metaRow}>
              <span
                className={`${styles.mealBadge} ${
                  dish.mealType === "afternoon" || dish.mealType === "AFTERNOON"
                    ? styles.mealAfternoon
                    : styles.mealLunch
                }`}
              >
                {mealLabel}
              </span>
              <span className={styles.dot}>•</span>
              <span className={styles.portionsMeta}>
                <Users size={12} />
                <span>
                  {Number.isFinite(dish.portionStandard)
                    ? dish.portionStandard.toLocaleString("vi-VN")
                    : "—"}{" "}
                  suất
                </span>
              </span>
            </div>
          </div>
        </div>

        <IconButton
          onClick={onClose}
          size="small"
          className={styles.closeBtn}
          aria-label="Đóng"
          disabled={submitting}
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers className={styles.dialogContent}>
        {/* Banner trạng thái */}
        {isCreated ? (
          <div className={styles.statusBannerDone}>
            <CheckCircle2 size={18} className={styles.doneIcon} />
            <div className={styles.bannerText}>
              <span className={styles.bannerTitle}>
                Đã lập lô chế biến thành công
              </span>
              <span className={styles.bannerSubtitle}>
                Mã lô: <strong>{dish.batchCode || "ĐÃ TẠO"}</strong> — Sẵn sàng nấu
              </span>
            </div>
          </div>
        ) : (
          <div className={styles.statusBannerPending}>
            <Clock size={16} className={styles.pendingIcon} />
            <div className={styles.bannerText}>
              <span className={styles.bannerTitle}>Chờ xác nhận tạo lô</span>
              <span className={styles.bannerSubtitle}>
                Kiểm tra định mức nguyên liệu bên dưới và bấm nút tích để tạo lô
              </span>
            </div>
          </div>
        )}

        {/* Thông tin phương án lô dự kiến */}
        <div className={styles.lotSummaryCard}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Mã lô dự kiến</span>
            <span className={styles.summaryValueCode}>
              {dish.batchCode || "TỰ ĐỘNG SINH (CB-...)"}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Quy mô chế biến</span>
            <span className={styles.summaryValue}>
              <strong>
                {Number.isFinite(dish.portionStandard)
                  ? dish.portionStandard.toLocaleString("vi-VN")
                  : "0"}
              </strong>{" "}
              suất ăn
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Phương thức nấu</span>
            <span className={styles.summaryValueMode}>Nấu chung mẻ</span>
          </div>
        </div>

        {/* Danh sách nguyên liệu xuất kho */}
        <div className={styles.ingredientsSection}>
          <div className={styles.ingHeader}>
            <div className={styles.ingTitleLeft}>
              <Layers size={14} className={styles.ingIcon} />
              <span className={styles.ingTitle}>Lô nguyên liệu xuất kho</span>
            </div>
            <span className={styles.ingCountBadge}>
              {ingredients.length.toString().padStart(2, "0")} lô
            </span>
          </div>

          {ingredients.length > 0 ? (
            <div className={styles.ingredientsList}>
              {ingredients.map((ing, idx) => (
                <div key={ing.code || idx} className={styles.ingRow}>
                  <div className={styles.ingInfoCol}>
                    <span className={styles.ingName}>
                      {ing.name || ing.ingredientName}
                    </span>
                    <span className={styles.ingLotCode}>
                      {ing.code ? `Lô: ${ing.code}` : "Lô kho gần nhất"}
                    </span>
                  </div>
                  <div className={styles.ingAmountCol}>
                    <span className={styles.ingAmount}>
                      {ing.amount ||
                        (ing.quantity ? `${ing.quantity} ${ing.unit || "kg"}` : "Theo định mức")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noIngredientsNotice}>
              <span>
                Nguyên liệu đã được phân bổ tự động theo định mức dinh dưỡng BGH duyệt.
              </span>
            </div>
          )}
        </div>
      </DialogContent>

      <DialogActions className={styles.dialogActions}>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={onClose}
          disabled={submitting}
        >
          Đóng
        </button>

        {isCreated ? (
          <button
            type="button"
            className={styles.viewBatchBtn}
            onClick={() => onViewBatchDetail?.(dish)}
          >
            <span>Xem chi tiết lô</span>
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            className={styles.confirmTickBtn}
            onClick={() => onConfirmCreate?.(dish)}
            disabled={submitting}
          >
            <Check size={18} className={styles.tickIcon} />
            <span>{submitting ? "Đang tạo lô..." : "Xác nhận tạo lô"}</span>
          </button>
        )}
      </DialogActions>
    </Dialog>
  );
}

