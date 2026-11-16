import React, { useState, useMemo, useEffect, useCallback } from "react"
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
  TableContainer,
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
  RotateCcw,
  Eye,
  X,
  ChevronDown,
  ChevronUp,
  Layers,
} from "lucide-react"
import IngredientOrderService from "src/services/IngredientOrderService"
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
  initialDate = "2026-11-16",
  onBack,
  onSubmitBatch1,
  onSubmitBatch2,
}) {
  const effectiveMenus = useMemo(() => {
    return Array.isArray(menus) ? menus : []
  }, [menus])

  const [orderDate, setOrderDate] = useState(() => {
    if (initialDate) return String(initialDate).slice(0, 10)
    if (effectiveMenus[0]?.mealDate) return String(effectiveMenus[0].mealDate).slice(0, 10)
    return "2026-11-16"
  })
  const [selectedMenuId, setSelectedMenuId] = useState(() => effectiveMenus[0]?.id || "")
  const [note, setNote] = useState("Vận chuyển bằng xe lạnh chuyên dụng, kiểm tra niêm phong nhiệt độ.")
  const [submitting, setSubmitting] = useState(false)

  // Danh mục nguyên liệu chuẩn tải từ API thật cho modal thêm món ngoài
  const [catalogOptions, setCatalogOptions] = useState([])
  useEffect(() => {
    IngredientOrderService.getMasterIngredientCatalog().then(res => {
      if (Array.isArray(res?.items) && res.items.length > 0) {
        setCatalogOptions(res.items)
      }
    })
  }, [])

  // Đồng bộ ngày khi initialDate thay đổi (ví dụ bấm Thêm Đợt 2 từ bảng)
  useEffect(() => {
    if (initialDate) {
      setOrderDate(String(initialDate).slice(0, 10))
      setActualAttendance("")
    }
  }, [initialDate])

  // Sĩ số GVCN báo cho Đợt 2 (tự động đồng bộ từ API tổng hợp sĩ số của trường)
  const [actualAttendance, setActualAttendance] = useState("")
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [attendanceSummary, setAttendanceSummary] = useState(null)
  const [openClassDialog, setOpenClassDialog] = useState(false)

  const fetchAttendance = useCallback(async (targetDate) => {
    const d = targetDate || orderDate
    if (!d) return
    setAttendanceLoading(true)
    try {
      const summary = await IngredientOrderService.getDailyAttendanceSummary({
        date: d,
        mealType: "LUNCH",
      })
      if (summary) {
        setAttendanceSummary(summary)
        if (summary.totalPortions > 0) {
          setActualAttendance(String(summary.totalPortions))
        }
      }
    } catch (err) {
      console.warn("Lỗi đồng bộ sĩ số GVCN:", err)
    } finally {
      setAttendanceLoading(false)
    }
  }, [orderDate])

  // =========================================================================
  // TỰ ĐỘNG NHẬN DIỆN CHẾ ĐỘ THEO NGÀY (VALIDATE THEO ORDER_DATE)
  // =========================================================================
  const { mode, batch1ForDate, batch2ForDate } = useMemo(() => {
    const target = String(orderDate || "").slice(0, 10)
    const forDate = deliveries.filter(d => String(d.deliveryDate || "").slice(0, 10) === target)
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

  // Tự động đồng bộ sĩ số từ GVCN khi chuyển sang mode Đợt 2 hoặc đổi ngày
  useEffect(() => {
    if (mode === "BATCH_2") {
      fetchAttendance(orderDate)
    } else {
      setAttendanceSummary(null)
    }
  }, [mode, orderDate, fetchAttendance])

  // 1. Quét thực đơn áp dụng theo ngày chọn (Hỗ trợ 1 ngày có nhiều thực đơn)
  const matchingMenusForDate = useMemo(() => {
    if (!orderDate) return effectiveMenus
    const target = String(orderDate).slice(0, 10)
    const matches = effectiveMenus.filter(m => {
      const d1 = String(m.mealDate || "").slice(0, 10)
      const d2 = String(m.date || "").slice(0, 10)
      const d3 = String(m.weekStartDate || "").slice(0, 10)
      if (d1 === target || d2 === target || d3 === target) return true
      if (Array.isArray(m.days) && m.days.some(d => String(d.date || d.menuDate || "").slice(0, 10) === target)) return true
      if (Array.isArray(m.menuDays) && m.menuDays.some(d => String(d.menuDate || d.date || "").slice(0, 10) === target)) return true
      return false
    })
    return matches.length > 0 ? matches : effectiveMenus
  }, [effectiveMenus, orderDate])

  const isMultiMenuDate = matchingMenusForDate.length > 1

  // 2. Danh sách thực đơn hiệu lực (activeMenus)
  const activeMenus = useMemo(() => {
    if (mode === "BATCH_2" && batch1ForDate) {
      if (Array.isArray(batch1ForDate.menusSummary) && batch1ForDate.menusSummary.length > 1) {
        return batch1ForDate.menusSummary.map(ms => {
          const found = effectiveMenus.find(m => m.id === ms.id)
          return (
            found || {
              ...ms,
              mealDate: batch1ForDate.deliveryDate,
              ingredients: [],
            }
          )
        })
      }
      return [effectiveMenus.find(m => m.id === batch1ForDate.menuId) || effectiveMenus[0]].filter(Boolean)
    }

    if (isMultiMenuDate) {
      return matchingMenusForDate
    }

    if (matchingMenusForDate.length === 1) {
      return matchingMenusForDate
    }

    return [effectiveMenus.find(m => m.id === selectedMenuId) || effectiveMenus[0]].filter(Boolean)
  }, [mode, batch1ForDate, isMultiMenuDate, matchingMenusForDate, effectiveMenus, selectedMenuId])

  const isMultiMenu = activeMenus.length > 1

  // 3. Phân bổ suất Đợt 1 và Suất tối đa của từng thực đơn
  const menusPortionsMeta = useMemo(() => {
    return activeMenus.map((m, idx) => {
      const maxP = Number(m.maxPortions) || (isMultiMenu ? 400 : 850)
      const b1P = Math.floor(maxP / 2)
      let scope = m.targetScope
      if (
        !scope ||
        scope === "Khối lớp" ||
        scope === "Khối 1-5" ||
        scope.includes("Khối lớp 4-5 - Khối lớp 1-3") ||
        scope.includes("4-5 -") ||
        scope.includes("1-3 -")
      ) {
        if (m.name?.includes("1-3") || m.title?.includes("1-3")) {
          scope = "Khối 1-3"
        } else if (m.name?.includes("4-5") || m.title?.includes("4-5")) {
          scope = "Khối 4-5"
        } else if (isMultiMenu) {
          scope = idx === 0 ? "Khối 1-3" : "Khối 4-5"
        } else {
          scope = "Toàn trường"
        }
      }
      return {
        id: m.id,
        name: m.name,
        targetScope: scope,
        maxPortions: maxP,
        batch1Portions: b1P,
      }
    })
  }, [activeMenus, isMultiMenu])

  const totalMaxPortions = useMemo(() => {
    return menusPortionsMeta.reduce((sum, m) => sum + m.maxPortions, 0)
  }, [menusPortionsMeta])

  const totalBatch1Portions = useMemo(() => {
    return menusPortionsMeta.reduce((sum, m) => sum + m.batch1Portions, 0)
  }, [menusPortionsMeta])

  const currentMenu = activeMenus[0] || effectiveMenus[0]
  const maxPortions = totalMaxPortions
  const batch1Portions = totalBatch1Portions

  // State sĩ số theo khối và đóng mở xem chi tiết phân rã
  const [gradeAttendance, setGradeAttendance] = useState({})
  const [expandedRows, setExpandedRows] = useState({})

  const toggleExpandRow = id => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Tính số suất giao bù ở Đợt 2
  const parsedAttendance = Number(actualAttendance) || 0

  const remainingByMenu = useMemo(() => {
    const res = {}
    menusPortionsMeta.forEach(m => {
      let actual = gradeAttendance[m.id]
      if (typeof actual !== "number" || isNaN(actual)) {
        const ratio = totalMaxPortions > 0 ? m.maxPortions / totalMaxPortions : 0.5
        actual = Math.round(parsedAttendance * ratio)
      }
      const rem = Math.max(0, actual - m.batch1Portions)
      res[m.id] = {
        maxPortions: m.maxPortions,
        batch1Portions: m.batch1Portions,
        actual,
        remaining: rem,
        targetScope: m.targetScope,
      }
    })
    return res
  }, [menusPortionsMeta, gradeAttendance, parsedAttendance, totalMaxPortions])

  const remainingPortions = useMemo(() => {
    if (parsedAttendance <= 0) return 0
    if (!isMultiMenu) {
      return Math.max(0, parsedAttendance - totalBatch1Portions)
    }
    return Object.values(remainingByMenu).reduce((sum, v) => sum + v.remaining, 0)
  }, [parsedAttendance, isMultiMenu, totalBatch1Portions, remainingByMenu])

  // Quản lý danh sách nguyên liệu và định lượng/số lượng tùy chỉnh 2 chiều
  const [itemsState, setItemsState] = useState([])

  // State Modal thêm nguyên liệu giao thêm
  const [openAddModal, setOpenAddModal] = useState(false)
  const [selectedIngredient, setSelectedIngredient] = useState(null)
  const [extraQtyInput, setExtraQtyInput] = useState("")

  // Khởi tạo itemsState khi đổi menu, đổi ngày (hoặc đổi mode Đợt 1 / Đợt 2)
  // Tự động gộp nguyên liệu chung của các thực đơn và lưu cấu trúc breakdown
  useEffect(() => {
    if (!activeMenus || activeMenus.length === 0) return

    const groupedMap = new Map()

    activeMenus.forEach(menu => {
      const fresh = (menu.ingredients || []).filter(it => it.handlingType === "DIRECT_USE")
      const mPortions =
        mode === "BATCH_1"
          ? Math.floor((menu.maxPortions || 400) / 2)
          : (remainingByMenu[menu.id]?.remaining || 0)

      fresh.forEach(ing => {
        const key = (ing.name || "").trim().toLowerCase()
        if (!groupedMap.has(key)) {
          groupedMap.set(key, {
            id: ing.id,
            ingredientId: ing.ingredientId || ing.id,
            ingredientEntryId: ing.ingredientEntryId || ing.id,
            name: ing.name,
            category: ing.category,
            unit: ing.unit,
            supplierId: ing.supplierId,
            supplierName: ing.supplierName,
            handlingType: ing.handlingType || "DIRECT_USE",
            isExtraItem: false,
            defaultQtyPerPortion: ing.qtyPerPortion,
            qtyPerPortion: ing.qtyPerPortion,
            contributions: [],
          })
        }

        const entry = groupedMap.get(key)
        let rate = ing.qtyPerPortion

        // Kế thừa định lượng Đợt 1 nếu là Đợt 2
        if (mode === "BATCH_2" && batch1ForDate) {
          const b1Item = batch1ForDate.items?.find(
            b =>
              (b.ingredientId && b.ingredientId === ing.id) ||
              b.ingredientName?.trim().toLowerCase() === key
          )
          if (b1Item) {
            if (Array.isArray(b1Item.breakdown) && b1Item.breakdown.length > 0) {
              const bContr = b1Item.breakdown.find(bd => bd.menuId === menu.id)
              if (bContr?.qtyPerPortion) rate = bContr.qtyPerPortion
            } else if (typeof b1Item.qtyPerPortion === "number" && b1Item.qtyPerPortion > 0) {
              rate = b1Item.qtyPerPortion
            }
          }
        }

        let mScope = menu.targetScope
        if (!mScope || mScope === "Khối lớp") {
          if (menu.name?.includes("1-3") || menu.title?.includes("1-3")) mScope = "Khối 1-3"
          else if (menu.name?.includes("4-5") || menu.title?.includes("4-5")) mScope = "Khối 4-5"
          else if (Array.isArray(menu.gradeNames) && menu.gradeNames.length > 0) mScope = menu.gradeNames.join(" - ")
          else mScope = menu.name || "Khối lớp"
        }

        const calcContribution = Number((rate * mPortions).toFixed(2))
        entry.contributions.push({
          menuId: menu.id,
          menuName: menu.name,
          targetScope: mScope,
          qtyPerPortion: rate,
          portions: mPortions,
          calculatedQty: calcContribution,
          unit: ing.unit,
        })
      })
    })

    const initialItems = Array.from(groupedMap.values()).map(entry => {
      const isDiscrete = isDiscreteUnit(entry.unit)
      const rawSum = entry.contributions.reduce((acc, c) => acc + c.calculatedQty, 0)
      const stdQty = isDiscrete ? Math.ceil(rawSum) : Number(rawSum.toFixed(2))
      const isMulti = entry.contributions.length > 1

      const displayRate = isMulti
        ? entry.contributions.map(c => `${c.targetScope}: ${c.qtyPerPortion}`).join(" | ")
        : (entry.contributions[0]?.qtyPerPortion || entry.qtyPerPortion)

      return {
        id: entry.id,
        name: entry.name,
        category: entry.category,
        unit: entry.unit,
        supplierId: entry.supplierId,
        supplierName: entry.supplierName,
        handlingType: entry.handlingType,
        isExtraItem: false,
        isMultiMenu: isMulti,
        breakdown: entry.contributions,
        defaultQtyPerPortion: entry.defaultQtyPerPortion,
        qtyPerPortion: entry.contributions[0]?.qtyPerPortion || entry.qtyPerPortion,
        portionInput: String(entry.contributions[0]?.qtyPerPortion || entry.qtyPerPortion),
        displayRate,
        standardQty: stdQty,
        standardQtyInput: String(stdQty),
        extraQty: 0,
        extraQtyInput: "",
        batchQty: stdQty,
      }
    })

    setItemsState(initialItems)
  }, [activeMenus, mode, batch1ForDate, orderDate])

  // Cập nhật lại số lượng Đợt 2 khi GVCN cập nhật Sĩ số (dựa trên định lượng đã kế thừa từ Đợt 1)
  useEffect(() => {
    if (mode !== "BATCH_2") return

    setItemsState(prev => {
      if (!prev || prev.length === 0) return prev
      return prev.map(item => {
        if (item.isExtraItem) return item

        const isDiscrete = isDiscreteUnit(item.unit)
        let newStdQty = 0
        let newBreakdown = null

        if (Array.isArray(item.breakdown) && item.breakdown.length > 0) {
          newBreakdown = item.breakdown.map(bd => {
            const mRem = remainingByMenu[bd.menuId]?.remaining ?? 0
            const cQty = Number(((bd.qtyPerPortion || 0) * mRem).toFixed(2))
            return {
              ...bd,
              portions: mRem,
              calculatedQty: cQty,
            }
          })
          const rawSum = newBreakdown.reduce((acc, b) => acc + b.calculatedQty, 0)
          newStdQty = isDiscrete ? Math.ceil(rawSum) : Number(rawSum.toFixed(2))
        } else {
          newStdQty = calcBatchQty(item.qtyPerPortion, remainingPortions, item.unit)
        }

        const extra = Number(item.extraQty) || 0
        const total = isDiscrete ? Math.ceil(newStdQty + extra) : Number((newStdQty + extra).toFixed(2))

        return {
          ...item,
          breakdown: newBreakdown || item.breakdown,
          standardQty: newStdQty,
          standardQtyInput: String(newStdQty),
          batchQty: total,
        }
      })
    })
  }, [mode, parsedAttendance, remainingPortions, remainingByMenu])

  // Thêm nguyên liệu giao thêm từ Catalog Popup
  const handleAddExtraIngredient = () => {
    if (!selectedIngredient) return
    const num = parseFloat(extraQtyInput)
    if (isNaN(num) || num <= 0) return

    const unit = selectedIngredient.defaultUnit || selectedIngredient.unit || "kg"
    const isDiscrete = isDiscreteUnit(unit)
    const addQty = isDiscrete ? Math.ceil(num) : Number(num.toFixed(2))

    setItemsState(prev => {
      // 1. Nếu nguyên liệu đã có sẵn trong bảng thực phẩm -> Điền vào cột "Giao thêm" riêng biệt
      const existingIdx = prev.findIndex(
        it => it.id === selectedIngredient.id || it.name.toLowerCase() === selectedIngredient.name.toLowerCase()
      )

      if (existingIdx !== -1) {
        const updated = [...prev]
        const currentExtra = Number(updated[existingIdx].extraQty) || 0
        const newExtra = isDiscrete ? Math.ceil(currentExtra + addQty) : Number((currentExtra + addQty).toFixed(2))
        const std = Number(updated[existingIdx].standardQty) || 0
        const total = isDiscrete ? Math.ceil(std + newExtra) : Number((std + newExtra).toFixed(2))

        updated[existingIdx] = {
          ...updated[existingIdx],
          extraQty: newExtra,
          extraQtyInput: String(newExtra),
          batchQty: total,
        }
        return updated
      }

      // 2. Nếu là nguyên liệu mới ngoài thực đơn -> Thêm thành dòng riêng
      const newItem = {
        id: selectedIngredient.id || `extra-${Date.now()}`,
        name: selectedIngredient.name,
        category: selectedIngredient.category || "Nguyên liệu",
        unit,
        supplierId: selectedIngredient.supplierId,
        supplierName: selectedIngredient.supplierName,
        handlingType: selectedIngredient.handlingType || "DIRECT_USE",
        isExtraItem: true,
        qtyPerPortion: 0,
        portionInput: "—",
        standardQty: 0,
        standardQtyInput: "—",
        extraQty: addQty,
        extraQtyInput: String(addQty),
        batchQty: addQty,
      }
      return [...prev, newItem]
    })

    setSelectedIngredient(null)
    setExtraQtyInput("")
    setOpenAddModal(false)
  }

  // Xóa món thêm ngoài
  const handleRemoveExtraIngredient = id => {
    setItemsState(prev => prev.filter(it => it.id !== id))
  }

  // 1. Chỉnh sửa Định lượng trên 1 suất (CHỈ ÁP DỤNG ĐỢT 1) -> Tự động tính lại Số lượng theo suất
  const handlePortionChange = (id, rawValue) => {
    if (mode !== "BATCH_1") return

    setItemsState(prev =>
      prev.map(item => {
        if (item.id !== id || item.isExtraItem) return item
        const val = rawValue
        const num = parseFloat(val)

        if (!isNaN(num) && num > 0) {
          const isDiscrete = isDiscreteUnit(item.unit)
          const newStdQty = calcBatchQty(num, batch1Portions, item.unit)
          const extra = Number(item.extraQty) || 0
          const total = isDiscrete ? Math.ceil(newStdQty + extra) : Number((newStdQty + extra).toFixed(2))

          return {
            ...item,
            portionInput: val,
            qtyPerPortion: num,
            standardQty: newStdQty,
            standardQtyInput: String(newStdQty),
            batchQty: total,
          }
        }

        return {
          ...item,
          portionInput: val,
        }
      })
    )
  }

  // 2. Chỉnh sửa Số lượng theo suất (CHỈ ÁP DỤNG ĐỢT 1) -> Tự động tính lại Định lượng trên 1 suất
  const handleStandardQtyChange = (id, rawValue) => {
    if (mode !== "BATCH_1") return

    setItemsState(prev =>
      prev.map(item => {
        if (item.id !== id || item.isExtraItem) return item
        const val = rawValue
        const num = parseFloat(val)

        if (!isNaN(num) && num > 0 && batch1Portions > 0) {
          const isDiscrete = isDiscreteUnit(item.unit)
          const finalStdQty = isDiscrete ? Math.round(num) : num
          const newPortion = calcQtyPerPortion(finalStdQty, batch1Portions)
          const extra = Number(item.extraQty) || 0
          const total = isDiscrete ? Math.ceil(finalStdQty + extra) : Number((finalStdQty + extra).toFixed(2))

          return {
            ...item,
            standardQtyInput: val,
            standardQty: finalStdQty,
            qtyPerPortion: newPortion,
            portionInput: String(newPortion),
            batchQty: total,
          }
        }

        return {
          ...item,
          standardQtyInput: val,
        }
      })
    )
  }

  // 3. Chỉnh sửa Số lượng Giao thêm (CỘT MỚI: Giao thêm)
  const handleExtraQtyChange = (id, rawValue) => {
    setItemsState(prev =>
      prev.map(item => {
        if (item.id !== id) return item
        const val = rawValue
        const num = parseFloat(val)
        const isDiscrete = isDiscreteUnit(item.unit)

        if (!isNaN(num) && num >= 0) {
          const finalExtra = isDiscrete ? Math.round(num) : num
          const std = Number(item.standardQty) || 0
          const total = isDiscrete ? Math.ceil(std + finalExtra) : Number((std + finalExtra).toFixed(2))

          return {
            ...item,
            extraQtyInput: val,
            extraQty: finalExtra,
            batchQty: total,
          }
        }

        return {
          ...item,
          extraQtyInput: val,
          extraQty: 0,
          batchQty: Number(item.standardQty) || 0,
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

  const handleStandardQtyBlur = id => {
    setItemsState(prev =>
      prev.map(item => {
        if (item.id !== id) return item
        const num = parseFloat(item.standardQtyInput)
        if (isNaN(num) || num <= 0) {
          return {
            ...item,
            standardQtyInput: String(item.standardQty),
          }
        }
        const finalVal = isDiscreteUnit(item.unit) ? Math.round(num) : num
        return {
          ...item,
          standardQty: finalVal,
          standardQtyInput: String(finalVal),
        }
      })
    )
  }

  const handleExtraQtyBlur = id => {
    setItemsState(prev =>
      prev.map(item => {
        if (item.id !== id) return item
        if (!item.extraQtyInput || isNaN(parseFloat(item.extraQtyInput))) {
          return {
            ...item,
            extraQtyInput: item.extraQty > 0 ? String(item.extraQty) : "",
          }
        }
        return item
      })
    )
  }

  // Submit Đợt 1 (Chuyên biệt thực phẩm tươi sống trong ngày)
  const handleSubmitBatch1 = async () => {
    if (!activeMenus || activeMenus.length === 0) return
    setSubmitting(true)
    try {
      await onSubmitBatch1({
        menuId: activeMenus[0].id,
        menuIds: activeMenus.map(m => m.id),
        menus: activeMenus,
        targetScope: activeMenus.map(m => m.targetScope).filter(Boolean).join(" & "),
        orderDate,
        note,
        items: itemsState.map(it => ({
          ingredientEntryId: it.ingredientEntryId || it.id,
          ingredientId: it.ingredientId || it.id,
          ingredientName: it.name,
          handlingType: it.handlingType || "DIRECT_USE",
          unit: it.unit,
          qtyPerPortion: it.qtyPerPortion || 0,
          standardQty: it.standardQty || 0,
          extraQty: it.extraQty || 0,
          orderedQty: it.batchQty,
          supplierId: it.supplierId,
          supplierName: it.supplierName,
          isCustomized: it.isCustomized || false,
          isExtraItem: it.isExtraItem || false,
          defaultQtyPerPortion: it.defaultQtyPerPortion,
          breakdown: it.breakdown || null,
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
        actualAttendanceByGrade: gradeAttendance,
        orderDate,
        note,
        items: itemsState.map(it => ({
          ingredientEntryId: it.ingredientEntryId || it.id,
          ingredientId: it.ingredientId || it.id,
          ingredientName: it.name,
          handlingType: it.handlingType || "DIRECT_USE",
          unit: it.unit,
          qtyPerPortion: it.qtyPerPortion || 0,
          standardQty: it.standardQty || 0,
          extraQty: it.extraQty || 0,
          orderedQty: it.batchQty,
          supplierId: it.supplierId,
          supplierName: it.supplierName,
          isCustomized: it.isCustomized || false,
          isExtraItem: it.isExtraItem || false,
          defaultQtyPerPortion: it.defaultQtyPerPortion,
          breakdown: it.breakdown || null,
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
            isMultiMenuDate ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", flex: 1 }}>
                {matchingMenusForDate.map(menu => (
                  <Chip
                    key={menu.id}
                    icon={<ChefHat size={16} color="#166534" />}
                    label={menu.name}
                    variant="outlined"
                    sx={{
                      py: 2.2,
                      px: 1,
                      borderRadius: 2,
                      bgcolor: "#f0fdf4",
                      borderColor: "#86efac",
                      fontWeight: 700,
                      color: "#166534",
                      fontSize: "0.875rem",
                    }}
                  />
                ))}
              </Box>
            ) : (
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
            )
          ) : (
            <Box sx={{ flex: 1 }}>
              {isMultiMenu ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                  {activeMenus.map(menu => (
                    <Chip
                      key={menu.id}
                      icon={<ChefHat size={16} color="#b45309" />}
                      label={menu.name}
                      variant="outlined"
                      sx={{
                        py: 2.2,
                        px: 1,
                        borderRadius: 2,
                        bgcolor: "#fffbeb",
                        borderColor: "#fde68a",
                        fontWeight: 700,
                        color: "#b45309",
                        fontSize: "0.875rem",
                      }}
                    />
                  ))}
                </Box>
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
            {isMultiMenu && (
              <Box sx={{ display: "flex", gap: 1.5, mt: 1, flexWrap: "wrap" }}>
                {menusPortionsMeta.map(m => (
                  <Chip
                    key={m.id}
                    label={`${m.targetScope}: ${m.batch1Portions} / ${m.maxPortions} suất (50%)`}
                    size="small"
                    sx={{ bgcolor: "#e0f2fe", color: "#0369a1", fontWeight: 600, fontSize: "0.75rem" }}
                  />
                ))}
              </Box>
            )}
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
              </Box>
            </Box>

            <Box className={styles.tableWrapper}>
              <Table size="small" className={styles.ingTable}>
                <TableHead>
                  <TableRow className={styles.tableHeaderRow}>
                    <TableCell>Tên thực phẩm</TableCell>
                    <TableCell>Phân loại</TableCell>
                    <TableCell align="center" style={{ width: 145 }}>
                      Định lượng / 1 Suất
                    </TableCell>
                    <TableCell align="right" className={styles.batch1Col} style={{ width: 160 }}>
                      Số lượng Đợt 1 ({batch1Portions} suất)
                    </TableCell>
                    <TableCell>Nhà cung cấp đối tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {itemsState.map(ing => {
                    const isDiscrete = isDiscreteUnit(ing.unit)
                    const isMulti = Boolean(ing.breakdown && ing.breakdown.length > 1)
                    const isExpanded = Boolean(expandedRows[ing.id])

                    return (
                      <React.Fragment key={ing.id}>
                        <TableRow hover className={styles.tableRow}>
                          <TableCell>
                            <Typography variant="subtitle2" className={styles.ingName}>
                              {ing.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label="Tươi sống (Dùng ngay)"
                              size="small"
                              className={styles.freshChip}
                            />
                          </TableCell>

                          {/* Cột 1: Định lượng / 1 Suất (Chuyển badge '2 thực đơn' qua đây, đổi nút thành 'Xem thêm') */}
                          <TableCell align="center">
                            {ing.isExtraItem ? (
                              <Typography variant="body2" sx={{ color: "#94a3b8", fontWeight: 500 }}>
                                —
                              </Typography>
                            ) : isMulti ? (
                              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
                                <Chip
                                  icon={<Layers size={12} />}
                                  label={`${ing.breakdown.length} thực đơn`}
                                  size="small"
                                  onClick={() => toggleExpandRow(ing.id)}
                                  sx={{
                                    cursor: "pointer",
                                    bgcolor: "#eff6ff",
                                    color: "#1d4ed8",
                                    fontWeight: 700,
                                    fontSize: "0.75rem",
                                    height: 22,
                                    border: "1px solid #bfdbfe",
                                    "&:hover": { bgcolor: "#dbeafe" },
                                  }}
                                />
                                <Button
                                  size="small"
                                  variant="text"
                                  onClick={() => toggleExpandRow(ing.id)}
                                  sx={{ fontSize: "0.6875rem", p: 0, minWidth: 0, textTransform: "none", color: "#2563eb", fontWeight: 600 }}
                                >
                                  {isExpanded ? "Thu gọn ▲" : "Xem thêm ▼"}
                                </Button>
                              </Box>
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

                          {/* Cột 2: Số lượng Đợt 1 (theo 50% suất) */}
                          <TableCell align="right" className={styles.batch1Cell}>
                            {ing.isExtraItem ? (
                              <Typography variant="body2" sx={{ color: "#94a3b8", fontWeight: 500 }}>
                                —
                              </Typography>
                            ) : (
                              <Box className={styles.editableCellWrapRight}>
                                <TextField
                                  type="number"
                                  size="small"
                                  value={ing.standardQtyInput}
                                  onChange={e => handleStandardQtyChange(ing.id, e.target.value)}
                                  onBlur={() => handleStandardQtyBlur(ing.id)}
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
                            )}
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" className={styles.supplierText}>
                              {ing.supplierName}
                            </Typography>
                          </TableCell>
                        </TableRow>

                        {/* Dòng mở rộng xem thêm chi tiết cho nguyên liệu đa thực đơn */}
                        {isExpanded && isMulti && (
                          <TableRow sx={{ bgcolor: "#f8fafc" }}>
                            <TableCell colSpan={5} sx={{ py: 1.25, px: 3, borderBottom: "1px solid #e2e8f0" }}>
                              <Box sx={{ p: 1.5, bgcolor: "#ffffff", borderRadius: 1.5, border: "1px solid #e2e8f0" }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
                                  <Layers size={14} color="#2563eb" /> Chi tiết định lượng &amp; số lượng theo từng thực đơn / khối lớp:
                                </Typography>
                                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                  {ing.breakdown.map((b, bIdx) => (
                                    <Box key={bIdx} sx={{ bgcolor: "#f8fafc", p: 1, px: 1.5, borderRadius: 1.25, border: "1px solid #e2e8f0", minWidth: 200 }}>
                                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.8rem" }}>
                                        {b.targetScope || b.menuName}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                                        {b.portions} suất × {b.qtyPerPortion} {b.unit}/suất
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#2563eb", mt: 0.5 }}>
                                        = {b.calculatedQty} {b.unit}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Box>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
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
                label={`${itemsState.length} mặt hàng tươi sống (100% Đồ tươi Đợt 1)`}
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
                    Sĩ Số Ăn Bán Trú Thực Tế Từ Giáo Viên Chủ Nhiệm (GVCN)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Hệ thống tự động tổng hợp số lượng học sinh ăn bán trú từ các lớp đã chốt điểm danh
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="outlined"
                size="small"
                startIcon={<Eye size={16} />}
                onClick={() => setOpenClassDialog(true)}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Xem danh sách các lớp ({attendanceSummary?.finalizedClasses || 0}/{attendanceSummary?.classes?.length || 0})
              </Button>
            </Box>

            <Box className={styles.attendanceBody}>
              {attendanceSummary && (
                <Box>
                  {attendanceSummary.finalizedClasses > 0 ? (
                    <Alert severity="success" icon={<CheckCircle2 size={18} />}>
                      Đã tự động lấy dữ liệu từ GVCN: <strong>{attendanceSummary.totalPortions} học sinh</strong> ({attendanceSummary.finalizedClasses} lớp đã chốt điểm danh sáng nay).
                    </Alert>
                  ) : (
                    <Alert severity="info" icon={<Clock size={18} />}>
                      Chưa có lớp nào chốt sĩ số điểm danh cho ngày {orderDate}. Khi GVCN các lớp chốt báo cơm, hệ thống sẽ tự động cập nhật số suất cần giao.
                    </Alert>
                  )}
                </Box>
              )}

              <Box className={styles.attendanceStatsRow}>
                <Box className={styles.attendanceStatBox}>
                  <Typography variant="caption" color="text.secondary">
                    Sĩ số chốt từ GVCN:
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: parsedAttendance > 0 ? "#15803d" : "#64748b",
                      mt: 0.5,
                    }}
                  >
                    {attendanceLoading
                      ? "Đang tải..."
                      : parsedAttendance > 0
                        ? `${parsedAttendance} học sinh`
                        : "0 học sinh"}
                  </Typography>
                </Box>

                <Typography variant="h5" color="text.secondary" sx={{ alignSelf: "center" }}>
                  -
                </Typography>

                <Box className={styles.attendanceStatBox}>
                  <Typography variant="caption" color="text.secondary">
                    Đợt 1 đã nhận (50%):
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#1976d2", mt: 0.5 }}>
                    {batch1Portions} suất
                  </Typography>
                </Box>

                <Typography variant="h5" color="text.secondary" sx={{ alignSelf: "center" }}>
                  =
                </Typography>

                <Box className={`${styles.attendanceStatBox} ${styles.attendanceStatBoxHighlight}`}>
                  <Typography variant="caption" color="text.secondary">
                    Cần giao thêm Đợt 2:
                  </Typography>
                  <Typography variant="h5" className={styles.resultPortions} sx={{ mt: 0.5 }}>
                    {parsedAttendance > 0 ? `${remainingPortions} suất` : "0 suất"}
                  </Typography>
                </Box>
              </Box>

              {/* Chi tiết phân bổ theo từng khối khi là đa thực đơn */}
              {isMultiMenu && (
                <Box sx={{ mt: 2, pt: 2, borderTop: "1px dashed #cbd5e1" }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", mb: 1, display: "block" }}>
                    Chi tiết cân đối theo từng khối lớp:
                  </Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 1.5 }}>
                    {menusPortionsMeta.map(m => {
                      const info = remainingByMenu[m.id] || { actual: 0, remaining: 0 }
                      return (
                        <Paper key={m.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: "#f8fafc" }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                            {m.targetScope || m.name}
                          </Typography>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Sĩ số: <strong>{info.actual}</strong> / {m.maxPortions}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Đợt 1: <strong>{m.batch1Portions}</strong>
                            </Typography>
                            <Chip
                              label={`Đợt 2: +${info.remaining} suất`}
                              size="small"
                              color="warning"
                              sx={{ fontWeight: 700, height: 22, fontSize: "0.75rem" }}
                            />
                          </Box>
                        </Paper>
                      )
                    })}
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>

          {/* MÀN NỔI (DIALOG): CHI TIẾT ĐIỂM DANH BÁO CƠM TỪNG LỚP */}
          <Dialog
            open={openClassDialog}
            onClose={() => setOpenClassDialog(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Users size={22} color="#15803d" />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
                    Chi Tiết Điểm Danh Báo Cơm Các Lớp
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ngày: {orderDate} • Bữa trưa (LUNCH)
                  </Typography>
                </Box>
              </Box>
              <IconButton size="small" onClick={() => setOpenClassDialog(false)}>
                <X size={18} />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", gap: 1.5, mb: 2.5, flexWrap: "wrap", alignItems: "center" }}>
                <Chip
                  label={`Tổng sĩ số chốt: ${attendanceSummary?.totalPortions || 0} học sinh`}
                  color="success"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
                <Chip
                  label={`Đã chốt: ${attendanceSummary?.finalizedClasses || 0} lớp`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
                {Number(attendanceSummary?.pendingClasses) > 0 && (
                  <Chip
                    label={`Chưa chốt: ${attendanceSummary.pendingClasses} lớp`}
                    color="warning"
                    variant="outlined"
                    size="small"
                  />
                )}
              </Box>

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: "12%" }}>Lớp</TableCell>
                      <TableCell sx={{ fontWeight: 600, width: "24%" }}>GVCN</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, width: "16%" }}>
                        Sĩ số đăng ký
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, width: "16%" }}>
                        Sĩ số báo thực tế
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, width: "14%" }}>
                        Trạng thái
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, width: "18%" }}>
                        Ghi chú / Dị ứng
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(attendanceSummary?.classes || []).length > 0 ? (
                      attendanceSummary.classes.map((cls, idx) => (
                        <TableRow key={cls.classId || idx} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{cls.className}</TableCell>
                          <TableCell>{cls.teacherName || "Chưa phân công"}</TableCell>
                          <TableCell align="center">{cls.registeredPortions || 0} hs</TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: 700,
                              color: cls.status === "FINALIZED" ? "#15803d" : "inherit",
                            }}
                          >
                            {cls.status === "FINALIZED" ? `${cls.actualPortions} suất` : "—"}
                          </TableCell>
                          <TableCell align="center">
                            {cls.status === "FINALIZED" ? (
                              <Chip
                                label="Đã chốt"
                                size="small"
                                color="success"
                                sx={{ height: 22, fontSize: 11, fontWeight: 500 }}
                              />
                            ) : cls.status === "DRAFT" ? (
                              <Chip
                                label="Bản nháp"
                                size="small"
                                color="warning"
                                sx={{ height: 22, fontSize: 11 }}
                              />
                            ) : (
                              <Chip
                                label="Chưa báo"
                                size="small"
                                variant="outlined"
                                sx={{ height: 22, fontSize: 11, color: "text.secondary" }}
                              />
                            )}
                          </TableCell>
                          <TableCell sx={{ fontSize: 12, color: cls.allergyNotes ? "#b91c1c" : "text.secondary" }}>
                            {cls.allergyNotes || "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3, color: "text.secondary" }}>
                          Chưa có thông tin điểm danh các lớp cho ngày này.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>

            <DialogActions sx={{ px: 2.5, py: 1.5 }}>
              <Button onClick={() => setOpenClassDialog(false)} variant="contained" color="inherit">
                Đóng
              </Button>
            </DialogActions>
          </Dialog>

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
                    <TableCell align="center" style={{ width: 145 }}>
                      Định lượng / 1 Suất
                    </TableCell>
                    <TableCell align="right" className={styles.batch2Col} style={{ width: 160 }}>
                      SL theo suất ({parsedAttendance > 0 ? remainingPortions : 425} suất)
                    </TableCell>
                    <TableCell align="right" className={styles.extraCol} style={{ width: 150 }}>
                      Giao thêm
                    </TableCell>
                    <TableCell align="right" className={styles.totalCol} style={{ width: 135 }}>
                      Tổng Đợt 2
                    </TableCell>
                    <TableCell>Nhà cung cấp đối tác</TableCell>
                    <TableCell align="center" style={{ width: 50 }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {itemsState.map(ing => {
                    const isDiscrete = isDiscreteUnit(ing.unit)
                    const isMulti = Boolean(ing.breakdown && ing.breakdown.length > 1)
                    const isExpanded = Boolean(expandedRows[ing.id])

                    return (
                      <React.Fragment key={ing.id}>
                        <TableRow hover className={styles.tableRow}>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography variant="subtitle2" className={styles.ingName}>
                                {ing.name}
                              </Typography>
                              {ing.isExtraItem && (
                                <Chip
                                  label="Giao thêm ngoài"
                                  size="small"
                                  color="warning"
                                  sx={{ height: 20, fontSize: "0.6875rem", fontWeight: 700 }}
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label="Tươi sống (Dùng ngay)"
                              size="small"
                              className={styles.freshChip}
                            />
                          </TableCell>

                          {/* Cột 1: Định lượng / 1 Suất (Chuyển badge '2 thực đơn' qua đây, đổi nút thành 'Xem thêm') */}
                          <TableCell align="center">
                            {ing.isExtraItem ? (
                              <Typography variant="body2" sx={{ color: "#94a3b8", fontWeight: 500 }}>
                                —
                              </Typography>
                            ) : isMulti ? (
                              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
                                <Chip
                                  icon={<Layers size={12} />}
                                  label={`${ing.breakdown?.length || 2} thực đơn`}
                                  size="small"
                                  onClick={() => toggleExpandRow(ing.id)}
                                  sx={{
                                    cursor: "pointer",
                                    bgcolor: "#eff6ff",
                                    color: "#1d4ed8",
                                    fontWeight: 700,
                                    fontSize: "0.75rem",
                                    height: 22,
                                    border: "1px solid #bfdbfe",
                                    "&:hover": { bgcolor: "#dbeafe" },
                                  }}
                                />
                                <Button
                                  size="small"
                                  variant="text"
                                  onClick={() => toggleExpandRow(ing.id)}
                                  sx={{ fontSize: "0.6875rem", p: 0, minWidth: 0, textTransform: "none", color: "#2563eb", fontWeight: 600 }}
                                >
                                  {isExpanded ? "Thu gọn ▲" : "Xem thêm ▼"}
                                </Button>
                              </Box>
                            ) : (
                              <Typography variant="body2" className={styles.readOnlyPortionText}>
                                {ing.qtyPerPortion} {ing.unit}/suất
                              </Typography>
                            )}
                          </TableCell>

                          {/* Cột 2: Số lượng theo suất Đợt 2 (KHÓA: Tự động tính theo Sĩ số bù, không cho sửa) */}
                          <TableCell align="right" className={styles.batch2Cell}>
                            {ing.isExtraItem ? (
                              <Typography variant="body2" sx={{ color: "#94a3b8", fontWeight: 500 }}>
                                —
                              </Typography>
                            ) : (
                              <Typography variant="subtitle2" className={styles.batch2QtyText}>
                                {ing.standardQty} {ing.unit}
                              </Typography>
                            )}
                          </TableCell>

                          {/* Cột 3: Giao thêm (Cột riêng để biết thêm bao nhiêu) */}
                          <TableCell align="right" className={styles.extraCell}>
                            <Box className={styles.editableCellWrapRight}>
                              <TextField
                                type="number"
                                size="small"
                                placeholder="0"
                                value={ing.extraQtyInput}
                                onChange={e => handleExtraQtyChange(ing.id, e.target.value)}
                                onBlur={() => handleExtraQtyBlur(ing.id)}
                                className={`${styles.cellInput} ${styles.extraCellInput}`}
                                slotProps={{
                                  htmlInput: {
                                    step: isDiscrete ? "1" : "0.01",
                                    min: "0",
                                    style: {
                                      textAlign: "right",
                                      padding: "6px 8px",
                                      fontWeight: 700,
                                      color: ing.extraQty > 0 ? "#15803d" : "#64748b",
                                    },
                                  },
                                  input: {
                                    endAdornment: (
                                      <span className={styles.inputAdornment} style={{ color: ing.extraQty > 0 ? "#15803d" : "#64748b" }}>
                                        {ing.unit}
                                      </span>
                                    ),
                                  },
                                }}
                              />
                            </Box>
                          </TableCell>

                          {/* Cột 4: Tổng SL Đợt 2 (= Theo suất + Giao thêm) */}
                          <TableCell align="right" className={styles.totalCell}>
                            <Typography variant="subtitle2" className={styles.totalQtyText}>
                              {ing.batchQty} {ing.unit}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" className={styles.supplierText}>
                              {ing.supplierName}
                            </Typography>
                          </TableCell>

                          {/* Cột thao tác xóa nếu là hàng giao thêm ngoài */}
                          <TableCell align="center">
                            {ing.isExtraItem ? (
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

                        {/* Dòng mở rộng phân rã chi tiết cho nguyên liệu đa thực đơn */}
                        {isExpanded && isMulti && (
                          <TableRow sx={{ bgcolor: "#f8fafc" }}>
                            <TableCell colSpan={8} sx={{ py: 1.25, px: 3, borderBottom: "1px solid #e2e8f0" }}>
                              <Box sx={{ p: 1.5, bgcolor: "#ffffff", borderRadius: 1.5, border: "1px solid #e2e8f0" }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
                                  <Layers size={14} color="#2563eb" /> Chi tiết định lượng &amp; số lượng theo từng thực đơn / khối lớp (Đợt 2):
                                </Typography>
                                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                  {ing.breakdown.map((b, bIdx) => (
                                    <Box key={bIdx} sx={{ bgcolor: "#f8fafc", p: 1, px: 1.5, borderRadius: 1.25, border: "1px solid #e2e8f0", minWidth: 200 }}>
                                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.8rem" }}>
                                        {b.targetScope || b.menuName}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                                        {b.portions} suất bù × {b.qtyPerPortion} {b.unit}/suất
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#2563eb", mt: 0.5 }}>
                                        = {b.calculatedQty} {b.unit}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Box>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
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
            options={catalogOptions}
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
