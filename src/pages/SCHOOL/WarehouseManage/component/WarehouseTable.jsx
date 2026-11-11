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
import { AlertTriangle, AlertCircle, CheckCircle2, Eye, Info } from "lucide-react"
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
    <Box className={styles.tableContainerWrapper}>

      <TableContainer component={Paper} className={styles.tableWrapper} elevation={0}>
        <Table className={styles.table}>
          <TableHead className={styles.tableHead}>
            <TableRow>
              <TableCell style={{ width: "30%" }}>Nguyên liệu &amp; Mã</TableCell>
              <TableCell style={{ width: "38%" }}>Tồn kho hiện tại &amp; Tỷ lệ so với Ngưỡng an toàn</TableCell>
              <TableCell style={{ width: "20%" }}>Đơn giá &amp; NCC</TableCell>
              <TableCell align="center" style={{ width: "12%" }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {items.map(it => {
              const stockPct = Math.round((it.currentStock / it.safetyStock) * 100)
              const deficitQty = it.safetyStock - it.currentStock
              const deficitPct = 100 - stockPct
              const isCritical = stockPct < 50
              const isWarning = stockPct >= 50 && stockPct < 100
              const isSafe = stockPct >= 100

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

                  {/* 2. Tồn kho hiện tại & Đánh giá % ngưỡng an toàn (Không dùng thanh bar, hiển thị % rõ ràng) */}
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
                          {it.currentStock} {it.unit}
                        </Typography>
                        <span className={styles.stockDivider}>/</span>
                        <Typography variant="body2" className={styles.safetyThresholdText}>
                          <strong>{it.safetyStock} {it.unit}</strong> (100%)
                        </Typography>
                      </Box>

                      {/* Badge trạng thái và % rõ ràng */}
                      <Box className={styles.statusBadgeWrap}>
                        {isCritical && (
                          <Chip
                            label={`${stockPct}% định mức • Cần nhập gấp`}
                            size="small"
                            className={styles.criticalChip}
                          />
                        )}
                        {isWarning && (
                          <Chip
                            label={`${stockPct}% định mức • Cần nhập thêm`}
                            size="small"
                            className={styles.warningChip}
                          />
                        )}
                        {isSafe && (
                          <Chip
                            label={`Đủ dùng`}
                            size="small"
                            className={styles.safeChip}
                          />
                        )}
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
    </Box>
  )
}

WarehouseTable.propTypes = {
  items: PropTypes.array.isRequired,
  onViewDetail: PropTypes.func,
}
