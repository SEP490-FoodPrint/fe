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
} from "@mui/material"
import {
  ArrowLeft,
  Send,
  Package,
} from "lucide-react"
import styles from "./CreateDryOrderView.module.scss"

export default function CreateDryOrderView({
  inventoryItems = [],
  suppliers = [],
  initialSelectedItem = null,
  onBack,
  onSubmit,
}) {
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().slice(0, 10)
  })
  const [deliveryTime, setDeliveryTime] = useState("14:30")
  const [note, setNote] = useState("Giao tại kho khô, kiểm tra kỹ tem niêm phong và bao bì đóng gói.")
  const [orderQtys, setOrderQtys] = useState({})
  const [itemSuppliers, setItemSuppliers] = useState({})

  // 1. Tổng hợp danh sách tất cả NCC liên kết trong hệ thống
  const allSuppliers = useMemo(() => {
    const list = [...suppliers]
    const existingIds = new Set(list.map(s => s.id))
    const existingNames = new Set(list.map(s => s.name?.toLowerCase().trim()))

    inventoryItems.forEach(it => {
      if (it.supplierId && !existingIds.has(it.supplierId)) {
        existingIds.add(it.supplierId)
        list.push({
          id: it.supplierId,
          name: it.supplierName || "Nhà cung cấp đối tác",
          phone: it.supplierPhone || "",
        })
      } else if (it.supplierName && !existingNames.has(it.supplierName.toLowerCase().trim())) {
        existingNames.add(it.supplierName.toLowerCase().trim())
        const genId = it.supplierId || `sup-${it.supplierName.replace(/\s+/g, "-").toLowerCase()}`
        list.push({
          id: genId,
          name: it.supplierName,
          phone: it.supplierPhone || "",
        })
      }
    })
    return list
  }, [suppliers, inventoryItems])

  // 2. Kiểm tra xem một NCC có cung cấp mặt hàng này không
  const isSupplierAvailableForItem = (supplier, item) => {
    if (!supplier || !item) return false

    // 2.1 Kiểm tra qua mảng availableSupplierIds do adapter trích xuất từ database
    if (Array.isArray(item.availableSupplierIds) && item.availableSupplierIds.length > 0) {
      if (item.availableSupplierIds.includes(supplier.id)) return true
    }

    // 2.2 Trực tiếp khớp ID nhà cung cấp chính của mặt hàng
    if (item.supplierId && item.supplierId === supplier.id) return true

    // 2.3 Khớp tên NCC của mặt hàng với tên của supplier
    if (item.supplierName && supplier.name) {
      const a = item.supplierName.trim().toLowerCase()
      const b = supplier.name.trim().toLowerCase()
      if (a === b || a.includes(b) || b.includes(a)) return true
    }

    // 2.4 Kiểm tra trong toàn bộ inventoryItems xem có mặt hàng cùng tên nào do NCC này cấp không
    const normName = (item.name || "").trim().toLowerCase()
    const matchSameName = inventoryItems.some(it => {
      const itNorm = (it.name || "").trim().toLowerCase()
      const isSameName =
        itNorm === normName ||
        (itNorm && normName && (itNorm.includes(normName) || normName.includes(itNorm)))
      if (!isSameName) return false
      if (it.supplierId === supplier.id) return true
      if (Array.isArray(it.availableSupplierIds) && it.availableSupplierIds.includes(supplier.id)) return true
      if (it.supplierName && supplier.name) {
        const sA = it.supplierName.trim().toLowerCase()
        const sB = supplier.name.trim().toLowerCase()
        if (sA === sB || sA.includes(sB) || sB.includes(sA)) return true
      }
      return false
    })
    if (matchSameName) return true

    // 2.5 Kiểm tra trong các lô hàng (lots) đã từng nhập của món đó
    if (Array.isArray(item.lots) && item.lots.length > 0) {
      const matchLot = item.lots.some(l => {
        if (l.supplierId === supplier.id) return true
        if (l.supplierName && supplier.name) {
          const lA = l.supplierName.trim().toLowerCase()
          const lB = supplier.name.trim().toLowerCase()
          return lA === lB || lA.includes(lB) || lB.includes(lA)
        }
        return false
      })
      if (matchLot) return true
    }

    return false
  }

  // 3. Khởi tạo NCC mặc định cho từng mặt hàng (chọn NCC đang có hàng)
  useEffect(() => {
    const defaultSupMap = {}
    inventoryItems.forEach(it => {
      // Tìm NCC khả dụng đầu tiên có mặt hàng này
      const matched = allSuppliers.find(s => isSupplierAvailableForItem(s, it))
      defaultSupMap[it.id] = matched?.id || it.supplierId || (allSuppliers[0]?.id || "")
    })
    setItemSuppliers(defaultSupMap)
  }, [inventoryItems, allSuppliers])

  // 4. Khởi tạo số lượng mặt hàng (ưu tiên món được chỉ định hoặc các món dưới mức an toàn)
  useEffect(() => {
    if (initialSelectedItem) {
      setOrderQtys({
        [initialSelectedItem.id]: Math.max(1, Number(initialSelectedItem.safetyStock) || 1),
      })
    } else {
      const initial = {}
      inventoryItems
        .filter(it => it.currentStock < it.safetyStock)
        .forEach(it => {
          initial[it.id] = Math.max(1, Number(it.safetyStock) || 1)
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
        next[item.id] = Math.max(1, Number(item.safetyStock) || 1)
      }
      return next
    })
  }

  const handleQtyChange = (itemId, val) => {
    const num = Math.max(1, Number(val) || 1)
    setOrderQtys(prev => ({ ...prev, [itemId]: num }))
  }

  // Đổi NCC cho riêng từng mặt hàng
  const handleItemSupplierChange = (itemId, newSupId) => {
    setItemSuppliers(prev => ({
      ...prev,
      [itemId]: newSupId,
    }))
  }

  const selectedCount = useMemo(() => {
    return Object.keys(orderQtys).filter(id => orderQtys[id] > 0).length
  }, [orderQtys])

  const totalEstimatedAmount = useMemo(() => {
    return Object.entries(orderQtys).reduce((sum, [id, qty]) => {
      const it = inventoryItems.find(item => item.id === id)
      return sum + (it?.unitPrice || 0) * qty
    }, 0)
  }, [orderQtys, inventoryItems])

  // Đếm số lượng NCC khác nhau trong các mặt hàng đã chọn
  const selectedSuppliersCount = useMemo(() => {
    const supNames = new Set()
    Object.keys(orderQtys).forEach(id => {
      if (orderQtys[id] > 0) {
        const it = inventoryItems.find(item => item.id === id)
        const name = it?.supplierName || "Nhà cung cấp đối tác"
        supNames.add(name)
      }
    })
    return supNames.size
  }, [orderQtys, inventoryItems])

  const handleSubmit = () => {
    // 1. Tổng hợp tất cả các mặt hàng được chọn kèm NCC tương ứng
    const allSelectedItems = []

    Object.entries(orderQtys).forEach(([id, qty]) => {
      if (qty <= 0) return
      const it = inventoryItems.find(item => item.id === id)
      if (!it) return

      // Ưu tiên NCC gốc của mặt hàng trong kho
      const matchedSup =
        allSuppliers.find(s => s.id === it.supplierId) ||
        allSuppliers.find(s => isSupplierAvailableForItem(s, it))
      const supId =
        it.supplierId ||
        matchedSup?.id ||
        `sup-${(it.supplierName || "default").replace(/\s+/g, "-").toLowerCase()}`
      const supName = it.supplierName || matchedSup?.name || "Nhà cung cấp đối tác"
      const supPhone = it.supplierPhone || matchedSup?.phone || ""

      allSelectedItems.push({
        id: it.id,
        name: it.name,
        qty,
        unit: it.unit || "kg",
        price: it.unitPrice || 0,
        supplierId: supId,
        supplierName: supName,
        supplierPhone: supPhone,
      })
    })

    if (allSelectedItems.length === 0) return

    // 2. Xác định nhãn hiển thị thời gian giao
    const hour = parseInt(deliveryTime.split(":")[0], 10) || 0
    let deliveryType = "OFFICE_HOURS"
    let deliveryTypeLabel = `Hẹn lúc ${deliveryTime}`

    if (hour >= 18) {
      deliveryType = "EVENING"
      deliveryTypeLabel = `Buổi tối (${deliveryTime})`
    } else if (hour >= 12) {
      deliveryType = "AFTERNOON"
      deliveryTypeLabel = `Buổi chiều (${deliveryTime})`
    } else if (hour >= 6) {
      deliveryType = "MORNING"
      deliveryTypeLabel = `Buổi sáng (${deliveryTime})`
    }

    const uniqueSuppliers = Array.from(
      new Set(allSelectedItems.map(it => it.supplierName).filter(Boolean))
    )
    const primarySupplierName =
      uniqueSuppliers.length === 1
        ? uniqueSuppliers[0]
        : uniqueSuppliers.join(", ")
    const totalAmount = allSelectedItems.reduce(
      (sum, it) => sum + it.price * it.qty,
      0
    )

    // 3. Tạo 1 Phiếu nhập hàng duy nhất của trường, bên trong chứa đầy đủ các NCC giao gì
    const orderToCreate = {
      id: `po-dry-${Date.now()}`,
      orderNo: `PO-DRY-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-0${Math.floor(Math.random() * 90 + 10)}`,
      deliveryNo: `PNK-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-0${Math.floor(Math.random() * 90 + 10)}`,
      supplierId: allSelectedItems[0]?.supplierId || "",
      supplierName: primarySupplierName,
      suppliers: uniqueSuppliers,
      supplierPhone: allSelectedItems[0]?.supplierPhone || "",
      orderDate: `${new Date().toLocaleDateString("vi-VN")} ${new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`,
      deliveryDate,
      deliveryTime,
      deliverySchedule: `${deliveryTime} - Ngày ${deliveryDate}`,
      deliveryType,
      deliveryTypeLabel,
      totalItems: allSelectedItems.length,
      totalAmount,
      status: "CREATED",
      statusLabel: "Chờ NCC xác nhận",
      note,
      items: allSelectedItems,
    }

    onSubmit(orderToCreate)
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
            Tạo Yêu Cầu Nhập Đồ Khô
          </Typography>
        </Box>
      </Box>

      {/* 2. Card Thông tin Thời gian giao hàng & Ghi chú (Mục 1) */}
      <Paper className={styles.formCard} elevation={0}>
        <Typography variant="subtitle1" className={styles.sectionTitle}>
          1. Thời gian giao hàng hẹn trước &amp; Ghi chú
        </Typography>

        <Box className={styles.formGrid}>
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
              onChange={e => setDeliveryTime(e.target.value)}
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

      {/* 3. Card Chọn danh sách nguyên liệu nhập (Mục 2 - Hiện tất cả nguyên liệu + Cột NCC có select) */}
      <Paper className={styles.formCard} elevation={0}>
        <Box className={styles.tableHeaderBar}>
          <Typography variant="subtitle1" className={styles.sectionTitle}>
            2. Danh sách gạo &amp; gia vị cần nhập ({selectedCount} món đã chọn)
          </Typography>
        </Box>

        <Box className={styles.tableWrap}>
          <Table size="small">
            <TableHead className={styles.tableHead}>
              <TableRow>
                <TableCell padding="checkbox">Chọn</TableCell>
                <TableCell style={{ minWidth: 200 }}>Tên &amp; Loại nguyên liệu</TableCell>
                <TableCell align="center" style={{ minWidth: 150 }}>Tồn kho / Mức an toàn</TableCell>
                <TableCell align="center" style={{ width: 140 }}>Số lượng nhập</TableCell>
                <TableCell style={{ minWidth: 240 }}>Nhà cung cấp (NCC)</TableCell>
                <TableCell align="right" style={{ minWidth: 100 }}>Đơn giá</TableCell>
                <TableCell align="right" style={{ minWidth: 120 }}>Thành tiền</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventoryItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Không có mặt hàng đồ khô nào trong kho.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                inventoryItems.map(item => {
                  const isSelected = Boolean(orderQtys[item.id])
                  const qty = orderQtys[item.id] || 0
                  const stockPct = Math.round((item.currentStock / item.safetyStock) * 100)
                  const lineTotal = (item.unitPrice || 0) * qty
                  const matchedSup = allSuppliers.find(s => isSupplierAvailableForItem(s, item)) || allSuppliers.find(s => s.id === item.supplierId)
                  const supplierDisplayName = item.supplierName || matchedSup?.name || "Nhà cung cấp đối tác"
                  const supplierPhone = item.supplierPhone || matchedSup?.phone

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
                        {item.category && (
                          <Box className={styles.tableItemMeta}>
                            <Chip label={item.category} size="small" className={styles.catChip} />
                          </Box>
                        )}
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

                      {/* Cột Nhà cung cấp: Hiện luôn NCC nào đang có món hàng đó */}
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: isSelected ? "#0f172a" : "#64748b",
                            fontSize: "0.8125rem",
                          }}
                        >
                          {supplierDisplayName}
                        </Typography>
                        {supplierPhone && (
                          <Typography
                            variant="caption"
                            sx={{ color: "#64748b", display: "block", fontSize: "0.7rem" }}
                          >
                            Hotline: {supplierPhone}
                          </Typography>
                        )}
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
                })
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {/* 4. Footer Summary & Action Buttons */}
      <Box className={styles.footerWrap}>
        <Box className={styles.summaryBadges}>
          <Chip
            icon={<Package size={16} />}
            label={`${selectedCount} mặt hàng gạo & gia vị`}
            color="primary"
            variant="outlined"
            className={styles.countBadge}
          />
          {selectedSuppliersCount > 0 && (
            <Chip
              label={`${selectedSuppliersCount} Nhà cung cấp`}
              color="default"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          )}
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
            Tạo
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

CreateDryOrderView.propTypes = {
  inventoryItems: PropTypes.array.isRequired,
  suppliers: PropTypes.array,
  initialSelectedItem: PropTypes.object,
  onBack: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
}
