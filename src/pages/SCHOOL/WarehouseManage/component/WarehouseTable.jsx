import React from "react"
import PropTypes from "prop-types"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Button,
  Box,
} from "@mui/material"
import { Eye } from "lucide-react"
import styles from "./WarehouseTable.module.scss"

export default function WarehouseTable({ items = [], onViewDetail }) {
  if (!items || items.length === 0) {
    return (
      <Paper className={styles.emptyCard} elevation={0}>
        <Typography variant="body1" color="text.secondary">
          Không tìm thấy mặt hàng gạo hay gia vị nào phù hợp với bộ lọc.
        </Typography>
      </Paper>
    )
  }

  return (
    <TableContainer component={Paper} className={styles.tableWrapper} elevation={0}>
      <Table className={styles.table}>
        <TableHead className={styles.tableHead}>
          <TableRow>
            <TableCell style={{ width: "35%" }}>Nguyên liệu &amp; Mã</TableCell>
            <TableCell style={{ width: "33%" }}>Tồn kho / Ngưỡng an toàn</TableCell>
            <TableCell style={{ width: "20%" }}>Đơn giá &amp; NCC</TableCell>
            <TableCell align="center" style={{ width: "12%" }}>Thao tác</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {items.map(it => {
            const stockPct = Math.round((it.currentStock / it.safetyStock) * 100)
            const isCritical = stockPct < 50
            const isWarning = stockPct >= 50 && stockPct < 100

            return (
              <TableRow key={it.id} className={styles.tableRow} hover>
                {/* 1. Mã & Tên nguyên liệu */}
                <TableCell>
                  <Box className={styles.nameCell}>
                    <Typography variant="subtitle2" className={styles.itemName}>
                      {it.name}
                    </Typography>
                    <Box className={styles.codeRow}>
                      <span className={styles.codeText}>{it.code}</span>
                      <Chip label={it.category} size="small" className={styles.categoryChip} />
                    </Box>
                  </Box>
                </TableCell>

                {/* 2. Tồn kho hiện tại / Ngưỡng an toàn (3 loại: Đủ, Dưới 50%, Trên 50% - Xanh, Đỏ, Vàng) */}
                <TableCell>
                  <Box className={styles.stockCell}>
                    <Box className={styles.stockMainRow}>
                      <Typography
                        variant="subtitle2"
                        className={
                          isCritical
                            ? styles.stockCritical
                            : isWarning
                              ? styles.stockWarning
                              : styles.stockSafe
                        }
                      >
                        {it.currentStock} / {it.safetyStock} {it.unit}
                      </Typography>

                      <Box className={styles.statusBadgeWrap}>
                        {isCritical ? (
                          <Chip
                            label="Dưới 50%"
                            size="small"
                            className={styles.criticalChip}
                          />
                        ) : isWarning ? (
                          <Chip
                            label="Trên 50%"
                            size="small"
                            className={styles.warningChip}
                          />
                        ) : (
                          <Chip
                            label="Đủ dùng"
                            size="small"
                            className={styles.safeChip}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </TableCell>

                {/* 3. Giá & NCC */}
                <TableCell>
                  <Typography variant="body2" className={styles.priceText}>
                    {it.unitPrice.toLocaleString("vi-VN")} đ/{it.unit}
                  </Typography>
                  <Typography variant="caption" className={styles.supplierText}>
                    {it.supplierName}
                  </Typography>
                </TableCell>

                {/* 4. Thao tác: Nút Xem chi tiết */}
                <TableCell align="center">
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    startIcon={<Eye size={14} />}
                    onClick={() => onViewDetail && onViewDetail(it)}
                    className={styles.detailBtn}
                  >
                    Chi tiết
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

WarehouseTable.propTypes = {
  items: PropTypes.array.isRequired,
  onViewDetail: PropTypes.func,
}
