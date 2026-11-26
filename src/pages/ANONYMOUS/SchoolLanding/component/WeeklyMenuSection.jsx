import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  CalendarX,
  ChevronLeft,
  ChevronRight,
  FileText,
  Layers,
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
import { vietnamTodayISO } from "src/utils/menuDays";
import styles from "./WeeklyMenuSection.module.scss";

function WeeklyMenuSection({
  weeklyMenu,
  onWeekChange,
  onGroupChange,
  schoolCode,
  schoolGrades = [],
  selectedGradeId,
  selectedGradeName,
  menuError = false,
}) {
  // Danh sách khối chỉ lấy từ danh mục khối gốc của trường (API /grades),
  // độc lập với thực đơn để vẫn hiển thị khi tuần không có menu hoặc menu lỗi.
  // Không có lựa chọn "Toàn trường": thực đơn toàn trường hiển thị ở mọi khối.
  const gradeOptions = useMemo(() => {
    const seen = new Set();
    return (schoolGrades || []).filter((g) => {
      if (!g?.id || seen.has(g.id)) return false;
      seen.add(g.id);
      return true;
    }).map((g) => ({ id: g.id, name: g.name }));
  }, [schoolGrades]);

  const [activeGroupId, setActiveGroupId] = useState(selectedGradeId || "");

  useEffect(() => {
    if (selectedGradeId !== undefined) {
      setActiveGroupId(selectedGradeId);
    }
  }, [selectedGradeId]);

  const currentGroupId =
    selectedGradeId !== undefined ? selectedGradeId : activeGroupId;

  // Tên khối đang chọn
  const displayGradeName = useMemo(() => {
    if (selectedGradeName) return selectedGradeName;
    const found = gradeOptions.find((g) => g.id === currentGroupId);
    return found?.name || "";
  }, [selectedGradeName, gradeOptions, currentGroupId]);

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

  // Đổi tuần giữ nguyên nhóm đang chọn. Page cha chịu trách nhiệm gọi API.
  const handlePrevWeek = () => {
    if (!canGoPrev || !onWeekChange) return;
    const prevWeek = availableWeeks[currentWeekIndex - 1];
    onWeekChange(prevWeek.weekStartDate, currentGroupId);
  };

  const handleNextWeek = () => {
    if (!canGoNext || !onWeekChange) return;
    const nextWeek = availableWeeks[currentWeekIndex + 1];
    onWeekChange(nextWeek.weekStartDate, currentGroupId);
  };

  const handleSelectWeek = (e) => {
    const targetDate = e.target.value;
    if (onWeekChange && targetDate && targetDate !== currentWeekDate) {
      onWeekChange(targetDate, currentGroupId);
    }
  };

  // Đổi nhóm giữ nguyên tuần đang xem.
  const handleSelectGroup = (groupId) => {
    setActiveGroupId(groupId);
    if (onGroupChange) {
      onGroupChange(groupId, currentWeekDate);
    }
  };

  const days = weeklyMenu?.days || [];
  const hasDays = days.length > 0;

  // Nhãn Tuần này dựa trên ngày hiện tại, độc lập với tuần đang xem.
  const todayIso = vietnamTodayISO();

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

          {/* Tách riêng Dropdown chọn Khối */}
          <div className={styles.rightActions}>
            <div className={styles.gradeDropdownWrapper}>
              <FormControl size="small" className={styles.gradeFormControl}>
                <Select
                  id="gradeSelect"
                  value={gradeOptions.some((g) => g.id === currentGroupId) ? currentGroupId : ""}
                  onChange={(e) => handleSelectGroup(e.target.value)}
                  displayEmpty
                  disabled={gradeOptions.length === 0}
                  renderValue={() => displayGradeName || "Chưa có khối"}
                  className={styles.gradeMuiSelect}
                  startAdornment={
                    <InputAdornment position="start" className={styles.calendarAdornment}>
                      <Layers size={16} />
                    </InputAdornment>
                  }
                  MenuProps={{
                    PaperProps: {
                      className: styles.weekDropdownPaper,
                    },
                  }}
                >
                  {gradeOptions.map((opt) => (
                    <MenuItem key={opt.id} value={opt.id} className={styles.weekMenuItem}>
                      <span className={styles.weekItemTitle}>{opt.name}</span>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
        </div>

        {/* Nội dung: Hiển thị Empty State Banner trong container hoặc Lưới 5 ngày */}
        {menuError ? (
          <div className={styles.emptyContainer}>
            <div className={styles.emptyIconBox}>
              <CalendarX size={32} />
            </div>
            <h3 className={styles.emptyTitle}>
              Không tải được thực đơn tuần
              {displayGradeName
                ? ` (${displayGradeName})`
                : ""}
            </h3>
            <p className={styles.emptyDescription}>
              Đã xảy ra lỗi khi tải thực đơn. Vui lòng thử lại sau hoặc chọn tuần,
              khối khác.
            </p>
          </div>
        ) : !hasDays ? (
          <div className={styles.emptyContainer}>
            <div className={styles.emptyIconBox}>
              <CalendarX size={32} />
            </div>
            <h3 className={styles.emptyTitle}>
              Chưa có thực đơn bán trú cho tuần này
              {displayGradeName
                ? ` (${displayGradeName})`
                : ""}
            </h3>
            <p className={styles.emptyDescription}>
              Nhà trường hiện chưa công bố thực đơn tuần được phê duyệt cho khoảng
              thời gian này
              {displayGradeName
                ? ` áp dụng cho ${displayGradeName}`
                : ""}
              . Phụ huynh có thể chọn các tuần hoặc khối khác trong danh sách thả xuống
              ở trên hoặc liên hệ bộ phận bán trú của nhà trường.
            </p>
          </div>
        ) : (
          <div className={styles.daysGrid}>
            {days.map((day, idx) => (
              <WeeklyDayCard
                key={day.date || day.id || idx}
                day={day}
                schoolCode={schoolCode}
                activeGroupId={currentGroupId}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

WeeklyMenuSection.propTypes = {
  schoolCode: PropTypes.string,
  schoolGrades: PropTypes.array,
  selectedGradeId: PropTypes.string,
  selectedGradeName: PropTypes.string,
  menuError: PropTypes.bool,
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
  onGroupChange: PropTypes.func,
};

export default WeeklyMenuSection;
