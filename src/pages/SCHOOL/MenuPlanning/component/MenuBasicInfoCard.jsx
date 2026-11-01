import React, { useContext, useEffect, useState, useRef, useMemo } from "react";
import styles from "./MenuBasicInfoCard.module.scss";
import { StoreContext } from "src/contexts";
import STORAGE, { getStorage } from "src/lib/storage";
import SchoolService from "src/services/SchoolService";
import MenuService from "src/services/MenuService";
import {
  getSchoolWeekScheduleFromDate,
  parseDateVNToISO,
  formatDateVN,
} from "src/services/MenuService/adapter";

export default function MenuBasicInfoCard({ formState, onChangeField }) {
  const store = useContext(StoreContext);
  const user = store?.userStore?.user || getStorage(STORAGE.USER_INFO) || {};
  const schoolId = user.schoolId || user.orgId;
  const [mealTimes, setMealTimes] = useState({ lunch: null, afternoon: null });
  const [weekSchedule, setWeekSchedule] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const dateInputRef = useRef(null);

  // Tải cấu hình giờ ăn từ trường
  useEffect(() => {
    let active = true;
    if (!schoolId)
      return () => {
        active = false;
      };

    SchoolService.getSchoolDetailById(schoolId)
      .then((response) => {
        if (!active) return;
        const school = response?.data;
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
  }, [schoolId]);

  const formatTime = (value) => (value ? String(value).slice(0, 5) : null);
  const lunchTime = formatTime(mealTimes.lunch);
  const afternoonTime = formatTime(mealTimes.afternoon);

  // Tính toán Thứ, Tuần, T2-T6 tức thời theo ngày hiện tại của form
  const weekInfo = useMemo(() => {
    return getSchoolWeekScheduleFromDate(formState.date);
  }, [formState.date]);

  // Lấy giá trị ISO YYYY-MM-DD cho thẻ <input type="date">
  const isoDateValue = useMemo(() => {
    if (!formState.date) return "";
    return parseDateVNToISO(formState.date);
  }, [formState.date]);

  // Gọi API / Mock để kiểm tra trạng thái 5 ngày của tuần đó (T2 - T6)
  useEffect(() => {
    let active = true;
    if (!formState.date) return;

    setLoadingSchedule(true);
    MenuService.getWeekSchedule(formState.date)
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
  }, [formState.date]);

  // Xử lý khi chọn ngày từ DatePicker Lịch
  const handleCalendarChange = (e) => {
    const val = e.target.value; // Format YYYY-MM-DD
    if (!val) return;
    const formatted = formatDateVN(val); // Format DD/MM/YYYY
    onChangeField("date", formatted);

    // Tự động cập nhật tên thực đơn nếu chưa nhập hoặc tên đang theo mẫu cũ
    if (!formState.name || formState.name.startsWith("Thực đơn Thứ")) {
      const newWeekInfo = getSchoolWeekScheduleFromDate(formatted);
      const mealName =
        formState.mealType === "AFTERNOON" ? "Bữa xế" : "Bữa trưa";
      onChangeField(
        "name",
        `Thực đơn ${newWeekInfo.dayLabel} (Tuần ${newWeekInfo.weekNumber}) - ${mealName}`,
      );
    }
  };

  // Mở popup Datepicker
  const handleTriggerDatePicker = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === "function") {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  // Chuyển nhanh giữa 5 ngày trong tuần
  const handleSelectDayPill = (day) => {
    onChangeField("date", day.dateVN);
    if (!formState.name || formState.name.startsWith("Thực đơn Thứ")) {
      const mealName =
        formState.mealType === "AFTERNOON" ? "Bữa xế" : "Bữa trưa";
      onChangeField(
        "name",
        `Thực đơn ${day.dayLabel} (Tuần ${weekInfo.weekNumber}) - ${mealName}`,
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
              date_range
            </span>
            Tuần học đường chuẩn: 05 ngày từ Thứ Hai đến Thứ Sáu (T2 – T6)
          </span>
        </div>
      </div>

      <div className={styles.formGrid}>
        {/* Tên thực đơn */}
        <div className={`${styles.fieldCol} ${styles.col6}`}>
          <label className={styles.fieldLabel} htmlFor="menuName">
            Tên thực đơn <span className={styles.req}>*</span>
          </label>
          <input
            id="menuName"
            type="text"
            className={styles.textInput}
            value={formState.name}
            onChange={(e) => onChangeField("name", e.target.value)}
            placeholder="Ví dụ: Thực đơn Thứ Tư (Tuần 46) - Bữa trưa"
          />
        </div>

        {/* Ngày ăn với Lịch Datepicker */}
        <div className={`${styles.fieldCol} ${styles.col3}`}>
          <div className={styles.labelWithAction}>
            <label className={styles.fieldLabel} htmlFor="menuDate">
              Ngày áp dụng <span className={styles.req}>*</span>
            </label>
            <button
              type="button"
              className={styles.openCalendarBtn}
              onClick={handleTriggerDatePicker}
              title="Bấm để mở lịch chọn ngày"
            >
              <span className="material-symbols-outlined">calendar_month</span>
              <span>Chọn lịch</span>
            </button>
          </div>

          <div className={styles.datePickerContainer}>
            <div
              className={styles.inputWithIcon}
              onClick={handleTriggerDatePicker}
            >
              <span className={`material-symbols-outlined ${styles.innerIcon}`}>
                calendar_today
              </span>
              <input
                id="menuDate"
                type="text"
                className={`${styles.textInput} ${styles.plIcon}`}
                value={formState.date}
                onChange={(e) => onChangeField("date", e.target.value)}
                placeholder="DD/MM/YYYY"
              />
            </div>

            {/* Native Date Picker ẩn nhưng hỗ trợ showPicker click */}
            <input
              type="date"
              ref={dateInputRef}
              className={styles.hiddenNativeDatePicker}
              value={isoDateValue}
              onChange={handleCalendarChange}
              aria-label="Chọn ngày trên lịch"
            />
          </div>
        </div>

        {/* Bữa ăn */}
        <div className={`${styles.fieldCol} ${styles.col3}`}>
          <label className={styles.fieldLabel} htmlFor="mealType">
            Loại bữa ăn <span className={styles.req}>*</span>
          </label>
          <div className={styles.selectWrapper}>
            <select
              id="mealType"
              className={styles.selectInput}
              value={formState.mealType}
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

        {/* DẢI TIỆN ÍCH THÔNG MINH: BẢNG 5 NGÀY HỌC ĐƯỜNG TUẦN (T2 - T6) */}
        <div className={`${styles.fieldCol} ${styles.col12}`}>
          <div
            className={`${styles.weekScheduleCard} ${weekInfo.isWeekend ? styles.cardWeekendWarning : ""}`}
          >
            <div className={styles.weekHeaderRow}>
              <div className={styles.weekTitleWrap}>
                <span
                  className={`material-symbols-outlined ${styles.weekIcon}`}
                >
                  {weekInfo.isWeekend ? "event_busy" : "event_available"}
                </span>
                <span className={styles.weekTitleText}>
                  Đang chọn: <strong>{weekInfo.dayLabel}</strong> (
                  {formState.date}) • {weekInfo.weekRangeLabel}
                </span>
              </div>

              <div className={styles.weekStatusBadgeWrap}>
                {weekInfo.isWeekend ? (
                  <span className={styles.badgeWeekend}>
                    ⚠️ Cuối tuần — Không tổ chức bán trú
                  </span>
                ) : weekSchedule?.isWeekComplete ? (
                  <span className={styles.badgeComplete}>
                    ✓ Đã có đủ 5/5 ngày bán trú trong tuần
                  </span>
                ) : (
                  <span className={styles.badgeMissing}>
                    Đã tạo {weekSchedule?.completedDays || 0}/5 ngày •{" "}
                    {weekSchedule?.missingDays?.length ? (
                      <strong>
                        Chưa tạo: {weekSchedule.missingDays.length} ngày ⚠️
                      </strong>
                    ) : (
                      "Đang tải lịch tuần..."
                    )}
                  </span>
                )}
              </div>
            </div>

            {/* Dải 5 nút chuyển ngày Thứ 2 đến Thứ 6 */}
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
                    className={`${styles.dayPill} ${isSelected ? styles.dayPillActive : ""} ${hasMenu ? styles.dayPillDone : styles.dayPillMissing}`}
                    onClick={() => handleSelectDayPill(day)}
                    title={`Chuyển sang ${day.dayLabel} (${day.dateVN})`}
                  >
                    <div className={styles.pillTop}>
                      <span className={styles.pillIndexBadge}>
                        {day.dayIndexLabel}
                      </span>
                      <span className={styles.pillDayName}>
                        {day.dayLabel.replace("Thứ ", "T")}
                      </span>
                      <span className={styles.pillDate}>
                        {day.dateVN.slice(0, 5)}
                      </span>
                    </div>

                    <div className={styles.pillBottom}>
                      {isSelected ? (
                        <span className={styles.statusActive}>
                          📍 Đang chọn
                        </span>
                      ) : hasMenu ? (
                        <span className={styles.statusDone}>✓ Đã có món</span>
                      ) : (
                        <span className={styles.statusMissing}>
                          ⚠️ Chưa tạo
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
                  <strong>Cảnh báo:</strong> Bạn đang chọn ngày cuối tuần (
                  {weekInfo.dayLabel}). Bán trú nhà trường chỉ phục vụ từ{" "}
                  <strong>Thứ Hai đến Thứ Sáu</strong>. Vui lòng bấm vào một
                  ngày trong dải trên để tiếp tục!
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
            onChange={(e) => onChangeField("targetScope", e.target.value)}
            placeholder="Tự nhập khối/độ tuổi, ví dụ: Toàn trường, Khối 1-2, Lớp Mầm non 3-4 tuổi..."
          />
        </div>

        {/* Tổng số suất dự kiến */}
        <div className={`${styles.fieldCol} ${styles.col6}`}>
          <label className={styles.fieldLabel} htmlFor="portionCount">
            Tổng số suất ăn kế hoạch <span className={styles.req}>*</span>
          </label>
          <div className={styles.portionInputWrapper}>
            <input
              id="portionCount"
              type="number"
              min="1"
              className={styles.portionNumberInput}
              value={formState.portionCount}
              onChange={(e) =>
                onChangeField("portionCount", Number(e.target.value) || 0)
              }
            />
            <span className={styles.portionUnitLabel}>suất ăn</span>
          </div>
        </div>

        {/* Ghi chú dinh dưỡng */}
        <div className={`${styles.fieldCol} ${styles.col12}`}>
          <label className={styles.fieldLabel} htmlFor="menuNotes">
            Ghi chú dinh dưỡng & khuyến nghị
          </label>
          <input
            id="menuNotes"
            type="text"
            className={styles.textInput}
            value={formState.notes}
            onChange={(e) => onChangeField("notes", e.target.value)}
            placeholder="Ghi chú dinh dưỡng, định hướng khẩu phần học đường..."
          />
        </div>
      </div>
    </div>
  );
}
