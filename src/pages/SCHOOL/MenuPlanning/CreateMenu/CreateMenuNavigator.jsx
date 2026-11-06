import React from "react"
import { ChevronLeft, ChevronRight, Utensils, Coffee } from "lucide-react"
import styles from "./CreateMenuNavigator.module.scss"

export default function CreateMenuNavigator({
  weekInfo,
  formState,
  weeklyMeals = {},
  onChangeField,
  onSelectDay,
  onSelectMealType,
  onShiftWeek,
  readOnly = false,
}) {
  const schoolDays = weekInfo?.schoolDays || []
  const weekRange =
    schoolDays.length >= 5
      ? `${schoolDays[0].dateVN.slice(0, 5)} – ${schoolDays[4].dateVN}`
      : ""

  return (
    <div className={styles.navCard}>
      {/* 1. Header: Stepper tuần & Trạng thái ca đang chọn */}
      <div className={styles.weekHeaderRow}>
        <div className={styles.weekStepper}>
          <button
            type="button"
            className={styles.weekNavBtn}
            onClick={() => onShiftWeek(-1)}
            title="Chuyển sang tuần trước"
            aria-label="Tuần trước"
          >
            <ChevronLeft size={16} />
          </button>
          <span className={styles.weekRangeText}>
            Tuần {weekInfo?.weekNumber || 45} • {weekRange}
          </span>
          <button
            type="button"
            className={styles.weekNavBtn}
            onClick={() => onShiftWeek(1)}
            title="Chuyển sang tuần sau"
            aria-label="Tuần sau"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className={styles.activeDaySummary}>
          <span className={styles.pulseDot} />
          <span>
            Đang soạn: <strong>{weekInfo?.dayLabel || "Thứ Hai"} ({formState.date})</strong> •{" "}
            {formState.mealType === "AFTERNOON" ? "Bữa xế" : "Bữa trưa"}
          </span>
        </div>
      </div>

      {/* 2. Dải chọn 5 ngày học đường T2 đến T6 */}
      <div className={styles.daysRow}>
        {schoolDays.map((day) => {
          const isSelected = formState.date === day.dateVN
          const dayMeals = weeklyMeals[day.dateISO] || {}
          const hasLunch = Array.isArray(dayMeals.LUNCH) && dayMeals.LUNCH.length > 0
          const hasAfternoon =
            Array.isArray(dayMeals.AFTERNOON) && dayMeals.AFTERNOON.length > 0
          const hasDishes = hasLunch || hasAfternoon

          return (
            <button
              key={day.dateISO}
              type="button"
              className={`${styles.dayBtn} ${isSelected ? styles.activeDayBtn : ""}`}
              onClick={() => onSelectDay(day.dateVN)}
              title={`Soạn thực đơn cho ${day.dayLabel} (${day.dateVN})`}
            >
              <span className={styles.dayName}>{day.dayLabel}</span>
              <div className={styles.dayDateRow}>
                <span className={styles.dayDate}>{day.dateVN.slice(0, 5)}</span>
                {hasDishes && <span className={styles.hasDishesDot} title="Đã có món" />}
              </div>
            </button>
          )
        })}
      </div>

      {/* 3. Dải chọn Ca ăn (Bữa trưa / Bữa xế) */}
      <div className={styles.mealTypeRow}>
        <button
          type="button"
          className={`${styles.mealToggleBtn} ${
            formState.mealType === "LUNCH" ? styles.activeLunch : ""
          }`}
          onClick={() => onSelectMealType("LUNCH")}
        >
          <Utensils size={16} />
          <span>Bữa trưa</span>
        </button>

        <button
          type="button"
          className={`${styles.mealToggleBtn} ${
            formState.mealType === "AFTERNOON" ? styles.activeAfternoon : ""
          }`}
          onClick={() => onSelectMealType("AFTERNOON")}
        >
          <Coffee size={16} />
          <span>Bữa xế</span>
        </button>
      </div>

      {/* 4. Thông tin cơ bản: Tên thực đơn & Khối lớp áp dụng (BỎ Số suất ăn dự kiến) */}
      <div className={styles.inputsGrid}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="menuName">
            Tên thực đơn <span className={styles.required}>*</span>
          </label>
          <input
            id="menuName"
            type="text"
            className={styles.input}
            value={formState.name}
            disabled={readOnly}
            onChange={(e) => onChangeField("name", e.target.value)}
            placeholder="Ví dụ: Thực đơn Bữa trưa Thứ Hai..."
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="targetScope">
            Khối lớp áp dụng <span className={styles.required}>*</span>
          </label>
          <input
            id="targetScope"
            type="text"
            className={styles.input}
            value={formState.targetScope}
            disabled={readOnly}
            onChange={(e) => onChangeField("targetScope", e.target.value)}
            placeholder="Ví dụ: Toàn trường (Khối 1 - 5)"
          />
        </div>
      </div>

      {/* 5. Ghi chú (tùy chọn) */}
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="menuNotes">
          Ghi chú thực đơn (tùy chọn)
        </label>
        <textarea
          id="menuNotes"
          rows={2}
          className={styles.notesInput}
          value={formState.notes || ""}
          disabled={readOnly}
          onChange={(e) => onChangeField("notes", e.target.value)}
          placeholder="Lưu ý về dinh dưỡng, nhiệt độ phục vụ hoặc chế biến nếu có..."
        />
      </div>
    </div>
  )
}

