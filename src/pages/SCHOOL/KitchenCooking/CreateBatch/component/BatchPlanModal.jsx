import React, { useState, useEffect, useMemo } from "react";
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
  ChevronLeft,
  ChevronRight,
  Columns2,
  Grid3X3,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import styles from "./BatchPlanModal.module.scss";

/**
 * BatchPlanModal - Popup Phương án phân lô chế biến tối ưu cho quy mô lớn
 * Hỗ trợ 2 chế độ hiển thị:
 * 1. Master-Detail (2 cột song song): Không cuộn trang dài dù có 10-20 lô
 * 2. Ma trận tổng hợp (Matrix View): Bảng so sánh đối chiếu nhanh tất cả các lô
 */
export default function BatchPlanModal({
  open = false,
  onClose,
  dish,
  cookingMode = "SEPARATE_BY_LOT",
  onConfirm,
  submitting = false,
}) {
  // State quản lý lô đang chọn ở cột chi tiết (mặc định lô đầu tiên 0)
  const [selectedLotIndex, setSelectedLotIndex] = useState(0);

  // State chuyển đổi giữa chế độ xem 2 cột (split) và xem bảng ma trận (matrix)
  const [viewMode, setViewMode] = useState("split"); // "split" | "matrix"

  const mealLabel =
    dish?.mealType === "afternoon" || dish?.mealType === "AFTERNOON"
      ? "Bữa xế"
      : "Bữa trưa";

  const totalPortions = Number(dish?.portionStandard || dish?.plannedPortions || 450);

  // Tạo dữ liệu phương án phân lô và gia vị tính theo số suất
  const plannedBatches = useMemo(() => {
    if (!dish) return [];

    const pad = (n) => String(n).padStart(2, "0");
    const now = new Date();
    const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;

    // Lấy nguyên liệu thực tế từ công thức món ăn (Database / API)
    const rawDishIngs = Array.isArray(dish.ingredients) && dish.ingredients.length > 0
      ? dish.ingredients
      : (dish.cookingBatchLots || []);

    const rawSeasonings = Array.isArray(dish.seasonings) ? dish.seasonings : [];

    // Xác định số lượng lô phân tách linh hoạt theo quy mô suất
    // Đối với suất thông thường (<= 350): chia 2 lô nguồn
    // Đối với quy mô nhiều lô (> 350): chia theo mẻ nấu công nghiệp 200-250 suất/chảo
    let batchPortionsList = [];
    if (totalPortions <= 350) {
      const p1 = Math.round(totalPortions * 0.6);
      const p2 = totalPortions - p1;
      batchPortionsList = [p1, p2];
    } else {
      const targetPerBatch = 200;
      const numBatches = Math.max(2, Math.round(totalPortions / targetPerBatch));
      const basePortion = Math.floor(totalPortions / numBatches);
      let remainder = totalPortions - basePortion * numBatches;
      batchPortionsList = Array.from({ length: numBatches }, (_, i) => {
        const extra = remainder > 0 ? 1 : 0;
        remainder = Math.max(0, remainder - 1);
        return basePortion + extra;
      });
    }

    return batchPortionsList.map((p, idx) => {
      const lotNumStr = String(idx + 1).padStart(2, "0");
      const lotCodeFormatted = `CB-${dateStr}-${String(idx + 1).padStart(3, "0")}`;

      const mains = rawDishIngs.map((ing, ingIdx) => {
        const portionQty = Number(ing.portionQty || ing.requiredQuantity || 0);
        const calcQty = portionQty > 0 ? portionQty * p : 0;
        return {
          id: ing.id || `main-${idx}-${ingIdx}`,
          name: ing.name || ing.ingredientName || `Nguyên liệu #${ingIdx + 1}`,
          lotCode: ing.lotCode || ing.code || "Chờ xuất kho",
          amount: calcQty > 0 ? `${calcQty.toFixed(1)} ${ing.unit || "kg"}` : (ing.amount || "Theo định mức"),
          amountRaw: calcQty,
          unit: ing.unit || "kg",
        };
      });

      const seasons = rawSeasonings.map((s, sIdx) => {
        const portionQty = Number(s.portionQty || s.requiredQuantity || 0);
        const calcQty = portionQty > 0 ? portionQty * p : 0;
        return {
          id: s.id || `seasoning-${idx}-${sIdx}`,
          name: s.name || s.ingredientName || `Gia vị #${sIdx + 1}`,
          lotCode: s.lotCode || s.code || "Chờ xuất kho",
          amount: calcQty > 0 ? `${calcQty.toFixed(2)} ${s.unit || "kg"}` : (s.amount || "Theo định mức"),
          amountRaw: calcQty,
          unit: s.unit || "kg",
        };
      });

      return {
        id: `batch-plan-${lotNumStr}`,
        index: idx,
        code: lotCodeFormatted,
        name: `Lô chế biến ${idx + 1}`,
        portions: p,
        mainIngredients: mains,
        seasonings: seasons,
      };
    });
  }, [dish, totalPortions]);

  // Reset selectedLotIndex khi đổi món hoặc mở modal
  useEffect(() => {
    if (open) {
      setSelectedLotIndex(0);
    }
  }, [open, dish]);

  // Tính tổng số suất đã phân bổ vào các lô
  const totalAllocatedPortions = useMemo(() => {
    return plannedBatches.reduce((sum, b) => sum + (b.portions || 0), 0);
  }, [plannedBatches]);

  const isBalanced = totalAllocatedPortions === totalPortions;

  // Lô đang được chọn xem ở cột phải (Detail)
  const currentBatch = plannedBatches[selectedLotIndex] || plannedBatches[0];

  // Chuyển sang lô trước / lô sau
  const handlePrevLot = () => {
    if (selectedLotIndex > 0) {
      setSelectedLotIndex((prev) => prev - 1);
    }
  };

  const handleNextLot = () => {
    if (selectedLotIndex < plannedBatches.length - 1) {
      setSelectedLotIndex((prev) => prev + 1);
    }
  };

  // Safe early exit AFTER all hooks are called
  if (!dish) return null;

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="batch-plan-dialog-title"
      classes={{ paper: styles.dialogPaper }}
    >
      {/* 1. Modal Header Tinh Gọn */}
      <DialogTitle id="batch-plan-dialog-title" className={styles.dialogTitle}>
        <div className={styles.titleLeft}>
          <div className={styles.iconCircle}>
            <CookingPot size={20} />
          </div>
          <div className={styles.titleTextWrap}>
            <h2 className={styles.modalHeading}>Phương án phân lô chế biến</h2>
            <div className={styles.metaRow}>
              <span className={styles.dishNameText}>{dish.name}</span>
              <span className={styles.dot}>•</span>
              <span className={styles.mealBadge}>{mealLabel}</span>
              <span className={styles.dot}>•</span>
              <span className={styles.portionText}>
                Tổng nhu cầu: <strong>{totalPortions.toLocaleString("vi-VN")} suất</strong>
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
        {/* 2. Thanh Cân Đối KPI (Balance Bar) & Bộ Chuyển Chế Độ Xem */}
        <div className={styles.balanceBar}>
          <div className={styles.kpiLeft}>
            <div className={styles.kpiPill}>
              <span className={styles.kpiLabel}>Quy mô:</span>
              <span className={styles.kpiValBold}>{plannedBatches.length} lô</span>
            </div>
            <div className={styles.kpiPill}>
              <span className={styles.kpiLabel}>Phân bổ:</span>
              <span className={styles.kpiValBold}>
                {totalAllocatedPortions.toLocaleString("vi-VN")} / {totalPortions.toLocaleString("vi-VN")} suất
              </span>
              {isBalanced && (
                <span className={styles.balancedChip}>
                  <CheckCircle2 size={12} />
                  <span>Khớp 100%</span>
                </span>
              )}
            </div>
          </div>

          {/* Nút chuyển chế độ xem: 2 Cột vs Bảng Ma Trận */}
          <div className={styles.viewModeToggle}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${viewMode === "split" ? styles.activeToggle : ""}`}
              onClick={() => setViewMode("split")}
              title="Xem chi tiết từng mẻ dạng 2 cột"
            >
              <Columns2 size={14} />
              <span>Từng mẻ</span>
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${viewMode === "matrix" ? styles.activeToggle : ""}`}
              onClick={() => setViewMode("matrix")}
              title="Xem bảng ma trận tổng hợp toàn bộ các lô"
            >
              <Grid3X3 size={14} />
              <span>Ma trận</span>
            </button>
          </div>
        </div>

        {/* 3A. CHẾ ĐỘ XEM 2 CỘT (Master-Detail View) - Tối ưu cho nhiều lô */}
        {viewMode === "split" ? (
          <div className={styles.splitLayout}>
            {/* Cột trái: Master List - Danh sách các lô (cuộn mượt mà) */}
            <div className={styles.masterListCol}>
              <div className={styles.masterListHeader}>
                <span className={styles.masterTitle}>Chọn lô để xem</span>
                <span className={styles.masterCountBadge}>{plannedBatches.length} mẻ nấu</span>
              </div>

              <div className={styles.lotsScrollContainer}>
                {plannedBatches.map((batch, idx) => {
                  const isActive = idx === selectedLotIndex;
                  return (
                    <div
                      key={batch.id}
                      className={`${styles.lotMiniCard} ${isActive ? styles.activeCard : ""}`}
                      onClick={() => setSelectedLotIndex(idx)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedLotIndex(idx);
                        }
                      }}
                      aria-selected={isActive}
                    >
                      <span className={styles.lotMiniName}>{batch.name}</span>
                      <span className={styles.lotMiniPortion}>
                        {batch.portions.toLocaleString("vi-VN")} suất
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cột phải: Detail Panel - Chi tiết lô đang chọn */}
            {currentBatch && (
              <div className={styles.detailCol}>
                {/* Header của cột chi tiết với nút chuyển Lô trước / Lô tiếp */}
                <div className={styles.detailHeader}>
                  <div className={styles.detailHeaderLeft}>
                    <span className={styles.detailBatchName}>{currentBatch.name}</span>
                    <span className={styles.detailPortionsBadge}>
                      {currentBatch.portions.toLocaleString("vi-VN")} suất
                    </span>
                  </div>

                  <div className={styles.navLotsWrap}>
                    <button
                      type="button"
                      className={styles.navLotBtn}
                      onClick={handlePrevLot}
                      disabled={selectedLotIndex === 0}
                      title="Xem lô trước"
                      aria-label="Lô trước"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className={styles.lotIndicatorText}>
                      {selectedLotIndex + 1}/{plannedBatches.length}
                    </span>
                    <button
                      type="button"
                      className={styles.navLotBtn}
                      onClick={handleNextLot}
                      disabled={selectedLotIndex === plannedBatches.length - 1}
                      title="Xem lô tiếp theo"
                      aria-label="Lô tiếp"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Danh sách nguyên liệu & gia vị của lô đang chọn */}
                <div className={styles.detailBody}>
                  {/* Nhóm 1: Nguyên liệu chính */}
                  <div className={styles.groupSection}>
                    <div className={styles.groupHeader}>
                      <span>Nguyên liệu chính</span>
                    </div>
                    <div className={styles.itemsTable}>
                      {currentBatch.mainIngredients.map((item, idx) => (
                        <div key={idx} className={styles.itemRow}>
                          <div className={styles.itemLeft}>
                            <span className={styles.itemName}>{item.name}</span>
                            <span className={styles.itemLotSub}>
                              Mã lô: <code>{item.lotCode}</code>
                            </span>
                          </div>
                          <div className={styles.itemRight}>
                            <span className={styles.itemAmountVal}>{item.amount}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nhóm 2: Gia vị định mức (Chỉ hiển thị nếu có dữ liệu gia vị) */}
                  {currentBatch.seasonings && currentBatch.seasonings.length > 0 && (
                    <div className={styles.groupSection}>
                      <div className={styles.groupHeader}>
                        <span>Gia vị định mức ({currentBatch.portions} suất)</span>
                      </div>
                      <div className={styles.itemsTable}>
                        {currentBatch.seasonings.map((item, idx) => (
                          <div key={idx} className={styles.itemRow}>
                            <div className={styles.itemLeft}>
                              <span className={styles.itemName}>{item.name}</span>
                              <span className={styles.itemLotSub}>
                                Mã lô: <code>{item.lotCode}</code>
                              </span>
                            </div>
                            <div className={styles.itemRight}>
                              <span className={styles.itemAmountVal}>{item.amount}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* 3B. CHẾ ĐỘ XEM MA TRẬN TỔNG HỢP (Matrix View) - So sánh ngang tất cả các lô */
          <div className={styles.matrixContainer}>
            <div className={styles.matrixTableWrap}>
              <table className={styles.matrixTable}>
                <thead>
                  <tr>
                    <th className={styles.stickyCol}>Thành phần</th>
                    <th style={{ minWidth: 120 }}>Mã lô nguồn</th>
                    {plannedBatches.map((b) => (
                      <th key={b.id} className={styles.batchColHeader}>
                        <div>{b.name}</div>
                        <div className={styles.subPortionText}>{b.portions} suất</div>
                      </th>
                    ))}
                    <th className={styles.totalColHeader}>Tổng xuất</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={styles.sectionDividerRow}>
                    <td colSpan={plannedBatches.length + 3}>
                      <span>1. Nguyên liệu chính</span>
                    </td>
                  </tr>
                  {/* Dòng Thịt chính */}
                  {plannedBatches[0]?.mainIngredients.map((_, ingIdx) => {
                    const ingName = plannedBatches[0].mainIngredients[ingIdx].name;
                    const ingUnit = plannedBatches[0].mainIngredients[ingIdx].unit;
                    const totalQty = plannedBatches.reduce(
                      (sum, b) => sum + (b.mainIngredients[ingIdx]?.amountRaw || 0),
                      0
                    );

                    return (
                      <tr key={`main-${ingIdx}`}>
                        <td className={styles.stickyCol}>
                          <strong>{ingName}</strong>
                        </td>
                        <td className={styles.codeCell}>
                          <code>{plannedBatches[0].mainIngredients[ingIdx].lotCode}</code>
                        </td>
                        {plannedBatches.map((b) => (
                          <td key={b.id} className={styles.batchQtyCell}>
                            {b.mainIngredients[ingIdx]?.amount}
                          </td>
                        ))}
                        <td className={styles.totalQtyCell}>
                          <strong>
                            {totalQty.toFixed(1)} {ingUnit}
                          </strong>
                        </td>
                      </tr>
                    );
                  })}

                  {plannedBatches[0]?.seasonings?.length > 0 && (
                    <>
                      <tr className={styles.sectionDividerRow}>
                        <td colSpan={plannedBatches.length + 3}>
                          <span>2. Gia vị định mức</span>
                        </td>
                      </tr>
                      {/* Danh sách các gia vị */}
                      {plannedBatches[0].seasonings.map((_, sIdx) => {
                        const sName = plannedBatches[0].seasonings[sIdx].name;
                        const sUnit = plannedBatches[0].seasonings[sIdx].unit;
                        const sCode = plannedBatches[0].seasonings[sIdx].lotCode;
                        const totalQty = plannedBatches.reduce(
                          (sum, b) => sum + (b.seasonings[sIdx]?.amountRaw || 0),
                          0
                        );

                        return (
                          <tr key={`seasoning-${sIdx}`}>
                            <td className={styles.stickyCol}>
                              <span>{sName}</span>
                            </td>
                            <td className={styles.codeCell}>
                              <code>{sCode}</code>
                            </td>
                            {plannedBatches.map((b) => (
                              <td key={b.id} className={styles.batchQtyCell}>
                                {b.seasonings[sIdx]?.amount}
                              </td>
                            ))}
                            <td className={styles.totalQtyCell}>
                              <strong>
                                {totalQty.toFixed(2)} {sUnit}
                              </strong>
                            </td>
                          </tr>
                        );
                      })}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DialogContent>

      {/* 4. Modal Footer */}
      <DialogActions className={styles.dialogActions}>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={onClose}
          disabled={submitting}
        >
          Hủy / Đóng
        </button>

        <button
          type="button"
          className={styles.confirmBtn}
          onClick={() => onConfirm?.(dish)}
          disabled={submitting}
        >
          <Check size={17} />
          <span>
            {submitting
              ? "Đang khởi tạo lô..."
              : `Xác nhận tạo ${plannedBatches.length} lô chế biến`}
          </span>
        </button>
      </DialogActions>
    </Dialog>
  );
}
