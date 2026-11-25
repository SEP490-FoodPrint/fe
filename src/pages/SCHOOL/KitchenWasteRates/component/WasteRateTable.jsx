import React from "react"
import PropTypes from "prop-types"
import {
  InputAdornment,
  MenuItem,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material"
import { isDirty, parsePercent, rateToPercent, rawPerCooked } from "./wasteRate"
import styles from "./WasteRateTable.module.scss"

const HANDLING_LABELS = { DIRECT_USE: "Đồ tươi", DRY_STOCK: "Đồ lưu kho" }
const PAGE_SIZES = [10, 20, 50]

const formatNumber = value =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 3 }).format(value)

function WasteRateTable({
  rows,
  drafts,
  saving,
  onDraft,
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) {
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize))
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalItems)

  if (totalItems === 0)
    return (
      <p className={styles.empty}>Không có nguyên liệu khớp bộ lọc.</p>
    )

  return (
    <>
      <Table className={styles.table}>
        <TableHead>
          <TableRow>
            <TableCell>Nguyên liệu</TableCell>
            <TableCell>Loại</TableCell>
            <TableCell className={styles.rateCell}>Hao hụt</TableCell>
            <TableCell align="right">Lượng sống cho 1 đơn vị thành phẩm</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => {
            const value =
              row.id in drafts ? drafts[row.id] : rateToPercent(row.wasteRate)
            const parsed = parsePercent(value)
            const dirty = isDirty(row, drafts)
            return (
              <TableRow
                key={row.id}
                className={dirty ? styles.dirty : undefined}
              >
                <TableCell className={styles.nameCell}>
                  <span className={styles.name}>{row.ingredientName}</span>
                  {dirty && <span className={styles.unsaved}>Chưa lưu</span>}
                </TableCell>
                <TableCell className={styles.typeCell}>
                  <span
                    className={`${styles.type} ${
                      row.handlingType === "DRY_STOCK" ? styles.dry : styles.fresh
                    }`}
                  >
                    {HANDLING_LABELS[row.handlingType] || "Khác"}
                  </span>
                </TableCell>
                <TableCell className={styles.rateCell}>
                  <TextField
                    size="small"
                    fullWidth
                    value={value}
                    disabled={saving}
                    error={Boolean(parsed.error)}
                    helperText={parsed.error}
                    onChange={event => onDraft(row.id, event.target.value)}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">%</InputAdornment>
                        ),
                      },
                      htmlInput: {
                        inputMode: "decimal",
                        "aria-label": `Tỷ lệ hao hụt của ${row.ingredientName}`,
                      },
                    }}
                  />
                </TableCell>
                <TableCell align="right" className={styles.rawCell}>
                  <span className={styles.rawLabel}>
                    1 {row.unit} thành phẩm cần{" "}
                  </span>
                  {parsed.error
                    ? "—"
                    : `${formatNumber(rawPerCooked(parsed.rate))} ${row.unit}`}
                  {!parsed.error && (
                    <span className={styles.rawLabel}> sống</span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <div className={styles.pagination}>
        <span className={styles.range}>
          {from}–{to} / {totalItems} nguyên liệu
        </span>
        <Pagination
          count={pageCount}
          page={page}
          siblingCount={0}
          color="primary"
          shape="rounded"
          onChange={(_, next) => onPageChange(next)}
        />
        <TextField
          select
          size="small"
          value={pageSize}
          onChange={event => onPageSizeChange(Number(event.target.value))}
          slotProps={{ htmlInput: { "aria-label": "Số dòng mỗi trang" } }}
        >
          {PAGE_SIZES.map(size => (
            <MenuItem key={size} value={size}>
              {size} dòng
            </MenuItem>
          ))}
        </TextField>
      </div>
    </>
  )
}

WasteRateTable.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  drafts: PropTypes.objectOf(PropTypes.string).isRequired,
  saving: PropTypes.bool.isRequired,
  onDraft: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onPageSizeChange: PropTypes.func.isRequired,
}

export default WasteRateTable
