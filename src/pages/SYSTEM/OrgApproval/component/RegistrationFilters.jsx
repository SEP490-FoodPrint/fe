import React, { useRef } from "react"
import { Button, InputAdornment, MenuItem, TextField } from "@mui/material"
import { REQUEST_STATUSES, REQUEST_TYPES } from "src/lib/registration"
import SearchIcon from "@mui/icons-material/Search"
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import styles from "./RegistrationFilters.module.scss"

function DateFilter({ id, label, value, onChange, min, max, error }) {
  const input = useRef(null)
  const openPicker = () => {
    input.current?.focus()
    try { input.current?.showPicker?.() } catch { /* Native keyboard date input remains available. */ }
  }
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <div className={`${styles.date} ${value ? styles.hasValue : ""}`}>
        {!value && <span className={styles.datePlaceholder} aria-hidden="true">Chọn ngày</span>}
        <TextField id={id} type="date" value={value} onChange={event => onChange(event.target.value)} inputRef={input} size="small" fullWidth error={error}
          slotProps={{ htmlInput: { min, max, "aria-label": label, "aria-describedby": error ? "registration-date-error" : undefined }, input: {
            endAdornment: <InputAdornment position="end"><button type="button" onClick={openPicker} className={styles.calendarButton} aria-label={`Chọn ${label.toLowerCase()}`}><CalendarTodayOutlinedIcon className={styles.calendarIcon} /></button></InputAdornment>,
          } }} />
      </div>
    </div>
  )
}

export default function RegistrationFilters({ filters, onChange, onReset, hasFilters }) {
  const invalidDates = Boolean(filters.from && filters.to && filters.from > filters.to)
  return (
    <div className={styles.wrapper}>
      <div className={styles.filters}>
        <div className={`${styles.field} ${styles.search}`}>
          <label htmlFor="registration-search">Tìm kiếm</label>
          <TextField id="registration-search" value={filters.search} onChange={event => onChange("search", event.target.value)} placeholder="Nhập UUID đầy đủ hoặc tên người đăng ký" size="small" fullWidth
            slotProps={{ htmlInput: { maxLength: 255 }, input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }} />
        </div>
        {[{ key: "type", label: "Loại hồ sơ", values: REQUEST_TYPES }, { key: "status", label: "Trạng thái", values: REQUEST_STATUSES }].map(({ key, label, values }) => (
          <div className={styles.field} key={key}>
            <label htmlFor={`registration-${key}`}>{label}</label>
            <TextField select id={`registration-${key}`} value={filters[key]} onChange={event => onChange(key, event.target.value)} size="small" fullWidth
              slotProps={{ select: { displayEmpty: true, IconComponent: KeyboardArrowDownIcon, SelectDisplayProps: { "aria-label": label } } }}>
              <MenuItem value="">Tất cả</MenuItem>
              {Object.entries(values).map(([value, text]) => <MenuItem key={value} value={value}>{text}</MenuItem>)}
            </TextField>
          </div>
        ))}
        <DateFilter id="registration-from" label="Từ ngày" value={filters.from} max={filters.to || undefined} error={invalidDates} onChange={value => onChange("from", value)} />
        <DateFilter id="registration-to" label="Đến ngày" value={filters.to} min={filters.from || undefined} error={invalidDates} onChange={value => onChange("to", value)} />
      </div>
      {invalidDates && <p id="registration-date-error" className={styles.error} role="alert">Đến ngày phải bằng hoặc sau Từ ngày.</p>}
      {hasFilters && <Button size="small" onClick={onReset} className={styles.reset}>Xóa bộ lọc</Button>}
    </div>
  )
}
