import React, { useMemo } from "react";
import PropTypes from "prop-types";
import {
  CalendarX,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import { FormControl, Select, MenuItem, InputAdornment } from "@mui/material";
import { NO_DATA_TEXT } from "src/constants/ui";
import {
  formatWeekRange,
  getAvailableWeeks,
  getWeekLabel,
  isDateInMenuWeek,
} from "src/utils/weeklyMenu";
import WeeklyDayCard from "./WeeklyDayCard";
import styles from "./WeeklyMenuSection.module.scss";

function WeeklyMenuSection({ weeklyMenu, onWeekChange, schoolCode }) {
  // Điều hướng theo các tuần API công bố, kể cả khi lịch có tuần bị bỏ trống.
  const availableWeeks = useMemo(() => getAvailableWeeks(weeklyMenu), [weeklyMenu]);

  // Ngày bắt đầu của tuần đang xem
  const currentWeekDate = weeklyMenu?.weekStartDate || (availableWeeks[0]?.weekStartDate || "");

  const currentWeekIndex = useMemo(() => {
    if (availableWeeks.length === 0 || !currentWeekDate) return -1;
    return availableWeeks.findIndex((w) => w.weekStartDate === currentWeekDate);
  }, [availableWeeks, currentWeekDate]);
  const currentWeek = availableWeeks[currentWeekIndex];

  const canGoPrev = currentWeekIndex > 0;
  const canGoNext =
    currentWeekIndex >= 0 && currentWeekIndex < availableWeeks.length - 1;

  // Page cha tải thực đơn mặc định của tuần được chọn.
  const handlePrevWeek = () => {
    if (!canGoPrev || !onWeekChange) return;
    const prevWeek = availableWeeks[currentWeekIndex - 1];
    onWeekChange(prevWeek.weekStartDate);
  };

  const handleNextWeek = () => {
    if (!canGoNext || !onWeekChange) return;
    const nextWeek = availableWeeks[currentWeekIndex + 1];
    onWeekChange(nextWeek.weekStartDate);
  };

  const handleSelectWeek = (e) => {
    const targetDate = e.target.value;
    if (onWeekChange && targetDate && targetDate !== currentWeekDate) {
      onWeekChange(targetDate);
    }
  };

  const days = weeklyMenu?.days || [];
  const hasDays = days.length > 0;

  // Nhãn Tuần này dựa trên ngày hiện tại, độc lập với tuần đang xem.
  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <section id="thuc-don-tuan" className={styles.section}>
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Thực đơn bán trú theo tuần</h2>
          <p className={styles.subtitle}>
            Tra cứu thực đơn đầy đủ từ Thứ 2 đến Thứ 6 được nhà trường công khai
          </p>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          {/* Week Switcher kết hợp Dropdown chọn tuần thực tế */}
          <div className={styles.weekSwitcher}>
            <button
              type="button"
              className={styles.weekBtn}
              onClick={handlePrevWeek}
              disabled={!canGoPrev}
              title={canGoPrev ? "Xem tuần trước" : "Không có tuần trước đó"}
            >
              <ChevronLeft size={18} />
            </button>

            {/* Chọn trực tiếp một tuần có trong lịch đã công bố */}
            <FormControl size="small" className={styles.weekFormControl}>
              <Select
                id="weekSelect"
                value={currentWeek?.weekStartDate || ""}
                onChange={handleSelectWeek}
                renderValue={() =>
                  currentWeek ? `Thực đơn ${getWeekLabel(currentWeek)}` : NO_DATA_TEXT
                }
                displayEmpty
                disabled={availableWeeks.length === 0}
                className={styles.weekMuiSelect}
                startAdornment={
                  <InputAdornment position="start" className={styles.calendarAdornment}>
                    <FileText size={16} />
                  </InputAdornment>
                }
                MenuProps={{
                  PaperProps: {
                    className: styles.weekDropdownPaper,
                  },
                }}
              >
                {availableWeeks.length === 0 ? (
                  <MenuItem value="" disabled className={styles.placeholderItem}>
                    {NO_DATA_TEXT}
                  </MenuItem>
                ) : (
                  availableWeeks.map((w) => {
                    const isRealtimeCurrentWeek = isDateInMenuWeek(todayIso, w.weekStartDate);

                    return (
                      <MenuItem
                        key={w.id || w.weekStartDate}
                        value={w.weekStartDate}
                        className={styles.weekMenuItem}
                      >
                        <span className={styles.weekItemTitle}>
                          {getWeekLabel(w)}
                        </span>
                        {w.weekRange && (
                          <span className={styles.weekItemRange}>
                            {formatWeekRange(w.weekRange)}
                          </span>
                        )}
                        {isRealtimeCurrentWeek && (
                          <span className={styles.currentTag}>Tuần này</span>
                        )}
                      </MenuItem>
                    );
                  })
                )}
              </Select>
            </FormControl>

            <button
              type="button"
              className={styles.weekBtn}
              onClick={handleNextWeek}
              disabled={!canGoNext}
              title={canGoNext ? "Xem tuần kế tiếp" : "Không có tuần kế tiếp"}
            >
              <ChevronRight size={18} />
            </button>
          </div>

        </div>

        {/* Nội dung: Hiển thị Empty State Banner trong container hoặc Lưới 5 ngày */}
        {!hasDays ? (
          <div className={styles.emptyContainer}>
            <div className={styles.emptyIconBox}>
              <CalendarX size={32} />
            </div>
            <h3 className={styles.emptyTitle}>
              Chưa có thực đơn bán trú cho tuần này
            </h3>
            <p className={styles.emptyDescription}>
              Nhà trường hiện chưa công bố thực đơn tuần được phê duyệt cho khoảng
              thời gian này. Phụ huynh có thể chọn các tuần khác trong danh sách thả xuống
              ở trên hoặc liên hệ bộ phận bán trú của nhà trường.
            </p>
          </div>
        ) : (
          <div className={styles.daysGrid}>
            {days.map((day, idx) => (
              <WeeklyDayCard key={day.date || day.id || idx} day={day} schoolCode={schoolCode} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

WeeklyMenuSection.propTypes = {
  schoolCode: PropTypes.string,
  weeklyMenu: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    weekNumber: PropTypes.number,
    weekStartDate: PropTypes.string,
    weekRange: PropTypes.string,
    days: PropTypes.array,
    availableWeeks: PropTypes.array,
    available_weeks: PropTypes.array,
  }),
  onWeekChange: PropTypes.func,
};

export default WeeklyMenuSection;
