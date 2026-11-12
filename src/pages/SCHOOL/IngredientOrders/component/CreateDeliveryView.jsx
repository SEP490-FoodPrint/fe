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
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  IconButton,
} from "@mui/material"
import {
  ArrowLeft,
  ChefHat,
  Sunrise,
  Users,
  Send,
  Package,
  Truck,
  Boxes,
  Flame,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Sparkles,
  CalendarCheck,
  Archive,
  Plus,
  Trash2,
} from "lucide-react"
import { MOCK_APPROVED_MENUS, MOCK_MASTER_INGREDIENT_CATALOG } from "../mockData"
import styles from "./CreateDeliveryView.module.scss"

/**
 * Kiểm tra đơn vị đếm được (nguyên quả, nguyên con, gói, chai...)
 * Không thể giao lẻ nửa đơn vị (ví dụ không giao 212.5 quả hay 215.5 quả)
 */
export const isDiscreteUnit = (unit = "") => {
  if (!unit) return false
  const u = String(unit).toLowerCase().trim()
  const discreteUnits = [
    "quả",
    "trứng",
    "hộp",
    "gói",
    "chai",
    "can",
    "lon",
    "hũ",
    "cái",
    "củ",
    "bắp",
    "ổ",
    "bó",
    "túi",
    "con",
  ]
  return discreteUnits.includes(u)
}

/**
 * Tính số lượng đợt: nếu đơn vị đếm được (trứng gà, quả...) thì tự động đẩy tròn lên (Math.ceil)
 * Ví dụ: 431 * 0.5 = 215.5 quả -> 216 quả; 425 * 0.5 = 212.5 quả -> 213 quả
 */
export const calcBatchQty = (qtyPerPortion, portions, unit = "") => {
  const raw = Number(qtyPerPortion) * Number(portions)
  if (isDiscreteUnit(unit)) {
    return Math.ceil(raw)
  }
  return Number(raw.toFixed(2))
}

export const calcQtyPerPortion = (batchQty, portions) => {
  if (!portions || portions <= 0) return 0
  return Number((Number(batchQty) / portions).toFixed(4))
}

export default function CreateDeliveryView({
  menus = [],
  deliveries = [],
  initialDate = "2026-10-27",
  onBack,
  onSubmitBatch1,
  onSubmitBatch2,
}) {
  const effectiveMenus = useMemo(() => {
    return Array.isArray(menus) && menus.length > 0 ? menus : MOCK_APPROVED_MENUS
  }, [menus])

  const [orderDate, setOrderDate] = useState(initialDate)
  const [selectedMenuId, setSelectedMenuId] = useState(() => effectiveMenus[0]?.id || "")
  const [note, setNote] = useState("Vận chuyển bằng xe lạnh chuyên dụng, kiểm tra niêm phong nhiệt độ.")
  const [submitting, setSubmitting] = useState(false)

  // Đồng bộ ngày khi initialDate thay đổi (ví dụ bấm Thêm Đợt 2 từ bảng)
  useEffect(() => {
    if (initialDate) {
      setOrderDate(initialDate)
      setActualAttendance("")
    }
  }, [initialDate])

  // Sĩ số GVCN báo cho Đợt 2 (mặc định để trống để test validate)
  const [actualAttendance, setActualAttendance] = useState("")

  // =========================================================================
  // TỰ ĐỘNG NHẬN DIỆN CHẾ ĐỘ THEO NGÀY (VALIDATE THEO ORDER_DATE)
  // =========================================================================
  const { mode, batch1ForDate, batch2ForDate } = useMemo(() => {
    const forDate = deliveries.filter(d => d.deliveryDate === orderDate)
    const b1 = forDate.find(d => d.batchType === "BATCH_1")
    const b2 = forDate.find(d => d.batchType === "BATCH_2")

    const rejectCount = Object.values(b1?.approvals || {}).filter(a => a?.approved === false).length
    const b1Failed = b1 && (b1.status === "CANCELLED" || b1.status === "REJECTED" || rejectCount >= 2)

    let m = "BATCH_1"
    if (b1 && b2) {
      m = "COMPLETED"
    } else if (b1 && b1Failed) {
      m = "BATCH_1_CANCELLED"
    } else if (b1 && !b2) {
      m = "BATCH_2"
    } else {
      m = "BATCH_1"
    }

    return { mode: m, batch1ForDate: b1, batch2ForDate: b2 }
  }, [deliveries, orderDate])

  // Menu áp dụng
  const currentMenu = useMemo(() => {
    if (mode === "BATCH_2" && batch1ForDate) {
      return effectiveMenus.find(m => m.id === batch1ForDate.menuId) || effectiveMenus[0]
    }
    return effectiveMenus.find(m => m.id === selectedMenuId) || effectiveMenus[0]
  }, [effectiveMenus, selectedMenuId, mode, batch1ForDate])

  const maxPortions = currentMenu?.maxPortions || 850
  const batch1Portions = Math.floor(maxPortions / 2) // 50%

  // Tính số suất giao bù ở Đợt 2
  const parsedAttendance = Number(actualAttendance) || 0
  const remainingPortions =
    parsedAttendance > 0 ? Math.max(0, parsedAttendance - batch1Portions) : maxPortions - batch1Portions

  // Nguyên liệu tươi sống (DIRECT_USE)
  const freshIngredients = useMemo(() => {
    return currentMenu?.ingredients?.filter(it => it.handlingType === "DIRECT_USE") || []
  }, [currentMenu])

  // Quản lý danh sách nguyên liệu và định lượng/số lượng tùy chỉnh 2 chiều
  const [itemsState, setItemsState] = useState([])

  // State Modal thêm nguyên liệu giao thêm
  const [openAddModal, setOpenAddModal] = useState(false)
  const [selectedIngredient, setSelectedIngredient] = useState(null)
  const [extraQtyInput, setExtraQtyInput] = useState("")

  // Khởi tạo itemsState khi đổi menu, đổi ngày (hoặc đổi mode Đợt 1 / Đợt 2)
  useEffect(() => {
    if (!currentMenu) return

    const fresh = currentMenu.ingredients?.filter(it => it.handlingType === "DIRECT_USE") || []
    const portions = mode === "BATCH_1" ? batch1Portions : (parsedAttendance > 0 ? remainingPortions : batch1Portions)

    const initialItems = fresh.map(ing => {
      let portionRate = ing.qtyPerPortion

      // Nếu là Đợt 2: Kế thừa định lượng/suất từ Đợt 1 nếu Đợt 1 đã có
      if (mode === "BATCH_2" && batch1ForDate) {
        const b1Item = batch1ForDate.items?.find(
          b => (b.ingredientId && b.ingredientId === ing.id) || b.ingredientName === ing.name
        )
        if (b1Item) {
          if (typeof b1Item.qtyPerPortion === "number" && b1Item.qtyPerPortion > 0) {
            portionRate = b1Item.qtyPerPortion
          } else if (b1Item.orderedQty && batch1ForDate.plannedPortions) {
            portionRate = Number((b1Item.orderedQty / batch1ForDate.plannedPortions).toFixed(4))
          }
        }
      }

      // Tự động đẩy tròn lên (Math.ceil) cho các đơn vị đếm được như quả, trứng...
      const calculatedBatchQty = calcBatchQty(portionRate, portions, ing.unit)

      return {
        id: ing.id,
        name: ing.name,
        category: ing.category,
        unit: ing.unit,
        supplierId: ing.supplierId,
        supplierName: ing.supplierName,
        defaultQtyPerPortion: ing.qtyPerPortion,
        qtyPerPortion: portionRate,
        portionInput: String(portionRate),
        batchQty: calculatedBatchQty,
        batchQtyInput: String(calculatedBatchQty),
        isExtra: false,
      }
    })

    setItemsState(initialItems)
  }, [currentMenu, mode, batch1ForDate, batch1Portions])

  // Cập nhật lại số lượng Đợt 2 khi GVCN cập nhật Sĩ số (dựa trên định lượng đã kế thừa từ Đợt 1)
  useEffect(() => {
    if (mode !== "BATCH_2") return
    const portions = parsedAttendance > 0 ? remainingPortions : batch1Portions

    setItemsState(prev => {
      if (!prev || prev.length === 0) return prev
      return prev.map(item => {
        // Món giao thêm giữ nguyên số lượng đã thêm, không nhân lại theo suất
        if (item.isExtra) return item

        const newBatchQty = calcBatchQty(item.qtyPerPortion, portions, item.unit)
        return {
          ...item,
          batchQty: newBatchQty,
          batchQtyInput: String(newBatchQty),
        }
      })
    })
  }, [mode, parsedAttendance, remainingPortions, batch1Portions])

  // Thêm nguyên liệu giao thêm từ Catalog
  const handleAddExtraIngredient = () => {
    if (!selectedIngredient) return
    const num = parseFloat(extraQtyInput)
    if (isNaN(num) || num <= 0) return

    const unit = selectedIngredient.defaultUnit || selectedIngredient.unit || "kg"
    const isDiscrete = isDiscreteUnit(unit)
    const finalQty = isDiscrete ? Math.ceil(num) : Number(num.toFixed(2))

    setItemsState(prev => {
      const existingIdx = prev.findIndex(
        it => it.id === selectedIngredient.id || it.name.toLowerCase() === selectedIngredient.name.toLowerCase()
      )

      if (existingIdx !== -1) {
        // Đã có trong bảng -> cộng thêm số lượng
        const updated = [...prev]
        const currentQty = Number(updated[existingIdx].batchQty) || 0
        const totalQty = isDiscrete ? Math.ceil(currentQty + finalQty) : Number((currentQty + finalQty).toFixed(2))
        updated[existingIdx] = {
          ...updated[existingIdx],
          batchQty: totalQty,
          batchQtyInput: String(totalQty),
        }
        return updated
      }

      // Chưa có -> thêm dòng mới vào bảng
      const newItem = {
        id: selectedIngredient.id || `extra-${Date.now()}`,
        name: selectedIngredient.name,
        category: selectedIngredient.category || "Nguyên liệu",
        unit,
        supplierId: selectedIngredient.supplierId,
        supplierName: selectedIngredient.supplierName,
        handlingType: selectedIngredient.handlingType || "DIRECT_USE",
        isExtra: true,
        qtyPerPortion: 0,
        portionInput: "—",
        batchQty: finalQty,
        batchQtyInput: String(finalQty),
      }
      return [...prev, newItem]
    })

    setSelectedIngredient(null)
    setExtraQtyInput("")
    setOpenAddModal(false)
  }

  // Xóa nguyên liệu giao thêm khỏi bảng
  const handleRemoveExtraIngredient = id => {
    setItemsState(prev => prev.filter(it => it.id !== id))
  }

  // 1. Chỉnh sửa Định lượng trên 1 suất -> Tự động tính lại Số lượng đợt
  const handlePortionChange = (id, rawValue) => {
    const activeP = mode === "BATCH_1" ? batch1Portions : (parsedAttendance > 0 ? remainingPortions : batch1Portions)

    setItemsState(prev =>
      prev.map(item => {
        if (item.id !== id) return item
        const val = rawValue
        const num = parseFloat(val)

        if (!isNaN(num) && num > 0) {
          const newBatchQty = calcBatchQty(num, activeP, item.unit)
          return {
            ...item,
            portionInput: val,
            qtyPerPortion: num,
            batchQty: newBatchQty,
            batchQtyInput: String(newBatchQty),
          }
        }

        return {
          ...item,
          portionInput: val,
        }
      })
    )
  }

  // 2. Chỉnh sửa Số lượng đợt -> Tự động tính lại Định lượng trên 1 suất
  const handleBatchQtyChange = (id, rawValue) => {
    const activeP = mode === "BATCH_1" ? batch1Portions : (parsedAttendance > 0 ? remainingPortions : batch1Portions)

    setItemsState(prev =>
      prev.map(item => {
        if (item.id !== id) return item
        const val = rawValue

        // Nếu là hàng thêm ngoài (isExtra): chỉ cập nhật số lượng, không tính lại portion
        if (item.isExtra) {
          const num = parseFloat(val)
          if (!isNaN(num) && num > 0) {
            const finalBatchQty = isDiscreteUnit(item.unit) ? Math.round(num) : num
            return {
              ...item,
              batchQtyInput: val,
              batchQty: finalBatchQty,
            }
          }
          return {
            ...item,
            batchQtyInput: val,
          }
        }

        const num = parseFloat(val)
        if (!isNaN(num) && num > 0 && activeP > 0) {
          const finalBatchQty = isDiscreteUnit(item.unit) ? Math.round(num) : num
          const newPortion = calcQtyPerPortion(finalBatchQty, activeP)
          return {
            ...item,
            batchQtyInput: val,
            batchQty: finalBatchQty,
            qtyPerPortion: newPortion,
            portionInput: String(newPortion),
          }
        }

        return {
          ...item,
          batchQtyInput: val,
        }
      })
    )
  }

  const handlePortionBlur = id => {
    setItemsState(prev =>
      prev.map(item => {
        if (item.id !== id) return item
        const num = parseFloat(item.portionInput)
        if (isNaN(num) || num <= 0) {
          return {
            ...item,
            portionInput: String(item.qtyPerPortion),
          }
        }
        return item
      })
    )
  }

  const handleBatchQtyBlur = id => {
    setItemsState(prev =>
      prev.map(item => {
        if (item.id !== id) return item
        const num = parseFloat(item.batchQtyInput)
        if (isNaN(num) || num <= 0) {
          return {
            ...item,
            batchQtyInput: String(item.batchQty),
          }
        }
        const finalVal = isDiscreteUnit(item.unit) ? Math.round(num) : num
        return {
          ...item,
          batchQty: finalVal,
          batchQtyInput: String(finalVal),
        }
      })
    )
  }

  // Submit Đợt 1 (Chuyên biệt thực phẩm tươi sống trong ngày)
  const handleSubmitBatch1 = async () => {
    if (!currentMenu) return
    setSubmitting(true)
    try {
      await onSubmitBatch1({
        menuId: currentMenu.id,
        orderDate,
        note,
        items: itemsState.map(it => ({
          ingredientId: it.id,
          ingredientName: it.name,
          handlingType: it.handlingType || "DIRECT_USE",
          unit: it.unit,
          qtyPerPortion: it.qtyPerPortion || 0,
          orderedQty: it.batchQty,
          supplierId: it.supplierId,
          supplierName: it.supplierName,
          isCustomized: it.isCustomized || false,
          isExtra: it.isExtra || false,
          defaultQtyPerPortion: it.defaultQtyPerPortion,
        })),
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Submit Đợt 2
  const handleSubmitBatch2 = async () => {
    if (!batch1ForDate || parsedAttendance <= 0) return
    setSubmitting(true)
    try {
      await onSubmitBatch2({
        batch1DeliveryId: batch1ForDate.id,
        actualAttendance: parsedAttendance,
        orderDate,
        note,
        items: itemsState.map(it => ({
          ingredientId: it.id,
          ingredientName: it.name,
          handlingType: it.handlingType || "DIRECT_USE",
          unit: it.unit,
          qtyPerPortion: it.qtyPerPortion || 0,
          orderedQty: it.batchQty,
          supplierId: it.supplierId,
          supplierName: it.supplierName,
          isCustomized: it.isCustomized || false,
          isExtra: it.isExtra || false,
          defaultQtyPerPortion: it.defaultQtyPerPortion,
        })),
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box className={styles.container}>
      {/* 1. Header Navigation */}
      <Box className={styles.navHeader}>
        <Box className={styles.navLeft}>
          <Button
            startIcon={<ArrowLeft size={18} />}
            onClick={onBack}
            className={styles.backBtn}
            variant="outlined"
          >
            Quay lại danh sách
          </Button>

          <Box className={styles.titleInfo}>
            <Box className={styles.titleWithIcon}>
              <Typography variant="h5" className={styles.mainTitle}>
                {mode === "BATCH_1" && "Tạo Yêu Cầu Mua Hàng Đợt 1"}
                {mode === "BATCH_2" && "Tạo Đơn Giao Hàng Đợt 2"}
                {mode === "COMPLETED" && "Trạng Thái Đơn Hàng Theo Ngày"}
              </Typography>
            </Box>
          </Box>
        </Box>

      </Box>

      {/* 2. Thanh chọn Ngày giao & Thực đơn */}
      <Paper className={styles.formCard} elevation={0}>
        <Box className={styles.formRow}>
          <TextField
            type="date"
            label="Ngày áp dụng / Ngày giao hàng"
            value={orderDate}
            onChange={e => {
              setOrderDate(e.target.value)
              setActualAttendance("") // Reset sĩ số khi đổi ngày
            }}
            size="small"
            className={styles.dateInput}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          {mode === "BATCH_1" ? (
            <TextField
              select
              label="Thực đơn áp dụng (Đã duyệt)"
              value={selectedMenuId}
              onChange={e => setSelectedMenuId(e.target.value)}
              className={styles.menuSelect}
              size="small"
              fullWidth
            >
              {effectiveMenus.map(menu => (
                <MenuItem key={menu.id} value={menu.id}>
                  {menu.name} — {menu.targetScope} ({menu.maxPortions} suất chuẩn)
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField
              label="Thực đơn đã chọn"
              value={`${currentMenu?.name || ""} (${maxPortions} suất tối đa)`}
              size="small"
              disabled
              className={styles.menuSelect}
              fullWidth
            />
          )}
        </Box>
      </Paper>

      {/* =====================================================================
          CASE 3: NGÀY ĐÓ ĐÃ CÓ CẢ 2 ĐỢT (HOÀN TẤT)
          ===================================================================== */}
      {mode === "COMPLETED" && (
        <Paper className={styles.completedCard} elevation={0}>
          <Box className={styles.completedHeader}>
            <CalendarCheck size={36} className={styles.completedIcon} />
            <Box>
              <Typography variant="h6" className={styles.completedTitle}>
                Ngày {orderDate} Đã Hoàn Thành Lập Cả 2 Đợt Giao Hàng!
              </Typography>
              <Typography variant="body2" className={styles.completedDesc}>
                Đơn hàng đã được chia 2 đợt đầy đủ: Đợt 1 ({batch1ForDate?.plannedPortions} suất lúc 05:30) và Đợt 2 ({batch2ForDate?.plannedPortions} suất lúc 07:45 theo sĩ số GVCN).
              </Typography>
            </Box>
          </Box>

          <Box className={styles.completedActions}>
            <Button variant="outlined" onClick={onBack}>
              Quay lại danh sách phiếu
            </Button>
            <Button
              variant="contained"
              onClick={() => setOrderDate("2026-10-28")}
            >
              Chọn ngày tiếp theo (28/10/2026)
            </Button>
          </Box>
        </Paper>
      )}

      {/* =====================================================================
          CASE 4: ĐỢT 1 ĐÃ BỊ HỦY (TỪ 2 BÊN TỪ CHỐI TRỞ LÊN)
          ===================================================================== */}
      {mode === "BATCH_1_CANCELLED" && (
        <Paper className={styles.completedCard} elevation={0}>
          <Box className={styles.completedHeader}>
            <AlertTriangle size={36} color="#dc2626" />
            <Box>
              <Typography variant="h6" sx={{ color: "#dc2626", fontWeight: 700 }}>
                Đợt 1 Ngày {orderDate} Đã Bị Hủy Nghiệm Thu!
              </Typography>
              <Typography variant="body2" sx={{ color: "#475569", mt: 0.5 }}>
                Đợt 1 của ngày này đã bị từ chối từ 2 bên trở lên trong Hội đồng 4 bên nên đã hủy toàn bộ đơn. Không thể lập đơn giao hàng Đợt 2 khi Đợt 1 không được nghiệm thu đạt chuẩn.
              </Typography>
            </Box>
          </Box>

          <Box className={styles.completedActions}>
            <Button variant="outlined" onClick={onBack}>
              Quay lại danh sách phiếu
            </Button>
          </Box>
        </Paper>
      )}

      {/* =====================================================================
          CASE 1: TẠO ĐỢT 1 (CHƯA CÓ ĐỢT 1)
          ===================================================================== */}
      {mode === "BATCH_1" && (
        <>
          {/* Card tóm tắt Đợt 1 */}
          <Box className={styles.batch1SummaryCard}>
            <Box className={styles.batchCardHeader}>
              <Typography variant="subtitle1" className={styles.batchCardTitle}>
                Quy Chuẩn Giao Hàng Đợt 1: Cố Định 50% Suất Tối Đa
              </Typography>
            </Box>
            <Typography variant="h4" className={styles.batchPortionCount}>
              {batch1Portions} <span className={styles.portionTotal}>/ {maxPortions}</span>{" "}
              <span className={styles.portionUnit}>suất ăn</span>
            </Typography>
          </Box>

          {/* BẢNG 1: THỰC PHẨM TƯƠI SỐNG (ĐỢT 1: 50% SUẤT) */}
          <Paper className={styles.tableCard} elevation={0}>
            <Box className={styles.tableCardHeader}>
              <Box className={styles.tableTitleGroup}>
                <Box>
                  <Typography variant="subtitle1" className={styles.tableHeading}>
                    A. Thực Phẩm Tươi Sống Đợt 1 (50% Suất - Giao Sớm 05:30 Sáng)
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label={`${itemsState.length} mặt hàng`}
                  size="small"
                  className={styles.freshItemCountBadge}
                />
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Plus size={16} />}
                  onClick={() => setOpenAddModal(true)}
                  sx={{
                    borderColor: "#cbd5e1",
                    color: "#0f172a",
                    bgcolor: "#ffffff",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    "&:hover": { borderColor: "#94a3b8", bgcolor: "#f8fafc" },
                  }}
                >
                  + Thêm nguyên liệu
                </Button>
              </Box>
            </Box>

            <Box className={styles.tableWrapper}>
              <Table size="small" className={styles.ingTable}>
                <TableHead>
                  <TableRow className={styles.tableHeaderRow}>
                    <TableCell>Tên thực phẩm</TableCell>
                    <TableCell>Phân loại</TableCell>
                    <TableCell align="center" style={{ width: 160 }}>
                      Định lượng / 1 Suất
                    </TableCell>
                    <TableCell align="right" className={styles.batch1Col} style={{ width: 175 }}>
                      Số lượng Đợt 1 ({batch1Portions} suất - 50%)
                    </TableCell>
                    <TableCell>Nhà cung cấp đối tác</TableCell>
                    <TableCell align="center" style={{ width: 60 }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {itemsState.map(ing => {
                    const isDiscrete = isDiscreteUnit(ing.unit)

                    return (
                      <TableRow key={ing.id} hover className={styles.tableRow}>
                        <TableCell>
                          <Typography variant="subtitle2" className={styles.ingName}>
                            {ing.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={ing.handlingType === "DRY_STOCK" ? "Kho khô" : "Tươi sống (Dùng ngay)"}
                            size="small"
                            className={styles.freshChip}
                          />
                        </TableCell>

                        {/* Cột 1: Định lượng / 1 Suất (Chỉnh sửa 2 chiều, hoặc — nếu là món thêm ngoài) */}
                        <TableCell align="center">
                          {ing.isExtra && ing.portionInput === "—" ? (
                            <Typography variant="body2" sx={{ color: "#94a3b8", fontWeight: 500 }}>
                              —
                            </Typography>
                          ) : (
                            <Box className={styles.editableCellWrap}>
                              <TextField
                                type="number"
                                size="small"
                                value={ing.portionInput}
                                onChange={e => handlePortionChange(ing.id, e.target.value)}
                                onBlur={() => handlePortionBlur(ing.id)}
                                className={styles.cellInput}
                                slotProps={{
                                  htmlInput: {
                                    step: "0.001",
                                    min: "0.001",
                                    style: { textAlign: "right", padding: "6px 8px" },
                                  },
                                  input: {
                                    endAdornment: (
                                      <span className={styles.inputAdornment}>
                                        {ing.unit}/suất
                                      </span>
                                    ),
                                  },
                                }}
                              />
                            </Box>
                          )}
                        </TableCell>

                        {/* Cột 2: Số lượng Đợt 1 (Chỉnh sửa 2 chiều, tự đẩy tròn lên cho trứng, quả...) */}
                        <TableCell align="right" className={styles.batch1Cell}>
                          <Box className={styles.editableCellWrapRight}>
                            <TextField
                              type="number"
                              size="small"
                              value={ing.batchQtyInput}
                              onChange={e => handleBatchQtyChange(ing.id, e.target.value)}
                              onBlur={() => handleBatchQtyBlur(ing.id)}
                              className={`${styles.cellInput} ${styles.batch1CellInput}`}
                              slotProps={{
                                htmlInput: {
                                  step: isDiscrete ? "1" : "0.01",
                                  min: isDiscrete ? "1" : "0.01",
                                  style: { textAlign: "right", padding: "6px 8px", fontWeight: 700 },
                                },
                                input: {
                                  endAdornment: (
                                    <span className={styles.inputAdornment}>
                                      {ing.unit}
                                    </span>
                                  ),
                                },
                              }}
                            />
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" className={styles.supplierText}>
                            {ing.supplierName}
                          </Typography>
                        </TableCell>

                        {/* Cột thao tác xóa nếu là hàng giao thêm ngoài */}
                        <TableCell align="center">
                          {ing.isExtra ? (
                            <Tooltip title="Xóa món giao thêm" arrow>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveExtraIngredient(ing.id)}
                                sx={{ p: 0.5 }}
                              >
                                <Trash2 size={16} />
                              </IconButton>
                            </Tooltip>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Box>
          </Paper>

          {/* Ghi chú & Footer Submit Đợt 1 */}
          <Paper className={styles.noteCard} elevation={0}>
            <TextField
              label="Ghi chú đơn hàng Đợt 1 gửi Nhà cung cấp"
              value={note}
              onChange={e => setNote(e.target.value)}
              multiline
              rows={2}
              fullWidth
              size="small"
              placeholder="Ghi chú về kiểm dịch, niêm phong xe lạnh..."
            />
          </Paper>

          <Box className={styles.footerWrap}>
            <Box className={styles.summaryBadges}>
              <Chip
                label={`${freshIngredients.length} mặt hàng tươi sống (100% Đồ tươi Đợt 1)`}
                size="small"
                className={styles.summaryFreshBadge}
              />
            </Box>

            <Box className={styles.footerActions}>
              <Button onClick={onBack} variant="outlined" color="inherit">
                Hủy bỏ
              </Button>
              <Button
                onClick={handleSubmitBatch1}
                variant="contained"
                startIcon={<Send size={18} />}
                disabled={submitting}
                className={styles.submitBtn}
              >
                {submitting ? "Đang gửi..." : "Tạo đơn mua hàng Đợt 1 & Gửi NCC"}
              </Button>
            </Box>
          </Box>
        </>
      )}

      {/* =====================================================================
          CASE 2: ĐÃ CÓ ĐỢT 1 -> TỰ ĐỘNG CHUYỂN SANG FORM TẠO ĐỢT 2
          ===================================================================== */}
      {mode === "BATCH_2" && (
        <>

          {/* KHỐI ĐIỂM DANH & CHỐT SĨ SỐ GVCN (ĐIỀU KIỆN TIÊN QUYẾT ĐỂ CHỐT ĐỢT 2) */}
          <Paper className={styles.attendanceCard} elevation={0}>
            <Box className={styles.attendanceHeader}>
              <Box className={styles.attendanceTitleGroup}>
                <Users size={22} className={styles.attendanceIcon} />
                <Box>
                  <Typography variant="subtitle1" className={styles.attendanceHeading}>
                    Cập Nhật Sĩ Số Học Sinh Từ Giáo Viên Chủ Nhiệm (GVCN)
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box className={styles.attendanceBody}>
              <Box className={styles.attendanceInputRow}>
                <TextField
                  type="number"
                  label="Sĩ số thực tế GVCN báo sáng (Học sinh)"
                  placeholder="Nhập sĩ số điểm danh..."
                  value={actualAttendance}
                  onChange={e => setActualAttendance(e.target.value)}
                  size="small"
                  className={styles.attendanceInput}
                  slotProps={{
                    htmlInput: { min: batch1Portions, max: maxPortions },
                  }}
                />

                <Box className={styles.attendanceFormula}>
                  <Box className={styles.formulaItem}>
                    <Typography variant="caption" color="text.secondary">
                      Suất tối đa:
                    </Typography>
                    <Typography variant="subtitle2">{maxPortions} suất</Typography>
                  </Box>
                  <Typography variant="h6" color="text.secondary">
                    -
                  </Typography>
                  <Box className={styles.formulaItem}>
                    <Typography variant="caption" color="text.secondary">
                      Đợt 1 đã nhận:
                    </Typography>
                    <Typography variant="subtitle2" color="primary">
                      {batch1Portions} suất
                    </Typography>
                  </Box>
                  <Typography variant="h6" color="text.secondary">
                    =
                  </Typography>
                  <Box className={styles.formulaItemResult}>
                    <Typography variant="caption" color="text.secondary">
                      Cần giao thêm Đợt 2:
                    </Typography>
                    <Typography variant="h6" className={styles.resultPortions}>
                      {parsedAttendance > 0 ? remainingPortions : "~425"} suất
                    </Typography>
                  </Box>
                </Box>
              </Box>

            </Box>
          </Paper>

          {/* BẢNG NGUYÊN LIỆU TƯƠI SỐNG ĐỢT 2 (BÊ NGUYÊN TỪ ĐỢT 1, KHÔNG CÓ ĐỒ KHÔ) */}
          <Paper className={styles.tableCard} elevation={0}>
            <Box className={styles.tableCardHeader}>
              <Box className={styles.tableTitleGroup}>
                <Package size={18} className={styles.tableIcon} />
                <Box>
                  <Typography variant="subtitle1" className={styles.tableHeading}>
                    Bảng Thực Phẩm Tươi Sống Đợt 2
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label={`Đợt 2: ${itemsState.length} mặt hàng`}
                  size="small"
                  color={parsedAttendance > 0 ? "warning" : "default"}
                />
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Plus size={16} />}
                  onClick={() => setOpenAddModal(true)}
                  sx={{
                    borderColor: "#cbd5e1",
                    color: "#0f172a",
                    bgcolor: "#ffffff",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    "&:hover": { borderColor: "#94a3b8", bgcolor: "#f8fafc" },
                  }}
                >
                  + Thêm nguyên liệu
                </Button>
              </Box>
            </Box>

            <Box className={styles.tableWrapper}>
              <Table size="small" className={styles.ingTable}>
                <TableHead>
                  <TableRow className={styles.tableHeaderRow}>
                    <TableCell>Tên thực phẩm</TableCell>
                    <TableCell>Phân loại</TableCell>
                    <TableCell align="center" style={{ width: 160 }}>
                      Định lượng / 1 Suất
                    </TableCell>
                    <TableCell align="right" className={styles.batch2Col} style={{ width: 175 }}>
                      Số lượng Đợt 2 ({parsedAttendance > 0 ? remainingPortions : 425} suất)
                    </TableCell>
                    <TableCell>Nhà cung cấp đối tác</TableCell>
                    <TableCell align="center" style={{ width: 60 }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {itemsState.map(ing => {
                    const isDiscrete = isDiscreteUnit(ing.unit)

                    return (
                      <TableRow key={ing.id} hover className={styles.tableRow}>
                        <TableCell>
                          <Typography variant="subtitle2" className={styles.ingName}>
                            {ing.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={ing.handlingType === "DRY_STOCK" ? "Kho khô" : "Tươi sống (Dùng ngay)"}
                            size="small"
                            className={styles.freshChip}
                          />
                        </TableCell>

                        {/* Cột 1: Định lượng / 1 Suất (Kế thừa từ Đợt 1, hoặc — nếu là món thêm ngoài) */}
                        <TableCell align="center">
                          {ing.isExtra && ing.portionInput === "—" ? (
                            <Typography variant="body2" sx={{ color: "#94a3b8", fontWeight: 500 }}>
                              —
                            </Typography>
                          ) : (
                            <Box className={styles.editableCellWrap}>
                              <TextField
                                type="number"
                                size="small"
                                value={ing.portionInput}
                                onChange={e => handlePortionChange(ing.id, e.target.value)}
                                onBlur={() => handlePortionBlur(ing.id)}
                                className={styles.cellInput}
                                slotProps={{
                                  htmlInput: {
                                    step: "0.001",
                                    min: "0.001",
                                    style: { textAlign: "right", padding: "6px 8px" },
                                  },
                                  input: {
                                    endAdornment: (
                                      <span className={styles.inputAdornment}>
                                        {ing.unit}/suất
                                      </span>
                                    ),
                                  },
                                }}
                              />
                            </Box>
                          )}
                        </TableCell>

                        {/* Cột 2: Số lượng Đợt 2 (Tự động nhân theo suất bù hoặc nhập số kg) */}
                        <TableCell align="right" className={styles.batch2Cell}>
                          <Box className={styles.editableCellWrapRight}>
                            <TextField
                              type="number"
                              size="small"
                              value={ing.batchQtyInput}
                              onChange={e => handleBatchQtyChange(ing.id, e.target.value)}
                              onBlur={() => handleBatchQtyBlur(ing.id)}
                              className={`${styles.cellInput} ${styles.batch2CellInput}`}
                              slotProps={{
                                htmlInput: {
                                  step: isDiscrete ? "1" : "0.01",
                                  min: isDiscrete ? "1" : "0.01",
                                  style: { textAlign: "right", padding: "6px 8px", fontWeight: 700 },
                                },
                                input: {
                                  endAdornment: (
                                    <span className={styles.inputAdornment}>
                                      {ing.unit}
                                    </span>
                                  ),
                                },
                              }}
                            />
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" className={styles.supplierText}>
                            {ing.supplierName}
                          </Typography>
                        </TableCell>

                        {/* Cột thao tác xóa nếu là hàng giao thêm ngoài */}
                        <TableCell align="center">
                          {ing.isExtra ? (
                            <Tooltip title="Xóa món giao thêm" arrow>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveExtraIngredient(ing.id)}
                                sx={{ p: 0.5 }}
                              >
                                <Trash2 size={16} />
                              </IconButton>
                            </Tooltip>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Box>
          </Paper>

          {/* Ghi chú & Footer Submit Đợt 2 */}
          <Paper className={styles.noteCard} elevation={0}>
            <TextField
              label="Ghi chú đơn giao hàng Đợt 2 gửi Nhà cung cấp"
              value={note}
              onChange={e => setNote(e.target.value)}
              multiline
              rows={2}
              fullWidth
              size="small"
              placeholder="Yêu cầu giao bù đúng 07:45 sáng, kiểm tra niêm phong xe lạnh..."
            />
          </Paper>

          <Box className={styles.footerWrap}>
            <Box className={styles.summaryBadges}>
              <Chip
                label={`${itemsState.length} mặt hàng (Đợt 2: ${parsedAttendance > 0 ? remainingPortions : 425} suất)`}
                size="small"
                className={styles.summaryFreshBadge}
              />
            </Box>

            <Box className={styles.footerActions}>
              <Button onClick={onBack} variant="outlined" color="inherit">
                Hủy bỏ
              </Button>

              {/* NÚT CHỐT ĐƠN ĐỢT 2: CHỈ BẤM ĐƯỢC KHI ĐÃ CÓ SĨ SỐ GVCN */}
              <Tooltip
                title={
                  parsedAttendance <= 0
                    ? "Nút bị khóa: Vui lòng nhập sĩ số GVCN báo để chốt đơn Đợt 2"
                    : ""
                }
              >
                <span>
                  <Button
                    onClick={handleSubmitBatch2}
                    variant="contained"
                    color="warning"
                    startIcon={<Send size={18} />}
                    disabled={submitting || parsedAttendance <= 0}
                    className={styles.submitBtnBatch2}
                  >
                    {submitting ? "Đang gửi..." : "Chốt đơn Đợt 2 & Gửi NCC"}
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </Box>
        </>
      )}

      {/* MODAL THÊM NGUYÊN LIỆU GIAO THÊM */}
      <Dialog
        open={openAddModal}
        onClose={() => {
          setOpenAddModal(false)
          setSelectedIngredient(null)
          setExtraQtyInput("")
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.05rem" }}>
          Thêm Nguyên Liệu Giao Thêm
        </DialogTitle>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Tìm chọn nguyên liệu trong danh mục chuẩn và nhập số lượng cần giao thêm cho đợt giao này.
          </Typography>

          <Autocomplete
            options={MOCK_MASTER_INGREDIENT_CATALOG}
            getOptionLabel={opt => `${opt.name} (${opt.category})`}
            value={selectedIngredient}
            onChange={(e, val) => {
              setSelectedIngredient(val)
              if (val) {
                const isDiscrete = isDiscreteUnit(val.defaultUnit || val.unit)
                setExtraQtyInput(isDiscrete ? "1" : "5")
              } else {
                setExtraQtyInput("")
              }
            }}
            renderInput={params => (
              <TextField
                {...params}
                label="Tìm & chọn nguyên liệu"
                placeholder="Nhập tên thịt, rau củ, quả, trứng, gia vị..."
                size="small"
                autoFocus
              />
            )}
            renderOption={(props, option) => {
              const { key, ...restProps } = props
              return (
                <li key={key || option.id} {...restProps}>
                  <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {option.name}
                      </Typography>
                      <Chip
                        label={option.defaultUnit || option.unit || "kg"}
                        size="small"
                        sx={{ fontSize: "0.7rem", height: 20 }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {option.category} • NCC: {option.supplierName}
                    </Typography>
                  </Box>
                </li>
              )
            }}
          />

          {selectedIngredient && (
            <Box sx={{ p: 1.5, bgcolor: "#f8fafc", borderRadius: 1.5, border: "1px solid #e2e8f0" }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                Thông tin đối tác cung cấp:
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                {selectedIngredient.supplierName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Phân loại: {selectedIngredient.handlingType === "DIRECT_USE" ? "Tươi sống (Dùng trong ngày)" : "Kho khô"} • Đơn vị: {selectedIngredient.defaultUnit || selectedIngredient.unit}
              </Typography>
            </Box>
          )}

          <TextField
            type="number"
            label="Số lượng cần giao thêm"
            value={extraQtyInput}
            onChange={e => setExtraQtyInput(e.target.value)}
            size="small"
            disabled={!selectedIngredient}
            slotProps={{
              htmlInput: {
                step: isDiscreteUnit(selectedIngredient?.defaultUnit || selectedIngredient?.unit) ? "1" : "0.01",
                min: isDiscreteUnit(selectedIngredient?.defaultUnit || selectedIngredient?.unit) ? "1" : "0.01",
                style: { fontWeight: 700 },
              },
              input: {
                endAdornment: (
                  <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600, ml: 1 }}>
                    {selectedIngredient?.defaultUnit || selectedIngredient?.unit || ""}
                  </Typography>
                ),
              },
            }}
            helperText={
              isDiscreteUnit(selectedIngredient?.defaultUnit || selectedIngredient?.unit)
                ? "Đơn vị đếm được (quả, hộp, gói...) sẽ tự động làm tròn thành số nguyên."
                : ""
            }
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => {
              setOpenAddModal(false)
              setSelectedIngredient(null)
              setExtraQtyInput("")
            }}
            variant="outlined"
            color="inherit"
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleAddExtraIngredient}
            variant="contained"
            disabled={!selectedIngredient || !extraQtyInput || Number(extraQtyInput) <= 0}
            sx={{ bgcolor: "#0f172a", "&:hover": { bgcolor: "#1e293b" } }}
          >
            Thêm vào bảng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

CreateDeliveryView.propTypes = {
  menus: PropTypes.array,
  deliveries: PropTypes.array,
  initialDate: PropTypes.string,
  onBack: PropTypes.func.isRequired,
  onSubmitBatch1: PropTypes.func.isRequired,
  onSubmitBatch2: PropTypes.func.isRequired,
}
