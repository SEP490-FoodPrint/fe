import React, { useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import {
  X,
  CookingPot,
  Check,
  CheckCircle2,
  Flame,
  ShieldCheck,
  Clock,
  ArrowRight,
  FlaskConical,
} from "lucide-react";
import styles from "./CreateBatchDetailModal.module.scss";

/**
 * CreateBatchDetailModal - Popup Xem chi tiết lô chế biến
 * Đồng bộ 100% với layout của Phương án phân lô:
 * - Nguyên liệu chính (Tên + Mã lô nguồn bên dưới + Định lượng xuất kho)
 * - Gia vị định mức tính chính xác theo số suất ăn của lô
 * - Badge trạng thái mẻ nấu theo từng giai đoạn
 * - Nút hành động tương ứng theo trạng thái
 */
export default function CreateBatchDetailModal({
  open,
  onClose,
  dish,
  batch,
  item,
  onConfirmCreate,
  onCompleteCooking,
  onOpenSampleModal,
  submitting = false,
  onViewBatchDetail,
}) {
  const currentItem = item || batch || dish;

  const mealLabel =
    currentItem?.mealType === "afternoon" || currentItem?.mealType === "AFTERNOON"
      ? "Bữa xế"
      : "Bữa trưa";

  const portions = Number(
    currentItem?.portionStandard ??
    currentItem?.plannedPortions ??
    currentItem?.portions ??
    0
  );

  const batchCode = currentItem?.batchCode || currentItem?.code || "";
  const isCreated = Boolean(currentItem?.isBatchCreated || batchCode);
  const status = currentItem?.status || (isCreated ? "UNCONFIRMED" : "PENDING");

  const hasSample = Boolean(
    (Array.isArray(currentItem?.retainedFoodSamples) && currentItem.retainedFoodSamples.length > 0) ||
    currentItem?.retainedFoodSample ||
    currentItem?.hasSample
  );

  const sampleData = useMemo(() => {
    if (!currentItem) return null;
    if (Array.isArray(currentItem.retainedFoodSamples) && currentItem.retainedFoodSamples.length > 0) {
      return currentItem.retainedFoodSamples[0];
    }
    return currentItem.retainedFoodSample || null;
  }, [currentItem]);

  // Phân tách nguyên liệu chính và gia vị từ dữ liệu thực tế
  const { mainIngredients, seasonings } = useMemo(() => {
    if (!currentItem) return { mainIngredients: [], seasonings: [] };

    const rawIngs = currentItem.ingredients || currentItem.cookingBatchLots || [];

    // Danh sách nguyên liệu chính thực tế từ Database / API
    const mains = rawIngs.map((ing, idx) => ({
      id: ing.id || idx,
      name: ing.name || ing.dishName || ing.ingredientName || "Nguyên liệu",
      lotCode: ing.lotCode || ing.code || "",
      amount: ing.amount || (ing.quantity ? `${ing.quantity} ${ing.unit || "kg"}` : "Theo định mức"),
    }));

    // Gia vị thực tế nếu có trong dữ liệu
    const rawSeasonings = currentItem.seasonings || currentItem.mealSeasonings || [];
    const seasonList = rawSeasonings.map((s, idx) => ({
      id: s.id || idx,
      name: s.name || s.ingredientName || "Gia vị",
      lotCode: s.lotCode || s.code || "",
      amount: s.amount || (s.quantity ? `${s.quantity} ${s.unit || "kg"}` : "Theo định mức"),
    }));

    return { mainIngredients: mains, seasonings: seasonList };
  }, [currentItem]);

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

  const formatDate = (val) => {
    try {
      const d = new Date(val || new Date());
      const pad = (n) => String(n).padStart(2, "0");
      return !isNaN(d.getTime())
        ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
        : "";
    } catch {
      return "";
    }
  };

  // Safe early exit AFTER all hooks are called
  if (!currentItem) return null;

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="batch-detail-dialog-title"
      classes={{ paper: styles.dialogPaper }}
    >
      {/* 1. Modal Header Tinh Gọn & Thống Nhất */}
      <DialogTitle id="batch-detail-dialog-title" className={styles.dialogTitle}>
        <div className={styles.titleLeft}>
          <div className={styles.iconCircle}>
            {hasSample ? (
              <ShieldCheck size={20} />
            ) : status === "COMPLETED" ? (
              <CheckCircle2 size={20} />
            ) : status === "CONFIRMED" ? (
              <Flame size={20} />
            ) : (
              <CookingPot size={20} />
            )}
          </div>
          <div className={styles.titleTextWrap}>
            <h2 className={styles.modalHeading}>Chi tiết lô chế biến</h2>
            <div className={styles.metaRow}>
              <span className={styles.dishNameText}>
                {hasSample
                  ? (() => {
                      const d = formatDate(currentItem.completedAt || currentItem.createdAt || new Date());
                      const rawName = (currentItem.name || currentItem.dishName || "")
                        .trim()
                        .replace(/^thức\s*ăn[:,\s-]*/i, "")
                        .replace(/^món\s*ăn[:,\s-]*/i, "")
                        .replace(/ngày\s*\d{1,2}\/\d{1,2}\/\d{4}/gi, "")
                        .replace(/[•,\-:\s]+$/, "")
                        .trim();
                      return rawName ? `${rawName} • Ngày ${d}` : `Ngày ${d}`;
                    })()
                  : (currentItem.name || currentItem.dishName || "Lô chế biến")}
              </span>
              <span className={styles.dot}>•</span>
              <span className={styles.mealBadge}>{mealLabel}</span>
              <span className={styles.dot}>•</span>
              <span className={styles.portionText}>
                Quy mô: <strong>{Number.isFinite(portions) ? portions.toLocaleString("vi-VN") : "0"} suất</strong>
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
        {/* 2. Thanh Tóm Tắt Trạng Thái & Mã Lô (Balance Bar) */}
        <div className={styles.summaryBar}>
          <div className={styles.summaryLeft}>
            <span className={styles.batchCodeLabel}>Mã lô:</span>
            <span className={styles.batchCodeValue}>{batchCode || "CHƯA TẠO"}</span>
          </div>

          <div className={styles.summaryRight}>
            {hasSample ? (
              <span className={styles.statusBadgeSampled}>
                <ShieldCheck size={13} />
                <span>Đã lưu mẫu 24h</span>
              </span>
            ) : status === "COMPLETED" ? (
              <span className={styles.statusBadgeCooked}>
                <CheckCircle2 size={13} />
                <span>Đã nấu xong {currentItem.completedAt ? `(${formatTime(currentItem.completedAt)})` : ""}</span>
              </span>
            ) : status === "CONFIRMED" ? (
              <span className={styles.statusBadgeCooking}>
                <Flame size={13} />
                <span>Đang nấu {currentItem.confirmedAt ? `(${formatTime(currentItem.confirmedAt)})` : ""}</span>
              </span>
            ) : (
              <span className={styles.statusBadgePending}>
                <Clock size={13} />
                <span>Chờ nấu</span>
              </span>
            )}
          </div>
        </div>

        {/* 3. Khối Thông Tin Mẫu Lưu (Chỉ hiển thị khi đã lưu mẫu) */}
        {hasSample && (
          <div className={styles.sampleInfoCard}>
            <div className={styles.sampleCardLeft}>
              <FlaskConical size={18} className={styles.sampleIcon} />
              <div className={styles.sampleDetailsWrap}>
                <span className={styles.sampleTitle}>Thông tin niêm phong lưu mẫu thực phẩm</span>
                <span className={styles.sampleLocationText}>
                  Vị trí: <strong>{sampleData?.storageLocation || "Chưa cập nhật vị trí"}</strong>
                  {sampleData?.quantity ? ` • Lượng mẫu: ${sampleData.quantity} ${sampleData.unit || "g"}` : ""}
                </span>
              </div>
            </div>
            <span className={styles.safeTag}>Đạt chuẩn ATTP</span>
          </div>
        )}

        {/* 4. Danh Sách Nguyên Liệu Thực Tế */}
        <div className={styles.itemsContainer}>
          {/* Nhóm 1: Nguyên liệu chính */}
          <div className={styles.groupSection}>
            <div className={styles.groupHeading}>
              <span>Nguyên liệu chính ({mainIngredients.length} loại)</span>
            </div>
            <div className={styles.itemsList}>
              {mainIngredients.length === 0 ? (
                <div style={{ padding: "12px 14px", color: "#94a3b8", fontSize: "13px" }}>
                  Chưa có thông tin nguyên liệu phân bổ
                </div>
              ) : (
                mainIngredients.map((item, idx) => (
                  <div key={idx} className={styles.itemRow}>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemLotCode}>
                        Mã lô: <code>{item.lotCode || "Chờ xuất kho"}</code>
                      </span>
                    </div>
                    <div className={styles.itemAmountCol}>
                      <span className={styles.itemAmount}>{item.amount}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Nhóm 2: Gia vị định mức (Chỉ hiển thị nếu có dữ liệu gia vị) */}
          {seasonings.length > 0 && (
            <div className={styles.groupSection}>
              <div className={styles.groupHeading}>
                <span>Gia vị định mức ({portions} suất)</span>
              </div>
              <div className={styles.itemsList}>
                {seasonings.map((item, idx) => (
                  <div key={idx} className={styles.itemRow}>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemLotCode}>
                        Mã lô: <code>{item.lotCode || "Chờ xuất kho"}</code>
                      </span>
                    </div>
                    <div className={styles.itemAmountCol}>
                      <span className={styles.itemAmount}>{item.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>

      {/* 5. Modal Footer: Nút hành động tương ứng theo từng trạng thái */}
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
            className={styles.confirmBtn}
            onClick={() => onConfirmCreate(currentItem)}
            disabled={submitting}
          >
            <Check size={17} />
            <span>{submitting ? "Đang tạo lô..." : "Xác nhận tạo lô"}</span>
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
            className={styles.sampleActionBtn}
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
              className={styles.viewFullBtn}
              onClick={() => onViewBatchDetail(currentItem)}
            >
              <span>Xem trang đầy đủ</span>
              <ArrowRight size={15} />
            </button>
          )
        )}
      </DialogActions>
    </Dialog>
  );
}
