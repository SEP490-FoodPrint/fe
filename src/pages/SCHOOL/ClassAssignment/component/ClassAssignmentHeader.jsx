import React from "react"
import PropTypes from "prop-types"
import { Button, MenuItem, TextField } from "@mui/material"
import { Copy, Plus } from "lucide-react"
import styles from "./ClassAssignmentHeader.module.scss"

function ClassAssignmentHeader({
  years,
  academicYear,
  currentYear,
  onYearChange,
  canManage,
  onCreate,
  onCopy,
}) {
  return (
    <header className={styles.header}>
      <div>
        <nav className={styles.breadcrumb} aria-label="Đường dẫn trang">
          <span>Ban Giám hiệu</span>
          <span>/</span>
          <strong>Lớp học & GVCN</strong>
        </nav>
        <h1 className={styles.title}>Lớp học & giáo viên chủ nhiệm</h1>
        <p className={styles.description}>
          Tạo lớp theo niên khóa, sao chép lớp từ năm trước và phân công giáo viên chủ nhiệm.
        </p>
      </div>

      <div className={styles.toolbar}>
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
        {canManage && (
          <>
            <Button variant="outlined" startIcon={<Copy size={18} />} onClick={onCopy}>
              Sao chép từ năm trước
            </Button>
            <Button variant="contained" startIcon={<Plus size={18} />} onClick={onCreate}>
              Thêm lớp
            </Button>
          </>
        )}
      </div>
    </header>
  )
}

ClassAssignmentHeader.propTypes = {
  years: PropTypes.arrayOf(PropTypes.string).isRequired,
  academicYear: PropTypes.string.isRequired,
  currentYear: PropTypes.string.isRequired,
  onYearChange: PropTypes.func.isRequired,
  canManage: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
  onCopy: PropTypes.func.isRequired,
}

export default ClassAssignmentHeader
