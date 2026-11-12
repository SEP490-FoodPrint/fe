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
import {
  Truck,
  Clock,
  CheckCircle2,
  Eye,
  Package,
} from "lucide-react"
import styles from "./TrackingTable.module.scss"

export default function TrackingTable({ orders = [], onViewDetail }) {
  const getOrderTypeBadge = type => {
    switch (type) {
      case "FRESH_BATCH_1":
        return (
          <Chip
            size="small"
            label="Đồ tươi (Đợt 1 - 05:30)"
            className={styles.badgeFresh1}
          />
        )
      case "FRESH_BATCH_2":
        return (
          <Chip
            size="small"
            label="Đồ tươi (Đợt 2 - Bù sĩ số)"
            className={styles.badgeFresh2}
          />
        )
      case "DRY_STOCK":
        return (
          <Chip
            size="small"
            label="Đồ khô &amp; Gia vị"
            className={styles.badgeDry}
          />
        )
      default:
        return <Chip size="small" label={type} />
    }
  }

  const getStatusBadge = status => {
    switch (status) {
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
      case "ACCEPTED":
        return (
          <Chip
            label="NCC đã xác nhận"
            size="small"
            className={styles.statusAccepted}
          />
        )
      case "COMPLETED":
        return (
          <Chip
            label="Đã hoàn tất"
            size="small"
            className={styles.statusCompleted}
          />
        )
      default:
        return <Chip size="small" label={status} />
    }
  }

  if (orders.length === 0) {
    return (
      <Paper className={styles.emptyContainer}>
        <Package size={48} className={styles.emptyIcon} />
        <Typography variant="h6" className={styles.emptyTitle}>
          Không tìm thấy đơn hàng vận chuyển nào
        </Typography>
        <Typography variant="body2" className={styles.emptySubtitle}>
          Thử đổi từ khóa tìm kiếm hoặc chọn bộ lọc trạng thái khác.
        </Typography>
      </Paper>
    )
  }

  return (
    <TableContainer component={Paper} className={styles.tableContainer}>
      <Table className={styles.table} aria-label="Bảng theo dõi đơn hàng">
        <TableHead>
          <TableRow className={styles.headRow}>
            <TableCell className={styles.thCell}>Mã Đơn / Phiếu Giao</TableCell>
            <TableCell className={styles.thCell}>Loại Đơn Hàng</TableCell>
            <TableCell className={styles.thCell}>Nhà Cung Cấp</TableCell>
            <TableCell className={styles.thCell}>Hẹn Giờ &amp; Tiến Độ ETA</TableCell>
            <TableCell className={styles.thCell}>Trạng Thái Tiến Trình</TableCell>
            <TableCell className={styles.thCellAction} align="center">Thao Tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map(item => (
            <TableRow key={item.id} hover className={styles.tableRow}>
              {/* Cột 1: Mã Đơn / Phiếu Giao */}
              <TableCell className={styles.tdCell}>
                <Typography className={styles.orderNo}>{item.orderNo}</Typography>
                <Typography className={styles.deliveryNo}>{item.deliveryNo}</Typography>
              </TableCell>

              {/* Cột 2: Loại Đơn */}
              <TableCell className={styles.tdCell}>
                {getOrderTypeBadge(item.orderType)}
              </TableCell>

              {/* Cột 3: Nhà Cung Cấp */}
              <TableCell className={styles.tdCell}>
                <Typography className={styles.supplierName}>{item.supplierName}</Typography>
                <Typography className={styles.supplierPhone}>Hotline: {item.supplierPhone}</Typography>
              </TableCell>

              {/* Cột 4: Hẹn Giờ & Tiến Độ ETA */}
              <TableCell className={styles.tdCell}>
                <Typography className={styles.scheduleText}>{item.deliverySchedule}</Typography>
                <Typography
                  className={`${styles.etaText} ${item.status === "IN_TRANSIT" ? styles.etaActive : ""
                    }`}
                >
                  {item.etaText}
                </Typography>
              </TableCell>

              {/* Cột 5: Trạng Thái Tiến Trình */}
              <TableCell className={styles.tdCell}>
                {getStatusBadge(item.status)}
              </TableCell>

              {/* Cột 6: Thao Tác */}
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
}
