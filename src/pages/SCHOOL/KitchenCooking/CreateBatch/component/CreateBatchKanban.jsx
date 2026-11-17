import { batchSampleProgress } from "src/services/KitchenService/adapter";
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import MenuScopeSelect from "src/components/MenuScopeSelect";
import {
  Calendar,
  Clock,
  Users,
  ChevronDown,
  CookingPot,
  CheckCircle2,
  Sparkles,
  Eye,
  ShieldCheck,
  FlaskConical,
} from "lucide-react";
import styles from "./CreateBatchKanban.module.scss";
import { batchDisplayName, withDishLotNumbers } from "../batchLabel";
import useKanbanDrag from "./useKanbanDrag";

const COLUMNS = [
  { key: "dishes", title: "Danh sách món ăn", empty: "Tất cả món đã được nấu", EmptyIcon: CheckCircle2 },
  { key: "cooking", title: "Đang nấu", empty: "Chưa có món nào đang nấu", EmptyIcon: CookingPot },
  { key: "cooked", title: "Đã nấu xong", empty: "Chưa có món cần lưu mẫu", EmptyIcon: CheckCircle2 },
  { key: "sampled", title: "Đã lưu mẫu", empty: "Chưa có món đã lưu mẫu", EmptyIcon: ShieldCheck },
];

// Chỉ cho phép kéo sang bước kế tiếp (BE không hỗ trợ chuyển ngược trạng thái lô).
const NEXT_COLUMN = { dishes: "cooking", cooking: "cooked", cooked: "sampled" };
const COLUMN_TITLE = Object.fromEntries(COLUMNS.map((column) => [column.key, column.title]));

function MealTag({ mealType }) {
  const isAfternoon = String(mealType || "").toLowerCase() === "afternoon";
  return (
    <span className={`${styles.mealTag} ${isAfternoon ? styles.mealTagAfternoon : styles.mealTagLunch}`}>
      {isAfternoon ? "Bữa xế" : "Bữa trưa"}
    </span>
  );
}

MealTag.propTypes = { mealType: PropTypes.string };

/**
 * CreateBatchKanban - Tiến độ chế biến 4 cột:
 * 1. Danh sách món ăn (nút "Nấu": hệ thống tự lập lô theo phương án tồn kho)
 * 2. Đang nấu -> "Nấu xong"
 * 3. Đã nấu xong -> "Lưu mẫu"
 * 4. Đã lưu mẫu
 * Lô hiển thị theo tên món + số lô trong ngày: "Canh chua (Lô 1)".
 */
export default function CreateBatchKanban({
  dishes = [],
  pendingDishes: propPendingDishes,
  batches: propBatches,
  mealRequirements = {},
  selectedMeal = "lunch",
  mealTimes = null,
  onSelectMeal,
  gradeMenus = [],
  grades = [],
  gradeValue = "",
  gradeMenuId = "",
  onGradeChange,
  gradeDisabled = false,
  emptyState = null,
  onOpenDetail,
  onOpenPlanModal,
  onStartCooking,
  onOpenSampleModal,
  onCompleteCooking,
  onNotify,
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
    if (propBatches) return withDishLotNumbers(propBatches);
    return withDishLotNumbers(dishes
      .filter((d) => d.isBatchCreated)
      .map((d) => ({
        ...d,
        batchCode: d.batchCode || "CB-LÔ",
        status: d.batchStatus || (d.isCompleted ? "COMPLETED" : "UNCONFIRMED"),
      })));
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

  const colCooked = useMemo(
    () => filteredBatches.filter((batch) => batch.status === "COMPLETED" && !batchSampleProgress(batch).complete),
    [filteredBatches]
  );
  const colSampled = useMemo(
    () => filteredBatches.filter((batch) => batch.status === "COMPLETED" && batchSampleProgress(batch).complete),
    [filteredBatches]
  );
  const portionMeals = [
    { type: "LUNCH", key: "lunch", label: "Bữa trưa" },
    { type: "AFTERNOON", key: "afternoon", label: "Bữa xế" },
  ].filter((meal) => selectedMeal === "all" || selectedMeal === meal.key);

  const allFinished =
    (effectivePendingDishes.length > 0 || effectiveBatches.length > 0) &&
    colPending.length === 0 &&
    colCreated.length === 0 &&
    colCooked.length === 0 &&
    colSampled.length > 0;

  const handleDrop = (item, from, to) => {
    const order = COLUMNS.map((column) => column.key);
    if (NEXT_COLUMN[from] !== to) {
      onNotify?.(
        from === "sampled"
          ? "Món đã lưu mẫu, không thể chuyển sang cột khác."
          : order.indexOf(to) < order.indexOf(from)
            ? "Không thể chuyển ngược về bước trước."
            : `Chỉ chuyển được sang bước kế tiếp: ${COLUMN_TITLE[NEXT_COLUMN[from]]}.`,
      );
      return;
    }
    if (from === "dishes") {
      if (submittingId) return;
      (onStartCooking || onOpenPlanModal)?.(item);
    } else if (from === "cooking") {
      if (item.status !== "CONFIRMED") {
        onNotify?.("Lô này chưa ở trạng thái đang nấu.");
        return;
      }
      if (actionLoadingId) return;
      onCompleteCooking?.(item);
    } else if (from === "cooked") {
      onOpenSampleModal?.(item);
    }
  };
  const { drag, startPointer, shouldIgnoreClick } = useKanbanDrag({ onDrop: handleDrop });
  const dropClass = (key) => {
    if (!drag || key === drag.from) return "";
    const valid = NEXT_COLUMN[drag.from] === key;
    if (drag.over === key) return valid ? styles.dropActive : styles.dropInvalid;
    return valid ? styles.dropTarget : "";
  };

  const columnItems = {
    dishes: colPending,
    cooking: colCreated,
    cooked: colCooked,
    sampled: colSampled,
  };

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

          {/* Số suất ăn dự kiến theo bữa (đồng bộ từ chốt suất của các lớp) */}
          <div className={styles.metaItem} title="Số suất đồng bộ từ chốt suất của các lớp">
            <Users size={15} className={styles.metaIcon} />
            <span className={styles.metaLabelText}>Suất dự kiến</span>
            <div className={styles.portionChips}>
              {portionMeals.map((meal) => (
                <span key={meal.type} className={styles.portionChip}>
                  <span className={styles.portionChipLabel}>{meal.label}</span>
                  <span className={styles.portionVal}>
                    {Number(mealRequirements[meal.type]?.portions ?? 0).toLocaleString("vi-VN")}
                  </span>
                  <span className={styles.unitText}>suất</span>
                </span>
              ))}
            </div>
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
              <option value="lunch">Bữa trưa{mealTimes?.lunch ? ` (${mealTimes.lunch})` : ""}</option>
              <option value="afternoon">Bữa xế{mealTimes?.afternoon ? ` (${mealTimes.afternoon})` : ""}</option>
            </select>
            <ChevronDown size={14} className={styles.selectArrow} aria-hidden="true" />
          </div>
          <MenuScopeSelect menus={gradeMenus} grades={grades} gradeValue={gradeValue} value={gradeMenuId} onChange={onGradeChange} disabled={gradeDisabled} />
        </div>
      </div>

      {emptyState ? emptyState : <>
      {/* Thông báo nếu đã hoàn thành và lưu mẫu toàn bộ */}
      {allFinished && (
        <div className={styles.allDoneBanner}>
          <Sparkles size={20} className={styles.allDoneIcon} />
          <div className={styles.allDoneContent}>
            <span className={styles.allDoneTitle}>
              Hoàn thành xuất sắc toàn bộ quy trình chế biến & lưu mẫu hôm nay!
            </span>
            <span className={styles.allDoneDesc}>
              Tất cả {colSampled.length} lô chế biến đã nấu xong, niêm phong lưu mẫu đầy đủ và sẵn sàng phân bổ suất ăn cho các lớp.
            </span>
          </div>
        </div>
      )}

      {/* 2. Bảng Kanban 4 cột */}
      <div className={styles.kanbanColumns}>
        {COLUMNS.map((column) => {
          const items = columnItems[column.key];
          const EmptyIcon = column.EmptyIcon;
          return (
            <section
              key={column.key}
              data-kanban-column={column.key}
              className={`${styles.columnWrapper} ${dropClass(column.key)}`}
              aria-label={column.title}
            >
              <header className={`${styles.columnHeader} ${styles[`header_${column.key}`]}`}>
                <div className={styles.colTitleLeft}>
                  <span className={`${styles.colDot} ${styles[`dot_${column.key}`]}`} aria-hidden="true" />
                  <h2 className={styles.colTitle}>{column.title}</h2>
                </div>
                <span className={styles.colCountBadge}>{items.length}</span>
              </header>

              <div className={styles.cardsContainer}>
                {items.length === 0 ? (
                  <div className={styles.emptyColCard}>
                    <EmptyIcon size={20} aria-hidden="true" />
                    <span>{column.empty}</span>
                  </div>
                ) : column.key === "dishes" ? (
                  items.map((dish) => (
                    <article
                      key={dish.id}
                      className={`${styles.dishCard} ${styles.draggable} ${drag?.from === "dishes" && drag.item.id === dish.id ? styles.dragSource : ""}`}
                      onPointerDown={(event) => startPointer(event, dish, "dishes", { title: dish.name, mealType: dish.mealType })}
                      title="Kéo sang cột Đang nấu để bắt đầu nấu"
                    >
                      <div className={styles.cardTop}>
                        <h3 className={styles.dishCardTitle}>{dish.name}</h3>
                        <MealTag mealType={dish.mealType} />
                      </div>
                      <div className={styles.cardFooter}>
                        <span className={styles.cardMeta}>
                          {Number(dish.portionStandard || 0).toLocaleString("vi-VN")} suất
                        </span>
                        <button
                          type="button"
                          className={styles.primaryBtn}
                          onClick={() => (onStartCooking || onOpenPlanModal)?.(dish)}
                          disabled={Boolean(submittingId)}
                          aria-label={`Nấu ${dish.name}`}
                        >
                          <CookingPot size={14} aria-hidden="true" />
                          <span>{submittingId === dish.id ? "Đang xử lý..." : "Nấu"}</span>
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  items.map((batch) => {
                    const name = batchDisplayName(batch);
                    const isActing = actionLoadingId === batch.id;
                    const portions = Number(batch.portionStandard || batch.plannedPortions || 0).toLocaleString("vi-VN");
                    const lastSample = batch.retainedFoodSamples?.at?.(-1);
                    const sampleProg = (column.key === "cooked" || column.key === "sampled") ? batchSampleProgress(batch) : null;
                    const sampleProgressText = sampleProg
                      ? ` · ${sampleProg.completed}/${sampleProg.total} ${sampleProg.total === 1 ? "lô" : "món"}`
                      : "";
                    const time =
                      column.key === "cooked" && batch.completedAt
                        ? ` · Xong ${formatTime(batch.completedAt)}`
                        : column.key === "sampled" && lastSample?.sampledAt
                          ? ` · Lưu ${formatTime(lastSample.sampledAt)}`
                          : "";
                    return (
                      <article
                        key={batch.id}
                        className={`${styles.dishCard} ${styles.clickable} ${column.key !== "sampled" ? styles.draggable : ""} ${drag?.from === column.key && drag.item.id === batch.id ? styles.dragSource : ""}`}
                        onPointerDown={column.key === "sampled" ? undefined : (event) => startPointer(event, batch, column.key, { title: name, mealType: batch.mealType })}
                        onClick={() => {
                          if (!shouldIgnoreClick()) onOpenDetail?.(batch);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onOpenDetail?.(batch);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`Xem chi tiết ${name}`}
                      >
                        <div className={styles.cardTop}>
                          <h3 className={styles.dishCardTitle}>{name}</h3>
                          <MealTag mealType={batch.mealType} />
                        </div>
                        <div className={styles.cardFooter}>
                          <span className={styles.cardMeta}>{portions} suất{sampleProgressText}{time}</span>
                          <div className={styles.cardActions}>
                            <button
                              type="button"
                              className={styles.iconBtn}
                              onClick={(event) => {
                                event.stopPropagation();
                                onOpenDetail?.(batch);
                              }}
                              title="Xem chi tiết"
                              aria-label={`Xem chi tiết ${name}`}
                            >
                              <Eye size={16} aria-hidden="true" />
                            </button>
                            {column.key === "cooking" && (
                              <button
                                type="button"
                                className={styles.primaryBtn}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onCompleteCooking?.(batch);
                                }}
                                disabled={isActing || batch.status !== "CONFIRMED"}
                                aria-label={`Nấu xong ${name}`}
                              >
                                <CheckCircle2 size={14} aria-hidden="true" />
                                <span>{isActing ? "Đang xử lý..." : "Nấu xong"}</span>
                              </button>
                            )}
                            {column.key === "cooked" && (
                              <button
                                type="button"
                                className={styles.primaryBtn}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onOpenSampleModal?.(batch);
                                }}
                                aria-label={`Lưu mẫu ${name}`}
                              >
                                <FlaskConical size={14} aria-hidden="true" />
                                <span>Lưu mẫu</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          );
        })}
      </div>
      </>}

      {drag && (
        <div
          className={styles.dragPreview}
          style={{ width: drag.width, left: drag.x - drag.offsetX, top: drag.y - drag.offsetY }}
          aria-hidden="true"
        >
          <div className={styles.cardTop}>
            <span className={styles.dishCardTitle}>{drag.preview.title}</span>
            <MealTag mealType={drag.preview.mealType} />
          </div>
          <span className={styles.cardMeta}>
            {drag.over && drag.over !== drag.from
              ? NEXT_COLUMN[drag.from] === drag.over
                ? `Thả để chuyển sang ${COLUMN_TITLE[drag.over]}`
                : "Không thể chuyển sang cột này"
              : `Kéo sang ${COLUMN_TITLE[NEXT_COLUMN[drag.from]]}`}
          </span>
        </div>
      )}
    </div>
  );
}

CreateBatchKanban.propTypes = {
  dishes: PropTypes.arrayOf(PropTypes.object),
  pendingDishes: PropTypes.arrayOf(PropTypes.object),
  batches: PropTypes.arrayOf(PropTypes.object),
  mealRequirements: PropTypes.object,
  selectedMeal: PropTypes.string,
  mealTimes: PropTypes.shape({ lunch: PropTypes.string, afternoon: PropTypes.string }),
  onSelectMeal: PropTypes.func,
  gradeMenus: PropTypes.arrayOf(PropTypes.object),
  grades: PropTypes.arrayOf(PropTypes.object),
  gradeValue: PropTypes.string,
  gradeMenuId: PropTypes.string,
  onGradeChange: PropTypes.func,
  gradeDisabled: PropTypes.bool,
  emptyState: PropTypes.node,
  onOpenDetail: PropTypes.func,
  onOpenPlanModal: PropTypes.func,
  onStartCooking: PropTypes.func,
  onOpenSampleModal: PropTypes.func,
  onCompleteCooking: PropTypes.func,
  onNotify: PropTypes.func,
  submittingId: PropTypes.string,
  actionLoadingId: PropTypes.string,
};
