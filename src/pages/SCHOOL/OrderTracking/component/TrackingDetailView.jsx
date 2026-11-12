import React from "react"
import PropTypes from "prop-types"
import {
  Box,
  Typography,
  Chip,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
} from "@mui/material"
import {
  ArrowLeft,
  Phone,
  Truck,
  Thermometer,
  MapPin,
  Calendar,
} from "lucide-react"
import styles from "./TrackingDetailView.module.scss"

export default function TrackingDetailView({ item, onBack }) {
  if (!item) return null

  return (
    <Box className={styles.container}>
      {/* 1. Header & Nút Quay lại */}
      <Box className={styles.header}>
        <Button
          onClick={onBack}
          startIcon={<ArrowLeft size={18} />}
          variant="outlined"
          color="inherit"
          className={styles.backBtn}
        >
          Quay lại danh sách theo dõi
        </Button>

        <Box className={styles.headerTextGroup}>
          <Box className={styles.titleRow}>
            <Typography variant="h5" className={styles.title}>
              Chi Tiết Đơn Hàng: {item.orderNo}
            </Typography>
            <Chip
              label={item.statusLabel}
              size="small"
              className={
                item.status === "IN_TRANSIT"
                  ? styles.statusInTransit
                  : item.status === "ARRIVED"
                  ? styles.statusArrived
                  : styles.statusAccepted
              }
            />
          </Box>
          <Typography variant="body2" className={styles.subtitle}>
            Mã phiếu giao: {item.deliveryNo} &bull; {item.orderTypeLabel} &bull; NCC: {item.supplierName}
          </Typography>
        </Box>
      </Box>

      {/* 2. Tiến trình đơn hàng (Đơn giản hóa, tinh gọn) */}
      <Paper className={styles.card} elevation={0}>
        <Typography variant="subtitle1" className={styles.cardTitle}>
          Tiến trình đơn hàng
        </Typography>

        <Box className={styles.simpleTimeline}>
          {item.timeline?.map((step, idx) => (
            <Box key={idx} className={styles.timelineStep}>
              <Box
                className={`${styles.stepDot} ${
                  step.done ? styles.stepDotDone : step.current ? styles.stepDotCurrent : ""
                }`}
              >
                {step.step}
              </Box>
              <Box className={styles.stepInfo}>
                <Typography className={styles.stepName}>{step.title}</Typography>
                <Typography className={styles.stepDate}>{step.time}</Typography>
              </Box>
              {idx < item.timeline.length - 1 && <Box className={styles.stepConnector} />}
            </Box>
          ))}
        </Box>
      </Paper>

      {/* 3. Thẻ thông tin Vận chuyển & Tài xế */}
      <Paper className={styles.card} elevation={0}>
        <Box className={styles.cardHeader}>
          <Box className={styles.cardHeaderIcon}>
            <Truck size={20} />
          </Box>
          <Typography variant="subtitle1" className={styles.cardTitle}>
            Thông tin Tài xế &amp; Phương tiện
          </Typography>
        </Box>

        <Box className={styles.infoRowGrid}>
          <Box className={styles.infoField}>
            <span className={styles.label}>Tài xế phụ trách:</span>
            <span className={styles.valueBold}>{item.driverName}</span>
          </Box>

          <Box className={styles.infoField}>
            <span className={styles.label}>Số điện thoại:</span>
            <span className={styles.phoneValue}>
              <a href={`tel:${item.driverPhone}`}>
                <Phone size={14} /> {item.driverPhone}
              </a>
            </span>
          </Box>

          <Box className={styles.infoField}>
            <span className={styles.label}>Biển số &amp; Loại xe:</span>
            <span className={styles.valueBold}>{item.vehiclePlate}</span>
          </Box>

          <Box className={styles.infoField}>
            <span className={styles.label}>Lịch hẹn giao:</span>
            <span className={styles.value}>
              <Calendar size={14} className={styles.inlineIcon} /> {item.deliverySchedule}
            </span>
          </Box>

          <Box className={styles.infoField}>
            <span className={styles.label}>Nhiệt độ thùng xe:</span>
            <span className={styles.value}>
              <Thermometer size={14} className={styles.inlineIcon} /> {item.refrigerationTemp}
            </span>
          </Box>

          <Box className={styles.infoField}>
            <span className={styles.label}>Vị trí cập nhật:</span>
            <span className={styles.value}>
              <MapPin size={14} className={styles.inlineIcon} /> {item.currentLocation}
            </span>
          </Box>
        </Box>
      </Paper>

      {/* 4. Danh sách nguyên liệu bàn giao */}
      <Paper className={styles.card} elevation={0}>
        <Typography variant="subtitle1" className={styles.cardTitle}>
          Danh mục nguyên liệu ({item.items?.length || 0} mặt hàng)
        </Typography>

        <Box className={styles.itemsTableWrapper}>
          <Table size="small">
            <TableHead>
              <TableRow className={styles.itemHeadRow}>
                <TableCell className={styles.itemTh}>Tên Nguyên Liệu</TableCell>
                <TableCell className={styles.itemTh} align="right">Số Lượng</TableCell>
                <TableCell className={styles.itemTh}>Đơn Vị</TableCell>
                <TableCell className={styles.itemTh}>Quy Cách / Tiêu Chuẩn</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {item.items?.map((it, idx) => (
                <TableRow key={idx}>
                  <TableCell className={styles.itemTdName}>{it.name}</TableCell>
                  <TableCell className={styles.itemTdQty} align="right">
                    {it.qty}
                  </TableCell>
                  <TableCell className={styles.itemTd}>{it.unit}</TableCell>
                  <TableCell className={styles.itemTdSpec}>{it.spec}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        {item.note && (
          <>
            <Divider className={styles.cardDivider} />
            <Box className={styles.noteBox}>
              <Typography variant="caption" className={styles.noteTitle}>
                Ghi chú:
              </Typography>
              <Typography variant="body2" className={styles.noteText}>
                {item.note}
              </Typography>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  )
}

TrackingDetailView.propTypes = {
  item: PropTypes.object,
  onBack: PropTypes.func.isRequired,
}
