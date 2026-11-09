import React from "react";
import PropTypes from "prop-types";
import {
  Calendar,
  CalendarDays,
  Layers,
} from "lucide-react";
import {
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
  Typography,
} from "@mui/material";
import styles from "./MealDetailFilterBar.module.scss";

function MealDetailFilterBar({
  availableWeeks,
  selectedWeekStartDate,
  onSelectWeek,
  daysInWeek,
  selectedDate,
  onSelectDate,
  gradeBlocks,
  selectedBlockId,
  onSelectBlock,
}) {
  // Page quản lý lựa chọn. Thanh lọc chỉ gửi giá trị từ từng dropdown qua callback.
  const hasBlocks = Array.isArray(gradeBlocks) && gradeBlocks.length > 0;

  return (
    <section className={styles.filterSection}>
      <div className={styles.filterContainer}>
        {/* Nhãn thanh công cụ */}
        <div className={styles.filterTitleArea}>
          <Typography variant="subtitle2" className={styles.filterLabel}>
            Bộ lọc thực đơn học đường:
          </Typography>
        </div>

        {/* Cụm 3 Dropdowns: Tuần học, Ngày trong tuần, Khối */}
        <div className={styles.dropdownsGroup}>
          {/* Dropdown 1: Chọn Tuần */}
          <div className={styles.filterItem}>
            <span className={styles.itemLabel}>Tuần học</span>
            <FormControl size="small" className={styles.formControl}>
              <Select
                id="week-select"
                value={selectedWeekStartDate || ""}
                onChange={(e) => onSelectWeek && onSelectWeek(e.target.value)}
                displayEmpty
                className={styles.muiSelect}
                startAdornment={
                  <InputAdornment position="start" className={styles.adornment}>
                    <Calendar size={16} />
                  </InputAdornment>
                }
                MenuProps={{
                  PaperProps: { className: styles.dropdownPaper },
                }}
              >
                {availableWeeks.length === 0 ? (
                  <MenuItem value="" disabled className={styles.emptyItem}>
                    Chưa có tuần thực đơn
                  </MenuItem>
                ) : (
                  availableWeeks.map((w) => (
                    <MenuItem
                      key={w.id || w.weekStartDate}
                      value={w.weekStartDate}
                      className={styles.menuItem}
                    >
                      <span className={styles.weekTitle}>
                        {w.title || `Tuần ${w.weekNumber}`}
                      </span>
                      <span className={styles.weekRange}>({w.weekRange})</span>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </div>

          {/* Dropdown 2: Chọn Ngày trong tuần */}
          <div className={styles.filterItem}>
            <span className={styles.itemLabel}>Ngày trong tuần</span>
            <FormControl size="small" className={styles.formControl}>
              <Select
                id="day-select"
                value={selectedDate || ""}
                onChange={(e) => onSelectDate && onSelectDate(e.target.value)}
                displayEmpty
                className={styles.muiSelect}
                startAdornment={
                  <InputAdornment position="start" className={styles.adornment}>
                    <CalendarDays size={16} />
                  </InputAdornment>
                }
                MenuProps={{
                  PaperProps: { className: styles.dropdownPaper },
                }}
              >
                {daysInWeek.length === 0 ? (
                  <MenuItem value="" disabled className={styles.emptyItem}>
                    Không có ngày trong tuần
                  </MenuItem>
                ) : (
                  daysInWeek.map((day) => (
                    <MenuItem
                      key={day.date}
                      value={day.date}
                      className={styles.menuItem}
                    >
                      <span className={styles.dayText}>
                        {day.dayOfWeek}, {day.dayOfMonth}
                      </span>
                      <span
                        className={`${styles.dayBadge} ${
                          day.hasMenu ? styles.dayBadgeAvailable : styles.dayBadgeOff
                        }`}
                      >
                        {day.hasMenu ? "Có thực đơn" : "Nghỉ bán trú"}
                      </span>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </div>

          {/* Chọn khối từ danh sách do page cung cấp */}
          <div className={styles.filterItem}>
            <span className={styles.itemLabel}>Khối</span>
            <FormControl size="small" className={styles.formControl}>
              <Select
                id="block-select"
                value={hasBlocks ? selectedBlockId || "" : ""}
                onChange={(e) => onSelectBlock && onSelectBlock(e.target.value)}
                displayEmpty
                disabled={!hasBlocks}
                className={styles.muiSelect}
                startAdornment={
                  <InputAdornment position="start" className={styles.adornment}>
                    <Layers size={16} />
                  </InputAdornment>
                }
                MenuProps={{
                  PaperProps: { className: styles.dropdownPaper },
                }}
              >
                {!hasBlocks ? (
                  <MenuItem value="" disabled className={styles.emptyItem}>
                    Không có khối nào
                  </MenuItem>
                ) : (
                  gradeBlocks.map((b) => (
                    <MenuItem key={b.id} value={b.id} className={styles.menuItem}>
                      <span className={styles.blockTitle}>{b.name}</span>
                      {b.description && (
                        <span className={styles.blockDesc}>({b.description})</span>
                      )}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </div>
        </div>
      </div>
    </section>
  );
}

MealDetailFilterBar.propTypes = {
  availableWeeks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      weekStartDate: PropTypes.string.isRequired,
      weekRange: PropTypes.string,
      title: PropTypes.string,
      weekNumber: PropTypes.number,
    }),
  ),
  selectedWeekStartDate: PropTypes.string,
  onSelectWeek: PropTypes.func.isRequired,
  daysInWeek: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      dayOfWeek: PropTypes.string.isRequired,
      dayOfMonth: PropTypes.string.isRequired,
      hasMenu: PropTypes.bool,
      isWeekend: PropTypes.bool,
    }),
  ),
  selectedDate: PropTypes.string,
  onSelectDate: PropTypes.func.isRequired,
  gradeBlocks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      isDefault: PropTypes.bool,
    }),
  ),
  selectedBlockId: PropTypes.string,
  onSelectBlock: PropTypes.func.isRequired,
};

MealDetailFilterBar.defaultProps = {
  availableWeeks: [],
  selectedWeekStartDate: "",
  daysInWeek: [],
  selectedDate: "",
  gradeBlocks: [],
  selectedBlockId: "BLOCK_1_3",
};

export default MealDetailFilterBar;
