import React, { useMemo } from "react";
import {
  Calendar,
  Clock,
  Users,
  ChevronDown,
  CookingPot,
  Layers,
  CheckCircle2,
  Sparkles,
  Flame,
  Eye,
  Plus,
  ShieldCheck,
} from "lucide-react";
import styles from "./CreateBatchKanban.module.scss";

export default function CreateBatchKanban({
  dishes = [],
  pendingDishes: propPendingDishes,
  batches: propBatches,
  selectedMeal = "all",
  onSelectMeal,
  onDishClick,
  onOpenDetail,
  onQuickConfirm,
  onQuickCreate,
  onConfirmCooking,
  onCompleteCooking,
  onViewBatchDetail,
  submittingDishId = null,
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

  // Phân chia 4 cột Kanban: Chờ tạo lô, Đã tạo lô, Đang nấu, Đã nấu xong
  const colPending = filteredPending;
  const colCreated = useMemo(
    () => filteredBatches.filter((b) => !b.status || b.status === "UNCONFIRMED"),
    [filteredBatches]
  );
  const colCooking = useMemo(
    () => filteredBatches.filter((b) => b.status === "CONFIRMED"),
    [filteredBatches]
  );
  const colCompleted = useMemo(
    () => filteredBatches.filter((b) => b.status === "COMPLETED"),
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
    colCooking.length === 0 &&
    colCompleted.length > 0;

  const handleItemDetail = (item) => {
    if (onOpenDetail) onOpenDetail(item);
    else if (onDishClick) onDishClick(item);
    else if (onViewBatchDetail) onViewBatchDetail(item);
  };

  const handleCreate = (item) => {
    if (onQuickCreate) onQuickCreate(item);
    else if (onQuickConfirm) onQuickConfirm(item);
  };

  const currentSubmittingId = submittingId || submittingDishId;

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
      </div>

      {/* Thông báo nếu đã hoàn thành tất cả lô */}
      {allFinished && (
        <div className={styles.allDoneBanner}>
          <Sparkles size={20} className={styles.allDoneIcon} />
          <div className={styles.allDoneContent}>
            <span className={styles.allDoneTitle}>
              Tất cả các món ăn hôm nay đã nấu xong hoàn tất!
            </span>
            <span className={styles.allDoneDesc}>
              {colCompleted.length} lô chế biến đã hoàn thành, sẵn sàng chuyển sang bước phân bổ suất ăn và kiểm tra mẫu lưu.
            </span>
          </div>
        </div>
      )}

      {/* 2. Bảng Kanban 4 cột theo tiến trình: Chờ tạo lô -> Đã tạo lô -> Đang nấu -> Đã nấu xong */}
      <div className={styles.kanbanColumns}>
        {/* CỘT 1: CHỜ TẠO LÔ */}
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
                  Tất cả món đã được khởi tạo lô
                </span>
              </div>
            ) : (
              colPending.map((dish) => {
                const isSubmitting = currentSubmittingId === dish.id;
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
                    className={styles.dishCardPending}
                    onClick={() => handleItemDetail(dish)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Món ${dish.name}, bấm để xem chi tiết`}
                  >
                    <div className={styles.cardHeaderRow}>
                      <span className={`${styles.mealChip} ${mealBadgeClass}`}>
                        {mealLabel}
                      </span>
                      <span className={styles.portionsChip}>
                        <Users size={11} />
                        <span>
                          {Number.isFinite(dish.portionStandard)
                            ? `${dish.portionStandard.toLocaleString("vi-VN")} suất`
                            : "—"}
                        </span>
                      </span>
                    </div>

                    <h3 className={styles.dishTitle}>{dish.name}</h3>

                    <div className={styles.cardBottomRow}>
                      <span className={styles.ingMeta}>
                        <Layers size={12} />
                        <span>
                          {(dish.ingredients || []).length > 0
                            ? `${dish.ingredients.length} nguyên liệu`
                            : "Định mức BGH"}
                        </span>
                      </span>

                      <div className={styles.actionBtnGroup}>
                        <button
                          type="button"
                          className={styles.iconEyeBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemDetail(dish);
                          }}
                          title="Xem chi tiết nguyên liệu"
                          aria-label={`Xem chi tiết ${dish.name}`}
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          type="button"
                          className={styles.quickCreateBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreate(dish);
                          }}
                          disabled={isSubmitting}
                          title="Tạo lô chế biến cho món này"
                          aria-label={`Tạo lô cho ${dish.name}`}
                        >
                          <Plus size={15} />
                          <span>{isSubmitting ? "Đang tạo..." : "Tạo lô"}</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        {/* CỘT 2: ĐÃ TẠO LÔ */}
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
                <Layers size={24} className={styles.emptyWaitIcon} />
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
                    onClick={() => handleItemDetail(batch)}
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
                      {/* Icon con mắt xem chi tiết */}
                      <button
                        type="button"
                        className={styles.iconEyeBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemDetail(batch);
                        }}
                        title="Xem chi tiết lô"
                        aria-label={`Xem chi tiết lô ${batch.batchCode}`}
                      >
                        <Eye size={15} />
                        <span>Chi tiết</span>
                      </button>

                      {onConfirmCooking && (
                        <button
                          type="button"
                          className={styles.startCookBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            onConfirmCooking(batch);
                          }}
                          disabled={isActing}
                          title="Xác nhận bắt đầu nấu"
                          aria-label={`Bắt đầu nấu lô ${batch.batchCode}`}
                        >
                          <Flame size={14} />
                          <span>{isActing ? "Đang xử lý..." : "Bắt đầu nấu"}</span>
                        </button>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        {/* CỘT 3: ĐANG NẤU */}
        <div className={styles.columnCooking}>
          <div className={styles.columnHeader}>
            <div className={styles.colTitleLeft}>
              <span className={styles.colIndicatorCooking} />
              <h2 className={styles.colTitle}>Đang nấu</h2>
            </div>
            <span className={styles.colCountCooking}>
              {colCooking.length} lô
            </span>
          </div>

          <div className={styles.cardsContainer}>
            {colCooking.length === 0 ? (
              <div className={styles.emptyColCard}>
                <Flame size={24} className={styles.emptyWaitIcon} />
                <span className={styles.emptyColText}>
                  Chưa có món nào đang nấu
                </span>
              </div>
            ) : (
              colCooking.map((batch) => {
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
                    className={styles.dishCardCooking}
                    onClick={() => handleItemDetail(batch)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Lô đang nấu ${batch.batchCode}`}
                  >
                    <div className={styles.cardHeaderRow}>
                      <span className={`${styles.mealChip} ${mealBadgeClass}`}>
                        {mealLabel}
                      </span>
                      <span className={styles.statusCookingBadge}>
                        <span className={styles.cookingPulse} />
                        <span>Đang nấu</span>
                      </span>
                    </div>

                    <h3 className={styles.dishTitle}>{batch.name || batch.dishName}</h3>

                    <div className={styles.lotCodeWrap}>
                      <span className={styles.lotCodeText}>
                        {batch.batchCode || "LÔ CHẾ BIẾN"}
                      </span>
                      {batch.confirmedAt && (
                        <span className={styles.timeTag}>
                          Bắt đầu {formatTime(batch.confirmedAt)}
                        </span>
                      )}
                    </div>

                    <div className={styles.cardBottomRow}>
                      {/* Icon con mắt xem chi tiết */}
                      <button
                        type="button"
                        className={styles.iconEyeBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemDetail(batch);
                        }}
                        title="Xem chi tiết lô"
                        aria-label={`Xem chi tiết lô ${batch.batchCode}`}
                      >
                        <Eye size={15} />
                        <span>Chi tiết</span>
                      </button>

                      {onCompleteCooking && (
                        <button
                          type="button"
                          className={styles.completeCookBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            onCompleteCooking(batch);
                          }}
                          disabled={isActing}
                          title="Ghi nhận nấu xong"
                          aria-label={`Nấu xong lô ${batch.batchCode}`}
                        >
                          <CheckCircle2 size={14} />
                          <span>{isActing ? "Đang xử lý..." : "Nấu xong"}</span>
                        </button>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        {/* CỘT 4: ĐÃ NẤU XONG */}
        <div className={styles.columnDone}>
          <div className={styles.columnHeader}>
            <div className={styles.colTitleLeft}>
              <span className={styles.colIndicatorDone} />
              <h2 className={styles.colTitle}>Đã nấu xong</h2>
            </div>
            <span className={styles.colCountDone}>
              {colCompleted.length} lô
            </span>
          </div>

          <div className={styles.cardsContainer}>
            {colCompleted.length === 0 ? (
              <div className={styles.emptyColCard}>
                <CookingPot size={24} className={styles.emptyWaitIcon} />
                <span className={styles.emptyColText}>
                  Chưa có lô nào nấu xong
                </span>
              </div>
            ) : (
              colCompleted.map((batch) => {
                const mealBadgeClass =
                  batch.mealType === "afternoon" || batch.mealType === "AFTERNOON"
                    ? styles.mealAfternoon
                    : styles.mealLunch;
                const mealLabel =
                  batch.mealType === "afternoon" || batch.mealType === "AFTERNOON"
                    ? "Bữa xế"
                    : "Bữa trưa";

                const hasSample = Boolean(
                  (Array.isArray(batch.retainedFoodSamples) && batch.retainedFoodSamples.length > 0) ||
                  batch.retainedFoodSample ||
                  batch.hasSample
                );

                return (
                  <article
                    key={batch.id}
                    className={styles.dishCardDone}
                    onClick={() => handleItemDetail(batch)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Lô đã nấu xong ${batch.batchCode}`}
                  >
                    <div className={styles.cardHeaderRow}>
                      <span className={`${styles.mealChip} ${mealBadgeClass}`}>
                        {mealLabel}
                      </span>
                      <span className={styles.statusSuccessBadge}>
                        <CheckCircle2 size={12} />
                        <span>Đã nấu xong</span>
                      </span>
                    </div>

                    <h3 className={styles.dishTitleDone}>{batch.name || batch.dishName}</h3>

                    <div className={styles.lotCodeWrap}>
                      <span className={styles.lotCodeTextDone}>
                        {batch.batchCode || "LÔ CHẾ BIẾN"}
                      </span>
                      {batch.completedAt && (
                        <span className={styles.completedTimeText}>
                          Xong {formatTime(batch.completedAt)}
                        </span>
                      )}
                    </div>

                    {/* Dải thông tin mẫu lưu */}
                    <div className={styles.sampleMiniBadge}>
                      <ShieldCheck size={12} className={hasSample ? styles.sampleDoneIcon : styles.sampleWaitIcon} />
                      <span>{hasSample ? "Đã lưu mẫu 24h" : "Chờ lưu mẫu 24h"}</span>
                    </div>

                    <div className={styles.cardBottomRow}>
                      {/* Nút có icon con mắt nổi bật theo đúng yêu cầu */}
                      <button
                        type="button"
                        className={styles.viewDetailEyeBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemDetail(batch);
                        }}
                        title="Bấm để xem chi tiết lô đã nấu xong"
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
