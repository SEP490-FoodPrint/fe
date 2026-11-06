import React from "react"
import PropTypes from "prop-types"
import { MenuItem, TextField } from "@mui/material"
import styles from "./ClassAssignmentHeader.module.scss"

function ClassAssignmentHeader({ years, academicYear, currentYear, onYearChange }) {
  return (
    <header className={styles.header}>
      <div>
        <nav className={styles.breadcrumb} aria-label="Đường dẫn trang">
          <span>Ban Giám hiệu</span>
          <span>/</span>
          <strong>Phân công GVCN</strong>
        </nav>
      </div>

      <TextField
        select
        size="small"
        label="Niên khóa"
        value={years.includes(academicYear) ? academicYear : ""}
        onChange={event => onYearChange(event.target.value)}
        className={styles.yearSelect}
      >
        {years.map(year => (
          <MenuItem key={year} value={year}>
            {year}
            {year === currentYear ? " · Hiện tại" : ""}
          </MenuItem>
        ))}
      </TextField>
    </header>
  )
}

ClassAssignmentHeader.propTypes = {
  years: PropTypes.arrayOf(PropTypes.string).isRequired,
  academicYear: PropTypes.string.isRequired,
  currentYear: PropTypes.string.isRequired,
  onYearChange: PropTypes.func.isRequired,
}

export default ClassAssignmentHeader
