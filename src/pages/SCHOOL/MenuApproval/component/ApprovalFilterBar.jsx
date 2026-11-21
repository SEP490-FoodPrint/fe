import React from "react"
import PropTypes from "prop-types"
import { FormControl, IconButton, MenuItem, Select, Tooltip } from "@mui/material"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { weekLabel } from "src/utils/approvalWeek"
import styles from "./ApprovalFilterBar.module.scss"

// Nhãn số thực đơn còn chờ duyệt của một tuần
function WeekBadge({ week }) {
  const done = week.pending === 0
  return (
    <span className={`${styles.badge} ${done ? styles.badgeDone : styles.badgePending}`}>
      {done ? "Đã xử lý" : `${week.pending}/${week.total} chờ duyệt`}
    </span>
  )
}

WeekBadge.propTypes = { week: PropTypes.object.isRequired }

// Bộ lọc cấp trang: tuần điều khiển danh sách thực đơn, khối chỉ lọc hiển thị
function ApprovalFilterBar({
  weeks,
  selectedWeek,
  onWeekChange,
  gradeOptions,
  gradeFilter,
  onGradeChange,
  shownCount,
  totalCount,
  disabled,
}) {
  // weeks xếp từ mới nhất đến cũ nhất: tuần trước nằm ở index sau
  const currentIndex = weeks.findIndex(week => week.weekStartDate === selectedWeek)
  const prevWeek = currentIndex >= 0 ? weeks[currentIndex + 1] : null
  const nextWeek = currentIndex > 0 ? weeks[currentIndex - 1] : null

  return (
    <section className={styles.bar} aria-label="Bộ lọc thực đơn">
      <div className={styles.filters}>
        <div className={styles.weekNavigator}>
          <Tooltip title={prevWeek ? `Tuần trước: ${weekLabel(prevWeek)}` : ""}>
            <span>
              <IconButton
                size="small"
                disabled={disabled || !prevWeek}
                onClick={() => prevWeek && onWeekChange(prevWeek.weekStartDate)}
                aria-label="Tuần trước"
              >
                <ChevronLeft size={18} />
              </IconButton>
            </span>
          </Tooltip>

          <FormControl size="small" className={styles.weekControl}>
            <Select
              value={currentIndex >= 0 ? selectedWeek : ""}
              onChange={event => onWeekChange(event.target.value)}
              disabled={disabled}
              displayEmpty
              inputProps={{ "aria-label": "Chọn tuần" }}
              renderValue={value => {
                const week = weeks.find(item => item.weekStartDate === value)
                return (
                  <span className={styles.option}>
                    <Calendar size={16} className={styles.calendarIcon} />
                    <span className={styles.optionText}>
                      {week ? weekLabel(week) : "Chọn tuần"}
                    </span>
                    {week && <WeekBadge week={week} />}
                  </span>
                )
              }}
            >
              {weeks.map(week => (
                <MenuItem key={week.weekStartDate} value={week.weekStartDate}>
                  <span className={styles.option}>
                    <span className={styles.optionText}>{weekLabel(week)}</span>
                    <WeekBadge week={week} />
                  </span>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Tooltip title={nextWeek ? `Tuần kế tiếp: ${weekLabel(nextWeek)}` : ""}>
            <span>
              <IconButton
                size="small"
                disabled={disabled || !nextWeek}
                onClick={() => nextWeek && onWeekChange(nextWeek.weekStartDate)}
                aria-label="Tuần kế tiếp"
              >
                <ChevronRight size={18} />
              </IconButton>
            </span>
          </Tooltip>
        </div>

        <FormControl size="small" className={styles.gradeControl}>
          <Select
            value={gradeFilter}
            onChange={event => onGradeChange(event.target.value)}
            disabled={disabled}
            displayEmpty
            inputProps={{ "aria-label": "Lọc theo khối lớp" }}
          >
            <MenuItem value="">Tất cả khối</MenuItem>
            {gradeOptions.map(option => (
              <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <span className={styles.count}>
        Đang hiển thị <strong>{shownCount}</strong>/{totalCount} thực đơn
      </span>
    </section>
  )
}

ApprovalFilterBar.propTypes = {
  weeks: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedWeek: PropTypes.string,
  onWeekChange: PropTypes.func.isRequired,
  gradeOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
  gradeFilter: PropTypes.string.isRequired,
  onGradeChange: PropTypes.func.isRequired,
  shownCount: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
}

export default ApprovalFilterBar
