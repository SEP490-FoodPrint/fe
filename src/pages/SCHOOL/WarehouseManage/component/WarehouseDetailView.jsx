import React from "react"
import PropTypes from "prop-types"
import {
  Box,
  Typography,
  Chip,
  Button,
  Paper,
} from "@mui/material"
import {
  ArrowLeft,
  Plus,
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
                const pct = Math.round((item.currentStock / item.safetyStock) * 100)
                if (pct < 50) {
                  return (
                    <Chip
                      label="Dưới 50%"
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
                if (pct < 100) {
                  return (
                    <Chip
                      label="Trên 50%"
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
                    label="Đủ"
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
      </Box>
    </Box>
  )
}

WarehouseDetailView.propTypes = {
  item: PropTypes.object,
  onBack: PropTypes.func.isRequired,
  onQuickOrder: PropTypes.func,
}
