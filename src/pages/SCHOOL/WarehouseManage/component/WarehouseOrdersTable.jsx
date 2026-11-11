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
} from "@mui/material"
import { Moon, Sun, Clock, CheckCircle2, Eye } from "lucide-react"
import styles from "./WarehouseOrdersTable.module.scss"

export default function WarehouseOrdersTable({ orders = [], onViewDetail }) {
  if (!orders || orders.length === 0) {
    return (
      <Paper className={styles.emptyCard} elevation={0}>
        <Typography variant="body1" color="text.secondary">
          Chưa có phiếu nhập hàng đồ khô nào phù hợp với bộ lọc.
        </Typography>
      </Paper>
    )
  }

  const getScheduleIcon = type => {
    if (type === "EVENING") return <Moon size={14} />
    if (type === "WEEKEND") return <Sun size={14} />
    return <Clock size={14} />
  }

  const getScheduleClass = type => {
    if (type === "EVENING") return styles.scheduleChipEvening
    if (type === "WEEKEND") return styles.scheduleChipWeekend
    return styles.scheduleChipDay
  }

  return (
    <TableContainer component={Paper} className={styles.tableWrapper} elevation={0}>
      <Table className={styles.table} aria-label="Bảng phiếu nhập đồ khô">
        <TableHead className={styles.tableHead}>
          <TableRow>
            <TableCell>Mã đơn &amp; Phiếu nhập</TableCell>
            <TableCell>Nhà cung cấp</TableCell>
            <TableCell>Lịch hẹn giao hàng linh hoạt</TableCell>
            <TableCell align="center">Số mặt hàng</TableCell>
            <TableCell align="right">Tổng giá trị</TableCell>
            <TableCell align="center">Trạng thái phiếu</TableCell>
            <TableCell align="center">Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map(order => (
            <TableRow key={order.id} className={styles.tableRow} hover>
              <TableCell>
                <Typography variant="subtitle2" className={styles.orderNo}>
                  {order.orderNo}
                </Typography>
                <Typography variant="caption" className={styles.deliveryNo}>
                  {order.deliveryNo}
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant="body2" className={styles.supplierName}>
                  {order.supplierName}
                </Typography>
                <Typography variant="caption" className={styles.supplierPhone}>
                  {order.supplierPhone}
                </Typography>
              </TableCell>

              <TableCell>
                <Chip
                  icon={getScheduleIcon(order.deliveryType)}
                  label={order.deliveryTypeLabel || "Linh hoạt"}
                  size="small"
                  className={getScheduleClass(order.deliveryType)}
                />
                <Typography variant="body2" className={styles.scheduleDetail}>
                  {order.deliverySchedule}
                </Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="body2" fontWeight={600}>
                  {order.totalItems} món khô
                </Typography>
              </TableCell>

              <TableCell align="right">
                <Typography variant="subtitle2" className={styles.amountText}>
                  {order.totalAmount?.toLocaleString("vi-VN")} đ
                </Typography>
              </TableCell>

              <TableCell align="center">
                {order.status === "COMPLETED" ? (
                  <Chip
                    icon={<CheckCircle2 size={14} />}
                    label="Đã nhập kho"
                    size="small"
                    color="success"
                    className={styles.statusSuccess}
                  />
                ) : (
                  <Chip
                    icon={<Clock size={14} />}
                    label="Chờ NCC giao"
                    size="small"
                    color="primary"
                    className={styles.statusWaiting}
                  />
                )}
              </TableCell>

              <TableCell align="center">
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  startIcon={<Eye size={14} />}
                  onClick={() => onViewDetail && onViewDetail(order)}
                  className={styles.detailBtn}
                >
                  Xem chi tiết
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

WarehouseOrdersTable.propTypes = {
  orders: PropTypes.array.isRequired,
  onViewDetail: PropTypes.func,
}
