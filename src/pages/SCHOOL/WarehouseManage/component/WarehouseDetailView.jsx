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
} from "@mui/material"
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Moon,
  Sun,
  Plus,
} from "lucide-react"
import styles from "./WarehouseDetailView.module.scss"

export default function WarehouseDetailView({ item, onBack, onQuickOrder }) {
  if (!item) return null

  // Phân biệt xem item là Phiếu nhập hàng (có orderNo) hay Mặt hàng tồn kho (có currentStock)
  const isOrder = Boolean(item.orderNo)

  const getScheduleIcon = type => {
    if (type === "EVENING") return <Moon size={14} />
    if (type === "WEEKEND") return <Sun size={14} />
    return <Clock size={14} />
  }

  const getScheduleClass = type => {
    if (type === "EVENING") return styles.scheduleEvening
    if (type === "WEEKEND") return styles.scheduleWeekend
    return styles.scheduleDay
  }

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
          Quay lại danh sách kho
        </Button>

        <Box className={styles.headerText}>
          <Typography variant="h5" className={styles.title}>
            {isOrder ? `Chi Tiết Phiếu Nhập Hàng: ${item.orderNo}` : `Chi Tiết Mặt Hàng: ${item.name}`}
          </Typography>
          <Typography variant="body2" className={styles.subtitle}>
            {isOrder
              ? `Lịch hẹn giao: ${item.deliverySchedule}`
              : `Mã mặt hàng: ${item.code} — Nhóm hàng: ${item.category}`}
          </Typography>
        </Box>
      </Box>

      {/* 2. Nếu là Chi tiết Phiếu nhập hàng */}
      {isOrder ? (
        <Box className={styles.contentGrid}>
          <Paper className={styles.card} elevation={0}>
            <Typography variant="subtitle1" className={styles.cardTitle}>
              Thông tin Phiếu nhập hàng đồ khô
            </Typography>

            <Box className={styles.infoRowGrid}>
              <Box className={styles.infoField}>
                <span className={styles.label}>Mã đơn hàng (PO):</span>
                <span className={styles.value}>{item.orderNo}</span>
              </Box>
              <Box className={styles.infoField}>
                <span className={styles.label}>Mã phiếu giao nhận:</span>
                <span className={styles.value}>{item.deliveryNo}</span>
              </Box>
              <Box className={styles.infoField}>
                <span className={styles.label}>Nhà cung cấp:</span>
                <span className={styles.value}>{item.supplierName}</span>
              </Box>
              <Box className={styles.infoField}>
                <span className={styles.label}>Số điện thoại:</span>
                <span className={styles.value}>{item.supplierPhone}</span>
              </Box>
              <Box className={styles.infoField}>
                <span className={styles.label}>Thời gian giao hàng:</span>
                <Chip
                  icon={getScheduleIcon(item.deliveryType)}
                  label={item.deliveryTypeLabel || "Linh hoạt"}
                  size="small"
                  className={getScheduleClass(item.deliveryType)}
                />
              </Box>
              <Box className={styles.infoField}>
                <span className={styles.label}>Lịch hẹn giao:</span>
                <span className={styles.valueHighlight}>{item.deliverySchedule}</span>
              </Box>
              <Box className={styles.infoField}>
                <span className={styles.label}>Trạng thái:</span>
                {item.status === "COMPLETED" ? (
                  <Chip
                    icon={<CheckCircle2 size={14} />}
                    label="Đã nhập kho hoàn tất"
                    size="small"
                    color="success"
                  />
                ) : (
                  <Chip
                    icon={<Clock size={14} />}
                    label="Chờ NCC giao"
                    size="small"
                    color="primary"
                  />
                )}
              </Box>
            </Box>

            {item.note && (
              <Box className={styles.noteSection}>
                <span className={styles.label}>Ghi chú tiếp nhận & bảo quản:</span>
                <Typography variant="body2" className={styles.noteContent}>
                  {item.note}
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Bảng mặt hàng trong đơn */}
          <Paper className={styles.card} elevation={0}>
            <Typography variant="subtitle1" className={styles.cardTitle}>
              Danh sách mặt hàng cần nhập ({item.items?.length || 0} món)
            </Typography>

            <Table size="small">
              <TableHead className={styles.tableHead}>
                <TableRow>
                  <TableCell>STT</TableCell>
                  <TableCell>Tên nguyên liệu</TableCell>
                  <TableCell align="center">Số lượng</TableCell>
                  <TableCell align="right">Đơn giá</TableCell>
                  <TableCell align="right">Thành tiền</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {item.items?.map((it, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{it.name}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      {it.qty} {it.unit}
                    </TableCell>
                    <TableCell align="right">{it.price?.toLocaleString("vi-VN")} đ</TableCell>
                    <TableCell align="right" className={styles.lineTotal}>
                      {((it.qty || 0) * (it.price || 0)).toLocaleString("vi-VN")} đ
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Box className={styles.orderTotalRow}>
              <Typography variant="subtitle1">
                Tổng giá trị đơn hàng: <strong>{item.totalAmount?.toLocaleString("vi-VN")} đ</strong>
              </Typography>
            </Box>
          </Paper>
        </Box>
      ) : (
        /* 3. Nếu là Chi tiết Mặt hàng Tồn kho */
        <Box className={styles.contentGrid}>
          <Paper className={styles.card} elevation={0}>
            <Box className={styles.cardHeaderWithAction}>
              <Typography variant="subtitle1" className={styles.cardTitle}>
                Thông tin tồn kho &amp; Định mức an toàn
              </Typography>
              {onQuickOrder && (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<Plus size={16} />}
                  onClick={() => onQuickOrder(item)}
                  className={styles.quickOrderBtn}
                >
                  Lập phiếu nhập thêm món này
                </Button>
              )}
            </Box>

            <Box className={styles.infoRowGrid}>
              <Box className={styles.infoField}>
                <span className={styles.label}>Tên nguyên liệu:</span>
                <span className={styles.valueBold}>{item.name}</span>
              </Box>
              <Box className={styles.infoField}>
                <span className={styles.label}>Mã quản lý:</span>
                <span className={styles.value}>{item.code}</span>
              </Box>
              <Box className={styles.infoField}>
                <span className={styles.label}>Nhóm hàng:</span>
                <Chip label={item.category} size="small" />
              </Box>
              <Box className={styles.infoField}>
                <span className={styles.label}>Tồn kho hiện tại:</span>
                <span
                  className={
                    item.currentStock < item.safetyStock
                      ? styles.stockLow
                      : styles.stockNormal
                  }
                >
                  {item.currentStock} {item.unit}
                </span>
              </Box>
              <Box className={styles.infoField}>
                <span className={styles.label}>Ngưỡng an toàn tối thiểu:</span>
                <span className={styles.value}>{item.safetyStock} {item.unit} (100% định mức)</span>
              </Box>
              <Box className={styles.infoField}>
                <span className={styles.label}>Tỷ lệ đạt định mức an toàn:</span>
                {(() => {
                  const pct = Math.round((item.currentStock / item.safetyStock) * 100)
                  const isCrit = pct < 50
                  const isWarn = pct >= 50 && pct < 100
                  return (
                    <span
                      style={{
                        fontWeight: 700,
                        color: isCrit ? "#dc2626" : isWarn ? "#d97706" : "#16a34a",
                      }}
                    >
                      Đạt {pct}% — {isCrit ? `Thiếu ${item.safetyStock - item.currentStock} ${item.unit} (Cần nhập khẩn cấp)` : isWarn ? `Thiếu ${item.safetyStock - item.currentStock} ${item.unit} (Cần nhập thêm)` : "Tồn kho an toàn (Đủ dùng)"}
                    </span>
                  )
                })()}
              </Box>
              <Box className={styles.infoField}>
                <span className={styles.label}>Sức chứa kho tối đa:</span>
                <span className={styles.value}>{item.maxCapacity} {item.unit}</span>
              </Box>
              <Box className={styles.infoField}>
                <span className={styles.label}>Đơn vị tính:</span>
                <span className={styles.valueBold}>{item.unit}</span>
              </Box>
              <Box className={styles.infoField}>
                <span className={styles.label}>Đơn giá tham khảo:</span>
                <span className={styles.value}>
                  {item.unitPrice?.toLocaleString("vi-VN")} đ/{item.unit}
                </span>
              </Box>
            </Box>
          </Paper>

          <Paper className={styles.card} elevation={0}>
            <Typography variant="subtitle1" className={styles.cardTitle}>
              Nhà cung cấp đối tác
            </Typography>

            <Box className={styles.infoRowGrid}>
              <Box className={styles.infoField}>
                <span className={styles.label}>Nhà cung cấp phụ trách:</span>
                <span className={styles.valueBold}>{item.supplierName}</span>
              </Box>
              <Box className={styles.infoField}>
                <span className={styles.label}>Chế độ giao nhận:</span>
                <span className={styles.value}>Linh hoạt theo thỏa thuận và lịch nhận kho của trường</span>
              </Box>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  )
}

WarehouseDetailView.propTypes = {
  item: PropTypes.object,
  onBack: PropTypes.func.isRequired,
  onQuickOrder: PropTypes.func,
}
