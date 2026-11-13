import React, { useMemo } from "react";
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
  RotateCcw,
} from "lucide-react";
import styles from "./CreateBatchKanban.module.scss";

/**
 * CreateBatchKanban - Bảng Kanban 4 cột:
 * 1. Chờ tạo lô (Thẻ tinh gọn: Tên món + Nút Tạo lô, không tag thừa)
 * 2. Đã tạo lô (Chờ nấu) -> Nút "Nấu xong"
 * 3. Đã nấu xong (Chờ lưu mẫu) -> Nút "Lưu mẫu" (mở form nhập lưu mẫu)
 * 4. Đã lưu mẫu (Hoàn tất 24h) -> Icon mắt xem chi tiết
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
  onResetMock,
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
      {/* 1. Dải thông tin phiên nấu hôm nay (Session Bar) */}
      <div className={styles.sessionBar}>
        <div className={styles.sessionItem}>
          <div className={styles.sessionItemHeader}>
            <Calendar size={13} className={styles.sessionIcon} />
            <span className={styles.sessionLabel}>Ngày chế biến</span>
          </div>
          <div className={styles.sessionValRow}>
            <span className={styles.sessionVal}>{todayDateStr}</span>
            <span className={styles.todayBadge}>Hôm nay</span>
          </div>
        </div>

        <div className={styles.sessionItem}>
          <div className={styles.sessionItemHeader}>
            <Clock size={13} className={styles.sessionIcon} />
            <span className={styles.sessionLabel}>Bữa ăn</span>
          </div>
          <div className={styles.selectWrapper}>
            <select
              className={styles.selectInput}
              value={selectedMeal}
              onChange={(e) => onSelectMeal?.(e.target.value)}
              aria-label="Chọn bữa ăn"
            >
              <option value="all">Tất cả bữa ăn</option>
              <option value="lunch">Bữa trưa học đường (11:00)</option>
              <option value="afternoon">Bữa xế chiều (14:30)</option>
            </select>
            <ChevronDown size={14} className={styles.selectArrow} aria-hidden="true" />
          </div>
        </div>

        <div className={styles.sessionItem}>
          <div className={styles.sessionItemHeader}>
            <Users size={13} className={styles.sessionIcon} />
            <span className={styles.sessionLabel}>Số suất ăn dự kiến</span>
          </div>
          <div className={styles.sessionValRow}>
            <span className={styles.portionVal}>
              {Number.isFinite(totalPortions) ? totalPortions.toLocaleString("vi-VN") : "—"}{" "}
              <span className={styles.unitText}>suất</span>
            </span>
            <span className={styles.lockBadge}>Điểm danh</span>
          </div>
        </div>

        {onResetMock && (
          <div className={styles.sessionItemMock}>
            <button
              type="button"
              className={styles.resetMockPill}
              onClick={onResetMock}
              title="Khôi phục lại dữ liệu mẫu 4 trạng thái để kiểm thử"
            >
              <RotateCcw size={13} />
              <span>Nạp lại mẫu 4 bước</span>
            </button>
          </div>
        )}
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
          {onResetMock && (
            <button
              type="button"
              className={styles.allDoneResetBtn}
              onClick={onResetMock}
              title="Nạp lại dữ liệu mẫu để thử nghiệm quy trình từ đầu"
            >
              <RotateCcw size={14} />
              <span>Thử lại từ đầu</span>
            </button>
          )}
        </div>
      )}

      {/* 2. Bảng Kanban 4 cột: Chờ tạo lô -> Đã tạo lô -> Đã nấu xong -> Đã lưu mẫu */}
      <div className={styles.kanbanColumns}>
        {/* CỘT 1: CHỜ TẠO LÔ (Thẻ tinh gọn: chỉ Tên món + Nút Tạo lô) */}
        <div className={styles.columnPending}>
          <div className={styles.columnHeader}>
            <div className={styles.colTitleLeft}>
              <span className={styles.colIndicatorPending} />
              <h2 className={styles.colTitle}>Chờ tạo lô</h2>
            </div>
            <span className={styles.colCountPending}>
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
                const mealBadgeClass =
                  dish.mealType === "afternoon" || dish.mealType === "AFTERNOON"
                    ? styles.mealAfternoon
                    : styles.mealLunch;
                const mealLabel =
                  dish.mealType === "afternoon" || dish.mealType === "AFTERNOON"
                    ? "Bữa xế"
                    : "Bữa trưa";

                return (
                  <article
                    key={dish.id}
                    className={styles.dishCardPendingClean}
                    onClick={() => onOpenPlanModal?.(dish)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Món ${dish.name}, bấm để xem phương án phân lô`}
                  >
                    <div className={styles.cleanCardTop}>
                      <span className={`${styles.mealChip} ${mealBadgeClass}`}>
                        {mealLabel}
                      </span>
                    </div>

                    <h3 className={styles.dishTitleClean}>{dish.name}</h3>

                    <div className={styles.cleanCardBottom}>
                      {/* Nút Tạo lô: Mở popup xem trước phương án phân lô theo yêu cầu */}
                      <button
                        type="button"
                        className={styles.primaryCreateBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenPlanModal?.(dish);
                        }}
                        disabled={isSubmitting}
                        title="Bấm để xem phương án phân lô nguyên liệu"
                        aria-label={`Tạo lô cho ${dish.name}`}
                      >
                        <Plus size={15} />
                        <span>{isSubmitting ? "Đang xử lý..." : "Tạo lô"}</span>
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        {/* CỘT 2: ĐÃ TẠO LÔ (Chờ nấu -> Nút Nấu xong) */}
        <div className={styles.columnCreated}>
          <div className={styles.columnHeader}>
            <div className={styles.colTitleLeft}>
              <span className={styles.colIndicatorCreated} />
              <h2 className={styles.colTitle}>Đã tạo lô</h2>
            </div>
            <span className={styles.colCountCreated}>
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
                const mealBadgeClass =
                  batch.mealType === "afternoon" || batch.mealType === "AFTERNOON"
                    ? styles.mealAfternoon
                    : styles.mealLunch;
                const mealLabel =
                  batch.mealType === "afternoon" || batch.mealType === "AFTERNOON"
                    ? "Bữa xế"
                    : "Bữa trưa";
                const isActing = actionLoadingId === batch.id;

                return (
                  <article
                    key={batch.id}
                    className={styles.dishCardCreated}
                    onClick={() => onOpenDetail?.(batch)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Lô ${batch.batchCode}, món ${batch.name || batch.dishName}`}
                  >
                    <div className={styles.cardHeaderRow}>
                      <span className={`${styles.mealChip} ${mealBadgeClass}`}>
                        {mealLabel}
                      </span>
                      <span className={styles.statusCreatedBadge}>
                        Chờ nấu
                      </span>
                    </div>

                    <h3 className={styles.dishTitle}>{batch.name || batch.dishName}</h3>

                    <div className={styles.lotCodeWrap}>
                      <span className={styles.lotCodeText}>
                        {batch.batchCode || "LÔ CHẾ BIẾN"}
                      </span>
                      <span className={styles.portionsInline}>
                        {batch.portionStandard || batch.plannedPortions || "—"} suất
                      </span>
                    </div>

                    <div className={styles.cardBottomRow}>
                      <button
                        type="button"
                        className={styles.iconEyeBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDetail?.(batch);
                        }}
                        title="Xem chi tiết lô"
                        aria-label={`Xem chi tiết lô ${batch.batchCode}`}
                      >
                        <Eye size={15} />
                        <span>Chi tiết</span>
                      </button>

                      {/* Nút Nấu xong chuyển sang Cột 3 */}
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
                        <CheckCircle2 size={14} />
                        <span>{isActing ? "Đang xử lý..." : "Nấu xong"}</span>
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        {/* CỘT 3: ĐÃ NẤU XONG (Chờ lưu mẫu -> Nút Lưu mẫu) */}
        <div className={styles.columnCooked}>
          <div className={styles.columnHeader}>
            <div className={styles.colTitleLeft}>
              <span className={styles.colIndicatorCooked} />
              <h2 className={styles.colTitle}>Đã nấu xong</h2>
            </div>
            <span className={styles.colCountCooked}>
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
                const mealBadgeClass =
                  batch.mealType === "afternoon" || batch.mealType === "AFTERNOON"
                    ? styles.mealAfternoon
                    : styles.mealLunch;
                const mealLabel =
                  batch.mealType === "afternoon" || batch.mealType === "AFTERNOON"
                    ? "Bữa xế"
                    : "Bữa trưa";

                return (
                  <article
                    key={batch.id}
                    className={styles.dishCardCooked}
                    onClick={() => onOpenDetail?.(batch)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Lô đã nấu xong ${batch.batchCode}`}
                  >
                    <div className={styles.cardHeaderRow}>
                      <span className={`${styles.mealChip} ${mealBadgeClass}`}>
                        {mealLabel}
                      </span>
                      <span className={styles.statusWaitSampleBadge}>
                        Chờ lưu mẫu
                      </span>
                    </div>

                    <h3 className={styles.dishTitleCooked}>{batch.name || batch.dishName}</h3>

                    <div className={styles.lotCodeWrap}>
                      <span className={styles.lotCodeTextCooked}>
                        {batch.batchCode || "LÔ CHẾ BIẾN"}
                      </span>
                      {batch.completedAt && (
                        <span className={styles.completedTimeText}>
                          Xong {formatTime(batch.completedAt)}
                        </span>
                      )}
                    </div>

                    <div className={styles.cardBottomRow}>
                      <button
                        type="button"
                        className={styles.iconEyeBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDetail?.(batch);
                        }}
                        title="Xem chi tiết lô"
                        aria-label={`Xem chi tiết lô ${batch.batchCode}`}
                      >
                        <Eye size={15} />
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

        {/* CỘT 4: ĐÃ LƯU MẪU (Hoàn tất quy trình 24h) */}
        <div className={styles.columnSampled}>
          <div className={styles.columnHeader}>
            <div className={styles.colTitleLeft}>
              <span className={styles.colIndicatorSampled} />
              <h2 className={styles.colTitle}>Đã lưu mẫu</h2>
            </div>
            <span className={styles.colCountSampled}>
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
                const mealBadgeClass =
                  batch.mealType === "afternoon" || batch.mealType === "AFTERNOON"
                    ? styles.mealAfternoon
                    : styles.mealLunch;
                const mealLabel =
                  batch.mealType === "afternoon" || batch.mealType === "AFTERNOON"
                    ? "Bữa xế"
                    : "Bữa trưa";

                return (
                  <article
                    key={batch.id}
                    className={styles.dishCardSampled}
                    onClick={() => onOpenDetail?.(batch)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Lô đã lưu mẫu ${batch.batchCode}`}
                  >
                    <div className={styles.cardHeaderRow}>
                      <span className={`${styles.mealChip} ${mealBadgeClass}`}>
                        {mealLabel}
                      </span>
                      <span className={styles.statusSampledBadge}>
                        <ShieldCheck size={12} />
                        <span>Đã lưu mẫu 24h</span>
                      </span>
                    </div>

                    <h3 className={styles.dishTitleSampled}>{batch.name || batch.dishName}</h3>

                    <div className={styles.lotCodeWrap}>
                      <span className={styles.lotCodeTextSampled}>
                        {batch.batchCode || "LÔ CHẾ BIẾN"}
                      </span>
                      {batch.completedAt && (
                        <span className={styles.completedTimeText}>
                          Xong {formatTime(batch.completedAt)}
                        </span>
                      )}
                    </div>

                    <div className={styles.cardBottomRow}>
                      <button
                        type="button"
                        className={styles.viewDetailEyeBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDetail?.(batch);
                        }}
                        title="Bấm để xem chi tiết lô và phiếu lưu mẫu"
                        aria-label={`Xem chi tiết lô ${batch.batchCode}`}
                      >
                        <Eye size={15} />
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
