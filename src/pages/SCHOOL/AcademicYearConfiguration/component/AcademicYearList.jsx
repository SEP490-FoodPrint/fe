import React from "react"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined"
import { Button, Skeleton } from "@mui/material"
import PropTypes from "prop-types"
import styles from "./AcademicYearList.module.scss"

const formatDate = value => value ? value.split("-").reverse().join("/") : "—"

function AcademicYearList({ years, selectedId, loading, onSelect, onCreate }) {
  return <aside className={styles.panel} aria-label="Danh sách niên khóa">
    <div className={styles.heading}>
      <div><h2>Niên khóa</h2><p>{years.length} cấu hình đã lưu</p></div>
      <Button variant="contained" size="small" startIcon={<AddRoundedIcon />} onClick={onCreate}>Thêm</Button>
    </div>
    <div className={styles.list}>
      {loading && Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} variant="rounded" height={76} />)}
      {!loading && years.map(year => <button type="button" key={year.id}
        className={`${styles.item} ${selectedId === year.id ? styles.active : ""}`}
        onClick={() => onSelect(year.id)} aria-current={selectedId === year.id ? "true" : undefined}>
        <span className={styles.icon}><CalendarMonthOutlinedIcon fontSize="small" /></span>
        <span><strong>{year.academicYear}</strong><small>{formatDate(year.startDate)} – {formatDate(year.endDate)}</small></span>
      </button>)}
      {!loading && !years.length && <div className={styles.empty}>
        <CalendarMonthOutlinedIcon /><strong>Chưa có niên khóa</strong>
        <p>Thêm cấu hình đầu tiên để thiết lập lịch dùng chung cho trường.</p>
      </div>}
    </div>
  </aside>
}

AcademicYearList.propTypes = {
  years: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedId: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
}
export default AcademicYearList
