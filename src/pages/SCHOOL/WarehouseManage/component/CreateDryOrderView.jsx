import React, { useState, useMemo, useEffect } from "react"
import PropTypes from "prop-types"
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Checkbox,
  Alert,
} from "@mui/material"
import {
  ArrowLeft,
  Clock,
  Sun,
  Moon,
  Calendar,
  Sparkles,
  Send,
  Package,
} from "lucide-react"
import styles from "./CreateDryOrderView.module.scss"

export default function CreateDryOrderView({
  inventoryItems = [],
  initialSelectedItem = null,
  onBack,
  onSubmit,
}) {
  const [supplierId, setSupplierId] = useState("sup-kho-04")
  const [deliveryDate, setDeliveryDate] = useState("2026-10-29")
  const [deliveryTime, setDeliveryTime] = useState("14:30")
  const [timePreset, setTimePreset] = useState("CUSTOM")
  const [note, setNote] = useState("Giao tại kho khô, kiểm tra kỹ tem niêm phong và bao bì đóng gói.")
  const [orderQtys, setOrderQtys] = useState({})

  // Khởi tạo mặt hàng được chọn
  useEffect(() => {
    if (initialSelectedItem) {
      setOrderQtys({
        [initialSelectedItem.id]: Math.max(
          1,
          (initialSelectedItem.safetyStock - initialSelectedItem.currentStock) + initialSelectedItem.safetyStock
        ),
      })
    } else {
      // Tự động gợi ý các mặt hàng đang thiếu kho
      const initial = {}
      inventoryItems
        .filter(it => it.currentStock < it.safetyStock)
        .forEach(it => {
          initial[it.id] = (it.safetyStock - it.currentStock) + it.safetyStock
        })
      setOrderQtys(initial)
    }
  }, [initialSelectedItem, inventoryItems])

  const handleToggleItem = item => {
    setOrderQtys(prev => {
      const next = { ...prev }
      if (next[item.id]) {
        delete next[item.id]
      } else {
        const suggested = Math.max(
          1,
          (item.safetyStock - item.currentStock) + item.safetyStock
        )
        next[item.id] = suggested
      }
      return next
    })
  }

  const handleQtyChange = (itemId, val) => {
    const num = Math.max(1, Number(val) || 1)
    setOrderQtys(prev => ({ ...prev, [itemId]: num }))
  }

  const handleSelectAllLowStock = () => {
    const next = { ...orderQtys }
    inventoryItems
      .filter(it => it.currentStock < it.safetyStock)
      .forEach(it => {
        next[it.id] = next[it.id] || (it.safetyStock - it.currentStock) + it.safetyStock
      })
    setOrderQtys(next)
  }

  // Chọn nhanh khung giờ gợi ý (vẫn cho phép tự do chỉnh lại giờ bất kỳ)
  const handleSelectTimePreset = preset => {
    setTimePreset(preset)
    if (preset === "MORNING") {
      setDeliveryTime("09:00")
    } else if (preset === "AFTERNOON") {
      setDeliveryTime("14:30")
    } else if (preset === "EVENING") {
      setDeliveryTime("19:30")
    } else if (preset === "WEEKEND") {
      setDeliveryTime("08:30")
    }
  }

  const selectedCount = Object.keys(orderQtys).length

  const totalEstimatedAmount = useMemo(() => {
    return Object.entries(orderQtys).reduce((sum, [id, qty]) => {
      const it = inventoryItems.find(item => item.id === id)
      return sum + (it?.unitPrice || 0) * qty
    }, 0)
  }, [orderQtys, inventoryItems])

  const handleSubmit = () => {
    if (selectedCount === 0) return

    const selectedList = Object.entries(orderQtys).map(([id, qty]) => {
      const it = inventoryItems.find(item => item.id === id)
      return {
        name: it?.name || "Nguyên liệu",
        qty,
        unit: it?.unit || "gói",
        price: it?.unitPrice || 0,
      }
    })

    // Xác định nhãn hiển thị thời gian giao
    const hour = parseInt(deliveryTime.split(":")[0], 10) || 0
    let deliveryType = "CUSTOM"
    let deliveryTypeLabel = `Hẹn lúc ${deliveryTime}`

    if (timePreset === "WEEKEND") {
      deliveryType = "WEEKEND"
      deliveryTypeLabel = `Cuối tuần (${deliveryTime})`
    } else if (hour >= 18) {
      deliveryType = "EVENING"
      deliveryTypeLabel = `Buổi tối (${deliveryTime})`
    } else if (hour >= 12) {
      deliveryType = "OFFICE_HOURS"
      deliveryTypeLabel = `Buổi chiều (${deliveryTime})`
    } else if (hour >= 7) {
      deliveryType = "OFFICE_HOURS"
      deliveryTypeLabel = `Buổi sáng (${deliveryTime})`
    }

    const newOrder = {
      id: `po-dry-${Date.now()}`,
      orderNo: `PO-DRY-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-0${Math.floor(Math.random() * 90 + 10)}`,
      deliveryNo: `PNK-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-0${Math.floor(Math.random() * 90 + 10)}`,
      supplierName: "Tổng kho Lương thực & Gia vị Miền Bắc",
      supplierPhone: "0912 888 999",
      orderDate: `${new Date().toLocaleDateString("vi-VN")} ${new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`,
      deliverySchedule: `${deliveryTime} - Ngày ${deliveryDate}`,
      deliveryType,
      deliveryTypeLabel,
      totalItems: selectedCount,
      totalAmount: totalEstimatedAmount,
      status: "WAITING_DELIVERY",
      statusLabel: "Chờ NCC giao hàng",
      note,
      items: selectedList,
    }

    onSubmit(newOrder)
  }

  const lowStockItemsCount = inventoryItems.filter(it => it.currentStock < it.safetyStock).length

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
            Lập Phiếu Nhập Hàng Gạo &amp; Gia Vị
          </Typography>
          <Typography variant="body2" className={styles.subtitle}>
            Nhập bổ sung gạo, dầu ăn, gia vị lưu kho — Chủ động hẹn thời gian giao nhận theo nhu cầu của nhà trường
          </Typography>
        </Box>
      </Box>

      {/* 3. Card Thông tin Giao hàng & Nhà cung cấp */}
      <Paper className={styles.formCard} elevation={0}>
        <Typography variant="subtitle1" className={styles.sectionTitle}>
          1. Thông tin Nhà cung cấp &amp; Thời gian giao hàng hẹn trước
        </Typography>

        <Box className={styles.formGrid}>
          <TextField
            select
            label="Nhà cung cấp gạo & gia vị"
            value={supplierId}
            onChange={e => setSupplierId(e.target.value)}
            size="small"
            fullWidth
          >
            <MenuItem value="sup-kho-04">Tổng kho Lương thực &amp; Gia vị Miền Bắc (Hợp đồng cung ứng)</MenuItem>
          </TextField>

          {/* Gợi ý chọn nhanh khung giờ + Tự do nhập giờ bất kỳ */}
          <Box className={styles.scheduleBox}>
            <Box className={styles.presetHeader}>
              <Typography variant="caption" className={styles.fieldLabel}>
                Chọn giờ nhanh hoặc nhập bên dưới:
              </Typography>
            </Box>
            <Box className={styles.presetButtons}>
              <Chip
                label="Buổi sáng (09:00)"
                onClick={() => handleSelectTimePreset("MORNING")}
                color={timePreset === "MORNING" ? "primary" : "default"}
                variant={timePreset === "MORNING" ? "filled" : "outlined"}
                clickable
                size="small"
              />
              <Chip
                label="Buổi chiều (14:30)"
                onClick={() => handleSelectTimePreset("AFTERNOON")}
                color={timePreset === "AFTERNOON" ? "primary" : "default"}
                variant={timePreset === "AFTERNOON" ? "filled" : "outlined"}
                clickable
                size="small"
              />
              <Chip
                label="Buổi tối (19:30)"
                onClick={() => handleSelectTimePreset("EVENING")}
                color={timePreset === "EVENING" ? "primary" : "default"}
                variant={timePreset === "EVENING" ? "filled" : "outlined"}
                clickable
                size="small"
              />
              <Chip
                label="Cuối tuần (08:30)"
                onClick={() => handleSelectTimePreset("WEEKEND")}
                color={timePreset === "WEEKEND" ? "primary" : "default"}
                variant={timePreset === "WEEKEND" ? "filled" : "outlined"}
                clickable
                size="small"
              />
            </Box>
          </Box>

          <Box className={styles.dateRow}>
            <TextField
              label="Ngày giao dự kiến"
              type="date"
              value={deliveryDate}
              onChange={e => setDeliveryDate(e.target.value)}
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 200 }}
            />
            <TextField
              label="Giờ hẹn giao"
              type="time"
              value={deliveryTime}
              onChange={e => {
                setDeliveryTime(e.target.value)
                setTimePreset("CUSTOM")
              }}
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 200 }}
            />
          </Box>

          <TextField
            label="Ghi chú giao nhận cho thủ kho / bảo vệ"
            value={note}
            onChange={e => setNote(e.target.value)}
            multiline
            rows={2}
            size="small"
            fullWidth
            placeholder="Ví dụ: Xe giao vào cổng phụ, liên hệ thủ kho tiếp nhận..."
          />
        </Box>
      </Paper>

      {/* 4. Card Chọn danh sách nguyên liệu nhập */}
      <Paper className={styles.formCard} elevation={0}>
        <Box className={styles.tableHeaderBar}>
          <Box>
            <Typography variant="subtitle1" className={styles.sectionTitle}>
              2. Danh sách gạo &amp; gia vị cần nhập ({selectedCount} món đã chọn)
            </Typography>
          </Box>

        </Box>

        <Box className={styles.tableWrap}>
          <Table size="small">
            <TableHead className={styles.tableHead}>
              <TableRow>
                <TableCell padding="checkbox">Chọn</TableCell>
                <TableCell>Mã &amp; Tên nguyên liệu</TableCell>
                <TableCell align="center">Tồn kho / Mức an toàn</TableCell>
                <TableCell align="center" style={{ width: 170 }}>
                  Số lượng nhập
                </TableCell>
                <TableCell align="right">Đơn giá</TableCell>
                <TableCell align="right">Thành tiền</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventoryItems.map(item => {
                const isSelected = Boolean(orderQtys[item.id])
                const qty = orderQtys[item.id] || 0
                const stockPct = Math.round((item.currentStock / item.safetyStock) * 100)
                const isLow = stockPct < 100
                const deficitQty = item.safetyStock - item.currentStock
                const lineTotal = (item.unitPrice || 0) * qty

                return (
                  <TableRow
                    key={item.id}
                    hover
                    selected={isSelected}
                    className={isSelected ? styles.selectedRow : ""}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        size="small"
                        checked={isSelected}
                        onChange={() => handleToggleItem(item)}
                        color="primary"
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="subtitle2" className={styles.tableItemName}>
                        {item.name}
                      </Typography>
                      <Box className={styles.tableItemMeta}>
                        <span className={styles.tableCode}>{item.code}</span>
                        <Chip label={item.category} size="small" className={styles.catChip} />
                      </Box>
                    </TableCell>

                    <TableCell align="center">
                      <Typography
                        variant="body2"
                        className={
                          stockPct < 50
                            ? styles.lowStockAlert
                            : stockPct < 100
                              ? styles.warningStock
                              : styles.normalStock
                        }
                      >
                        {item.currentStock} / {item.safetyStock} {item.unit}
                      </Typography>
                      {stockPct < 50 ? (
                        <Chip
                          label="Dưới 50%"
                          size="small"
                          className={styles.miniAlertRed}
                        />
                      ) : stockPct < 100 ? (
                        <Chip
                          label="Trên 50%"
                          size="small"
                          className={styles.miniAlertYellow}
                        />
                      ) : (
                        <Chip
                          label="Đủ dùng"
                          size="small"
                          className={styles.miniAlertGreen}
                        />
                      )}
                    </TableCell>

                    <TableCell align="center">
                      <Box className={styles.qtyInputWrap}>
                        <TextField
                          type="number"
                          size="small"
                          value={qty}
                          onChange={e => handleQtyChange(item.id, e.target.value)}
                          disabled={!isSelected}
                          slotProps={{
                            htmlInput: { min: 1, style: { textAlign: "center", padding: "4px 8px" } },
                          }}
                          className={styles.qtyField}
                        />
                        <span className={styles.unitText}>{item.unit}</span>
                      </Box>
                    </TableCell>

                    <TableCell align="right">
                      <Typography variant="body2">
                        {item.unitPrice.toLocaleString("vi-VN")} đ
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Typography variant="subtitle2" className={styles.lineTotal}>
                        {isSelected ? `${lineTotal.toLocaleString("vi-VN")} đ` : "—"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {/* 5. Footer Summary & Action Buttons */}
      <Box className={styles.footerWrap}>
        <Box className={styles.summaryBadges}>
          <Chip
            icon={<Package size={16} />}
            label={`${selectedCount} mặt hàng gạo & gia vị`}
            color="primary"
            variant="outlined"
            className={styles.countBadge}
          />
          <Typography variant="subtitle1" className={styles.totalText}>
            Tổng tiền ước tính: <strong>{totalEstimatedAmount.toLocaleString("vi-VN")} đ</strong>
          </Typography>
        </Box>

        <Box className={styles.footerActions}>
          <Button onClick={onBack} variant="outlined" color="inherit">
            Hủy bỏ
          </Button>

          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            startIcon={<Send size={18} />}
            disabled={selectedCount === 0}
            className={styles.submitBtn}
          >
            Tạo phiếu nhập đồ khô &amp; Gửi NCC
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

CreateDryOrderView.propTypes = {
  inventoryItems: PropTypes.array.isRequired,
  initialSelectedItem: PropTypes.object,
  onBack: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
}
