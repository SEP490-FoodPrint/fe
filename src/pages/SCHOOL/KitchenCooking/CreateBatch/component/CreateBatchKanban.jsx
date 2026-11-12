import React, { useMemo } from "react";
import {
  Calendar,
  Clock,
  Users,
  ChevronDown,
  Check,
  CookingPot,
  Layers,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import styles from "./CreateBatchKanban.module.scss";

export default function CreateBatchKanban({
  dishes = [],
  selectedMeal = "all",
  onSelectMeal,
  onDishClick,
  onQuickConfirm,
  onViewBatchDetail,
  submittingDishId = null,
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

  // Lọc theo bữa ăn được chọn
  const filteredDishes = useMemo(() => {
    if (selectedMeal === "all") return dishes;
    return dishes.filter((d) => d.mealType === selectedMeal);
  }, [dishes, selectedMeal]);

  // Phân chia theo trạng thái Kanban
  const pendingDishes = useMemo(
    () => filteredDishes.filter((d) => !d.isBatchCreated),
    [filteredDishes]
  );
  const createdDishes = useMemo(
    () => filteredDishes.filter((d) => d.isBatchCreated),
    [filteredDishes]
  );

  // Tổng số suất ăn tính theo món đang hiển thị
  const totalPortions = useMemo(() => {
    const list = dishes.filter((d) => selectedMeal === "all" || d.mealType === selectedMeal);
    if (!list.length) return 0;
    return Math.max(...list.map((d) => d.portionStandard || 0));
  }, [dishes, selectedMeal]);

  const allFinished = dishes.length > 0 && pendingDishes.length === 0;

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

        {/* Đổi nhãn thành "Bữa ăn" theo đúng yêu cầu */}
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
            <span className={styles.sessionLabel}>Số suất ăn</span>
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
              Hoàn thành khởi tạo tất cả các lô chế biến hôm nay!
            </span>
            <span className={styles.allDoneDesc}>
              Tất cả {dishes.length} món ăn đã có lô chế biến và sẵn sàng tiến hành quy trình nấu.
            </span>
          </div>
        </div>
      )}

      {/* 2. Bảng Kanban 2 cột */}
      <div className={styles.kanbanColumns}>
        {/* CỘT 1: CHỜ TẠO LÔ */}
        <div className={styles.columnPending}>
          <div className={styles.columnHeader}>
            <div className={styles.colTitleLeft}>
              <span className={styles.colIndicatorPending} />
              <h2 className={styles.colTitle}>Chờ tạo lô</h2>
            </div>
            <span className={styles.colCountPending}>
              {pendingDishes.length} món
            </span>
          </div>

          <div className={styles.cardsContainer}>
            {pendingDishes.length === 0 ? (
              <div className={styles.emptyColCard}>
                <CheckCircle2 size={24} className={styles.emptyDoneIcon} />
                <span className={styles.emptyColText}>
                  Không có món ăn nào đang chờ tạo lô
                </span>
              </div>
            ) : (
              pendingDishes.map((dish) => {
                const isSubmitting = submittingDishId === dish.id;
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
                    onClick={() => onDishClick?.(dish)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Món ${dish.name}, bấm để xem chi tiết lô`}
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

                      {/* Nút Tích xác nhận tạo lô trực tiếp trên thẻ */}
                      <button
                        type="button"
                        className={styles.quickTickBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickConfirm?.(dish);
                        }}
                        disabled={isSubmitting}
                        title="Bấm để tích xác nhận tạo lô cho món này"
                        aria-label={`Xác nhận tạo lô cho ${dish.name}`}
                      >
                        <Check size={16} className={styles.quickTickIcon} />
                        <span>{isSubmitting ? "Đang tạo..." : "Tạo lô"}</span>
                      </button>
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
              <span className={styles.colIndicatorDone} />
              <h2 className={styles.colTitle}>Đã tạo lô</h2>
            </div>
            <span className={styles.colCountDone}>
              {createdDishes.length} món
            </span>
          </div>

          <div className={styles.cardsContainer}>
            {createdDishes.length === 0 ? (
              <div className={styles.emptyColCard}>
                <CookingPot size={24} className={styles.emptyWaitIcon} />
                <span className={styles.emptyColText}>
                  Chưa có món nào được tạo lô
                </span>
              </div>
            ) : (
              createdDishes.map((dish) => {
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
                    className={styles.dishCardDone}
                    onClick={() => onDishClick?.(dish)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Món ${dish.name}, đã tạo lô`}
                  >
                    <div className={styles.cardHeaderRow}>
                      <span className={`${styles.mealChip} ${mealBadgeClass}`}>
                        {mealLabel}
                      </span>
                      <span className={styles.statusSuccessBadge}>
                        <Check size={11} />
                        <span>Đã tạo lô</span>
                      </span>
                    </div>

                    <h3 className={styles.dishTitleDone}>{dish.name}</h3>

                    <div className={styles.cardBottomRow}>
                      <div className={styles.lotCodeWrap}>
                        <span className={styles.lotCodeText}>
                          {dish.batchCode || "LÔ CHẾ BIẾN"}
                        </span>
                      </div>

                      <button
                        type="button"
                        className={styles.viewDetailBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewBatchDetail?.(dish);
                        }}
                        title="Xem chi tiết lô chế biến"
                        aria-label={`Xem chi tiết lô ${dish.name}`}
                      >
                        <span>Chi tiết</span>
                        <ArrowRight size={13} />
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

