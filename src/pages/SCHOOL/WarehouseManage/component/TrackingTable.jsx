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
  CircularProgress,
} from "@mui/material"
import {
  Eye,
  Package,
} from "lucide-react"
import FoodPrintLoading from "src/components/FoodPrintLoading"
import styles from "./TrackingTable.module.scss"

export default function TrackingTable({ orders = [], onViewDetail, loading = false }) {
  const getStatusBadge = status => {
    switch (status) {
      case "CREATED":
      case "PENDING":
        return (
          <Chip
            label="Chờ NCC xác nhận"
            size="small"
            className={styles.statusPending}
          />
        )
      case "ACCEPTED":
      case "CONFIRMED":
        return (
          <Chip
            label="NCC đã xác nhận"
            size="small"
            className={styles.statusAccepted}
          />
        )
      case "IN_TRANSIT":
        return (
          <Chip
            label="Đang giao"
            size="small"
            className={styles.statusInTransit}
          />
        )
      case "ARRIVED":
        return (
          <Chip
            label="Đã tới trường (Chờ kiểm duyệt)"
            size="small"
            className={styles.statusArrived}
          />
        )
      case "COMPLETED":
      case "RECEIVED":
        return (
          <Chip
            label="Đã hoàn tất"
            size="small"
            className={styles.statusCompleted}
          />
        )
      case "REJECTED":
        return (
          <Chip
            label="Bị từ chối"
            size="small"
            color="error"
          />
        )
      case "CANCELLED":
        return (
          <Chip
            label="Đã hủy"
            size="small"
          />
        )
      default:
        return <Chip size="small" label={status} />
    }
  }

  if (loading) {
    return (
      <Paper
        className={styles.emptyContainer}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 10,
          gap: 2,
        }}
      >
        <FoodPrintLoading size="large" />
        <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
          Đang tải dữ liệu theo dõi đơn hàng đồ khô...
        </Typography>
      </Paper>
    )
  }

  if (orders.length === 0) {
    return (
      <Paper className={styles.emptyContainer}>
        <Package size={48} className={styles.emptyIcon} />
        <Typography variant="h6" className={styles.emptyTitle}>
          Không tìm thấy đơn hàng vận chuyển nào
        </Typography>
        <Typography variant="body2" className={styles.emptySubtitle}>
          Thử đổi mốc thời gian hoặc chọn bộ lọc trạng thái khác.
        </Typography>
      </Paper>
    )
  }

  return (
    <TableContainer component={Paper} className={styles.tableContainer}>
      <Table className={styles.table} aria-label="Bảng theo dõi đơn hàng">
        <TableHead>
          <TableRow className={styles.headRow}>
            <TableCell className={styles.thCell}>Mã Nhập Hàng</TableCell>
            <TableCell className={styles.thCell}>Lịch Hẹn Giao</TableCell>
            <TableCell className={styles.thCell}>Trạng Thái</TableCell>
            <TableCell className={styles.thCellAction} align="center">Thao Tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map(item => (
            <TableRow key={item.id} hover className={styles.tableRow}>
              {/* Cột 1: Mã Phiếu (Gọn gàng, chỉ hiển thị mã định danh chính) */}
              <TableCell className={styles.tdCell}>
                <Typography className={styles.orderNo}>
                  {String(item.orderNo || item.deliveryNo || "PN-UNKNOWN").replace(/^PO-/, "PN-").replace(/-\d+$/, "")}
                </Typography>
                {Array.isArray(item.suppliers) && item.suppliers.length > 1 && (
                  <Typography variant="caption" sx={{ color: "#64748b", display: "block", fontSize: "0.725rem", mt: 0.25 }}>
                    Gồm {item.suppliers.length} NCC
                  </Typography>
                )}
              </TableCell>

              {/* Cột 2: Lịch Hẹn Giao */}
              <TableCell className={styles.tdCell}>
                <Typography className={styles.scheduleText}>{item.deliverySchedule}</Typography>
              </TableCell>

              {/* Cột 3: Trạng Thái Tiến Trình */}
              <TableCell className={styles.tdCell}>
                {getStatusBadge(item.status)}
              </TableCell>

              {/* Cột 4: Thao Tác */}
              <TableCell className={styles.tdCellAction} align="center">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Eye size={14} />}
                  onClick={() => onViewDetail(item)}
                  className={styles.detailBtn}
                >
                  Chi tiết
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

TrackingTable.propTypes = {
  orders: PropTypes.arrayOf(PropTypes.object).isRequired,
  onViewDetail: PropTypes.func.isRequired,
  loading: PropTypes.bool,
}
