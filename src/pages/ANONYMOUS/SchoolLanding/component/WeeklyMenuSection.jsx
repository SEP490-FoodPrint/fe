import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import {
  CalendarX,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Users,
} from "lucide-react"
import notice from "src/components/Notice"
import WeeklyDayCard from "./WeeklyDayCard"
import styles from "./WeeklyMenuSection.module.scss"

function WeeklyMenuSection({ weeklyMenu, onWeekChange, onGroupChange }) {
  const [weekOffset, setWeekOffset] = useState(0)

  const groups =
    weeklyMenu?.portionGroups ||
    weeklyMenu?.gradeGroups ||
    weeklyMenu?.grade_groups ||
    []

  const defaultGroupId =
    groups.find(g => g.isDefault)?.id ||
    groups.find(g => g.isDefault)?.key ||
    groups[0]?.id ||
    groups[0]?.key ||
    "all"

  const [activeGroupId, setActiveGroupId] = useState(defaultGroupId)

  useEffect(() => {
    if (groups.length > 0) {
      const exists = groups.some(g => (g.id || g.key) === activeGroupId)
      if (!exists) {
        setActiveGroupId(defaultGroupId)
      }
    }
  }, [groups, defaultGroupId, activeGroupId])

  const handleDownloadPdf = () => {
    notice({
      msg: "Đang tạo và tải xuống bản in Thực đơn tuần PDF...",
      isSuccess: true,
    })
  }

  const handlePrevWeek = () => {
    const nextOffset = weekOffset - 1
    setWeekOffset(nextOffset)
    if (onWeekChange) {
      onWeekChange(nextOffset, activeGroupId)
    } else {
      notice({
        msg: "Đang xem dữ liệu tuần trước",
        isSuccess: true,
      })
    }
  }

  const handleNextWeek = () => {
    const nextOffset = weekOffset + 1
    setWeekOffset(nextOffset)
    if (onWeekChange) {
      onWeekChange(nextOffset, activeGroupId)
    } else {
      notice({
        msg: "Đang xem dữ liệu tuần tiếp theo",
        isSuccess: true,
      })
    }
  }

  const handleSelectGroup = groupId => {
    setActiveGroupId(groupId)
    if (onGroupChange) {
      onGroupChange(groupId, weekOffset)
    }
  }

  const weekNumber =
    (weeklyMenu?.weekNumber || weeklyMenu?.week_number || 44) + weekOffset
  const weekRange =
    weeklyMenu?.weekRange ||
    weeklyMenu?.week_range ||
    "Chưa cập nhật ngày"

  const days = weeklyMenu?.days || []
  const hasDays = days.length > 0

  return (
    <section id="thuc-don-tuan" className={styles.section}>
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Thực đơn bán trú theo tuần</h2>
          <p className={styles.subtitle}>
            Tra cứu thực đơn đầy đủ từ Thứ 2 đến Thứ 6 được nhà trường công khai
            và phê duyệt bởi Chuyên viên Dinh dưỡng.
          </p>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          {/* Week Switcher */}
          <div className={styles.weekSwitcher}>
            <button
              type="button"
              className={styles.weekBtn}
              onClick={handlePrevWeek}
              title="Tuần trước"
            >
              <ChevronLeft size={18} />
            </button>

            <div className={styles.weekInfo}>
              <FileText size={16} className={styles.calendarIcon} />
              <span>
                Tuần {weekNumber}: {weekRange}{" "}
                {weekOffset === 0 ? "(Tuần hiện tại)" : ""}
              </span>
            </div>

            <button
              type="button"
              className={styles.weekBtn}
              onClick={handleNextWeek}
              title="Tuần kế tiếp"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Dynamic Portion/Grade Groups & Download */}
          <div className={styles.rightActions}>
            {groups.length > 1 ? (
              <div className={styles.gradeTabs}>
                {groups.map(group => {
                  const gId = group.id || group.key
                  const gName = group.name || group.label
                  const isActive = activeGroupId === gId
                  return (
                    <button
                      key={gId}
                      type="button"
                      className={`${styles.gradeTab} ${
                        isActive ? styles.activeGrade : ""
                      }`}
                      onClick={() => handleSelectGroup(gId)}
                    >
                      {gName}
                    </button>
                  )
                })}
              </div>
            ) : groups.length === 1 ? (
              <div className={styles.singleGroupBadge}>
                <Users size={14} />
                <span>Khẩu phần: {groups[0].name || groups[0].label || "Toàn trường"}</span>
              </div>
            ) : null}

            <div className={styles.separator} />
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
              thời gian này. Phụ huynh có thể bấm nút chuyển tuần để tra cứu các
              tuần khác hoặc liên hệ bộ phận bán trú của nhà trường.
            </p>
          </div>
        ) : (
          <div className={styles.daysGrid}>
            {days.map((day, idx) => (
              <WeeklyDayCard key={day.date || day.id || idx} day={day} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

WeeklyMenuSection.propTypes = {
  weeklyMenu: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    weekNumber: PropTypes.number,
    week_number: PropTypes.number,
    weekRange: PropTypes.string,
    week_range: PropTypes.string,
    portionGroups: PropTypes.array,
    gradeGroups: PropTypes.array,
    grade_groups: PropTypes.array,
    days: PropTypes.array,
  }),
  onWeekChange: PropTypes.func,
  onGroupChange: PropTypes.func,
}

export default WeeklyMenuSection
