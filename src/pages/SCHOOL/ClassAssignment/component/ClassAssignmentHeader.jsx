import React, { useState } from "react"
import PropTypes from "prop-types"
import { Button, ListItemIcon, ListItemText, Menu, MenuItem, TextField } from "@mui/material"
import { ChevronDown, Copy, Download, FileSpreadsheet, Plus, Upload } from "lucide-react"
import styles from "./ClassAssignmentHeader.module.scss"

function ClassAssignmentHeader({
  years,
  academicYear,
  currentYear,
  onYearChange,
  canManage,
  onCreate,
  onCopy,
  canImport,
  canExport,
  exporting,
  onImport,
  onExport,
}) {
  const [excelMenu, setExcelMenu] = useState(null)
  const runExcel = action => {
    setExcelMenu(null)
    action()
  }

  return (
    <header className={styles.header}>
      <div>
        <nav className={styles.breadcrumb} aria-label="Đường dẫn trang">
          <span>Ban Giám hiệu</span>
          <span>/</span>
          <strong>Phân công GVCN</strong>
        </nav>
        <h1 className={styles.title}>Lớp học & giáo viên chủ nhiệm</h1>
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
        <Button
          variant="outlined"
          startIcon={<FileSpreadsheet size={18} />}
          endIcon={<ChevronDown size={16} />}
          onClick={event => setExcelMenu(event.currentTarget)}
          aria-haspopup="menu"
          aria-expanded={Boolean(excelMenu)}
          disabled={exporting}
        >
          {exporting ? "Đang xuất..." : "Excel"}
        </Button>
        <Menu
          anchorEl={excelMenu}
          open={Boolean(excelMenu)}
          onClose={() => setExcelMenu(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          {canImport && (
            <MenuItem onClick={() => runExcel(onImport)}>
              <ListItemIcon>
                <Upload size={16} />
              </ListItemIcon>
              <ListItemText primary="Nhập lớp từ Excel" secondary="Có file mẫu, xem trước trước khi lưu" />
            </MenuItem>
          )}
          <MenuItem onClick={() => runExcel(onExport)} disabled={!canExport}>
            <ListItemIcon>
              <Download size={16} />
            </ListItemIcon>
            <ListItemText primary="Xuất danh sách lớp" secondary={`Niên khóa ${academicYear || "đang chọn"}`} />
          </MenuItem>
        </Menu>
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
  canImport: PropTypes.bool.isRequired,
  canExport: PropTypes.bool.isRequired,
  exporting: PropTypes.bool.isRequired,
  onImport: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
}

export default ClassAssignmentHeader
