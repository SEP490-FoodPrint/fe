import React, { useState } from "react"
import { TablePagination } from "@mui/material"
import { ChevronRight } from "lucide-react"
import FoodPrintLoading from "src/components/FoodPrintLoading"
import { formatDateVN } from "src/services/MenuService/adapter"
import { statusTone, weekMenuSummary } from "src/services/MenuService/academicWeekView"
import styles from "./MenuYearWeeksTable.module.scss"

export default function MenuYearWeeksTable({
  academicYears = [], academicYear = "", onYearChange, onSelectWeek,
  loading = false, error = "", onRetry, action,
}) {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const year = academicYears.find((item) => item.academicYear === academicYear)
  const weeks = year?.weeks || []
  const activePage = Math.min(page, Math.max(0, Math.ceil(weeks.length / rowsPerPage) - 1))
  const rows = weeks.slice(activePage * rowsPerPage, (activePage + 1) * rowsPerPage)

  return (
    <section className={styles.section} aria-label="Danh sách tuần theo năm học">
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Danh sách thực đơn</h1>
          <p className={styles.subtitle}>Chọn một tuần để xem thực đơn.</p>
        </div>
        {action}
      </div>
      <div className={styles.toolbar}>
        <label className={styles.yearField}>
          <span>Năm học</span>
          <select aria-label="Năm học của danh sách tuần" value={academicYear} disabled={loading || !academicYears.length} onChange={(event) => { setPage(0); onYearChange(event.target.value) }}>
            {!academicYears.length && <option value="">Chưa có năm học</option>}
            {academicYears.map((item) => <option key={item.id || item.academicYear} value={item.academicYear}>{item.academicYear}</option>)}
          </select>
        </label>
        {!loading && year && <span className={styles.count}>{weeks.length} tuần học</span>}
        {year && <div className={styles.statusLegend} aria-label="Chú giải trạng thái">
          <span><i className={styles.dotDraft} />Bản nháp</span><span><i className={styles.dotPending} />Chờ duyệt</span><span><i className={styles.dotApproved} />Đã duyệt</span><span><i className={styles.dotRevision} />Cần chỉnh sửa</span>
        </div>}
      </div>
      {loading ? (
        <div className={styles.notice} role="status"><FoodPrintLoading /></div>
      ) : error ? (
        <div className={styles.error} role="alert"><p>{error}</p><button type="button" className={styles.textButton} onClick={onRetry}>Thử lại</button></div>
      ) : !weeks.length ? (
        <p className={styles.notice} role="status">{year ? "Năm học này chưa có tuần học được cấu hình." : "Trường chưa có cấu hình năm học. Vui lòng liên hệ Ban Giám Hiệu."}</p>
      ) : (
        <div className={styles.card}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className={styles.srOnly}>Danh sách tuần năm học {academicYear}</caption>
              <thead><tr><th scope="col">Tuần học</th><th scope="col">Thời gian</th><th scope="col">Trạng thái</th><th scope="col">Món ăn</th><th scope="col"><span className={styles.srOnly}>Thao tác</span></th></tr></thead>
              <tbody>
                {rows.map((week) => {
                  const summary = weekMenuSummary(weekMenus[week.weekStartDate] || [])
                  const tone = statusTone(summary.status)
                  return (
                    <tr
                      key={week.weekStartDate}
                      className={week.isCurrentWeek ? styles.currentRow : undefined}
                      onClick={() => onSelectWeek(week)}
                    >
                      <th scope="row">
                        <span>{week.weekLabel || `Tuần ${week.weekNumber}`}</span>
                        {week.isCurrentWeek && <span className={styles.currentLabel}>Tuần hiện tại</span>}
                      </th>
                      <td>
                        <span className={styles.date}>{formatDateVN(week.weekStartDate)}</span>
                        <span className={styles.dateDivider}> – </span>
                        <span className={styles.date}>{formatDateVN(week.weekEndDate)}</span>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[tone]}`}>{summary.label}</span>
                      </td>
                      <td>
                        <span className={styles.dishCount}>{summary.dishCount.toLocaleString("vi-VN")}</span>
                      </td>
                      <td className={styles.actionCell}>
                        <button
                          type="button"
                          className={styles.textButton}
                          aria-label={`Xem thực đơn ${week.weekLabel || `Tuần ${week.weekNumber}`}`}
                        >
                          <span className={styles.actionText}>Xem thực đơn</span>
                          <ChevronRight size={16} aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <TablePagination component="div" count={weeks.length} page={activePage} rowsPerPage={rowsPerPage} rowsPerPageOptions={[10, 20, 50]} onPageChange={(_, next) => setPage(next)} onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0) }} labelRowsPerPage="Số dòng:" labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count} tuần`} getItemAriaLabel={(type) => ({ first: "Trang đầu", last: "Trang cuối", previous: "Trang trước", next: "Trang sau" })[type]} />
        </div>
      )}
    </section>
  )
}
