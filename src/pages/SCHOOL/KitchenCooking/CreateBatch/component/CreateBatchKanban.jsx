import React, { useMemo } from "react";
import PropTypes from "prop-types";
import {
  Calendar,
  Clock,
  Users,
  ChevronDown,
  CookingPot,
  CheckCircle2,
  Sparkles,
  Eye,
  Plus,
  ShieldCheck,
  FlaskConical,
} from "lucide-react";
import styles from "./CreateBatchKanban.module.scss";

/**
 * CreateBatchKanban - Bảng Tiến độ chế biến 4 cột chuẩn FoodPrint (Không dùng ảnh):
 * 1. Chờ tạo lô (Thẻ tinh gọn: Tên món + Nút Tạo lô, không tag thừa)
 * 2. Đã tạo lô (Chờ nấu) -> Nút "Chi tiết" đen trắng không viền + Nút "Nấu xong"
 * 3. Đã nấu xong (Chờ lưu mẫu) -> Nút "Chi tiết" đen trắng không viền + Nút "Lưu mẫu"
 * 4. Đã lưu mẫu (Hoàn tất 24h) -> Nút "Xem chi tiết lô" đen trắng không viền
 */
export default function CreateBatchKanban({
  dishes = [],
  pendingDishes: propPendingDishes,
  batches: propBatches,
  selectedMeal = "all",
  onSelectMeal,
  onOpenDetail,
  onOpenPlanModal,
  onOpenSampleModal,
  onCompleteCooking,
  submittingId = null,
  actionLoadingId = null,
}) {
  const today = new Date();
  const dayNames = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  const dayOfWeek = dayNames[today.getDay()];
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  const todayDateStr = `${dayOfWeek}, ${dd}/${mm}/${yyyy}`;

  // Hàm hiển thị tiêu đề thẻ lưu mẫu: "Ngày dd/mm/yyyy" (bỏ chữ thức ăn theo yêu cầu)
  const getSampledFoodTitle = (batch) => {
    const rawDate =
      batch.sampledAt ||
      batch.retainedFoodSample?.sampledAt ||
      batch.retainedFoodSamples?.[0]?.sampledAt ||
      batch.completedAt ||
      batch.createdAt;
    let dateStr = "";
    if (rawDate) {
      try {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) {
          dateStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
        }
      } catch {
        // ignore
      }
    }
    if (!dateStr) {
      dateStr = `${dd}/${mm}/${yyyy}`;
    }

    const rawName = (batch.name || batch.dishName || "").trim();
    const cleanName = rawName
      .replace(/^thức\s*ăn[:,\s-]*/i, "")
      .replace(/^món\s*ăn[:,\s-]*/i, "")
      .replace(/ngày\s*\d{1,2}\/\d{1,2}\/\d{4}/gi, "")
      .replace(/[•,\-:\s]+$/, "")
      .trim();

    if (!cleanName) {
      return `Ngày ${dateStr}`;
    }
    return `${cleanName} • Ngày ${dateStr}`;
  };

  // Chuẩn hóa danh sách pending dishes và batches
  const effectivePendingDishes = useMemo(() => {
    if (propPendingDishes) return propPendingDishes;
    return dishes.filter((d) => !d.isBatchCreated);
  }, [propPendingDishes, dishes]);

  const effectiveBatches = useMemo(() => {
    if (propBatches) return propBatches;
    return dishes
      .filter((d) => d.isBatchCreated)
      .map((d) => ({
        ...d,
        batchCode: d.batchCode || "CB-LÔ",
        status: d.batchStatus || (d.isCompleted ? "COMPLETED" : "UNCONFIRMED"),
      }));
  }, [propBatches, dishes]);

  // Lọc theo ca ăn
  const filteredPending = useMemo(() => {
    if (selectedMeal === "all") return effectivePendingDishes;
    return effectivePendingDishes.filter((d) => d.mealType === selectedMeal);
  }, [effectivePendingDishes, selectedMeal]);

  const filteredBatches = useMemo(() => {
    if (selectedMeal === "all") return effectiveBatches;
    return effectiveBatches.filter((b) => b.mealType === selectedMeal);
  }, [effectiveBatches, selectedMeal]);

  // Phân chia 4 cột Kanban:
  // 1. Chờ tạo lô (Chưa tạo lô)
  const colPending = filteredPending;

  // 2. Đã tạo lô (Mới tạo lô, chưa nấu xong: UNCONFIRMED hoặc CONFIRMED)
  const colCreated = useMemo(
    () => filteredBatches.filter((b) => b.status !== "COMPLETED"),
    [filteredBatches]
  );

  // 3. Đã nấu xong (COMPLETED nhưng chưa lưu mẫu: !hasSample)
  const colCooked = useMemo(
    () =>
      filteredBatches.filter((b) => {
        if (b.status !== "COMPLETED") return false;
        const hasSample = Boolean(
          (Array.isArray(b.retainedFoodSamples) && b.retainedFoodSamples.length > 0) ||
          b.retainedFoodSample ||
          b.hasSample
        );
        return !hasSample;
      }),
    [filteredBatches]
  );

  // 4. Đã lưu mẫu (COMPLETED và đã lưu mẫu: hasSample === true)
  const colSampled = useMemo(
    () =>
      filteredBatches.filter((b) => {
        if (b.status !== "COMPLETED") return false;
        const hasSample = Boolean(
          (Array.isArray(b.retainedFoodSamples) && b.retainedFoodSamples.length > 0) ||
          b.retainedFoodSample ||
          b.hasSample
        );
        return hasSample;
      }),
    [filteredBatches]
  );

  // Tổng số suất ăn tính theo món đang hiển thị
  const totalPortions = useMemo(() => {
    const list = [
      ...effectivePendingDishes.filter((d) => selectedMeal === "all" || d.mealType === selectedMeal),
      ...effectiveBatches.filter((b) => selectedMeal === "all" || b.mealType === selectedMeal),
    ];
    if (!list.length) return 0;
    return Math.max(...list.map((d) => d.portionStandard || d.plannedPortions || 0));
  }, [effectivePendingDishes, effectiveBatches, selectedMeal]);

  const allFinished =
    (effectivePendingDishes.length > 0 || effectiveBatches.length > 0) &&
    colPending.length === 0 &&
    colCreated.length === 0 &&
    colCooked.length === 0 &&
    colSampled.length > 0;

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

  return (
    <div className={styles.kanbanWrapper}>
      {/* 1. Dải thông tin phiên nấu hôm nay & Bộ lọc (Compact Session Toolbar) */}
      <div className={styles.sessionBar}>
        <div className={styles.sessionMetaGroup}>
          {/* Ngày chế biến */}
          <div className={styles.metaItem}>
            <Calendar size={15} className={styles.metaIcon} />
            <span className={styles.metaDateText}>{todayDateStr}</span>
            <span className={styles.todayBadge}>Hôm nay</span>
          </div>

          <div className={styles.metaDivider} aria-hidden="true" />

          {/* Số suất ăn dự kiến */}
          <div className={styles.metaItem}>
            <Users size={15} className={styles.metaIcon} />
            <span className={styles.metaLabelText}>Dự kiến:</span>
            <span className={styles.portionVal}>
              {Number.isFinite(totalPortions) ? totalPortions.toLocaleString("vi-VN") : "—"}
            </span>
            <span className={styles.unitText}>suất</span>
            <span className={styles.lockBadge} title="Số liệu đồng bộ từ điểm danh học sinh">
              Điểm danh
            </span>
          </div>
        </div>

        {/* Bộ lọc Bữa ăn (Filter Control bên phải) */}
        <div className={styles.filterControl}>
          <div className={styles.selectWrapper}>
            <Clock size={14} className={styles.selectIcon} />
            <select
              className={styles.selectInput}
              value={selectedMeal}
              onChange={(e) => onSelectMeal?.(e.target.value)}
              aria-label="Chọn bữa ăn"
            >
              <option value="all">Tất cả bữa ăn</option>
              <option value="lunch">Bữa trưa (11:00)</option>
              <option value="afternoon">Bữa xế (14:30)</option>
            </select>
            <ChevronDown size={14} className={styles.selectArrow} aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Thông báo nếu đã hoàn thành và lưu mẫu toàn bộ */}
      {allFinished && (
        <div className={styles.allDoneBanner}>
          <Sparkles size={20} className={styles.allDoneIcon} />
          <div className={styles.allDoneContent}>
            <span className={styles.allDoneTitle}>
              Hoàn thành xuất sắc toàn bộ quy trình chế biến & lưu mẫu hôm nay!
            </span>
            <span className={styles.allDoneDesc}>
              Tất cả {colSampled.length} lô chế biến đã nấu xong, niêm phong lưu mẫu 24h đầy đủ và sẵn sàng phân bổ suất ăn cho các lớp.
            </span>
          </div>
        </div>
      )}

      {/* 2. Bảng Kanban 4 cột */}
      <div className={styles.kanbanColumns}>
        {/* ========================================================= */}
        {/* CỘT 1: CHỜ TẠO LÔ                                         */}
        {/* ========================================================= */}
        <div className={styles.columnWrapper}>
          <div className={styles.columnHeader}>
            <div className={styles.colTitleLeft}>
              <span className={styles.colIndicatorPending} />
              <h2 className={styles.colTitle}>Chờ tạo lô</h2>
            </div>
            <span className={styles.colCountBadge}>
              {colPending.length} món
            </span>
          </div>

          <div className={styles.cardsContainer}>
            {colPending.length === 0 ? (
              <div className={styles.emptyColCard}>
                <CheckCircle2 size={24} className={styles.emptyDoneIcon} />
                <span className={styles.emptyColText}>
                  Tất cả món đã được tạo lô
                </span>
              </div>
            ) : (
              colPending.map((dish) => {
                const isSubmitting = submittingId === dish.id;
                const mealLabel =
                  dish.mealType === "afternoon" || dish.mealType === "AFTERNOON"
                    ? "Bữa xế"
                    : "Bữa trưa";
                const isAfternoon =
                  dish.mealType === "afternoon" || dish.mealType === "AFTERNOON";

                return (
                  <article
                    key={dish.id}
                    className={styles.dishCard}
                    onClick={() => onOpenPlanModal?.(dish)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Món ${dish.name}, bấm để xem phương án phân lô`}
                  >
                    <div className={styles.cardHeaderRow}>
                      <span
                        className={`${styles.mealChip} ${
                          isAfternoon ? styles.mealChipAfternoon : styles.mealChipLunch
                        }`}
                      >
                        {mealLabel}
                      </span>
                    </div>

                    {/* Nút Tạo nằm cùng hàng với Tên món ăn */}
                    <div className={styles.dishTitleRow}>
                      <h3 className={styles.dishCardTitle}>{dish.name}</h3>
                      <button
                        type="button"
                        className={styles.primaryCreateBtnCompact}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenPlanModal?.(dish);
                        }}
                        disabled={isSubmitting}
                        title="Bấm để xem phương án phân lô nguyên liệu"
                        aria-label={`Tạo lô cho ${dish.name}`}
                      >
                        <Plus size={13} />
                        <span>{isSubmitting ? "Đang xử lý..." : "Tạo"}</span>
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* CỘT 2: ĐÃ TẠO LÔ (Chờ nấu)                                */}
        {/* ========================================================= */}
        <div className={styles.columnWrapper}>
          <div className={styles.columnHeader}>
            <div className={styles.colTitleLeft}>
              <span className={styles.colIndicatorCreated} />
              <h2 className={styles.colTitle}>Đã tạo lô</h2>
            </div>
            <span className={styles.colCountBadge}>
              {colCreated.length} lô
            </span>
          </div>

          <div className={styles.cardsContainer}>
            {colCreated.length === 0 ? (
              <div className={styles.emptyColCard}>
                <CookingPot size={24} className={styles.emptyWaitIcon} />
                <span className={styles.emptyColText}>
                  Chưa có lô nào chờ nấu
                </span>
              </div>
            ) : (
              colCreated.map((batch) => {
                const mealLabel =
                  batch.mealType === "afternoon" || batch.mealType === "AFTERNOON"
                    ? "Bữa xế"
                    : "Bữa trưa";
                const isAfternoon =
                  batch.mealType === "afternoon" || batch.mealType === "AFTERNOON";
                const isActing = actionLoadingId === batch.id;

                return (
                  <article
                    key={batch.id}
                    className={styles.dishCard}
                    onClick={() => onOpenDetail?.(batch)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Lô ${batch.batchCode}, món ${batch.name || batch.dishName}`}
                  >
                    <div className={styles.cardHeaderRow}>
                      <span
                        className={`${styles.mealChip} ${
                          isAfternoon ? styles.mealChipAfternoon : styles.mealChipLunch
                        }`}
                      >
                        {mealLabel}
                      </span>
                      <span className={styles.statusWaitingCook}>
                        Chờ nấu
                      </span>
                    </div>

                    <h3 className={styles.dishCardTitle}>
                      {batch.name || batch.dishName}
                    </h3>

                    <div className={styles.batchMetaBox}>
                      <span className={styles.batchCodeText}>
                        {batch.batchCode || "LÔ CHẾ BIẾN"}
                      </span>
                      <span className={styles.batchMetaDot}>•</span>
                      <span className={styles.batchPortionsText}>
                        {batch.portionStandard || batch.plannedPortions || "—"} suất
                      </span>
                    </div>

                    <div className={styles.cardBottomRow}>
                      {/* Thao tác Xem chi tiết: Icon mắt KHÔNG VIỀN, ĐEN TRẮNG */}
                      <button
                        type="button"
                        className={styles.ghostDetailBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDetail?.(batch);
                        }}
                        title="Xem chi tiết lô"
                        aria-label={`Xem chi tiết lô ${batch.batchCode}`}
                      >
                        <Eye size={15} strokeWidth={1.75} />
                        <span>Chi tiết</span>
                      </button>

                      {/* Nút Nấu xong */}
                      <button
                        type="button"
                        className={styles.cookCompleteBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          onCompleteCooking?.(batch);
                        }}
                        disabled={isActing}
                        title="Ghi nhận mẻ này đã nấu xong"
                        aria-label={`Nấu xong lô ${batch.batchCode}`}
                      >
                        <CookingPot size={14} />
                        <span>{isActing ? "Đang xử lý..." : "Nấu xong"}</span>
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* CỘT 3: ĐÃ NẤU XONG (Chờ lưu mẫu)                          */}
        {/* ========================================================= */}
        <div className={styles.columnWrapper}>
          <div className={styles.columnHeader}>
            <div className={styles.colTitleLeft}>
              <span className={styles.colIndicatorCooked} />
              <h2 className={styles.colTitle}>Đã nấu xong</h2>
            </div>
            <span className={styles.colCountBadge}>
              {colCooked.length} lô
            </span>
          </div>

          <div className={styles.cardsContainer}>
            {colCooked.length === 0 ? (
              <div className={styles.emptyColCard}>
                <CheckCircle2 size={24} className={styles.emptyWaitIcon} />
                <span className={styles.emptyColText}>
                  Chưa có lô nào cần lưu mẫu
                </span>
              </div>
            ) : (
              colCooked.map((batch) => {
                const mealLabel =
                  batch.mealType === "afternoon" || batch.mealType === "AFTERNOON"
                    ? "Bữa xế"
                    : "Bữa trưa";
                const isAfternoon =
                  batch.mealType === "afternoon" || batch.mealType === "AFTERNOON";

                return (
                  <article
                    key={batch.id}
                    className={styles.dishCard}
                    onClick={() => onOpenDetail?.(batch)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Lô đã nấu xong ${batch.batchCode}`}
                  >
                    <div className={styles.cardHeaderRow}>
                      <span
                        className={`${styles.mealChip} ${
                          isAfternoon ? styles.mealChipAfternoon : styles.mealChipLunch
                        }`}
                      >
                        {mealLabel}
                      </span>
                      <span className={styles.statusWaitingSample}>
                        Chờ lưu mẫu
                      </span>
                    </div>

                    <h3 className={styles.dishCardTitle}>
                      {batch.name || batch.dishName}
                    </h3>

                    <div className={styles.batchMetaBox}>
                      <span className={styles.batchCodeText}>
                        {batch.batchCode || "LÔ CHẾ BIẾN"}
                      </span>
                      <span className={styles.batchMetaDot}>•</span>
                      <span className={styles.batchPortionsText}>
                        {batch.portionStandard || batch.plannedPortions || "—"} suất
                      </span>
                      {batch.completedAt && (
                        <>
                          <span className={styles.batchMetaDot}>•</span>
                          <span className={styles.completedTimeText}>
                            Xong {formatTime(batch.completedAt)}
                          </span>
                        </>
                      )}
                    </div>

                    <div className={styles.cardBottomRow}>
                      {/* Thao tác Xem chi tiết: Icon mắt KHÔNG VIỀN, ĐEN TRẮNG */}
                      <button
                        type="button"
                        className={styles.ghostDetailBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDetail?.(batch);
                        }}
                        title="Xem chi tiết lô"
                        aria-label={`Xem chi tiết lô ${batch.batchCode}`}
                      >
                        <Eye size={15} strokeWidth={1.75} />
                        <span>Chi tiết</span>
                      </button>

                      {/* Nút Lưu mẫu: Mở Form nhập lưu mẫu 24h ngay tại đây */}
                      <button
                        type="button"
                        className={styles.sampleActionBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenSampleModal?.(batch);
                        }}
                        title="Niêm phong lưu mẫu thực phẩm 24h"
                        aria-label={`Lưu mẫu thực phẩm cho lô ${batch.batchCode}`}
                      >
                        <FlaskConical size={14} />
                        <span>Lưu mẫu</span>
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* CỘT 4: ĐÃ LƯU MẪU (Hoàn tất 24h)                          */}
        {/* ========================================================= */}
        <div className={styles.columnWrapper}>
          <div className={styles.columnHeader}>
            <div className={styles.colTitleLeft}>
              <span className={styles.colIndicatorSampled} />
              <h2 className={styles.colTitle}>Đã lưu mẫu</h2>
            </div>
            <span className={styles.colCountBadge}>
              {colSampled.length} lô
            </span>
          </div>

          <div className={styles.cardsContainer}>
            {colSampled.length === 0 ? (
              <div className={styles.emptyColCard}>
                <ShieldCheck size={24} className={styles.emptyWaitIcon} />
                <span className={styles.emptyColText}>
                  Chưa có lô nào hoàn tất lưu mẫu
                </span>
              </div>
            ) : (
              colSampled.map((batch) => {
                const mealLabel =
                  batch.mealType === "afternoon" || batch.mealType === "AFTERNOON"
                    ? "Bữa xế"
                    : "Bữa trưa";
                const isAfternoon =
                  batch.mealType === "afternoon" || batch.mealType === "AFTERNOON";

                return (
                  <article
                    key={batch.id}
                    className={styles.dishCard}
                    onClick={() => onOpenDetail?.(batch)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Lô đã lưu mẫu ${batch.batchCode}`}
                  >
                    <div className={styles.cardHeaderRow}>
                      <span
                        className={`${styles.mealChip} ${
                          isAfternoon ? styles.mealChipAfternoon : styles.mealChipLunch
                        }`}
                      >
                        {mealLabel}
                      </span>
                      <span className={styles.statusSampled}>
                        <ShieldCheck size={12} />
                        <span>Đã lưu mẫu 24h</span>
                      </span>
                    </div>

                    {/* Bỏ chữ món ăn đi, thay vào đó là Thức ăn, ngày ... */}
                    <h3 className={styles.dishCardTitle}>
                      {getSampledFoodTitle(batch)}
                    </h3>

                    <div className={styles.batchMetaBox}>
                      <span className={styles.batchCodeText}>
                        {batch.batchCode || "LÔ CHẾ BIẾN"}
                      </span>
                      <span className={styles.batchMetaDot}>•</span>
                      <span className={styles.batchPortionsText}>
                        {batch.portionStandard || batch.plannedPortions || "—"} suất
                      </span>
                      {batch.completedAt && (
                        <>
                          <span className={styles.batchMetaDot}>•</span>
                          <span className={styles.completedTimeText}>
                            Xong {formatTime(batch.completedAt)}
                          </span>
                        </>
                      )}
                    </div>

                    <div className={styles.cardBottomRow}>
                      {/* Thao tác Xem chi tiết: Icon mắt KHÔNG VIỀN, ĐEN TRẮNG */}
                      <button
                        type="button"
                        className={styles.ghostDetailBtnFull}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDetail?.(batch);
                        }}
                        title="Bấm để xem chi tiết lô và phiếu lưu mẫu"
                        aria-label={`Xem chi tiết lô ${batch.batchCode}`}
                      >
                        <Eye size={15} strokeWidth={1.75} />
                        <span>Xem chi tiết lô</span>
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

CreateBatchKanban.propTypes = {
  dishes: PropTypes.arrayOf(PropTypes.object),
  pendingDishes: PropTypes.arrayOf(PropTypes.object),
  batches: PropTypes.arrayOf(PropTypes.object),
  selectedMeal: PropTypes.string,
  onSelectMeal: PropTypes.func,
  onOpenDetail: PropTypes.func,
  onOpenPlanModal: PropTypes.func,
  onOpenSampleModal: PropTypes.func,
  onCompleteCooking: PropTypes.func,
  submittingId: PropTypes.string,
  actionLoadingId: PropTypes.string,
};
