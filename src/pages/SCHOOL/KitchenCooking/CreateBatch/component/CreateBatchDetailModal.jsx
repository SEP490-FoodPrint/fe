import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
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
  Flame,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import styles from "./CreateBatchDetailModal.module.scss";

export default function CreateBatchDetailModal({
  open,
  onClose,
  dish,
  batch,
  item,
  onConfirmCreate,
  onConfirmCooking,
  onCompleteCooking,
  onOpenSampleModal,
  submitting = false,
  onViewBatchDetail,
}) {
  const currentItem = item || batch || dish;
  if (!currentItem) return null;

  const batchCode = currentItem.batchCode || currentItem.code || "";
  const isCreated = Boolean(currentItem.isBatchCreated || batchCode);
  const status = currentItem.status || (isCreated ? "UNCONFIRMED" : "PENDING");
  const ingredients = currentItem.ingredients || currentItem.cookingBatchLots || [];

  const mealLabel =
    currentItem.mealType === "afternoon" || currentItem.mealType === "AFTERNOON"
      ? "Bữa xế"
      : "Bữa trưa";

  const portions =
    currentItem.portionStandard ??
    currentItem.plannedPortions ??
    currentItem.portions ??
    0;

  const modeLabel =
    currentItem.cookingModeApplied === "SEPARATE_BY_LOT"
      ? "Nấu riêng theo lô"
      : "Nấu chung mẻ";

  const formatTime = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "";
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    } catch {
      return "";
    }
  };

  const hasSample = Boolean(
    (Array.isArray(currentItem.retainedFoodSamples) && currentItem.retainedFoodSamples.length > 0) ||
    currentItem.retainedFoodSample ||
    currentItem.hasSample
  );

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
            <h2 className={styles.dishHeading}>{currentItem.name || currentItem.dishName}</h2>
            <div className={styles.metaRow}>
              <span
                className={`${styles.mealBadge} ${
                  currentItem.mealType === "afternoon" || currentItem.mealType === "AFTERNOON"
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
                  {Number.isFinite(portions) ? portions.toLocaleString("vi-VN") : "—"}{" "}
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
        {/* Banner trạng thái theo vòng đời chế biến */}
        {status === "COMPLETED" ? (
          <div className={styles.statusBannerDone}>
            <CheckCircle2 size={20} className={styles.doneIcon} />
            <div className={styles.bannerText}>
              <span className={styles.bannerTitle}>
                Đã nấu xong hoàn tất
              </span>
              <span className={styles.bannerSubtitle}>
                Mã lô: <strong>{batchCode}</strong>
                {currentItem.completedAt ? ` • Xong lúc ${formatTime(currentItem.completedAt)}` : ""} — Sẵn sàng phân bổ suất ăn
              </span>
            </div>
          </div>
        ) : status === "CONFIRMED" ? (
          <div className={styles.statusBannerCooking}>
            <Flame size={20} className={styles.cookingIcon} />
            <div className={styles.bannerText}>
              <span className={styles.bannerTitle}>
                Đang chế biến trên bếp
              </span>
              <span className={styles.bannerSubtitle}>
                Mã lô: <strong>{batchCode}</strong>
                {currentItem.confirmedAt ? ` • Bắt đầu lúc ${formatTime(currentItem.confirmedAt)}` : ""}
              </span>
            </div>
          </div>
        ) : isCreated ? (
          <div className={styles.statusBannerCreated}>
            <Layers size={18} className={styles.createdIcon} />
            <div className={styles.bannerText}>
              <span className={styles.bannerTitle}>
                Đã khởi tạo lô chế biến
              </span>
              <span className={styles.bannerSubtitle}>
                Mã lô: <strong>{batchCode || "ĐÃ TẠO"}</strong> — Chờ xác nhận và bắt đầu nấu
              </span>
            </div>
          </div>
        ) : (
          <div className={styles.statusBannerPending}>
            <Clock size={18} className={styles.pendingIcon} />
            <div className={styles.bannerText}>
              <span className={styles.bannerTitle}>Chờ xác nhận tạo lô</span>
              <span className={styles.bannerSubtitle}>
                Kiểm tra định mức nguyên liệu bên dưới và bấm nút Tạo lô để bắt đầu
              </span>
            </div>
          </div>
        )}

        {/* Thông tin chi tiết lô */}
        <div className={styles.lotSummaryCard}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Mã lô chế biến</span>
            <span className={styles.summaryValueCode}>
              {batchCode || "TỰ ĐỘNG SINH (CB-...)"}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Quy mô chế biến</span>
            <span className={styles.summaryValue}>
              <strong>
                {Number.isFinite(portions) ? portions.toLocaleString("vi-VN") : "0"}
              </strong>{" "}
              suất ăn
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Phương thức nấu</span>
            <span className={styles.summaryValueMode}>{modeLabel}</span>
          </div>
        </div>

        {/* Thông tin mẫu lưu thực phẩm nếu đã nấu xong */}
        {status === "COMPLETED" && (
          <div className={styles.sampleBox}>
            <div className={styles.sampleIconWrap}>
              <ShieldCheck size={18} className={styles.sampleIcon} />
            </div>
            <div className={styles.sampleContent}>
              <span className={styles.sampleTitle}>
                {hasSample ? "Đã lưu mẫu thực phẩm 24h" : "Chờ lưu mẫu thực phẩm"}
              </span>
              <span className={styles.sampleDesc}>
                {hasSample
                  ? "Mẫu thức ăn đã được lưu vào tủ lưu chuyên dụng theo quy chuẩn ATTP."
                  : "Cần lưu tối thiểu 100g mẫu thức ăn trong tủ lưu 24h trước khi bàn giao suất ăn."}
              </span>
            </div>
          </div>
        )}

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
                <div key={ing.code || ing.lotCode || ing.id || idx} className={styles.ingRow}>
                  <div className={styles.ingInfoCol}>
                    <span className={styles.ingName}>
                      {ing.name || ing.dishName || ing.ingredientName}
                    </span>
                    <span className={styles.ingLotCode}>
                      {ing.code || ing.lotCode ? `Lô: ${ing.code || ing.lotCode}` : "Lô kho gần nhất"}
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

        {/* Nút hành động theo trạng thái */}
        {!isCreated && onConfirmCreate ? (
          <button
            type="button"
            className={styles.confirmTickBtn}
            onClick={() => onConfirmCreate(currentItem)}
            disabled={submitting}
          >
            <Check size={18} className={styles.tickIcon} />
            <span>{submitting ? "Đang tạo lô..." : "Xác nhận tạo lô"}</span>
          </button>
        ) : status === "UNCONFIRMED" && onConfirmCooking ? (
          <button
            type="button"
            className={styles.startCookBtn}
            onClick={() => onConfirmCooking(currentItem)}
            disabled={submitting}
          >
            <Flame size={16} />
            <span>{submitting ? "Đang xử lý..." : "Bắt đầu nấu"}</span>
          </button>
        ) : status === "CONFIRMED" && onCompleteCooking ? (
          <button
            type="button"
            className={styles.completeCookBtn}
            onClick={() => onCompleteCooking(currentItem)}
            disabled={submitting}
          >
            <CheckCircle2 size={16} />
            <span>{submitting ? "Đang xử lý..." : "Ghi nhận nấu xong"}</span>
          </button>
        ) : status === "COMPLETED" && !hasSample && onOpenSampleModal ? (
          <button
            type="button"
            className={styles.confirmTickBtn}
            onClick={() => {
              onClose?.();
              onOpenSampleModal(currentItem);
            }}
          >
            <ShieldCheck size={16} />
            <span>Lưu mẫu thực phẩm 24h</span>
          </button>
        ) : (
          onViewBatchDetail && (
            <button
              type="button"
              className={styles.viewBatchBtn}
              onClick={() => onViewBatchDetail(currentItem)}
            >
              <span>Xem trang đầy đủ</span>
              <ArrowRight size={16} />
            </button>
          )
        )}
      </DialogActions>
    </Dialog>
  );
}
