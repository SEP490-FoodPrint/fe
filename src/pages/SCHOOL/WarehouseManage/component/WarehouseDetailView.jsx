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
  TableContainer,
  Alert,
} from "@mui/material"
import {
  ArrowLeft,
  Plus,
  Boxes,
} from "lucide-react"
import styles from "./WarehouseDetailView.module.scss"

export default function WarehouseDetailView({ item, onBack, onQuickOrder }) {
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
          Quay lại danh sách kho
        </Button>

        <Box className={styles.headerText}>
          <Typography variant="h5" className={styles.title}>
            Chi Tiết Mặt Hàng: {item.name}
          </Typography>
          <Typography variant="body2" className={styles.subtitle}>
            Mã mặt hàng: {item.code} — Nhóm hàng: {item.category}
          </Typography>
        </Box>
      </Box>

      {/* 2. Chi tiết Mặt hàng Tồn kho */}
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
              <span className={styles.value}>{item.safetyStock} {item.unit}</span>
            </Box>
            <Box className={styles.infoField}>
              <span className={styles.label}>Trạng thái định mức:</span>
              {(() => {
                const safety = Number(item.safetyStock) || 1
                const current = Number(item.currentStock) || 0
                const pct = Math.round((current / safety) * 100)
                if (pct < 30) {
                  return (
                    <Chip
                      label="Báo động (< 30%) - Cần nhập gấp"
                      size="small"
                      style={{
                        width: "fit-content",
                        backgroundColor: "#fee2e2",
                        color: "#b91c1c",
                        fontWeight: 700,
                        border: "1px solid #fca5a5",
                      }}
                    />
                  )
                }
                if (pct < 50) {
                  return (
                    <Chip
                      label="Dưới 50% - Cần nhập hàng"
                      size="small"
                      style={{
                        width: "fit-content",
                        backgroundColor: "#fef3c7",
                        color: "#b45309",
                        fontWeight: 700,
                        border: "1px solid #fde68a",
                      }}
                    />
                  )
                }
                return (
                  <Chip
                    label="Đủ an toàn"
                    size="small"
                    style={{
                      width: "fit-content",
                      backgroundColor: "#ecfdf5",
                      color: "#047857",
                      fontWeight: 700,
                      border: "1px solid #a7f3d0",
                    }}
                  />
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

        <Paper className={styles.card} elevation={0} sx={{ gridColumn: "1 / -1", mt: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Boxes size={20} color="#15803d" />
            <Typography variant="subtitle1" className={styles.cardTitle}>
              Danh sách lô hàng thực tế trong kho ({item.lots?.length || 0} lô)
            </Typography>
          </Box>

          {item.lots && item.lots.length > 0 ? (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Mã lô</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Ngày sản xuất</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Hạn sử dụng</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Số lượng nhập</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Tồn khả dụng</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Mã phiếu giao</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {item.lots.map(lot => (
                    <TableRow key={lot.id} hover>
                      <TableCell sx={{ fontWeight: 600, color: "#1e293b" }}>{lot.lotCode}</TableCell>
                      <TableCell>{lot.manufactureDate || "—"}</TableCell>
                      <TableCell>{lot.expiryDate || "—"}</TableCell>
                      <TableCell align="center">{lot.receivedQuantity} {item.unit}</TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          color: lot.availableQuantity > 0 ? "#15803d" : "#94a3b8",
                        }}
                      >
                        {lot.availableQuantity} {item.unit}
                      </TableCell>
                      <TableCell>{lot.deliveryNo || "—"}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={lot.status === "AVAILABLE" ? "Khả dụng" : lot.status}
                          size="small"
                          color={lot.status === "AVAILABLE" ? "success" : "default"}
                          sx={{ height: 22, fontSize: 11 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Hiện tại chưa có lô hàng thực tế nào của mặt hàng này được nhập vào kho. Hãy lập phiếu nhập hàng để bổ sung tồn kho.
            </Alert>
          )}
        </Paper>
      </Box>
    </Box>
  )
}

WarehouseDetailView.propTypes = {
  item: PropTypes.object,
  onBack: PropTypes.func.isRequired,
  onQuickOrder: PropTypes.func,
}
