import InlineError from "src/components/InlineError"
import React, { useMemo, useState } from "react"
import { Eye, RotateCcw } from "lucide-react"
import FoodPrintLoading from "src/components/FoodPrintLoading"
import { formatDateVN } from "src/services/MenuService/adapter"
import { sortWeeksCurrentFirst, statusTone, visibleAcademicWeeks, weekMenuGroups, weekSchoolDates } from "src/services/MenuService/academicWeekView"
import MenuListStatsRail from "./MenuListStatsRail"
import styles from "./MenuYearWeeksTable.module.scss"

export default function MenuYearWeeksTable({
  academicYears = [],
  academicYear = "",
  onYearChange,
  onSelectWeek,
  loading = false,
  error = "",
  onRetry,
  action,
  weekMenus = {},
}) {
  const year = academicYears.find((item) => item.academicYear === academicYear)
  const [weekFilter, setWeekFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showAll, setShowAll] = useState(false)
  // Toàn bộ tuần của năm học do BE cấp (từ ngày bắt đầu đến kết thúc), lớn đến bé.
  const availableWeeks = useMemo(() => [...(year?.weeks || [])].sort((a, b) => String(b.weekStartDate).localeCompare(String(a.weekStartDate))), [year])
  // Mặc định chỉ đến tuần hiện tại (tuần hiện tại trên đầu); bấm "Hiển thị N tuần" để xem đủ.
  const pastWeeks = useMemo(() => sortWeeksCurrentFirst(visibleAcademicWeeks(year)), [year])
  const listWeeks = showAll ? availableWeeks : pastWeeks
  const weekRows = useMemo(() => (weekFilter ? availableWeeks : listWeeks)
    .filter((week) => !weekFilter || week.weekStartDate === weekFilter)
    .map((week) => {
      const schoolDates = weekSchoolDates(week, year?.holidays)
      const allGroups = weekMenuGroups(weekMenus[week.weekStartDate] || [], schoolDates)
      const groups = !statusFilter ? allGroups
        : statusFilter === "EMPTY" ? (allGroups.length ? [] : allGroups)
          : allGroups.filter((group) => group.status === statusFilter)
      return { week, schoolDates, groups, hidden: statusFilter && !(statusFilter === "EMPTY" ? !allGroups.length : groups.length) }
    })
    .filter((row) => !row.hidden), [availableWeeks, listWeeks, weekFilter, statusFilter, weekMenus, year])
  const weeks = weekRows
  // Thống kê số thực đơn tuần (mỗi nhóm khối một thực đơn) trong cả năm học đang chọn.
  const stats = useMemo(() => {
    const groups = availableWeeks.flatMap((week) => weekMenuGroups(weekMenus[week.weekStartDate] || [], weekSchoolDates(week, year?.holidays)))
    const count = (status) => groups.filter((group) => group.status === status).length
    return { total: groups.length, draft: count("DRAFT"), pendingApproval: count("PENDING_APPROVAL"), approved: count("APPROVED"), revisionRequested: count("REVISION_REQUESTED") }
  }, [availableWeeks, weekMenus, year])
  const changeYear = (value) => { setWeekFilter(""); onYearChange(value) }

  return (
    <section className={styles.section} aria-label="Danh sách tuần theo năm học">
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Danh sách thực đơn</h1>
          <p className={styles.subtitle}>Chọn một tuần để xem thực đơn.</p>
        </div>
        {action}
      </div>
      {!loading && !error && year && (
        <MenuListStatsRail stats={stats} readOnly />
      )}
      <div className={styles.toolbar}>
        <label className={styles.yearField}>
          <span>Năm học</span>
          <select aria-label="Năm học của danh sách tuần" value={academicYear} disabled={loading || !academicYears.length} onChange={(event) => changeYear(event.target.value)}>
            {!academicYears.length && <option value="">Chưa có năm học</option>}
            {academicYears.map((item) => <option key={item.id || item.academicYear} value={item.academicYear}>{item.academicYear}</option>)}
          </select>
        </label>
        <label className={styles.yearField}>
          <span>Tuần</span>
          <select aria-label="Lọc theo tuần" value={weekFilter} disabled={loading || !availableWeeks.length} onChange={(event) => setWeekFilter(event.target.value)}>
            <option value="">Tất cả tuần</option>
            {availableWeeks.map((week) => <option key={week.weekStartDate} value={week.weekStartDate}>{week.weekLabel || `Tuần ${week.weekNumber}`}{week.isCurrentWeek ? " (hiện tại)" : ""}</option>)}
          </select>
        </label>
        <label className={styles.yearField}>
          <span>Trạng thái</span>
          <select aria-label="Lọc theo trạng thái" value={statusFilter} disabled={loading || !availableWeeks.length} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="DRAFT">Bản nháp</option>
            <option value="PENDING_APPROVAL">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REVISION_REQUESTED">Cần chỉnh sửa</option>
            <option value="INCOMPLETE">Chưa đủ thực đơn</option>
            <option value="EMPTY">Chưa tạo</option>
          </select>
        </label>
        <button type="button" className={styles.iconButton} title="Xóa lọc" aria-label="Xóa lọc" disabled={!weekFilter && !statusFilter} onClick={() => { setWeekFilter(""); setStatusFilter("") }}><RotateCcw size={18} aria-hidden="true" /></button>
      </div>
      {loading ? (
        <div className={styles.notice} role="status"><FoodPrintLoading /></div>
      ) : error ? (
        <InlineError messages={error} onRetry={onRetry} />
      ) : !weeks.length ? (
        <p className={styles.notice} role="status">{year ? (availableWeeks.length ? "Không có tuần nào phù hợp bộ lọc." : "Năm học này chưa có tuần học được cấu hình.") : "Trường chưa có cấu hình năm học. Vui lòng liên hệ Ban Giám Hiệu."}</p>
      ) : (
        <div className={styles.card}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className={styles.srOnly}>Danh sách tuần năm học {academicYear}</caption>
              <thead><tr><th scope="col">Tuần học</th><th scope="col">Thời gian</th><th scope="col">Khối</th><th scope="col">Trạng thái</th><th scope="col" className={styles.num}>Số ngày có thực đơn</th><th scope="col" className={styles.num}>Số món ăn</th><th scope="col" className={styles.actionCell}><span className={styles.srOnly}>Thao tác</span></th></tr></thead>
              {weeks.map(({ week, schoolDates, groups }) => {
                const rows = groups.length ? groups : [null]
                const label = week.weekLabel || `Tuần ${week.weekNumber}`
                return (
                  <tbody key={week.weekStartDate} className={week.isCurrentWeek ? styles.currentWeek : undefined} onClick={() => onSelectWeek(week)}>
                    {rows.map((group, index) => (
                      <tr key={group?.id || "empty"}>
                        {index === 0 && (
                          <th scope="row" rowSpan={rows.length} className={styles.weekCell}>
                            <span className={styles.weekName}>{label}</span>
                            {week.isCurrentWeek && <span className={styles.currentLabel}>Hiện tại</span>}
                            {schoolDates.length < 5 && <span className={styles.holidayNote}>{5 - schoolDates.length} ngày nghỉ</span>}
                          </th>
                        )}
                        {index === 0 && (
                          <td rowSpan={rows.length} className={styles.timeCell}>
                            <span className={styles.date}>{formatDateVN(week.weekStartDate)}</span>
                            <span className={styles.dateDivider}> – </span>
                            <span className={styles.date}>{formatDateVN(week.weekEndDate)}</span>
                          </td>
                        )}
                        <td>{group ? <span className={styles.scope}>{group.scope || "Chưa gán khối"}</span> : <span className={styles.muted}>—</span>}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${styles[statusTone(group?.status || "EMPTY")]}`}>{group?.label || "Chưa tạo"}</span>
                          {group?.status === "REVISION_REQUESTED" && (
                            <button type="button" className={styles.textButton} onClick={(event) => { event.stopPropagation(); onSelectWeek(week) }} aria-label={`Xem lý do yêu cầu chỉnh sửa ${label}, ${group.scope || "toàn trường"}`}>
                              Xem lý do
                            </button>
                          )}
                        </td>
                        <td className={styles.num}>{group ? `${group.plannedDays}/${group.schoolDays} ngày` : <span className={styles.muted}>—</span>}</td>
                        <td className={styles.num}>{group ? group.dishCount.toLocaleString("vi-VN") : <span className={styles.muted}>—</span>}</td>
                        {index === 0 && (
                          <td rowSpan={rows.length} className={styles.actionCell}>
                            <button type="button" className={styles.iconButton} title="Xem thực đơn" aria-label={`Xem thực đơn ${label}`}>
                              <Eye size={18} aria-hidden="true" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                )
              })}
            </table>
          </div>
          {!weekFilter && !statusFilter && availableWeeks.length > pastWeeks.length && (
            <div className={styles.moreRow}>
              <button type="button" className={styles.moreButton} onClick={() => setShowAll((value) => !value)}>
                {showAll ? "Chỉ hiển thị đến tuần hiện tại" : `Hiển thị ${availableWeeks.length.toLocaleString("vi-VN")} tuần`}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
