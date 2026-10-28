import React, { useState } from "react"
import PropTypes from "prop-types"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
} from "lucide-react"
import notice from "src/components/Notice"
import WeeklyDayCard from "./WeeklyDayCard"
import styles from "./WeeklyMenuSection.module.scss"

function WeeklyMenuSection({ weeklyMenu }) {
  const [selectedGrade, setSelectedGrade] = useState("GRADE_1_2")
  const [weekOffset, setWeekOffset] = useState(0)

  if (!weeklyMenu) return null

  const handleDownloadPdf = () => {
    notice({
      msg: "Đang tạo và tải xuống bản in Thực đơn tuần PDF...",
      isSuccess: true,
    })
  }

  const handlePrevWeek = () => {
    setWeekOffset(prev => prev - 1)
    notice({
      msg: "Đang xem dữ liệu tuần trước",
      isSuccess: true,
    })
  }

  const handleNextWeek = () => {
    setWeekOffset(prev => prev + 1)
    notice({
      msg: "Đang xem dữ liệu tuần tiếp theo",
      isSuccess: true,
    })
  }

  const displayWeekNumber = (weeklyMenu.week_number || 42) + weekOffset

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
                Tuần {displayWeekNumber}: {weeklyMenu.week_range || "19/10/2026 – 23/10/2026"}{" "}
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

          {/* Grade Selector & Download */}
          <div className={styles.rightActions}>
            {/* Grade Switcher */}
            <div className={styles.gradeTabs}>
              <button
                type="button"
                className={`${styles.gradeTab} ${
                  selectedGrade === "GRADE_1_2" ? styles.activeGrade : ""
                }`}
                onClick={() => setSelectedGrade("GRADE_1_2")}
              >
                Khối 1 – 2
              </button>
              <button
                type="button"
                className={`${styles.gradeTab} ${
                  selectedGrade === "GRADE_3_5" ? styles.activeGrade : ""
                }`}
                onClick={() => setSelectedGrade("GRADE_3_5")}
              >
                Khối 3 – 5
              </button>
            </div>

            <div className={styles.separator} />

            {/* PDF Download */}
            <button
              type="button"
              className={styles.downloadBtn}
              onClick={handleDownloadPdf}
            >
              <Download size={16} className={styles.downloadIcon} />
              <span>Tải thực đơn PDF</span>
            </button>
          </div>
        </div>

        {/* 5 Days Grid */}
        <div className={styles.daysGrid}>
          {weeklyMenu.days?.map((day, idx) => (
            <WeeklyDayCard key={day.date || idx} day={day} />
          ))}
        </div>
      </div>
    </section>
  )
}

WeeklyMenuSection.propTypes = {
  weeklyMenu: PropTypes.shape({
    week_number: PropTypes.number,
    week_range: PropTypes.string,
    days: PropTypes.array,
  }),
}

export default WeeklyMenuSection
