import React, { useEffect, useState, useMemo, useRef } from "react";
import { TextField } from "@mui/material";
import styles from "./MenuBasicInfoCard.module.scss";
import MenuService from "src/services/MenuService";
import {
  getSchoolWeekScheduleFromDate,
  parseDateVNToISO,
  formatDateVN,
} from "src/services/MenuService/adapter";

export default function MenuBasicInfoCard({
  formState,
  onChangeField,
  readOnly = false,
}) {
  const [mealTimes, setMealTimes] = useState({ lunch: null, afternoon: null });
  const [weekSchedule, setWeekSchedule] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [weekendWarning, setWeekendWarning] = useState(false);
  const dateInputRef = useRef(null);

  // Tải cấu hình giờ ăn từ trường
  useEffect(() => {
    let active = true;
    MenuService.getContext()
      .then((school) => {
        if (!active) return;
        setMealTimes({
          lunch: school?.lunchTime || school?.lunch_time || null,
          afternoon:
            school?.afternoonMealTime || school?.afternoon_meal_time || null,
        });
      })
      .catch(() => {
        if (active) setMealTimes({ lunch: null, afternoon: null });
      });

    return () => {
      active = false;
    };
  }, []);

  const formatTime = (value) => (value ? String(value).slice(0, 5) : null);
  const lunchTime = formatTime(mealTimes.lunch);
  const afternoonTime = formatTime(mealTimes.afternoon);

  // Tính toán T2-T6, Tuần tức thời theo ngày hiện tại của form
  const weekInfo = useMemo(() => {
    return getSchoolWeekScheduleFromDate(formState.date);
  }, [formState.date]);

  // Lấy giá trị ISO YYYY-MM-DD cho thẻ <input type="date">
  const isoDateValue = useMemo(() => {
    if (!formState.date) return "";
    return parseDateVNToISO(formState.date);
  }, [formState.date]);

  // Chuỗi dải ngày từ T2 đến T6 trong tuần (DD/MM – DD/MM/YYYY)
  const weekRange = useMemo(() => {
    if (!weekInfo?.schoolDays || weekInfo.schoolDays.length < 5) return "";
    const startStr = weekInfo.schoolDays[0].dateVN.slice(0, 5);
    const endStr = weekInfo.schoolDays[4].dateVN;
    return `${startStr} – ${endStr}`;
  }, [weekInfo]);

  const weekStartDate = weekInfo?.schoolDays?.[0]?.dateISO;

  // Gọi API để kiểm tra trạng thái 5 ngày của tuần đó (T2 - T6)
  // Chỉ gọi lại khi chuyển sang tuần khác (weekStartDate thay đổi), không fetch lại khi chọn thứ trong tuần
  useEffect(() => {
    let active = true;
    if (!weekStartDate) return;

    setLoadingSchedule(true);
    setWeekSchedule(null);
    MenuService.getWeekSchedule(weekStartDate)
      .then((res) => {
        if (!active) return;
        if (res?.data) {
          setWeekSchedule(res.data);
        }
      })
      .catch((err) => {
        console.warn("Lỗi tải weekSchedule:", err);
      })
      .finally(() => {
        if (active) setLoadingSchedule(false);
      });

    return () => {
      active = false;
    };
  }, [weekStartDate]);

  // Cảnh báo nếu hôm nay là cuối tuần và tuần tới chưa có thực đơn T2
  useEffect(() => {
    const today = new Date();
    if (today.getDay() !== 0 && today.getDay() !== 6) {
      setWeekendWarning(false);
      return;
    }
    const monday = new Date(today);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) + 7);
    const mondayIso = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;

    if (weekStartDate === mondayIso && weekSchedule?.days) {
      const mondayMenu = weekSchedule.days.find((day) => day.date === mondayIso);
      setWeekendWarning(!mondayMenu?.hasMenu);
      return;
    }

    MenuService.getWeekSchedule(mondayIso)
      .then((res) => {
        const mondayMenu = res?.data?.days?.find(
          (day) => day.date === mondayIso,
        );
        setWeekendWarning(!mondayMenu?.hasMenu);
      })
      .catch(() => setWeekendWarning(false));
  }, [weekStartDate, weekSchedule]);

  // Xử lý khi chọn ngày từ DatePicker Lịch
  const handleCalendarChange = (e) => {
    const val = e.target.value;
    if (!val) return;
    const formatted = formatDateVN(val);
    onChangeField("date", formatted);

    // Tự động cập nhật tên thực đơn nếu chưa nhập hoặc tên đang theo mẫu mặc định
    if (!formState.name || formState.name.startsWith("Thực đơn T")) {
      const newWeekInfo = getSchoolWeekScheduleFromDate(formatted);
      const mealName =
        formState.mealType === "AFTERNOON" ? "Bữa xế" : "Bữa trưa";
      onChangeField(
        "name",
        `Thực đơn ${newWeekInfo.dayIndexLabel || "T2"} (${formatted}) - ${mealName}`,
      );
    }
  };

  const handleTriggerDatePicker = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === "function") {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  // Di chuyển giữa các tuần (Lùi 1 tuần hoặc Tiến 1 tuần)
  const handleShiftWeek = (offset) => {
    const selectedDate = new Date(`${weekInfo.dateISO}T00:00:00`);
    selectedDate.setDate(selectedDate.getDate() + offset * 7);
    const dateVN = `${String(selectedDate.getDate()).padStart(2, "0")}/${String(selectedDate.getMonth() + 1).padStart(2, "0")}/${selectedDate.getFullYear()}`;
    onChangeField("date", dateVN);
  };

  // Bấm chọn trực tiếp một trong 5 ngày học đường (T2 - T6)
  const handleSelectDayPill = (day) => {
    onChangeField("date", day.dateVN);
    if (!formState.name || formState.name.startsWith("Thực đơn T")) {
      const mealName =
        formState.mealType === "AFTERNOON" ? "Bữa xế" : "Bữa trưa";
      onChangeField(
        "name",
        `Thực đơn ${day.dayIndexLabel} (${day.dateVN}) - ${mealName}`,
      );
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <span className={`material-symbols-outlined ${styles.headerIcon}`}>
            tune
          </span>
          <h2 className={styles.cardTitle}>Thông tin thực đơn</h2>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.multiNotice}>
            <span className={`material-symbols-outlined ${styles.multiIcon}`}>
              calendar_view_week
            </span>
            Tuần học đường bán trú: T2 đến T6
          </span>
        </div>
      </div>

      {weekendWarning && (
        <div className={styles.weekendAlertBox} role="alert">
          <span className={`material-symbols-outlined ${styles.alertIcon}`}>
            warning
          </span>
          <span>
            Cuối tuần rồi nhưng tuần tới chưa có thực đơn cho Thứ Hai. Vui lòng
            tạo thực đơn trước ngày học đầu tuần.
          </span>
        </div>
      )}

      <div className={styles.formGrid}>
        {/* Tên thực đơn (col6) */}
        <div className={`${styles.fieldCol} ${styles.col6}`}>
          <label className={styles.fieldLabel} htmlFor="menuName">
            Tên thực đơn <span className={styles.req}>*</span>
          </label>
          <input
            id="menuName"
            type="text"
            className={styles.textInput}
            value={formState.name}
            disabled={readOnly}
            onChange={(e) => onChangeField("name", e.target.value)}
            placeholder="Ví dụ: Thực đơn T2 (Tuần 45) - Bữa trưa"
          />
        </div>

        {/* Ngày áp dụng kèm Lịch (col3) */}
        <div className={`${styles.fieldCol} ${styles.col3}`}>
          <div className={styles.labelWithAction}>
            <label className={styles.fieldLabel} htmlFor="menuDate">
              Ngày áp dụng <span className={styles.req}>*</span>
            </label>
            {!readOnly && (
              <button
                type="button"
                className={styles.openCalendarBtn}
                onClick={handleTriggerDatePicker}
                title="Mở lịch chọn ngày bất kỳ"
              >
                <span className="material-symbols-outlined">event</span>
                Chọn lịch
              </button>
            )}
          </div>
          <div className={styles.datePickerContainer}>
            <div
              className={`${styles.inputWithIcon} ${readOnly ? styles.inputDisabled : ""}`}
              onClick={!readOnly ? handleTriggerDatePicker : undefined}
            >
              <span className={`material-symbols-outlined ${styles.innerIcon}`}>
                calendar_month
              </span>
              <input
                id="menuDate"
                type="text"
                readOnly
                className={`${styles.textInput} ${styles.plIcon}`}
                value={formState.date}
                placeholder="DD/MM/YYYY"
              />
              {!readOnly && (
                <input
                  ref={dateInputRef}
                  type="date"
                  className={styles.hiddenNativeDatePicker}
                  value={isoDateValue}
                  onChange={handleCalendarChange}
                  tabIndex={-1}
                  aria-label="Chọn ngày trên lịch"
                />
              )}
            </div>
          </div>
        </div>

        {/* Loại bữa ăn (col3) */}
        <div className={`${styles.fieldCol} ${styles.col3}`}>
          <label className={styles.fieldLabel} htmlFor="mealType">
            Loại bữa ăn <span className={styles.req}>*</span>
          </label>
          <div className={styles.selectWrapper}>
            <select
              id="mealType"
              className={styles.selectInput}
              value={formState.mealType}
              disabled={readOnly}
              onChange={(e) => onChangeField("mealType", e.target.value)}
            >
              <option value="LUNCH">
                Bữa trưa{lunchTime ? ` (${lunchTime})` : ""}
              </option>
              <option value="AFTERNOON">
                Bữa xế{afternoonTime ? ` (${afternoonTime})` : ""}
              </option>
            </select>
            <span
              className={`material-symbols-outlined ${styles.selectChevron}`}
            >
              expand_more
            </span>
          </div>
        </div>

        {/* KHỐI TIỆN ÍCH LỊCH TUẦN HỌC ĐƯỜNG (T2 ĐẾN T6) - CLEAN UI/UX */}
        <div className={`${styles.fieldCol} ${styles.col12}`}>
          <div
            className={`${styles.weekScheduleCard} ${
              weekInfo.isWeekend ? styles.cardWeekendWarning : ""
            }`}
          >
            {/* Header dải tuần: Stepper chuyển tuần + Trạng thái */}
            <div className={styles.weekHeaderRow}>
              <div className={styles.weekTitleWrap}>
                {/* Segmented Week Nav Pill */}
                <div className={styles.weekPillNav}>
                  <button
                    type="button"
                    className={styles.weekNavBtn}
                    onClick={() => handleShiftWeek(-1)}
                    title="Chuyển sang tuần trước"
                    aria-label="Tuần trước"
                  >
                    <span className="material-symbols-outlined">
                      chevron_left
                    </span>
                  </button>

                  <div className={styles.weekInfoCenter}>
                    <span
                      className={`material-symbols-outlined ${styles.weekCalendarIcon}`}
                    >
                      date_range
                    </span>
                    <span className={styles.weekRangeText}>
                      {weekSchedule?.weekLabel ? `${weekSchedule.weekLabel} • ` : ""}{weekRange}
                    </span>
                  </div>

                  <button
                    type="button"
                    className={styles.weekNavBtn}
                    onClick={() => handleShiftWeek(1)}
                    title="Chuyển sang tuần sau"
                    aria-label="Tuần sau"
                  >
                    <span className="material-symbols-outlined">
                      chevron_right
                    </span>
                  </button>
                </div>

                {/* Tag Đang chọn ngày nào */}
                <div className={styles.currentDayIndicator}>
                  <span className={styles.indicatorDot} />
                  <span>
                    Đang chọn:{" "}
                    <strong>
                      {weekInfo.dayIndexLabel || "T2"} ({formState.date})
                    </strong>
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className={styles.weekStatusBadgeWrap}>
                {loadingSchedule && !weekSchedule ? (
                  <span className={styles.badgeLoading}>
                    <span className={`material-symbols-outlined ${styles.spinIcon}`}>
                      sync
                    </span>
                    Đang kiểm tra tiến độ tuần…
                  </span>
                ) : weekInfo.isWeekend ? (
                  <span className={styles.badgeWeekend}>
                    <span className="material-symbols-outlined">
                      event_busy
                    </span>
                    Cuối tuần (Không có bán trú)
                  </span>
                ) : weekSchedule?.isWeekComplete ? (
                  <span className={styles.badgeComplete}>
                    <span className="material-symbols-outlined">
                      check_circle
                    </span>
                    Đã tạo đủ 5/5 ngày bán trú
                  </span>
                ) : (
                  <span className={styles.badgeMissing}>
                    <span className="material-symbols-outlined">
                      pending_actions
                    </span>
                    Đã tạo {weekSchedule?.completedDays ?? 0}/5 ngày •{" "}
                    <strong>
                      Chưa tạo {weekSchedule?.missingDays?.length ?? (5 - (weekSchedule?.completedDays ?? 0))} ngày ⚠️
                    </strong>
                  </span>
                )}
              </div>
            </div>

            {/* Dải 5 thẻ ngày học đường T2 đến T6 */}
            <div className={styles.daysStrip}>
              {weekInfo.schoolDays.map((day) => {
                const isSelected = formState.date === day.dateVN;
                const dayMatch = weekSchedule?.days?.find(
                  (d) => d.dateVN === day.dateVN || d.date === day.dateISO,
                );
                const hasMenu = Boolean(dayMatch?.hasMenu);

                return (
                  <button
                    key={day.dateISO}
                    type="button"
                    className={`${styles.dayCard} ${
                      isSelected ? styles.dayCardActive : ""
                    } ${hasMenu ? styles.dayCardDone : styles.dayCardMissing}`}
                    onClick={() => handleSelectDayPill(day)}
                    title={`Chọn ngày ${day.dayIndexLabel} (${day.dateVN})`}
                  >
                    <div className={styles.dayCardTop}>
                      <span className={styles.dayNameText}>
                        {day.dayIndexLabel}
                      </span>
                      <span className={styles.dayDateText}>
                        {day.dateVN.slice(0, 5)}
                      </span>
                    </div>

                    <div className={styles.dayCardStatusWrap}>
                      {isSelected ? (
                        <span className={styles.statusPillActive}>
                          <span className={styles.activeDot} />
                          Đang chọn
                        </span>
                      ) : loadingSchedule && !weekSchedule ? (
                        <span className={styles.statusPillLoading}>
                          <span className={styles.pulseDot} />
                          Đang tải...
                        </span>
                      ) : hasMenu ? (
                        <span className={styles.statusPillDone}>
                          <span className="material-symbols-outlined">
                            check
                          </span>
                          Đã có món
                        </span>
                      ) : (
                        <span className={styles.statusPillMissing}>
                          <span className="material-symbols-outlined">
                            add
                          </span>
                          Chưa tạo
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {weekInfo.isWeekend && (
              <div className={styles.weekendAlertBox}>
                <span
                  className={`material-symbols-outlined ${styles.alertIcon}`}
                >
                  warning
                </span>
                <span>
                  <strong>Lưu ý:</strong> Ngày bạn đang chọn là cuối tuần (
                  {weekInfo.dayLabel}). Nhà trường chỉ tổ chức bán trú từ{" "}
                  <strong>T2 đến T6</strong>. Vui lòng bấm vào thẻ{" "}
                  <strong>T2 – T6</strong> ở trên để tiếp tục.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Khối lớp / Độ tuổi áp dụng */}
        <div className={`${styles.fieldCol} ${styles.col6}`}>
          <label className={styles.fieldLabel} htmlFor="targetScope">
            Khối lớp / Độ tuổi áp dụng <span className={styles.req}>*</span>
          </label>
          <input
            id="targetScope"
            type="text"
            className={styles.textInput}
            value={formState.targetScope}
            disabled={readOnly}
            onChange={(e) => onChangeField("targetScope", e.target.value)}
            placeholder="Ví dụ: Khối 1 - Khối 5 (Tiểu học) hoặc Toàn trường"
          />
        </div>

        {/* Số suất ăn dự kiến */}
        <div className={`${styles.fieldCol} ${styles.col6}`}>
          <label className={styles.fieldLabel} htmlFor="portionCount">
            Số suất ăn dự kiến <span className={styles.req}>*</span>
          </label>
          <div className={styles.portionInputGroup}>
            <input
              id="portionCount"
              type="number"
              disabled={readOnly}
              min="1"
              className={styles.portionNumberInput}
              value={formState.portionCount}
              onChange={(e) =>
                onChangeField("portionCount", Number(e.target.value) || 0)
              }
            />
          </div>
        </div>

        {/* Ghi chú thực đơn */}
        <div className={`${styles.fieldCol} ${styles.col12}`}>
          <label className={styles.fieldLabel} htmlFor="menuNotes">
            Ghi chú thực đơn (nếu có)
          </label>
          <TextField
            id="menuNotes"
            multiline
            minRows={3}
            maxRows={8}
            fullWidth
            variant="outlined"
            className={styles.textareaInput}
            value={formState.notes || ""}
            disabled={readOnly}
            onChange={(e) => onChangeField("notes", e.target.value)}
            placeholder="Thêm lưu ý về chế biến, phục vụ hoặc dinh dưỡng…"
          />
        </div>
      </div>
    </div>
  );
}
